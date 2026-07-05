// Simple in-memory cache store
const store = {};

function getCache(key) {
  return store[key] || null;
}

function setCache(key, value) {
  store[key] = value;
}

function clearCache(key) {
  if (key) delete store[key];
  else Object.keys(store).forEach(k => delete store[k]);
}

module.exports = { getCache, setCache, clearCache };
