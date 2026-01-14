const mongoose = require('mongoose');

const HotelBookingSchema = new mongoose.Schema({
  hotelName: { type: String, required: true },
  address: { type: String },
  city: { type: String, required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  guests: { type: Number, default: 1 },
  phone: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'pending' }, // pending, confirmed, cancelled
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HotelBooking', HotelBookingSchema);
