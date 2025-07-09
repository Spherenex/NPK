/**
 * Service for fetching data from Firebase
 * This is a simulation for the demo - in a real app, this would connect to Firebase
 */

/**
 * Fetch sensor data from Firebase
 * 
 * @param {String} landType - The type of land (Dry land, Coastal land, Malnad region)
 * @param {Number} day - The current day in the growing cycle
 * @returns {Object} - Simulated sensor data
 */
export const fetchFirebaseData = (landType, day) => {
    // In a real implementation, this would fetch actual data from Firebase
    // Here we're just simulating different data patterns based on land type and day

    // Base values depend on land type
    let baseTemp, baseMoisture, basePh, baseEc, baseN, baseP, baseK;

    switch (landType) {
        case "Dry land":
            baseTemp = 24 + Math.sin(day * 0.1) * 2; // Fluctuating between 22-26°C
            baseMoisture = 50 + Math.cos(day * 0.1) * 5; // Fluctuating between 45-55%
            basePh = 6.5 + Math.sin(day * 0.05) * 0.3; // Fluctuating between 6.2-6.8
            baseEc = 1100 + Math.cos(day * 0.05) * 100; // Fluctuating between 1000-1200 µS/cm
            baseN = 120 + (day % 5) * 5; // Slight increase every 5 days
            baseP = 35 + Math.sin(day * 0.1) * 5; // Fluctuating between 30-40 mg/kg
            baseK = 180 + Math.cos(day * 0.1) * 10; // Fluctuating between 170-190 mg/kg
            break;

        case "Coastal land":
            baseTemp = 22 + Math.sin(day * 0.1) * 1.5; // Fluctuating between 20.5-23.5°C
            baseMoisture = 68 + Math.cos(day * 0.1) * 4; // Fluctuating between 64-72%
            basePh = 6.2 + Math.sin(day * 0.05) * 0.2; // Fluctuating between 6.0-6.4
            baseEc = 1300 + Math.cos(day * 0.05) * 150; // Fluctuating between 1150-1450 µS/cm
            baseN = 150 + (day % 4) * 8; // Slight increase every 4 days
            baseP = 40 + Math.sin(day * 0.1) * 6; // Fluctuating between 34-46 mg/kg
            baseK = 200 + Math.cos(day * 0.1) * 15; // Fluctuating between 185-215 mg/kg
            break;

        case "Malnad region":
            baseTemp = 20 + Math.sin(day * 0.1) * 1.2; // Fluctuating between 18.8-21.2°C
            baseMoisture = 75 + Math.cos(day * 0.1) * 6; // Fluctuating between 69-81%
            basePh = 5.8 + Math.sin(day * 0.05) * 0.3; // Fluctuating between 5.5-6.1
            baseEc = 1000 + Math.cos(day * 0.05) * 100; // Fluctuating between 900-1100 µS/cm
            baseN = 160 + (day % 3) * 10; // Slight increase every 3 days
            baseP = 45 + Math.sin(day * 0.1) * 7; // Fluctuating between 38-52 mg/kg
            baseK = 210 + Math.cos(day * 0.1) * 20; // Fluctuating between 190-230 mg/kg
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

    // Add some randomness to simulate real sensor fluctuations
    const randomFactor = () => (Math.random() * 2 - 1); // Random value between -1 and 1

    return {
        soilTemp: baseTemp + randomFactor() * 1.5,
        soilMoisture: baseMoisture + randomFactor() * 5,
        pH: basePh + randomFactor() * 0.2,
        ec: baseEc + randomFactor() * 50,
        nitrogen: baseN + randomFactor() * 10,
        phosphorus: baseP + randomFactor() * 3,
        potassium: baseK + randomFactor() * 15
    };
};

/**
 * In a real implementation, you would add more Firebase-related functions:
 *
 * - Authentication
 * - Data storage
 * - Real-time updates
 * - Push notifications
 * - etc.
 */

// Example Firebase initialization (commented out for simulation)
/*
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Real implementation would look like this:
export const fetchRealTimeData = (landType, callback) => {
  const sensorRef = ref(database, `sensors/${landType}`);
  
  onValue(sensorRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};
*/