const axios = require('axios');
require('dotenv').config();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'booking-com.p.rapidapi.com';

async function getRegionId(region) {
  const response = await axios.get(
    'https://booking-com.p.rapidapi.com/v1/hotels/locations',
    {
      params: { name: region },
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      }
    }
  );
  return response.data[0]?.dest_id || null;
}

async function searchHotels(region, checkin, checkout, adults) {
  const regionId = await getRegionId(region);
  if (!regionId) return null;

  const response = await axios.get(
    'https://booking-com.p.rapidapi.com/v1/hotels/search',
    {
      params: {
        dest_id: regionId,
        dest_type: 'city',
        checkin_date: checkin,
        checkout_date: checkout,
        adults_number: adults,
        order_by: 'popularity',
        room_number: 1,
        units: 'metric',
      },
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      }
    }
  );

  return response.data;
}

// Export functions so server.js can use them
module.exports = {
  searchHotels
};
