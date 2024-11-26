const mongoose = require("mongoose");
const WaveForecast = require("../models/waveForecast.model");
const { logger } = require('../utils/logger');

// Function to generate time slots for every 3 hours in ISO format for the next 7 days
const generateTimeSlots = (days = 7) => {
  const timeSlots = [];
  const currentTime = new Date();
  currentTime.setUTCHours(0, 0, 0, 0); // Set to the start of the current day in UTC
  const endTime = new Date(currentTime);
  endTime.setDate(currentTime.getDate() + days);

  while (currentTime <= endTime) {
    timeSlots.push(currentTime.toISOString());
    currentTime.setUTCHours(currentTime.getUTCHours() + 3);
  }
  return timeSlots;
};

const getNearestWaveData = async (lat, lon, maxDistanceInMeters = 500000) => {
  try {
    logger.info(`Getting nearest wave data for lat: ${lat}, lon: ${lon}`);
    
    // Generate time slots for every 3 hours within the next 7 days
    const timeSlots = generateTimeSlots();
    logger.debug(`Generated ${timeSlots.length} time slots`);

    // Find the nearest points and their data using a single query
    const nearestPoints = await WaveForecast.find({
      location: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [lon, lat],
          },
          $maxDistance: maxDistanceInMeters,
        },
      },
      time: {
        $gte: new Date(timeSlots[0]),
        $lte: new Date(timeSlots[timeSlots.length - 1]),
      },
    }).sort({ "dist.calculated": 1, time: -1 });

    if (!nearestPoints || nearestPoints.length === 0) {
      logger.warn('No wave data found for the specified location');
      return [];
    }

    const results = timeSlots
      .map((time) => {
        const dataPoint = nearestPoints.find(
          (point) => point.time.toISOString() === time
        );
        return dataPoint ? dataPoint : null;
      })
      .filter((dataPoint) => dataPoint !== null);

    logger.info(`Found ${results.length} wave data points`);
    return results;
  } catch (error) {
    logger.error('Error in getNearestWaveData:', error);
    throw error;
  }
};

module.exports = {
  getNearestWaveData,
};
