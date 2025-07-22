// googleSheetsService.js - Enhanced to persist last valid data
// This version keeps showing the last valid data until new data arrives

// Store the last valid data for each parameter
let lastValidData = {
  soilTemp: null,
  soilMoisture: null,
  pH: null,
  ec: null,
  nitrogen: null,
  phosphorus: null,
  potassium: null,
  lastTimestamp: null
};

// Track the last row index we've processed to detect truly new data
let lastProcessedRowIndex = -1;

// Try to load lastValidData from localStorage if available
try {
  const savedData = localStorage.getItem('lastValidSensorData');
  if (savedData) {
    const parsedData = JSON.parse(savedData);
    if (parsedData && typeof parsedData === 'object') {
      lastValidData = parsedData;
      console.log("Loaded last valid sensor data from storage:", lastValidData);
    }
  }
} catch (e) {
  console.warn("Could not load last valid data from localStorage:", e);
}

/**
 * Fetch sensor data from Google Sheets API
 * If cells are empty, it will use the last valid data
 * 
 * @param {String} landType - Used for fallback if no data has ever been received
 * @param {Number} day - Used for fallback if no data has ever been received
 * @param {String} crop - Used for fallback if no data has ever been received
 * @returns {Promise<Object>} - Promise that resolves to sensor data
 */
