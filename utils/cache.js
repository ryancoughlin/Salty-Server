const { logger } = require('./logger');

// In-memory cache storage
const cache = new Map();
const ttls = new Map();

/**
 * Get a value from cache
 * @param {string} key - Cache key
 * @returns {Promise<any>} Cached value or null if not found/expired
 */
async function getCache(key) {
  const ttl = ttls.get(key);
  if (ttl && ttl < Date.now()) {
    cache.delete(key);
    ttls.delete(key);
    return null;
  }
  return cache.get(key);
}

/**
 * Set a value in cache
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttlSeconds - Time to live in seconds
 * @returns {Promise<void>}
 */
async function setCache(key, value, ttlSeconds) {
  cache.set(key, value);
  if (ttlSeconds) {
    ttls.set(key, Date.now() + (ttlSeconds * 1000));
  }
  logger.debug(`Cached ${key} for ${ttlSeconds} seconds`);
}

/**
 * Clear expired cache entries
 * @returns {Promise<void>}
 */
async function clearExpiredCache() {
  const now = Date.now();
  for (const [key, ttl] of ttls.entries()) {
    if (ttl < now) {
      cache.delete(key);
      ttls.delete(key);
    }
  }
  logger.info('Expired cache entries cleared');
}

module.exports = {
  getCache,
  setCache,
  clearExpiredCache
}; 