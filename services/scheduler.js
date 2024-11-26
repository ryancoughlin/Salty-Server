const schedule = require('node-schedule');
const { logger } = require('../utils/logger');
const { updateAllBuoys } = require('./ndbcService');

// Update buoy data every hour
const scheduleBuoyUpdates = () => {
  logger.info('Scheduling buoy data updates');
  
  // Run immediately on startup
  updateAllBuoys().catch(error => {
    logger.error('Failed initial buoy update:', error);
  });

  // Then schedule hourly updates
  schedule.scheduleJob('0 * * * *', async () => {
    try {
      await updateAllBuoys();
      logger.info('Completed scheduled buoy update');
    } catch (error) {
      logger.error('Failed scheduled buoy update:', error);
    }
  });
};

module.exports = {
  scheduleBuoyUpdates
}; 