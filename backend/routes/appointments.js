const router = require("express").Router();
const Appointment = require("../models/Appointment");
const Service = require("../models/Service");
const WorkSchedule = require("../models/WorkSchedule");
const { auth, role } = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  const q =
    req.user.role === "customer"
      ? { customer: req.user.id }
      : req.user.role === "employee"
        ? { employee: req.user.id }
        : {};

  const appointments = await Appointment.find(q)
    .populate("customer", "name email")
    .populate("employee", "name")
    .populate("services", "name price duration")
    .populate("service", "name price duration")
    .sort({ date: 1, time: 1 });

  res.json(appointments);
});

router.post("/", auth, role("customer"), async (req, res) => {
  try {
    const {
      services,
      service,
      employee,
      date,
      time,
      note,
      paymentMethod = "cash"
    } = req.body;

    // Hỗ trợ cả dữ liệu mới services[] và dữ liệu cũ service.
    const serviceIds = Array.isArray(services) && services.length
      ? services
      : service
        ? [service]
        : [];

    if (!serviceIds.length || !date || !time) {
      return res.status(400).json({
        message: "Vui lòng chọn ít nhất một dịch vụ, ngày và giờ."
      });
    }

    const validServices = await Service.find({
      _id: { $in: serviceIds },
      active: true
    });

    if (validServices.length !== serviceIds.length) {
      return res.status(400).json({
        message: "Một hoặc nhiều dịch vụ không hợp lệ hoặc đã ngừng hoạt động."
      });
    }

    if (employee) {
      const dayOfWeek = new Date(`${date}T00:00:00`).getDay();
      const schedule = await WorkSchedule.findOne({
        employee, active: true,
        $or: [{ date }, { date: { $exists: false }, dayOfWeek }]
      }).sort({ date: -1 });
      if (!schedule) return res.status(400).json({ message: "Nhân viên chưa được xếp ca trong ngày này." });

      const toMinutes = value => { const [h,m] = String(value).split(":").map(Number); return h*60+m; };
      const start = toMinutes(time);
      const end = start + validServices.reduce((sum,s) => sum + Number(s.duration || 0), 0);
      if (start < toMinutes(schedule.startTime) || end > toMinutes(schedule.endTime)) {
        return res.status(400).json({ message: "Lịch hẹn nằm ngoài ca làm của nhân viên." });
      }

      const busy = await Appointment.find({ employee, date, status: { $in: ["pending", "confirmed"] } })
        .populate("services", "duration").populate("service", "duration");
      const overlap = busy.some(item => {
        const oldDocs = item.services?.length ? item.services : (item.service ? [item.service] : []);
        const oldDuration = oldDocs.reduce((sum,s) => sum + Number(s.duration || 0), 0);
        const oldStart = toMinutes(item.time);
        return start < oldStart + oldDuration && end > oldStart;
      });
      if (overlap) return res.status(400).json({ message: "Khung giờ này bị trùng với lịch khác của nhân viên." });
    }

    const appointment = await Appointment.create({
      customer: req.user.id,
      employee: employee || undefined,
      services: serviceIds,
      // service đầu tiên giúp tương thích với dữ liệu/API cũ.
      service: serviceIds[0],
      date,
      time,
      note,
      paymentMethod: ["cash","qr"].includes(paymentMethod) ? paymentMethod : "cash",
      paymentStatus: "unpaid"
    });

    const result = await Appointment.findById(appointment._id)
      .populate("services", "name price duration")
      .populate("employee", "name");

    res.status(201).json(result);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.put("/:id/assign", auth, role("admin"), async (req, res) => {
  try {
    const { employee } = req.body;
    if (!employee) return res.status(400).json({ message: "Vui lòng chọn nhân viên." });
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Không tìm thấy lịch hẹn." });
    if (appointment.status === "cancelled") return res.status(400).json({ message: "Lịch đã hủy không thể xếp nhân viên." });

    const busy = await Appointment.findOne({
      _id: { $ne: appointment._id }, employee, date: appointment.date,
      status: { $in: ["pending", "confirmed"] }
    }).populate("services", "duration").populate("service", "duration");

    const minutes = value => { const [h,m] = String(value).split(":").map(Number); return h*60+m; };
    const serviceDocs = appointment.services?.length ? appointment.services : (appointment.service ? [appointment.service] : []);
    const duration = serviceDocs.reduce((sum,s) => sum + Number(s.duration || 0), 0);
    if (busy) {
      const oldDocs = busy.services?.length ? busy.services : (busy.service ? [busy.service] : []);
      const oldDuration = oldDocs.reduce((sum,s) => sum + Number(s.duration || 0), 0);
      const a = minutes(appointment.time), b = minutes(busy.time);
      if (a < b + oldDuration && a + duration > b) return res.status(400).json({ message: "Nhân viên đã có lịch trùng giờ." });
    }

    appointment.employee = employee;
    await appointment.save();
    res.json(await Appointment.findById(appointment._id).populate("customer", "name email").populate("employee", "name email").populate("services", "name price duration"));
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.put("/:id/status", auth, async (req, res) => {
  const allowed =
    req.user.role === "admin"
      ? ["pending", "confirmed", "completed", "cancelled"]
      : req.user.role === "employee"
        ? ["confirmed", "completed"]
        : ["cancelled"];

  if (!allowed.includes(req.body.status)) {
    return res.status(403).json({ message: "Không thể đổi trạng thái" });
  }

  res.json(
    await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, note: req.body.note },
      { new: true }
    )
  );
});

router.delete("/:id", auth, async (req, res) => {
  const a = await Appointment.findById(req.params.id);

  if (!a) {
    return res.status(404).json({ message: "Không tìm thấy lịch" });
  }

  if (req.user.role === "customer" && String(a.customer) !== req.user.id) {
    return res.status(403).json({ message: "Không có quyền" });
  }

  a.status = "cancelled";
  await a.save();

  res.json({ message: "Đã hủy lịch" });
});

module.exports = router;
