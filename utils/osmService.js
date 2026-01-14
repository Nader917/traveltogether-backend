const axios = require('axios');
const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY; // Add your Google API key

/**
 * Get bounding box for a city/region using Nominatim
 * Returns [south, west, north, east]
 */
async function getBoundingBox(cityName) {
  try {
    const res = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: cityName,
        format: 'json',
        limit: 1,
      },
      headers: { 'User-Agent': 'FreeHotelApp/1.0' }
    });

    if (!res.data.length) return null;

    const bbox = res.data[0].boundingbox; // [south, north, west, east]
    return [parseFloat(bbox[0]), parseFloat(bbox[2]), parseFloat(bbox[1]), parseFloat(bbox[3])];
  } catch (err) {
    console.error('Nominatim error:', err.message);
    return null;
  }
}

/**
 * Get a Google Places image for a hotel
 */
async function getGoogleHotelImage(hotelName, city) {
  try {
    const query = encodeURIComponent(`${hotelName} ${city}`);
    const res = await axios.get(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${GOOGLE_API_KEY}`
    );

    const result = res.data.results?.[0];
    if (result?.photos?.[0]?.photo_reference) {
      const photoRef = result.photos[0].photo_reference;
      return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoRef}&key=${GOOGLE_API_KEY}`;
    }
    return null;
  } catch (err) {
    console.error('Google Places API error:', err.message);
    return null;
  }
}

/**
 * Unsplash fallback image
 */
async function getUnsplashImage(city, hotelName) {
  try {
    const query = hotelName ? `${hotelName} ${city} hotel` : `${city} hotel`;
    const res = await axios.get('https://api.unsplash.com/search/photos', {
      params: { query, per_page: 1 },
      headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` }
    });

    if (res.data.results?.length) return res.data.results[0].urls.small;
    return null;
  } catch (err) {
    console.error('Unsplash API error:', err.message);
    return null;
  }
}

/**
 * Extract image from OSM tags
 */
function getHotelImage(tags) {
  if (tags?.image) return tags.image;
  return null;
}

/**
 * Fetch hotels with images
 */
async function getHotels(cityName, limit = 50) {
  try {
    const bbox = await getBoundingBox(cityName.trim());
    if (!bbox) return [];

    const [south, west, north, east] = bbox;

    const query = `
      [out:json][timeout:25];
      (
        node["tourism"="hotel"](${south},${west},${north},${east});
      );
      out center ${limit};
    `;

    const res = await axios.post(
      'https://overpass-api.de/api/interpreter',
      `data=${encodeURIComponent(query)}`,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    // Fetch images in parallel
    const hotelsWithImages = await Promise.all(
      res.data.elements.map(async (h) => {
        let image = getHotelImage(h.tags);

        // First try Google Places for real hotel image
        if (!image && h.tags?.name) {
          image = await getGoogleHotelImage(h.tags.name, cityName);
        }

        // Then Unsplash fallback
        if (!image) {
          image = await getUnsplashImage(cityName, h.tags?.name);
        }

        // Finally, Picsum placeholder
        if (!image) {
          image = `https://picsum.photos/seed/${h.id}/400/300.jpg`;
        }

        return {
          id: h.id,
          name: h.tags?.name || h.tags?.operator || 'Unnamed Hotel',
          lat: h.lat || h.center?.lat,
          lon: h.lon || h.center?.lon,
          address: h.tags?.addr_full || `${h.tags?.["addr:street"] || ''}, ${h.tags?.["addr:city"] || ''}`,
          image
        };
      })
    );

    return hotelsWithImages;
  } catch (err) {
    console.error('OSM Overpass API error:', err.message);
    return [];
  }
}

module.exports = { getHotels };
