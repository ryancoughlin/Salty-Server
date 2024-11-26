// services/stationService.js
const mongoose = require('mongoose');
const Spot = require('../models/spot.model');
const sanitize = require('mongo-sanitize');
const { logger } = require('../utils/logger');

const fetchClosestStation = async (lat, lon) => {
  try {
    logger.info(`Fetching closest station for lat: ${lat}, lon: ${lon}`);
    
    const query = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [sanitize(lon), sanitize(lat)],
          },
          $maxDistance: 100000, // 100km max distance
        },
      },
    };

    const station = await Spot.findOne(query);
    
    if (!station) {
      logger.warn('No station found near the specified location');
      return null;
    }

    logger.info(`Found station: ${station.name}`);
    return station;
  } catch (error) {
    logger.error('Error in fetchClosestStation:', error);
    throw error;
  }
};

const fetchAllStations = async () => {
  try {
    logger.info('Fetching all stations');
    const stations = await Spot.find({});
    logger.info(`Found ${stations.length} stations`);
    return stations;
  } catch (error) {
    logger.error('Error in fetchAllStations:', error);
    throw error;
  }
};

const fetchStationById = async (stationId) => {
  try {
    logger.info(`Fetching station by ID: ${stationId}`);
    const sanitizedId = sanitize(stationId);
    const station = await Spot.findOne({ stationId: sanitizedId });
    
    if (!station) {
      logger.warn(`No station found with ID: ${stationId}`);
      return null;
    }

    logger.info(`Found station: ${station.name}`);
    return station;
  } catch (error) {
    logger.error('Error in fetchStationById:', error);
    throw error;
  }
};

module.exports = {
  fetchClosestStation,
  fetchAllStations,
  fetchStationById,
};
