import { Buffer } from 'buffer';
import { setCache, getCache } from './cache.js';

const DATAFORSEO_USERNAME = import.meta.env.DATAFORSEO_USERNAME;
const DATAFORSEO_PASSWORD = import.meta.env.DATAFORSEO_PASSWORD;

const API_URL = 'https://api.dataforseo.com/v3/serp/google/maps/live/advanced';

async function makeRequest(data) {
  const auth = Buffer.from(`${DATAFORSEO_USERNAME}:${DATAFORSEO_PASSWORD}`).toString('base64');
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.status_code !== 20000) {
      throw new Error(`API error: ${result.status_message}`);
    }

    return result;
  } catch (error) {
    console.error('Error fetching data from DataForSEO:', error);
    throw error;
  }
}

export async function fetchTradespeople(keyword) {
  const cacheKey = `tradespeople:${keyword}`;
  const cachedData = getCache(cacheKey);
  if (cachedData) return cachedData;

  const data = [{
    keyword,
    location_code: 2372, // Ireland
    language_code: "en",
    device: "desktop",
    os: "windows",
    depth: 20 // Limit to 20 results for better performance
  }];

  try {
    const result = await makeRequest(data);
    const items = result.tasks[0].result[0].items || [];
    setCache(cacheKey, items, 86400); // Cache for 24 hours
    return items;
  } catch (error) {
    console.error(`Error fetching tradespeople for "${keyword}":`, error);
    return [];
  }
}

export async function fetchSingleBusiness(businessName) {
  const cacheKey = `business:${businessName}`;
  const cachedData = getCache(cacheKey);
  if (cachedData) return cachedData;

  try {
    const tradespeople = await fetchTradespeople(businessName);
    const business = tradespeople.find(business => business.title.toLowerCase().includes(businessName.toLowerCase())) || null;
    setCache(cacheKey, business, 86400); // Cache for 24 hours
    return business;
  } catch (error) {
    console.error(`Error fetching single business "${businessName}":`, error);
    return null;
  }
}

export async function fetchBusinessDetails(businessId) {
  const cacheKey = `businessDetails:${businessId}`;
  const cachedData = getCache(cacheKey);
  if (cachedData) return cachedData;

  const data = [{
    id: businessId,
    location_code: 2372,
    language_code: "en"
  }];

  try {
    const result = await makeRequest(data);
    const details = result.tasks[0].result[0] || null;
    setCache(cacheKey, details, 86400); // Cache for 24 hours
    return details;
  } catch (error) {
    console.error(`Error fetching business details for ID "${businessId}":`, error);
    return null;
  }
}