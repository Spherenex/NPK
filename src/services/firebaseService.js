// /**
//  * Service for fetching data from Firebase and Google Sheets
//  */
// import { fetchSensorDataFromGoogleSheets } from './googleSheetsService';

// /**
//  * Fetch sensor data - now using Google Sheets as the data source
//  * 
//  * @param {String} landType - The type of land (Dry land, Coastal land, Malnad region)
//  * @param {Number} day - The current day in the growing cycle
//  * @param {String} crop - The selected crop type
//  * @returns {Object} - Sensor data from Google Sheets
//  */
// export const fetchFirebaseData = async (landType, day, crop) => {
//     try {
//         // Use the Google Sheets service to fetch actual data
//         const sensorData = await fetchSensorDataFromGoogleSheets(landType, day, crop);
//         return sensorData;
//     } catch (error) {
//         console.error("Error fetching sensor data:", error);
//         // Fallback to simulated data if Google Sheets fetch fails
//         return generateSimulatedData(landType, day, crop);
//     }
// };

// /**
//  * Generate simulated sensor data (fallback)
//  * This is used as a fallback if Google Sheets data can't be fetched
//  */
// const generateSimulatedData = (landType, day, crop) => {
//     // Base values depend on land type
//     let baseTemp, baseMoisture, basePh, baseEc, baseN, baseP, baseK;

//     switch (landType) {
//         case "Dry land":
//             baseTemp = 24 + Math.sin(day * 0.1) * 2; // Fluctuating between 22-26°C
//             baseMoisture = 50 + Math.cos(day * 0.1) * 5; // Fluctuating between 45-55%
//             basePh = 6.5 + Math.sin(day * 0.05) * 0.3; // Fluctuating between 6.2-6.8
//             baseEc = 1100 + Math.cos(day * 0.05) * 100; // Fluctuating between 1000-1200 µS/cm
//             baseN = 120 + (day % 5) * 5; // Slight increase every 5 days
//             baseP = 35 + Math.sin(day * 0.1) * 5; // Fluctuating between 30-40 mg/kg
//             baseK = 180 + Math.cos(day * 0.1) * 10; // Fluctuating between 170-190 mg/kg
//             break;

//         case "Coastal land":
//             baseTemp = 22 + Math.sin(day * 0.1) * 1.5; // Fluctuating between 20.5-23.5°C
//             baseMoisture = 68 + Math.cos(day * 0.1) * 4; // Fluctuating between 64-72%
//             basePh = 6.2 + Math.sin(day * 0.05) * 0.2; // Fluctuating between 6.0-6.4
//             baseEc = 1300 + Math.cos(day * 0.05) * 150; // Fluctuating between 1150-1450 µS/cm
//             baseN = 150 + (day % 4) * 8; // Slight increase every 4 days
//             baseP = 40 + Math.sin(day * 0.1) * 6; // Fluctuating between 34-46 mg/kg
//             baseK = 200 + Math.cos(day * 0.1) * 15; // Fluctuating between 185-215 mg/kg
//             break;

//         case "Malnad region":
//             baseTemp = 20 + Math.sin(day * 0.1) * 1.2; // Fluctuating between 18.8-21.2°C
//             baseMoisture = 75 + Math.cos(day * 0.1) * 6; // Fluctuating between 69-81%
//             basePh = 5.8 + Math.sin(day * 0.05) * 0.3; // Fluctuating between 5.5-6.1
//             baseEc = 1000 + Math.cos(day * 0.05) * 100; // Fluctuating between 900-1100 µS/cm
//             baseN = 160 + (day % 3) * 10; // Slight increase every 3 days
//             baseP = 45 + Math.sin(day * 0.1) * 7; // Fluctuating between 38-52 mg/kg
//             baseK = 210 + Math.cos(day * 0.1) * 20; // Fluctuating between 190-230 mg/kg
//             break;

//         default:
//             baseTemp = 22;
//             baseMoisture = 65;
//             basePh = 6.5;
//             baseEc = 1200;
//             baseN = 150;
//             baseP = 40;
//             baseK = 200;
//     }

//     // Add some randomness to simulate real sensor fluctuations
//     const randomFactor = () => (Math.random() * 2 - 1); // Random value between -1 and 1

//     return {
//         soilTemp: baseTemp + randomFactor() * 1.5,
//         soilMoisture: baseMoisture + randomFactor() * 5,
//         pH: basePh + randomFactor() * 0.2,
//         ec: baseEc + randomFactor() * 50,
//         nitrogen: baseN + randomFactor() * 10,
//         phosphorus: baseP + randomFactor() * 3,
//         potassium: baseK + randomFactor() * 15
//     };
// };



/**
 * Service for fetching data from Google Sheets
 * This service acts as a bridge between your app and the Google Sheets data source
 */
/**
 * Service for fetching data from Google Sheets
 * This service acts as a bridge between your app and the Google Sheets data source
 */
import { fetchSensorDataFromGoogleSheets } from './googleSheetsService';

// Global variable to store the last successfully fetched data
let lastFetchedData = null;
let lastFetchTime = 0;

