const axios = require('axios');

async function getBoundingBox(city) {
  try {
    const res = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { q: city, format: 'json', limit: 1 },
      headers: { 'User-Agent': 'BusTravellerApp/1.0' }
    });

    if (!res.data.length) return null;

    const bbox = res.data[0].boundingbox; // [south, north, west, east]
    return [bbox[0], bbox[1], bbox[2], bbox[3]].join(',');
  } catch (err) {
    console.error('Geocoding error:', err.message);
    return null;
  }
}
module.exports = { getBoundingBox };