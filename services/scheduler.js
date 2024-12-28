const schedule = require('node-schedule');
const { logger } = require('../utils/logger');
const { getStats, clearCache } = require('../utils/cache');

// Monitor cache and cleanup if needed
const scheduleCacheMonitoring = () => {
    logger.info('Scheduling cache monitoring');
    
    // Monitor cache stats every hour
    schedule.scheduleJob('0 * * * *', async () => {
        try {
            const stats = getStats();
            logger.info('Cache statistics:', {
                hits: stats.hits,
                misses: stats.misses,
                hitRate: stats.hitRate,
                keys: stats.keys.length,
                memoryUsage: Math.round(stats.memoryUsage / 1024 / 1024) + 'MB'
            });

            // If memory usage is too high, clear the cache
            if (stats.memoryUsage > 500 * 1024 * 1024) { // 500MB threshold
                logger.warn('Cache memory usage too high, clearing cache');
                clearCache();
            }
        } catch (error) {
            logger.error('Failed cache monitoring:', error);
        }
    });
};

module.exports = {
    scheduleCacheMonitoring
}; 