/**
 * Fetch sensor data with improved reliability and error handling
 * If no new data is available, returns the last successfully fetched data
 * 
 * @param {String} landType - The type of land (Dry land, Coastal land, Malnad region)
 * @param {Number} day - The current day in the growing cycle
 * @param {String} crop - The selected crop type
 * @returns {Promise<Object>} - Promise that resolves to sensor data
 */
export const fetchFirebaseData = async (landType, day, crop) => {
  try {
    console.log(`fetchFirebaseData called for ${crop}, ${landType}, day ${day}`);
    
    // Get the current time
    const now = Date.now();
    
    // Check if we've fetched data recently (within the last 10 seconds)
    // This prevents hammering the Google Sheets API with too many requests
    const timeSinceLastFetch = now - lastFetchTime;
    if (timeSinceLastFetch < 10000 && lastFetchedData) {
      console.log(`Using recently fetched data (${Math.round(timeSinceLastFetch/1000)}s ago)`);
      return { ...lastFetchedData, timestamp: now };
    }
    
    // Fetch fresh data from Google Sheets
    console.log("Fetching fresh data from Google Sheets");
    const sensorData = await fetchSensorDataFromGoogleSheets(landType, day, crop);
    
    // Add timestamp to the data
    const dataWithTimestamp = { ...sensorData, timestamp: now };
    
    // Store this as the last successfully fetched data
    lastFetchedData = dataWithTimestamp;
    lastFetchTime = now;
    
    return dataWithTimestamp;
  } catch (error) {
    console.error("Error in fetchFirebaseData:", error);
    
    // If we have previously fetched data, use it as a fallback
    if (lastFetchedData) {
      console.log("Using last successfully fetched data as fallback");
      return { ...lastFetchedData, timestamp: Date.now() };
    }
    
    // If we have no previous data, generate simulated data
    console.log("No previous data available, generating simulated data");
    return {
      ...generateSimulatedData(landType, day, crop),
      timestamp: Date.now()
    };
  }
};

/**
 * Generate simulated sensor data (fallback if Google Sheets fails)
 * This has a slightly different pattern from the fallback in googleSheetsService
 * to make it obvious when we're using this fallback vs. the Google Sheets fallback
 */
const generateSimulatedData = (landType, day, crop) => {
  console.log("Generating emergency fallback data in firebaseService");
  
  // Use a seed based on landType, day, and crop for consistent results
  const seed = (landType.charCodeAt(0) + day + crop.charCodeAt(0)) % 100;
  
  // Base values depend on land type
  let baseTemp, baseMoisture, basePh, baseEc, baseN, baseP, baseK;

  switch (landType) {
    case "Dry land":
      baseTemp = 24 + Math.cos(seed * 0.1) * 3;
      baseMoisture = 50 + Math.sin(seed * 0.1) * 7;
      basePh = 6.5 + Math.cos(seed * 0.05) * 0.5;
      baseEc = 1100 + Math.sin(seed * 0.05) * 150;
      baseN = 120 + (seed % 5) * 7;
      baseP = 35 + Math.cos(seed * 0.1) * 7;
      baseK = 180 + Math.sin(seed * 0.1) * 15;
      break;

    case "Coastal land":
      baseTemp = 22 + Math.cos(seed * 0.1) * 2;
      baseMoisture = 68 + Math.sin(seed * 0.1) * 6;
      basePh = 6.2 + Math.cos(seed * 0.05) * 0.3;
      baseEc = 1300 + Math.sin(seed * 0.05) * 180;
      baseN = 150 + (seed % 4) * 10;
      baseP = 40 + Math.cos(seed * 0.1) * 8;
      baseK = 200 + Math.sin(seed * 0.1) * 18;
      break;

    case "Malnad region":
      baseTemp = 20 + Math.cos(seed * 0.1) * 2;
      baseMoisture = 75 + Math.sin(seed * 0.1) * 8;
      basePh = 5.8 + Math.cos(seed * 0.05) * 0.4;
      baseEc = 1000 + Math.sin(seed * 0.05) * 120;
      baseN = 160 + (seed % 3) * 12;
      baseP = 45 + Math.cos(seed * 0.1) * 9;
      baseK = 210 + Math.sin(seed * 0.1) * 22;
      break;

    default:
      baseTemp = 22;
      baseMoisture = 65;
      basePh = 6.5;
      baseEc = 1200;
      baseN = 150;
      baseP = 40;
      baseK = 200;
  }

  // Add some randomness but keep it consistent
  const randomFactor = (seedMod) => Math.sin(seed + seedMod) * 0.5;

  return {
    soilTemp: baseTemp + randomFactor(1),
    soilMoisture: baseMoisture + randomFactor(2) * 5,
    pH: basePh + randomFactor(3) * 0.2,
    ec: baseEc + randomFactor(4) * 50,
    nitrogen: baseN + randomFactor(5) * 10,
    phosphorus: baseP + randomFactor(6) * 3,
    potassium: baseK + randomFactor(7) * 15
  };
};