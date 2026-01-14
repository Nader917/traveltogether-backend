const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();

const RAPIDAPI_HOST = "booking-com15.p.rapidapi.com";
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

// Step 1: Get destination ID from search
async function getDestinationInfo(query) {
  const url = `https://${RAPIDAPI_HOST}/api/v1/hotels/searchDestination`;

  const options = {
    method: "GET",
    url,
    params: { query },
    headers: {
      "x-rapidapi-key": RAPIDAPI_KEY,
      "x-rapidapi-host": RAPIDAPI_HOST,
    },
  };

  const response = await axios.request(options);
  return response.data;
}

router.get("/hotels", async (req, res) => {
  try {
    // ✅ page comes from frontend
    const { city, checkIn, checkOut, adults = 2, page = 1 } = req.query;

    if (!city || !checkIn || !checkOut) {
      return res.status(400).json({
        status: false,
        message: "Missing required params: city, checkIn, checkOut",
      });
    }

    // Step 1 — Resolve Destination
    const destResponse = await getDestinationInfo(city);

    if (!destResponse.status || !destResponse.data || destResponse.data.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No matching destination found",
      });
    }

    const dest = destResponse.data[0];

    console.log("✔ Destination:", dest.dest_id, dest.search_type);

    // Step 2 — Fetch hotels using dest_id
    const hotelUrl = `https://${RAPIDAPI_HOST}/api/v1/hotels/searchHotels`;

    const hotelOptions = {
      method: "GET",
      url: hotelUrl,
      params: {
        dest_id: dest.dest_id,
        search_type: dest.search_type.toUpperCase(),
        arrival_date: checkIn,
        departure_date: checkOut,
        adults,
        room_qty: 1,
        page_number: Number(page), // ✅ pagination
        languagecode: "en-us",
        currency_code: "USD",
      },
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
      },
    };

    const hotelsResponse = await axios.request(hotelOptions);

    // 🔥 THE ACTUAL FIX (THIS IS WHAT YOU WERE MISSING)
    const hotels = hotelsResponse.data.data.hotels || [];

    const hotelsPerPage = hotels.length;

    // Booking tells total hotels in destination
    const totalHotels = dest.nr_hotels || dest.hotels || 0;

    const totalPages = hotelsPerPage
      ? Math.ceil(totalHotels / hotelsPerPage)
      : 1;

    // ✅ FINAL RESPONSE
    return res.json({
      status: true,
      destination: dest,
      hotels,
      pagination: {
        currentPage: Number(page),
        totalHotels,
        hotelsPerPage,
        totalPages,
      },
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({
      status: false,
      error: error.response?.data || error.message,
    });
  }
});

module.exports = router;
