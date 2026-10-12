const mongoose = require("mongoose");

const employeeLeaveSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true },
  reason: { type: String, default: "Nghỉ theo lịch" },
  note: { type: String, default: "" }
}, { timestamps: true });

employeeLeaveSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("EmployeeLeave", employeeLeaveSchema);
