const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Service = require("../models/Service");
const { auth, optionalAuth, role } = require("../middleware/auth");
const { sendEmail } = require("../utils/emailLogger");

function getServiceIds(body) {
  if (Array.isArray(body.services)) return body.services.filter(Boolean);
  if (body.service) return [body.service];
  return [];
}

function serviceList(appointment) {
  if (appointment.services && appointment.services.length) return appointment.services;
  if (appointment.service) return [appointment.service];
  return [];
}

router.get("/", auth, async (req, res) => {
  try {
    const filter = {};

    // Admin: xem TOÀN BỘ lịch của hệ thống.
    if (req.user.role === "admin") {
      // giữ filter rỗng
    }
    // Nhân viên: chỉ xem lịch đã được gán cho chính mình.
    else if (req.user.role === "employee") {
      filter.employee = req.user.id;
    }
    // Khách hàng: chỉ xem lịch của tài khoản đang đăng nhập.
    else if (req.user.role === "customer") {
      filter.customer = req.user.id;
    }

    const appointments = await Appointment.find(filter)
      .populate("customer", "name email phone")
      .populate("employee", "name email")
      .populate("services", "name duration price image")
      .populate("service", "name duration price image")
      .sort({ date: 1, time: 1, createdAt: -1 });

    res.json(appointments);
  } catch (e) {
    console.error("GET APPOINTMENTS ERROR:", e);
    res.status(500).json({ message: "Lỗi lấy danh sách lịch hẹn", error: e.message });
  }
});

// Endpoint riêng cho Admin, giúp phân biệt rõ dữ liệu quản trị.
router.get("/admin/all", auth, role("admin"), async (req, res) => {
  try {
    const appointments = await Appointment.find({})
      .populate("customer", "name email phone")
      .populate("employee", "name email")
      .populate("services", "name duration price image")
      .populate("service", "name duration price image")
      .sort({ date: 1, time: 1, createdAt: -1 });

    res.json(appointments);
  } catch (e) {
    console.error("GET ADMIN APPOINTMENTS ERROR:", e);
    res.status(500).json({ message: "Lỗi lấy lịch hẹn cho quản trị viên", error: e.message });
  }
});

