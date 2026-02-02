// In-memory cache for API responses
const cache = {
  gainers: { data: null, lastUpdate: null, timeframe: null },
  volume: { data: null, lastUpdate: null, timeframe: null },
  funding: { data: null, lastUpdate: null },
  wallets: { data: null, lastUpdate: null },
  tickers: { data: null, lastUpdate: null },
  excludedCoins: new Set(),
  excludedCoinsLastUpdate: null
};

// Update intervals in milliseconds
const UPDATE_INTERVALS = {
  gainers: 60 * 1000,           // 60 seconds
  volume: 60 * 1000,            // 60 seconds
  funding: 60 * 1000,           // 60 seconds
  wallets: 5 * 60 * 1000,       // 5 minutes
  tickers: 30 * 1000,           // 30 seconds
  exclusionList: 24 * 60 * 60 * 1000  // 24 hours
};

// Check if cache is valid
export function isCacheValid(key, timeframe = null) {
  const entry = cache[key];
  if (!entry || !entry.data || !entry.lastUpdate) return false;

  // Check timeframe match if applicable
  if (timeframe && entry.timeframe !== timeframe) return false;

  const interval = UPDATE_INTERVALS[key] || UPDATE_INTERVALS.tickers;
  return Date.now() - entry.lastUpdate < interval;
}

// Get cached data
export function getCache(key) {
  return cache[key]?.data || null;
}

// Set cache data
export function setCache(key, data, timeframe = null) {
  cache[key] = {
    data,
    lastUpdate: Date.now(),
    timeframe
  };
}

// Get excluded coins set
export function getExcludedCoins() {
  return cache.excludedCoins;
}

// Set excluded coins
export function setExcludedCoins(coins) {
  cache.excludedCoins = new Set(coins);
  cache.excludedCoinsLastUpdate = Date.now();
}

// Check if exclusion list needs refresh
export function isExclusionListStale() {
  if (!cache.excludedCoinsLastUpdate) return true;
  return Date.now() - cache.excludedCoinsLastUpdate > UPDATE_INTERVALS.exclusionList;
}

// Get last update timestamp
export function getLastUpdate(key) {
  return cache[key]?.lastUpdate || null;
}

export default cache;
