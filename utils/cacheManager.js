const { logger } = require('./logger');
const CONFIG = require('../config/waveModelConfig');

/**
 * Calculates cache duration based on NOAA wave model run times
 * Memoized to recalculate only once per minute for performance
 */
const getModelRunCacheDuration = (() => {
    let cachedDuration = null;
    let lastCalculated = 0;
    const RECALCULATE_INTERVAL = 60000; // 1 minute in milliseconds
    
    const calculate = () => {
        const now = new Date();
        const currentHour = now.getUTCHours();
        const currentMinute = now.getUTCMinutes();

        // Find next model run hour (00, 06, 12, 18)
        const modelRuns = CONFIG.modelRuns.hours.map(h => parseInt(h));
        const nextRun = modelRuns.find(hour => hour > currentHour) || modelRuns[0];
        
        // Calculate hours until next run
        let hoursUntilNextRun = nextRun > currentHour ? 
            nextRun - currentHour : 
            (24 - currentHour) + nextRun;
        
        // Add model availability delay (typically 5 hours)
        hoursUntilNextRun += CONFIG.modelRuns.availableAfter[nextRun.toString().padStart(2, '0')];
        
        // Convert to seconds and subtract elapsed minutes
        const cacheDuration = (hoursUntilNextRun * 60 - currentMinute) * 60;
        
        // Cap at maximum cache duration from config (6 hours)
        return Math.min(cacheDuration, CONFIG.cache.hours * 3600);
    };
    
    return () => {
        const now = Date.now();
        // Recalculate if no cached value or cache is older than 1 minute
        if (!cachedDuration || now - lastCalculated > RECALCULATE_INTERVAL) {
            cachedDuration = calculate();
            lastCalculated = now;
            logger.debug('Recalculated model run cache duration', { 
                cacheDuration: cachedDuration,
                nextCalculation: new Date(now + RECALCULATE_INTERVAL).toISOString()
            });
        }
        return cachedDuration;
    };
})();

module.exports = {
    getModelRunCacheDuration
}; 