router.post("/", optionalAuth, async (req, res) => {
  try {
    const { employee, date, time, note, paymentMethod } = req.body;
    const customerName = String(req.body.name || "").trim();
    const phone = String(req.body.phone || "").trim();
    const serviceIds = getServiceIds(req.body);
    const requestedSubServices = Array.isArray(req.body.selectedSubServices) ? req.body.selectedSubServices : [];

    if (!customerName || !phone || !serviceIds.length || !employee || !date || !time) {
      return res.status(400).json({
        message: "Vui lòng nhập họ tên, số điện thoại và chọn dịch vụ, nhân viên, ngày và giờ."
      });
    }

    if (!/^(0|\+84)[0-9\s.-]{8,14}$/.test(phone)) {
      return res.status(400).json({ message: "Số điện thoại không hợp lệ." });
    }

    const services = await Service.find({
      _id: { $in: serviceIds },
      active: true
    });

    if (services.length !== serviceIds.length) {
      return res.status(400).json({ message: "Dịch vụ không tồn tại hoặc đã ngừng hoạt động." });
    }

    const employeeData = await User.findOne({ _id: employee, role: "employee" });
    if (!employeeData) return res.status(404).json({ message: "Không tìm thấy nhân viên." });

    // Kiểm tra và lưu snapshot các mục phụ khách đã chọn, tránh tin giá từ frontend.
    const selectedSubServices = [];
    for (const item of requestedSubServices) {
      const parent = services.find(s => String(s._id) === String(item.mainService));
      if (!parent) continue;
      const sub = (parent.subServices || []).find(x => x.name === item.name);
      if (sub) {
        selectedSubServices.push({
          mainService: parent._id,
          name: sub.name,
          price: Number(sub.price || 0)
        });
      }
    }

    const existed = await Appointment.findOne({
      employee,
      date,
      time,
      status: { $in: ["pending", "confirmed"] }
    });

    if (existed) return res.status(400).json({ message: "Khung giờ này đã được đặt. Vui lòng chọn giờ khác." });

    // Đặt lịch cũng đồng thời tạo/liên kết tài khoản khách hàng theo số điện thoại.
    // Nếu khách đã đăng nhập bằng tài khoản customer thì dùng chính tài khoản đó.
    let customer = req.user?.role === "customer"
      ? await User.findById(req.user.id)
      : null;
    let accountCreated = false;
    let temporaryPassword = "";

    if (!customer) {
      customer = await User.findOne({ phone, role: "customer" });
    }

    if (!customer) {
      const normalizedPhone = phone.replace(/\D/g, "");
      let email = `${normalizedPhone}@booking.local`;
      const existingEmail = await User.findOne({ email });
      if (existingEmail) email = `${normalizedPhone}-${Date.now()}@booking.local`;

      temporaryPassword = Math.random().toString(36).slice(-8);
      customer = await User.create({
        name: customerName,
        email,
        phone,
        password: await bcrypt.hash(temporaryPassword, 10),
        role: "customer"
      });
      accountCreated = true;
    } else {
      customer.name = customerName || customer.name;
      customer.phone = phone || customer.phone;

      // Tương thích với tài khoản khách cũ được tạo trước khi có chức năng
      // tự động đăng ký. Nếu bản ghi cũ thiếu password, cấp mật khẩu tạm
      // và hash trước khi save để tránh lỗi User validation failed.
      if (!customer.password) {
        temporaryPassword = Math.random().toString(36).slice(-8);
        customer.password = await bcrypt.hash(temporaryPassword, 10);
        accountCreated = true;
      }

      await customer.save();
    }

    const appointment = await Appointment.create({
      customer: customer._id,
      customerName,
      customerPhone: phone,
      employee,
      services: serviceIds,
      service: serviceIds[0],
      date,
      time,
      note: note || "",
      selectedSubServices,
      paymentMethod: paymentMethod === "qr" ? "qr" : "cash",
      paymentStatus: "unpaid",
      status: "pending"
    });

    const token = jwt.sign(
      { id: customer._id, name: customer.name, email: customer.email, phone: customer.phone, role: customer.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    const result = await Appointment.findById(appointment._id)
      .populate("customer", "name email phone")
      .populate("employee", "name email")
      .populate("services", "name duration price image subServices")
      .populate("service", "name duration price image subServices");

    res.status(201).json({
      message: accountCreated ? "Đặt lịch thành công. Tài khoản khách hàng đã được tạo tự động." : "Đặt lịch thành công.",
      appointment: result,
      accountCreated,
      temporaryPassword,
      auth: {
        token,
        user: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          role: customer.role
        }
      }
    });
  } catch (e) {
    console.error("BOOKING ERROR:", e);
    res.status(500).json({ message: e.message || "Lỗi đặt lịch" });
  }
});

// Admin xếp nhân viên cho lịch hẹn.
// Đây là bước quan trọng để lịch vừa đặt xuất hiện trong lịch làm việc của nhân viên.
router.put("/:id/assign", auth, role("admin"), async (req, res) => {
  try {
    const { employee } = req.body;
    if (!employee) {
      return res.status(400).json({ message: "Vui lòng chọn nhân viên." });
    }

    const employeeData = await User.findOne({ _id: employee, role: "employee" })
      .select("name email");
    if (!employeeData) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên." });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Không tìm thấy lịch hẹn." });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({ message: "Không thể xếp nhân viên cho lịch đã hủy." });
    }

    // Không cho một nhân viên nhận 2 lịch cùng ngày và cùng giờ.
    const conflict = await Appointment.findOne({
      _id: { $ne: appointment._id },
      employee: employeeData._id,
      date: appointment.date,
      time: appointment.time,
      status: { $in: ["pending", "confirmed"] }
    });

    if (conflict) {
      return res.status(400).json({
        message: "Nhân viên này đã có lịch ở khung giờ đó. Vui lòng chọn nhân viên khác."
      });
    }

    appointment.employee = employeeData._id;
    await appointment.save();

    const result = await Appointment.findById(appointment._id)
      .populate("customer", "name email phone")
      .populate("employee", "name email")
      .populate("services", "name duration price image")
      .populate("service", "name duration price image");

    res.json({
      message: `Đã xếp lịch cho ${employeeData.name}. Lịch này sẽ xuất hiện ở tài khoản nhân viên.`,
      appointment: result
    });
  } catch (e) {
    console.error("ASSIGN APPOINTMENT ERROR:", e);
    res.status(500).json({
      message: "Không thể xếp nhân viên.",
      error: e.message
    });
  }
});

