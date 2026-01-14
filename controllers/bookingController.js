const Booking = require("../models/booking");
const { sendEmail } = require("../utils/mail");
const { sendSms } = require("../utils/sms");
const crypto = require("crypto");

// create booking (called by your Angular form)
exports.createBooking = async (req, res) => {
  try {
    const payload = req.body;

    // create email token and phone OTP
    const emailToken = crypto.randomBytes(20).toString("hex"); // long token for link
    const phoneOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const phoneOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const booking = await Booking.create({
      ...payload,
      emailToken,
      phoneOtp,
      phoneOtpExpires,
      status: "pending",
      emailConfirmed: false,
      phoneVerified: false
    });

    // Send confirmation email (link)
    const confirmUrl = `${process.env.FRONTEND_URL}/confirm-booking?bookingId=${booking._id}&token=${emailToken}`;
    const emailHtml = `
      <p>Hi ${booking.fullName},</p>
      <p>Thanks for booking the ${booking.vehicleName}. Please confirm your email by clicking the link below:</p>
      <p><a href="${confirmUrl}">Confirm Booking</a></p>
      <p>If you did not request this, ignore this email.</p>
    `;
    await sendEmail({
      to: booking.email,
      subject: "Confirm your BusTraveller booking",
      html: emailHtml
    });

    // Send OTP to phone
    if (booking.phone) {
      await sendSms(booking.phone, `Your BusTraveller verification code: ${phoneOtp}`);
    }

    res.json({ msg: "Booking created. Check email and SMS for verification.", bookingId: booking._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Email confirmation endpoint
exports.confirmEmail = async (req, res) => {
  try {
    const { bookingId, token } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });
    if (booking.emailConfirmed) return res.json({ msg: "Email already confirmed" });

    if (booking.emailToken !== token) return res.status(400).json({ msg: "Invalid token" });

    booking.emailConfirmed = true;
    booking.emailToken = null;
    await booking.save();

    res.json({ msg: "Email confirmed", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Phone OTP verification endpoint
exports.verifyPhoneOtp = async (req, res) => {
  try {
    const { bookingId, otp } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });
    if (booking.phoneVerified) return res.json({ msg: "Phone already verified" });

    if (booking.phoneOtp !== otp) return res.status(400).json({ msg: "Invalid OTP" });
    if (booking.phoneOtpExpires < new Date()) return res.status(400).json({ msg: "OTP expired" });

    booking.phoneVerified = true;
    booking.phoneOtp = null;
    booking.phoneOtpExpires = null;
    await booking.save();

    res.json({ msg: "Phone verified", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: get all bookings with filters/pagination
exports.getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, q } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (q) filter.$or = [
      { fullName: new RegExp(q, "i") },
      { email: new RegExp(q, "i") },
      { phone: new RegExp(q, "i") },
      { vehicleName: new RegExp(q, "i") }
    ];

    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

    res.json({ bookings, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: change booking status (approve / complete / cancel)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body; // expected 'approved','completed','cancelled'
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    booking.status = status;
    await booking.save();

    // optional: notify client via email/SMS
    await sendEmail({
      to: booking.email,
      subject: `Your booking status changed to ${status}`,
      html: `<p>Your booking for ${booking.vehicleName} is now <strong>${status}</strong>.</p>`
    });

    if (booking.phone) {
      await sendSms(booking.phone, `Your BusTraveller booking status is now ${status}.`);
    }

    res.json({ msg: "Status updated", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
