const { getProcessedNoaaData } = require('../services/noaaService');
const Forecast = require('../models/forecast.model');

async function getForecast(req, res) {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const existingForecast = await Forecast.findOne({
      latitude: lat,
      longitude: lon,
      timestamp: { $gte: new Date(Date.now() - 3 * 60 * 60 * 1000) } // Data less than 3 hours old
    }).sort({ timestamp: -1 });

    if (existingForecast) {
      return res.json(existingForecast);
    }

    const forecastData = await getProcessedNoaaData(lat, lon);
    const newForecast = new Forecast({
      timestamp: new Date(),
      latitude: lat,
      longitude: lon,
      ...forecastData
    });

    await newForecast.save();
    res.json(newForecast);
  } catch (error) {
    console.error('Error in getForecast:', error);
    res.status(500).json({ error: 'An error occurred while fetching the forecast' });
  }
}

module.exports = { getForecast };