const axios = require("axios");

const RAPID_API_KEY = process.env.RAPIDAPI_KEY;
const RAPID_API_HOST = "booking-com15.p.rapidapi.com";

async function searchHotels(location, checkIn, checkOut, adults = 2) {

  const options = {
    method: "GET",
    url: `https://${RAPID_API_HOST}/api/v1/hotels/searchHotels`,
    params: {
      query: location,     // Example: "Paris" or "Dubai"
      checkin_date: checkIn,
      checkout_date: checkOut,
      adults_number: adults
    },
    headers: {
      "x-rapidapi-key": RAPID_API_KEY,
      "x-rapidapi-host": RAPID_API_HOST
    }
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (err) {
    console.error("API ERROR:", err.response?.data || err.message);
    throw err;
  }
}

module.exports = { searchHotels };
