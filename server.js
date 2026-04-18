const express = require("express");
const cors = require("cors");
const path = require("path"); // ✅ FIXED
require("dotenv").config();
const connectDB = require("./config/db");

// routes...
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const hotelsRoute = require("./routes/hotels");
const hotelBookingsRouter = require('./routes/hotelBookings');
const flightsRoutes = require('./routes/flights.routes');

const app = express();

const corsOptions = {
  origin: [
    "https://www.traveltogether-agency.com",
    "https://traveltogether-agency.com",
  ],
  credentials: true,
};

connectDB();

app.use(cors(corsOptions));
app.use(express.json());

// ✅ STATIC FILES + CACHE
app.use(express.static(path.join(__dirname, 'dist/bus-traveller'), {
  maxAge: '1y',
  setHeaders: (res, filePath) => {
    if (filePath.match(/\.(mp4|webp|jpg|jpeg|png|css|js)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// API routes
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/", hotelsRoute);
app.use('/api/hotels', hotelBookingsRouter);
app.use('/api/admin/hotel-bookings', hotelBookingsRouter);
app.use('/api/flights', flightsRoutes);

// API root
app.get("/", (req, res) => {
  res.send("API is running");
});

// Angular fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/bus-traveller/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
