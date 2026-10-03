const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Appointment = require("../models/Appointment");
const Review = require("../models/Review");
const { auth, role } = require("../middleware/auth");

router.get("/", auth, role("admin"), async (req, res) => {
  try {
    const customers = await User.find({ role: "customer" }).select("name email phone createdAt").sort({ createdAt: -1 }).lean();
    const ids = customers.map(c => c._id);
    const [counts, spent, reviews, cancelled] = await Promise.all([
      Appointment.aggregate([
        { $match: { customer: { $in: ids }, status: { $ne: "cancelled" } } },
        { $group: { _id: "$customer", count: { $sum: 1 } } }
      ]),
      Appointment.aggregate([
        { $match: { customer: { $in: ids }, status: "completed" } },
        { $lookup: { from: "services", localField: "services", foreignField: "_id", as: "servicesData" } },
        { $project: {
          customer: 1,
          total: {
            $add: [
              { $sum: { $map: { input: "$servicesData", as: "s", in: { $ifNull: ["$$s.price", 0] } } } },
              { $sum: { $map: { input: { $ifNull: ["$selectedSubServices", []] }, as: "s", in: { $ifNull: ["$$s.price", 0] } } } }
            ]
          }
        } },
        { $group: { _id: "$customer", total: { $sum: "$total" } } }
      ]),
      Review.aggregate([{ $match: { customer: { $in: ids } } }, { $group: { _id: "$customer", count: { $sum: 1 } } }]),
      Appointment.aggregate([{ $match: { customer: { $in: ids }, status: "cancelled" } }, { $group: { _id: "$customer", count: { $sum: 1 } } }])
    ]);
    const map = (items) => Object.fromEntries(items.map(x => [String(x._id), x]));
    const countMap = map(counts), spentMap = map(spent), reviewMap = map(reviews), cancelledMap = map(cancelled);
    res.json(customers.map(c => ({
      ...c,
      bookingCount: countMap[String(c._id)]?.count || 0,
      spent: spentMap[String(c._id)]?.total || 0,
      reviewCount: reviewMap[String(c._id)]?.count || 0,
      cancelledCount: cancelledMap[String(c._id)]?.count || 0
    })));
  } catch (e) {
    res.status(500).json({ message: "Không thể tải danh sách khách hàng", error: e.message });
  }
});

router.get("/:id", auth, role("admin"), async (req, res) => {
  try {
    const customer = await User.findOne({ _id: req.params.id, role: "customer" })
      .select("name email phone createdAt")
      .lean();
    if (!customer) return res.status(404).json({ message: "Không tìm thấy khách hàng." });

    const appointments = await Appointment.find({ customer: customer._id })
      .populate("employee", "name")
      .populate("services", "name price")
      .populate("service", "name price")
      .sort({ createdAt: -1 })
      .lean();

    const servicesOf = a => (a.services?.length ? a.services : (a.service ? [a.service] : []));
    const totalOf = a => servicesOf(a).reduce((sum, s) => sum + Number(s?.price || 0), 0)
      + (a.selectedSubServices || []).reduce((sum, s) => sum + Number(s?.price || 0), 0);
    const completed = appointments.filter(a => a.status === "completed");
    const active = appointments.filter(a => a.status !== "cancelled");
    const cancelled = appointments.filter(a => a.status === "cancelled");

    res.json({
      customer,
      stats: {
        revenue: completed.reduce((sum, a) => sum + totalOf(a), 0),
        bookedValue: active.reduce((sum, a) => sum + totalOf(a), 0),
        completedCount: completed.length,
        bookingCount: active.length,
        cancelledCount: cancelled.length,
        totalOrders: appointments.length
      },
      appointments
    });
  } catch (e) {
    res.status(500).json({ message: "Không thể tải chi tiết khách hàng", error: e.message });
  }
});

module.exports = router;
