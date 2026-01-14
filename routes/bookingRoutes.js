const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const bookingCtrl = require("../controllers/bookingController");

router.post("/", bookingCtrl.createBooking); // public

router.post("/confirm-email", bookingCtrl.confirmEmail); // user clicks link or frontend calls with bookingId+token
router.post("/verify-phone", bookingCtrl.verifyPhoneOtp); // bookingId + otp

// admin protected:
router.get("/", auth, role("admin"), bookingCtrl.getAllBookings);
router.patch("/:bookingId/status", auth, role("admin"), bookingCtrl.updateBookingStatus);

module.exports = router;
