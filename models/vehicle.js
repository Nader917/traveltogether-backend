const mongoose = require("mongoose");

const VehicleSchema = new mongoose.Schema({
  slug: { type: String, unique: true }, // e.g., 'otokar'
  name: String,
  seats: Number,
  images: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Vehicle", VehicleSchema);
