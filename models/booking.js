const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  vehicleId: String,
  vehicleName: String,
  fullName: String,
  email: String,
  phone: String,
  passengers: Number,
  pickup: String,
  dropoff: String,
  date: String,
  time: String,
  notes: String,
  status: { type: String, enum: ["pending","approved","completed","cancelled"], default: "pending" },
  emailConfirmed: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  emailToken: String,
  phoneOtp: String,
  phoneOtpExpires: Date,
  payment: {
    status: { type: String, enum: ["unpaid","paid","failed"], default: "unpaid"},
    provider: String,
    providerPaymentId: String
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Booking", BookingSchema);
