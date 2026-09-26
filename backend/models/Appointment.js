const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  // Một lịch hẹn có thể gồm nhiều dịch vụ.
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true
  }],

  // Giữ trường service cũ để không làm hỏng dữ liệu lịch hẹn cũ.
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service"
  },

  date: { type: String, required: true },
  time: { type: String, required: true },
  note: String,
  paymentMethod: {
    type: String,
    enum: ["cash", "qr"],
    default: "cash"
  },
  paymentStatus: {
    type: String,
    enum: ["unpaid", "paid"],
    default: "unpaid"
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "completed", "cancelled"],
    default: "pending"
  }
}, { timestamps: true });

module.exports = mongoose.model("Appointment", appointmentSchema);
