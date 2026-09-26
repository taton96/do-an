const mongoose = require("mongoose");

const subServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: "" },
  price: { type: Number, default: 0, min: 0 }
}, { _id: false });

module.exports = mongoose.model("Service", new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  duration: { type: Number, default: 60 },
  price: { type: Number, default: 0 },
  image: { type: String, default: "/images/services/cat-toc-3d.jpg" },
  active: { type: Boolean, default: true },
  subServices: { type: [subServiceSchema], default: [] }
}, { timestamps: true }));