export const fetchSensorDataFromGoogleSheets = async (landType, day, crop) => {
  try {
    console.log("Starting Google Sheets data fetch...");
    
    // Google Sheets ID
    const sheetId = '1N7KerIkYhvLd1AAmqqpteqfMDQ3oEoB9SHhw5tuyIIE';
    
    // URL for direct export as CSV
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
    
    console.log(`Fetching from URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-cache' // Don't use cached responses
    });
    
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      console.error(`Failed to fetch Google Sheets data: ${response.status}`);
      return getDataWithFallbacks(landType, day, crop);
    }
    
    const csvText = await response.text();
    console.log(`Received ${csvText.length} characters of data`);
    
    // Parse the CSV data
    const rows = parseCSV(csvText);
    console.log(`Parsed ${rows.length} rows from CSV`);
    
    if (rows.length === 0) {
      console.warn("No data rows found in Google Sheet after parsing");
      return getDataWithFallbacks(landType, day, crop);
    }
    
    // Check if we have more rows than before - this indicates new data
    const hasNewRows = rows.length > lastProcessedRowIndex + 1;
    if (hasNewRows) {
      console.log(`Found ${rows.length - (lastProcessedRowIndex + 1)} new rows since last check`);
    }
    
    // Update our tracking of the last processed row
    lastProcessedRowIndex = rows.length - 1;
    
    // Find the most recent row that has at least some data (not completely empty)
    let latestRow = null;
    let latestRowIndex = -1;
    for (let i = rows.length - 1; i >= 0; i--) {
      const row = rows[i];
      // Check if this row has any non-empty values for our required fields
      if (hasAnyNonEmptyValue(row, ["Temp", "Temperature", "Hum", "Humidity", "PH", "pH"])) {
        latestRow = row;
        latestRowIndex = i;
        console.log(`Found latest row with data at index ${i}`);
        break;
      }
    }
    
    if (!latestRow) {
      console.warn("No rows with valid data found in the sheet");
      return getDataWithFallbacks(landType, day, crop);
    }
    
    console.log("Latest row with data:", latestRow);
    
    // Force isNewData to true if we detected new rows, or if the latest row with data is the newest row
    const isDefinitelyNewData = hasNewRows || latestRowIndex === rows.length - 1;
    
    // Extract values from the row, with fallbacks for empty values
    const result = {
      soilTemp: extractNumberWithFallback(latestRow, ["Temp", "Temperature", "temp", "temperature", "TEMP", "Soil Temp", "SoilTemp"], lastValidData.soilTemp || generateSoilTemp(landType, day)),
      soilMoisture: extractNumberWithFallback(latestRow, ["Hum", "Humidity", "hum", "humidity", "moisture", "Moisture", "HUMIDITY", "Soil Moisture", "SoilMoisture"], lastValidData.soilMoisture || generateSoilMoisture(landType, day)),
      pH: extractNumberWithFallback(latestRow, ["PH", "Ph", "pH", "ph"], lastValidData.pH || generatePH(landType, day)),
      ec: extractNumberWithFallback(latestRow, ["EC", "Ec", "ec", "Electric Conductivity"], lastValidData.ec || generateEC(landType, day)),
      nitrogen: extractNumberWithFallback(latestRow, ["N", "n", "Nitrogen", "nitrogen", "N Content"], lastValidData.nitrogen || generateNitrogen(landType, day)),
      phosphorus: extractNumberWithFallback(latestRow, ["P", "p", "Phosphorus", "phosphorus", "P Content"], lastValidData.phosphorus || generatePhosphorus(landType, day)),
      potassium: extractNumberWithFallback(latestRow, ["K", "k", "Potassium", "potassium", "K Content"], lastValidData.potassium || generatePotassium(landType, day)),
      timestamp: Date.now(),
      isNewData: isDefinitelyNewData, // Set this to true if we definitely have new data
      dataSource: 'mixed' // Flag to indicate some values might be fallbacks
    };
    
    // Check if any values have changed compared to last valid data
    const hasChangedValues = 
      !lastValidData.soilTemp || result.soilTemp !== lastValidData.soilTemp ||
      !lastValidData.soilMoisture || result.soilMoisture !== lastValidData.soilMoisture ||
      !lastValidData.pH || result.pH !== lastValidData.pH ||
      !lastValidData.ec || result.ec !== lastValidData.ec ||
      !lastValidData.nitrogen || result.nitrogen !== lastValidData.nitrogen ||
      !lastValidData.phosphorus || result.phosphorus !== lastValidData.phosphorus ||
      !lastValidData.potassium || result.potassium !== lastValidData.potassium;
    
    // If values have changed, consider this new data
    if (hasChangedValues) {
      console.log("Values have changed since last fetch, marking as new data");
      result.isNewData = true;
    }
    
    // Update the last valid data if we have new data
    if (result.isNewData) {
      lastValidData.soilTemp = result.soilTemp;
      lastValidData.soilMoisture = result.soilMoisture;
      lastValidData.pH = result.pH;
      lastValidData.ec = result.ec;
      lastValidData.nitrogen = result.nitrogen;
      lastValidData.phosphorus = result.phosphorus;
      lastValidData.potassium = result.potassium;
      lastValidData.lastTimestamp = result.timestamp;
      
      // Try to save to localStorage
      try {
        localStorage.setItem('lastValidSensorData', JSON.stringify(lastValidData));
      } catch (e) {
        console.warn("Could not save to localStorage:", e);
      }
    }
    
    console.log("Final processed data:", result);
    return result;
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    return getDataWithFallbacks(landType, day, crop);
  }
};

/**
 * Extract a number from a row using multiple possible column names
 * Returns null if no valid number is found
 */
function extractNumber(row, possibleNames) {
  for (const name of possibleNames) {
    if (row[name] && row[name].trim() !== '' && !isNaN(parseFloat(row[name]))) {
      return parseFloat(row[name]);
    }
  }
  return null;
}

/**
 * Extract a number with fallback value if not found
 */
function extractNumberWithFallback(row, possibleNames, fallbackValue) {
  const value = extractNumber(row, possibleNames);
  return value !== null ? value : fallbackValue;
}

/**
 * Check if a row has any non-empty values for the given possible column names
 */
function hasAnyNonEmptyValue(row, possibleNames) {
  for (const name of possibleNames) {
    if (row[name] && row[name].trim() !== '') {
      return true;
    }
  }
  return false;
}

/**
 * Get the data with fallbacks for any missing values
 */
function getDataWithFallbacks(landType, day, crop) {
  // If we have any last valid data, use it
  if (lastValidData.soilTemp !== null || lastValidData.soilMoisture !== null || lastValidData.pH !== null) {
    console.log("Using stored last valid data:", lastValidData);
    
    return {
      soilTemp: lastValidData.soilTemp !== null ? lastValidData.soilTemp : generateSoilTemp(landType, day),
      soilMoisture: lastValidData.soilMoisture !== null ? lastValidData.soilMoisture : generateSoilMoisture(landType, day),
      pH: lastValidData.pH !== null ? lastValidData.pH : generatePH(landType, day),
      ec: lastValidData.ec !== null ? lastValidData.ec : generateEC(landType, day),
      nitrogen: lastValidData.nitrogen !== null ? lastValidData.nitrogen : generateNitrogen(landType, day),
      phosphorus: lastValidData.phosphorus !== null ? lastValidData.phosphorus : generatePhosphorus(landType, day),
      potassium: lastValidData.potassium !== null ? lastValidData.potassium : generatePotassium(landType, day),
      timestamp: lastValidData.lastTimestamp || Date.now(),
      isNewData: false
    };
  }
  
  // If we have no valid data at all, generate consistent fallback data
  console.log("No last valid data available, generating consistent fallback data");
  
  return {
    soilTemp: generateSoilTemp(landType, day),
    soilMoisture: generateSoilMoisture(landType, day),
    pH: generatePH(landType, day),
    ec: generateEC(landType, day),
    nitrogen: generateNitrogen(landType, day),
    phosphorus: generatePhosphorus(landType, day),
    potassium: generatePotassium(landType, day),
    timestamp: Date.now(),
    isNewData: false,
    isFallback: true
  };
}

/**
 * Parse CSV data into rows of objects
 */
function parseCSV(csvText) {
  try {
    // Handle different line endings
    const lines = csvText.split(/\r?\n/);
    if (lines.length < 2) {
      console.warn("CSV has less than 2 lines, can't parse headers and data");
      return [];
    }
    
    // Parse headers - handle quotes and trim whitespace
    const headers = lines[0]
      .split(',')
      .map(header => header.replace(/^["']|["']$/g, '').trim());
    
    console.log("Detected headers:", headers);
    
    const rows = [];
    
    // Start from line 1 (skipping headers)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines
      
      // Advanced CSV parsing that properly handles quoted fields with commas
      const values = parseCSVLine(line);
      
      // Handle case where we might have more or fewer values than headers
      const row = {};
      headers.forEach((header, index) => {
        if (index < values.length) {
          // Remove quotes and trim
          row[header] = values[index].replace(/^["']|["']$/g, '').trim();
        } else {
          row[header] = ''; // Empty value for missing fields
        }
      });
      
      rows.push(row);
    }
    
    return rows;
  } catch (error) {
    console.error("Error parsing CSV:", error);
    return []; // Return empty array on error
  }
}

/**
 * Parse a single CSV line, properly handling quoted fields
 */
function parseCSVLine(line) {
  const values = [];
  let inQuotes = false;
  let currentValue = '';
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    
    // Handle quotes
    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        // Escaped quote inside quoted field
        currentValue += '"';
        i += 2;
        continue;
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
        i++;
        continue;
      }
    }
    
    // Handle commas
    if (char === ',' && !inQuotes) {
      values.push(currentValue);
      currentValue = '';
      i++;
      continue;
    }
    
    // Add character to current value
    currentValue += char;
    i++;
  }
  
  // Add the last value
  values.push(currentValue);
  
  return values;
}

/**
 * Generate soil temperature based on land type and day
 */
function generateSoilTemp(landType, day) {
  const baseTemp = getBaseTemp(landType);
  // Create a deterministic pattern based on day
  return baseTemp + 2 * Math.sin(day * 0.1);
}

/**
 * Generate soil moisture based on land type and day
 */
function generateSoilMoisture(landType, day) {
  const baseMoisture = getBaseMoisture(landType);
  // Create a deterministic pattern based on day
  return baseMoisture + 5 * Math.cos(day * 0.1);
}

/**
 * Generate pH based on land type and day
 */
function generatePH(landType, day) {
  const basePH = getBasePH(landType);
  // Create a deterministic pattern based on day
  return basePH + 0.2 * Math.sin(day * 0.05);
}

/**
 * Generate EC based on land type and day
 */
function generateEC(landType, day) {
  const baseEC = getBaseEC(landType);
  // Create a deterministic pattern based on day
  return baseEC + 100 * Math.cos(day * 0.05);
}

/**
 * Generate nitrogen based on land type and day
 */
function generateNitrogen(landType, day) {
  const baseN = getBaseN(landType);
  // Create a deterministic pattern based on day
  return baseN + (day % 5) * 5;
}

/**
 * Generate phosphorus based on land type and day
 */
function generatePhosphorus(landType, day) {
  const baseP = getBaseP(landType);
  // Create a deterministic pattern based on day
  return baseP + 5 * Math.sin(day * 0.1);
}

/**
 * Generate potassium based on land type and day
 */
function generatePotassium(landType, day) {
  const baseK = getBaseK(landType);
  // Create a deterministic pattern based on day
  return baseK + 10 * Math.cos(day * 0.1);
}

/**
 * Get base temperature for land type
 */
function getBaseTemp(landType) {
  switch (landType) {
    case "Dry land": return 24;
    case "Coastal land": return 22;
    case "Malnad region": return 20;
    default: return 22;
  }
}

/**
 * Get base moisture for land type
 */
function getBaseMoisture(landType) {
  switch (landType) {
    case "Dry land": return 50;
    case "Coastal land": return 65;
    case "Malnad region": return 75;
    default: return 65;
  }
}

/**
 * Get base pH for land type
 */
function getBasePH(landType) {
  switch (landType) {
    case "Dry land": return 6.5;
    case "Coastal land": return 6.2;
    case "Malnad region": return 5.8;
    default: return 6.3;
  }
}

/**
 * Get base EC for land type
 */
function getBaseEC(landType) {
  switch (landType) {
    case "Dry land": return 1100;
    case "Coastal land": return 1300;
    case "Malnad region": return 1000;
    default: return 1200;
  }
}

/**
 * Get base nitrogen for land type
 */
function getBaseN(landType) {
  switch (landType) {
    case "Dry land": return 120;
    case "Coastal land": return 150;
    case "Malnad region": return 160;
    default: return 140;
  }
}

/**
 * Get base phosphorus for land type
 */
function getBaseP(landType) {
  switch (landType) {
    case "Dry land": return 35;
    case "Coastal land": return 40;
    case "Malnad region": return 45;
    default: return 40;
  }
}

/**
 * Get base potassium for land type
 */
function getBaseK(landType) {
  switch (landType) {
    case "Dry land": return 180;
    case "Coastal land": return 200;
    case "Malnad region": return 210;
    default: return 200;
  }
}