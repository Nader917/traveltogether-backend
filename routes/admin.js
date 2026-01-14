const express = require('express');
const router = express.Router();
const Booking = require('../models/booking');
const authMiddleware = require('../middleware/authMiddleware'); // JWT check
const adminMiddleware = require('../middleware/adminMiddleware'); // now exists
const HotelBooking = require('../models/hotelBooking');

// GET all bookings (admin only)
router.get('/bookings', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Approve booking
router.patch('/bookings/:id/approve', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    res.json(booking);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Reject booking
router.patch('/bookings/:id/reject', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    res.json(booking);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});
// GET all hotel bookings (admin only)
router.get('/hotel-bookings', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const bookings = await HotelBooking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});


module.exports = router;
