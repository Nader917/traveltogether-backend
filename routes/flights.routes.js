const express = require('express');
const router = express.Router();
const axios = require('axios');

const RAPIDAPI_HOST = 'booking-com15.p.rapidapi.com';
const BASE_URL = 'https://booking-com15.p.rapidapi.com/api/v1/flights';

const headers = {
  'x-rapidapi-key': process.env.RAPIDAPI_KEY,
  'x-rapidapi-host': RAPIDAPI_HOST
};

// 🔍 Airport / location search
router.get('/airports', async (req, res) => {
  try {
    const { query, languagecode } = req.query;

    if (!query) {
      return res.status(400).json({
        error: 'query is required (city, airport, country, etc.)'
      });
    }

    const response = await axios.get(`${BASE_URL}/searchDestination`, {
      headers,
      params: {
        query,
        ...(languagecode && { languagecode })
      }
    });

    res.json(response.data);

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to search destinations' });
  }
});
router.get('/search', async (req, res) => {
  try {
    const {
      fromId,
      toId,
      departDate,
      returnDate,
      stops = 'none',
      pageNo = 1,
      adults = 1,
      children,
      sort = 'BEST',
      cabinClass = 'ECONOMY',
      currency_code = 'AED'
    } = req.query;

    // 🔴 Required params validation
    if (!fromId || !toId || !departDate) {
      return res.status(400).json({
        error: 'fromId, toId and departDate are required'
      });
    }

    // 🔴 Date format validation
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(departDate)) {
      return res.status(400).json({
        error: 'departDate must be in YYYY-MM-DD format'
      });
    }

    if (returnDate && !dateRegex.test(returnDate)) {
      return res.status(400).json({
        error: 'returnDate must be in YYYY-MM-DD format'
      });
    }

    const response = await axios.get(`${BASE_URL}/searchFlights`, {
      headers,
      params: {
        fromId,
        toId,
        departDate,
        ...(returnDate && { returnDate }),
        stops,
        pageNo,
        adults,
        ...(children && { children }),
        sort,
        cabinClass,
        currency_code
      }
    });
    
    // ✅ SORT FLIGHTS BY DEPARTURE TIME (EARLIEST → LATEST)
    const data = response.data;
    
    if (data?.data?.flights && Array.isArray(data.data.flights)) {
      data.data.flights.sort((a, b) => {
        const timeA = new Date(a.segments[0].departureDateTime).getTime();
        const timeB = new Date(b.segments[0].departureDateTime).getTime();
        return timeA - timeB;
      });
    }
    
    res.json(data);
    

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Flight search failed' });
  }
});

module.exports = router;
