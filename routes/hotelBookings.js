const express = require('express');
const router = express.Router();
const HotelBooking = require('../models/hotelBooking'); // Mongoose model

// Public hotel booking route
router.post('/book', async (req, res) => {
  try {
    const { hotelName, city, checkIn, checkOut, guests, phone } = req.body;

    if (!hotelName || !city || !checkIn || !checkOut || !phone) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    const booking = await HotelBooking.create({
      hotelName,
      city,
      checkIn,
      checkOut,
      guests,
      phone,
      status: 'pending'
    });

    res.json({ msg: 'Hotel booked successfully', booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
