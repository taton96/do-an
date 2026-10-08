const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Appointment = require("../models/Appointment");
const { auth, role } = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { customer: req.user.id };
    const reviews = await Review.find(filter)
      .populate("customer", "name")
      .populate("service", "name")
      .populate("appointment", "date time")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (e) { res.status(500).json({ message: "Không thể tải đánh giá", error: e.message }); }
});

router.get("/eligible", auth, role("customer"), async (req, res) => {
  try {
    const appointments = await Appointment.find({ customer: req.user.id, status: "completed" })
      .populate("services", "name")
      .populate("service", "name")
      .sort({ date: -1, time: -1 });
    const reviewed = await Review.find({ customer: req.user.id }).select("appointment").lean();
    const reviewedIds = new Set(reviewed.map(r => String(r.appointment)));
    res.json(appointments.filter(a => !reviewedIds.has(String(a._id))));
  } catch (e) { res.status(500).json({ message: "Không thể tải lịch đủ điều kiện đánh giá", error: e.message }); }
});

router.post("/", auth, role("customer"), async (req, res) => {
  try {
    const { appointment, rating, comment } = req.body;
    const value = Number(rating);
    if (!appointment || !Number.isInteger(value) || value < 1 || value > 5) return res.status(400).json({ message: "Điểm đánh giá phải từ 1 đến 5." });
    const booking = await Appointment.findOne({ _id: appointment, customer: req.user.id, status: "completed" });
    if (!booking) return res.status(404).json({ message: "Chỉ có thể đánh giá lịch đã hoàn thành của bạn." });
    const serviceId = booking.services?.[0] || booking.service;
    const review = await Review.create({ appointment: booking._id, customer: req.user.id, service: serviceId, rating: value, comment: String(comment || "").trim() });
    res.status(201).json({ message: "Đã gửi đánh giá.", review });
  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ message: "Lịch này đã được đánh giá." });
    res.status(500).json({ message: "Không thể gửi đánh giá", error: e.message });
  }
});

router.delete("/:id", auth, role("admin"), async (req, res) => {
  try { await Review.findByIdAndDelete(req.params.id); res.json({ message: "Đã xóa đánh giá." }); }
  catch (e) { res.status(500).json({ message: "Không thể xóa đánh giá", error: e.message }); }
});

module.exports = router;