router.put("/:id/status", auth, async (req, res) => {
  try {
    const { status, cancellationReason } = req.body;
    const allowed = ["pending", "confirmed", "completed", "cancelled"];
    if (!allowed.includes(status)) return res.status(400).json({ message: "Trạng thái không hợp lệ" });

    const appointment = await Appointment.findById(req.params.id)
      .populate("customer", "name email phone")
      .populate("employee", "name email")
      .populate("services", "name duration price")
      .populate("service", "name duration price");

    if (!appointment) return res.status(404).json({ message: "Không tìm thấy lịch hẹn" });

    const uid = req.user.id.toString();
    const customerId = appointment.customer?._id?.toString();
    const employeeId = appointment.employee?._id?.toString();
    const isAdmin = req.user.role === "admin";
    const isEmployee = req.user.role === "employee" && employeeId === uid;
    const isCustomer = req.user.role === "customer" && customerId === uid;

    if (isCustomer && status !== "cancelled") return res.status(403).json({ message: "Khách hàng chỉ được hủy lịch" });
    if (!isAdmin && !isEmployee && !isCustomer) return res.status(403).json({ message: "Bạn không có quyền thực hiện thao tác này" });

    appointment.status = status;
    if (status === "cancelled") {
      appointment.cancelledAt = new Date();
      appointment.cancellationReason = String(cancellationReason || "").trim().slice(0, 500);
    } else {
      appointment.cancelledAt = undefined;
      appointment.cancellationReason = "";
    }
    await appointment.save();

    const customer = appointment.customer;
    if (customer?.email && ["confirmed", "completed", "cancelled"].includes(status)) {
      const names = serviceList(appointment).map(s => s.name).join(", ");
      const subjectMap = {
        confirmed: "Lịch hẹn đã được xác nhận",
        completed: "Lịch hẹn đã hoàn thành",
        cancelled: "Lịch hẹn đã bị hủy"
      };
      const statusMap = { confirmed: "Đã xác nhận", completed: "Hoàn thành", cancelled: "Đã hủy" };
      sendEmail(
        customer.email,
        subjectMap[status],
        `Xin chào ${customer.name},\n\nDịch vụ: ${names}\nNhân viên: ${appointment.employee?.name || ""}\nNgày: ${appointment.date}\nGiờ: ${appointment.time}\nTrạng thái: ${statusMap[status]}.`
      );
    }

    res.json({ message: "Cập nhật trạng thái thành công", appointment });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Lỗi cập nhật trạng thái", error: e.message });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("customer", "name email phone")
      .populate("employee", "name email")
      .populate("services", "name duration price")
      .populate("service", "name duration price");
    if (!updated) return res.status(404).json({ message: "Không tìm thấy lịch hẹn" });
    res.json({ message: "Cập nhật lịch hẹn thành công", appointment: updated });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Lỗi cập nhật lịch hẹn", error: e.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("customer", "name email phone")
      .populate("employee", "name email")
      .populate("services", "name duration price")
      .populate("service", "name duration price");

    if (!appointment) return res.status(404).json({ message: "Không tìm thấy lịch hẹn" });

    const isOwner = appointment.customer?._id?.toString() === req.user.id.toString();
    if (!isOwner && req.user.role !== "admin") return res.status(403).json({ message: "Bạn không có quyền hủy lịch này" });

    appointment.status = "cancelled";
    appointment.cancelledAt = new Date();
    appointment.cancellationReason = String(req.body?.cancellationReason || "").trim().slice(0, 500);
    await appointment.save();

    if (appointment.customer?.email) {
      const names = serviceList(appointment).map(s => s.name).join(", ");
      sendEmail(
        appointment.customer.email,
        "Lịch hẹn đã bị hủy",
        `Xin chào ${appointment.customer.name},\n\nLịch hẹn đã được hủy.\nDịch vụ: ${names}\nNhân viên: ${appointment.employee?.name || ""}\nNgày: ${appointment.date}\nGiờ: ${appointment.time}`
      );
    }

    res.json({ message: "Hủy lịch thành công", appointment });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Lỗi hủy lịch", error: e.message });
  }
});

module.exports = router;
