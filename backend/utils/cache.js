const NodeCache = require("node-cache");

// TTL in seconds, adjust default as needed
const cache = new NodeCache({ stdTTL: 30, checkperiod: 10 });

/**
 * Set value in cache
 * @param {string} key 
 * @param {*} value 
 * @param {number} ttl optional TTL in seconds for this key
 */
function setCache(key, value, ttl) {
  if (ttl) {
    cache.set(key, value, ttl);
  } else {
    cache.set(key, value);
  }
}

/**
 * Get value from cache
 * @param {string} key 
 * @returns {*} cached value or undefined
 */
function getCache(key) {
  return cache.get(key);
}

/**
 * Delete value from cache
 * @param {string} key
 */
function deleteCache(key) {
  cache.del(key);
}

/**
 * Clear all cache
 */
function clearCache() {
  cache.flushAll();
}

module.exports = { setCache, getCache, deleteCache, clearCache };
