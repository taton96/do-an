const express = require("express");
const router = express.Router();

const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Service = require("../models/Service");
const { auth, role } = require("../middleware/auth");
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
    if (req.user.role === "customer") filter.customer = req.user.id;
    if (req.user.role === "employee") filter.employee = req.user.id;

    const appointments = await Appointment.find(filter)
      .populate("customer", "name email")
      .populate("employee", "name email")
      .populate("services", "name duration price image")
      .populate("service", "name duration price image")
      .sort({ date: 1, time: 1 });

    res.json(appointments);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Lỗi lấy danh sách lịch hẹn", error: e.message });
  }
});

router.post("/", auth, role("customer"), async (req, res) => {
  try {
    const { employee, date, time, note, paymentMethod } = req.body;
    const serviceIds = getServiceIds(req.body);

    if (!serviceIds.length || !employee || !date || !time) {
      return res.status(400).json({
        message: "Vui lòng chọn ít nhất một dịch vụ, nhân viên, ngày và giờ."
      });
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

    const existed = await Appointment.findOne({
      employee,
      date,
      time,
      status: { $in: ["pending", "confirmed"] }
    });

    if (existed) return res.status(400).json({ message: "Khung giờ này đã được đặt. Vui lòng chọn giờ khác." });

    const appointment = await Appointment.create({
      customer: req.user.id,
      employee,
      services: serviceIds,
      service: serviceIds[0],
      date,
      time,
      note: note || "",
      paymentMethod: paymentMethod === "qr" ? "qr" : "cash",
      paymentStatus: "unpaid",
      status: "pending"
    });

    const customer = await User.findById(req.user.id);
    if (customer?.email) {
      const names = services.map(s => s.name).join(", ");
      const total = services.reduce((sum, s) => sum + Number(s.price || 0), 0);
      const duration = services.reduce((sum, s) => sum + Number(s.duration || 0), 0);
      sendEmail(
        customer.email,
        "Xác nhận đặt lịch dịch vụ",
        `Xin chào ${customer.name},\n\nBạn đã đặt lịch thành công.\n\nDịch vụ: ${names}\nNhân viên: ${employeeData.name}\nNgày: ${date}\nGiờ: ${time}\nThời gian: ${duration} phút\nTổng tiền: ${total.toLocaleString("vi-VN")}đ\nThanh toán: ${paymentMethod === "qr" ? "Quét mã QR" : "Tiền mặt tại quầy"}\nTrạng thái: Chờ xác nhận\n\nCảm ơn bạn đã sử dụng dịch vụ.`
      );
    }

    const result = await Appointment.findById(appointment._id)
      .populate("customer", "name email")
      .populate("employee", "name email")
      .populate("services", "name duration price image")
      .populate("service", "name duration price image");

    res.status(201).json({ message: "Đặt lịch thành công", appointment: result });
  } catch (e) {
    console.error("BOOKING ERROR:", e);
    res.status(500).json({ message: e.message || "Lỗi đặt lịch" });
  }
});

router.put("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "confirmed", "completed", "cancelled"];
    if (!allowed.includes(status)) return res.status(400).json({ message: "Trạng thái không hợp lệ" });

    const appointment = await Appointment.findById(req.params.id)
      .populate("customer", "name email")
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
      .populate("customer", "name email")
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
      .populate("customer", "name email")
      .populate("employee", "name email")
      .populate("services", "name duration price")
      .populate("service", "name duration price");

    if (!appointment) return res.status(404).json({ message: "Không tìm thấy lịch hẹn" });

    const isOwner = appointment.customer?._id?.toString() === req.user.id.toString();
    if (!isOwner && req.user.role !== "admin") return res.status(403).json({ message: "Bạn không có quyền hủy lịch này" });

    appointment.status = "cancelled";
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
