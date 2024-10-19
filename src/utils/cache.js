const cache = new Map();

export function setCache(key, value, duration = 3600000) { // Default duration: 1 hour
  cache.set(key, {
    value,
    expiry: Date.now() + duration
  });
}

export function getCache(key) {
  const item = cache.get(key);
  if (!item) return null;

  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }

  return item.value;
}