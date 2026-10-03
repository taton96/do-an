const mongoose = require("mongoose");

const workScheduleSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String },
  dayOfWeek: { type: Number },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("WorkSchedule", workScheduleSchema);
