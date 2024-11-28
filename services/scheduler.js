const schedule = require('node-schedule');
const { logger } = require('../utils/logger');
const { getCache, clearExpiredCache } = require('../utils/cache');

// Clean expired cache entries periodically
const scheduleCacheCleanup = () => {
    logger.info('Scheduling cache cleanup');
    
    // Run cache cleanup every hour
    schedule.scheduleJob('0 * * * *', async () => {
        try {
            await clearExpiredCache();
            logger.info('Completed scheduled cache cleanup');
        } catch (error) {
            logger.error('Failed scheduled cache cleanup:', error);
        }
    });
};

module.exports = {
    scheduleCacheCleanup
}; 