const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

// Import routes
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
    "http://localhost:4200",
    "https://traveltogether-agency.com",
  ],
  credentials: true,
};
// Connect to MongoDB
connectDB();

app.use(cors(corsOptions));

app.use(express.json());

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/", hotelsRoute);
app.use('/api/hotels', hotelBookingsRouter); // user hotel booking API
app.use('/api/admin/hotel-bookings', hotelBookingsRouter); // admin view
app.use('/api/flights', flightsRoutes);

app.get("/", (req, res) => {
  res.send("API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
