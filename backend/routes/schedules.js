const router = require("express").Router();
const WorkSchedule = require("../models/WorkSchedule");
const Holiday = require("../models/Holiday");
const Service = require("../models/Service");
const Appointment = require("../models/Appointment");
const { auth, role } = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  res.json({
    schedules: await WorkSchedule.find().populate("employee", "name"),
    holidays: await Holiday.find().sort({ date: 1 })
  });
});

// Tạo các khung giờ phù hợp với tổng thời lượng của nhiều dịch vụ.
router.get("/slots", async (req, res) => {
  try {
    const { services, service, employee, date } = req.query;

    if (!employee || !date) {
      return res.status(400).json({ message: "Thiếu nhân viên hoặc ngày." });
    }

    const serviceIds = services
      ? services.split(",").filter(Boolean)
      : service
        ? [service]
        : [];

    if (!serviceIds.length) {
      return res.json([]);
    }

    const serviceDocs = await Service.find({
      _id: { $in: serviceIds },
      active: true
    });

    const duration = serviceDocs.reduce(
      (sum, item) => sum + Number(item.duration || 0),
      0
    );

    if (!duration) return res.json([]);

    const dayOfWeek = new Date(`${date}T00:00:00`).getDay();

    // Ưu tiên ca được xếp đúng ngày; nếu chưa có thì dùng ca lặp theo thứ.
    const schedule = await WorkSchedule.findOne({
      employee,
      active: true,
      $or: [{ date }, { date: { $exists: false }, dayOfWeek }]
    }).sort({ date: -1 });

    if (!schedule) return res.json([]);

    const toMinutes = (value) => {
      const [h, m] = value.split(":").map(Number);
      return h * 60 + m;
    };

    const toTime = (minutes) => {
      const h = String(Math.floor(minutes / 60)).padStart(2, "0");
      const m = String(minutes % 60).padStart(2, "0");
      return `${h}:${m}`;
    };

    const start = toMinutes(schedule.startTime);
    const end = toMinutes(schedule.endTime);

    const appointments = await Appointment.find({
      employee,
      date,
      status: { $in: ["pending", "confirmed"] }
    }).populate("services", "duration");

    const slots = [];

    // Tạo slot mỗi 30 phút và chỉ trả về slot đủ chỗ cho toàn bộ dịch vụ.
    for (let current = start; current + duration <= end; current += 30) {
      const currentEnd = current + duration;

      const overlap = appointments.some((appointment) => {
        const appointmentStart = toMinutes(appointment.time);
        const oldServices =
          appointment.services?.length
            ? appointment.services
            : appointment.service
              ? [appointment.service]
              : [];

        const appointmentDuration = oldServices.reduce(
          (sum, item) => sum + Number(item.duration || 0),
          0
        );

        const appointmentEnd = appointmentStart + appointmentDuration;

        return current < appointmentEnd && currentEnd > appointmentStart;
      });

      if (!overlap) slots.push(toTime(current));
    }

    res.json(slots);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.post("/work", auth, role("admin"), async (req, res) => {
  try {
    const { employee, date, dayOfWeek, startTime, endTime } = req.body;
    if (!employee || !startTime || !endTime) {
      return res.status(400).json({ message: "Thiếu nhân viên hoặc thời gian ca." });
    }
    if (!date && (dayOfWeek === undefined || dayOfWeek === null)) {
      return res.status(400).json({ message: "Vui lòng chọn ngày cụ thể hoặc thứ trong tuần." });
    }
    const schedule = await WorkSchedule.create({ employee, date: date || undefined, dayOfWeek: date ? new Date(`${date}T00:00:00`).getDay() : dayOfWeek, startTime, endTime, active: true });
    res.status(201).json(await schedule.populate("employee", "name email"));
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.delete("/work/:id", auth, role("admin"), async (req, res) => {
  await WorkSchedule.findByIdAndDelete(req.params.id);
  res.json({ message: "Đã xóa ca làm." });
});

router.post("/holiday", auth, role("admin"), async (req, res) =>
  res.status(201).json(await Holiday.create(req.body))
);

module.exports = router;
