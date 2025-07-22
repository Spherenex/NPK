import React, { useState, useEffect, useMemo, useRef } from 'react';
import './App.css';
import AdminLogin from './components/AdminLogin/AdminLogin';
import AppLayout from './components/Layout/AppLayout';
import Dashboard from './components/Dashboard/Dashboard';
import GrowthStage from './components/GrowthStage/GrowthStage';
import SensorDataWithAverage from './components/SensorData/SensorData';
import Recommendations from './components/Recommendations/Recommendations';
import IdealRanges from './components/IdealRanges/IdealRanges';
import PlanDashboard from './components/PlanDashboard/PlanDashboard';
import SensorDataGraphs from './components/Graphs/SensorDataGraphs';
import AllParametersGraph from './components/Graphs/AllParametersGraph';
import { parseCSVData, generateRecommendations, getMLSystem } from './utils/cropUtils';
import { fetchFirebaseData } from './services/firebaseService';
import ChatbotInterface from './components/Chatbot/ChatbotInterface';
import {
  logoutUser,
  subscribeToAuthChanges,
  getCurrentUser
} from './services/firebaseAuth';
import { MdInsertChart, MdAutorenew, MdPsychology, MdShowChart } from 'react-icons/md';
// Import CSS for the graph components
import './components/Graphs/SensorDataGraphs.css';

function App() {
  // Define test function at the top of the component
  async function testGoogleSheetsConnection() {
    try {
      console.log("Testing Google Sheets connection...");

      // Google Sheets ID from your code
      const sheetId = '1N7KerIkYhvLd1AAmqqpteqfMDQ3oEoB9SHhw5tuyIIE';

      // Try two different URLs to see which one works
      const urls = [
        `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`,
        `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`
      ];

      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        console.log(`Trying URL ${i + 1}:`, url);

        try {
          const response = await fetch(url);
          console.log(`URL ${i + 1} response:`, response.status, response.statusText);

          if (response.ok) {
            const text = await response.text();
            console.log(`URL ${i + 1} returned ${text.length} characters of data`);
            console.log("First 100 characters:", text.substring(0, 100));
            console.log("Test successful for URL", i + 1);
            return;
          } else {
            console.error(`URL ${i + 1} failed:`, response.status, response.statusText);
          }
        } catch (urlError) {
          console.error(`URL ${i + 1} failed with error:`, urlError);
        }
      }

      // If we get here, both URLs failed
      console.error("All Google Sheets URL formats failed to fetch data");

      // Common issues that might cause the problem
      console.log("Possible issues:");
      console.log("1. The Google Sheet is not publicly accessible");
      console.log("2. The Google Sheet ID is incorrect");
      console.log("3. CORS policies are preventing access from your domain");
      console.log("4. Network connectivity issues");

      // Suggest alternatives
      console.log("Possible solutions:");
      console.log("1. Make sure the Google Sheet is published to the web and shared publicly");
      console.log("2. Double-check the Sheet ID");
      console.log("3. Consider using a CORS proxy or a backend API to fetch the data");
      console.log("4. Try using the fallback data generation temporarily until the Sheet access is fixed");
    } catch (error) {
      console.error("Test failed with error:", error);
    }
  }

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Section refs for scrolling
  const dashboardRef = useRef(null);
  const growthStageRef = useRef(null);
  const sensorDataRef = useRef(null);
  const recommendationsRef = useRef(null);
  const mlSystemRef = useRef(null);
  const graphsRef = useRef(null); // New ref for graphs section

  // Active section for navigation
  const [activeSection, setActiveSection] = useState('dashboard');

  // State for UI components
  const [visibleComponents, setVisibleComponents] = useState({
    growthStage: true,
    sensorData: true,
    recommendations: true,
    idealRanges: true,
    graphs: false // New component for graphs
  });

  // State for selections
  const [selectedCrop, setSelectedCrop] = useState("Tomato");
  const [selectedLandType, setSelectedLandType] = useState("");
  const [totalDays, setTotalDays] = useState(120);
  const [currentDay, setCurrentDay] = useState(1);
  const [liveData, setLiveData] = useState(null);
  const [dataInterval, setDataInterval] = useState(null);
  const [aggregatedData, setAggregatedData] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showPlanDashboard, setShowPlanDashboard] = useState(false);
  const [mlModelStatus, setMlModelStatus] = useState("loading"); // "loading", "ready", "error"
  const [availableCrops, setAvailableCrops] = useState(["Tomato", "Brinjal", "Capsicum", "Potato"]);
  const [recommendations, setRecommendations] = useState([]);

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      if (user) {
        // User is signed in
        setIsAuthenticated(true);
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Admin'
        });
        console.log("User authenticated:", user.email);
      } else {
        // User is signed out
        setIsAuthenticated(false);
        setCurrentUser(null);
        console.log("User signed out");
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Initialize ML model
  useEffect(() => {
    async function initializeML() {
      try {
        setMlModelStatus("loading");
        const mlSystem = await getMLSystem();
        if (mlSystem.initialized) {
          setMlModelStatus("ready");
          console.log("ML model successfully initialized");
        } else {
          setMlModelStatus("error");
          console.error("ML model initialization failed");
        }
      } catch (error) {
        setMlModelStatus("error");
        console.error("Error initializing ML model:", error);
      }
    }

    if (isAuthenticated) {
      initializeML();
    }
  }, [isAuthenticated]);

  // Parse data from CSV (simulated)
  const { data, landTypes } = useMemo(() => parseCSVData(), []);

  // Filter data based on selections
  const filteredData = useMemo(() => {
    if (!selectedLandType) return [];

    return data.filter(item =>
      item.crop === selectedCrop &&
      item.landType === selectedLandType &&
      item.day <= totalDays
    );
  }, [data, selectedCrop, selectedLandType, totalDays]);

  // Get plan for the current day
  const currentDayPlan = useMemo(() => {
    if (!filteredData.length) return null;
    return filteredData.find(item => item.day === currentDay);
  }, [filteredData, currentDay]);

  // Generate full plan for all days
  const fullPlan = useMemo(() => {
    if (!filteredData.length) return [];

    const days = Array.from({ length: totalDays }, (_, i) => i + 1);
    return days.map(day => {
      const dayPlan = filteredData.find(item => item.day === day);
      return dayPlan || null;
    }).filter(Boolean);
  }, [filteredData, totalDays]);

  useEffect(() => {
  // Function to fetch and update sensor data
  const fetchAndUpdateData = async () => {
    if (selectedLandType && currentDay && showRecommendations) {
      try {
        console.log(`Fetching sensor data for ${selectedCrop}, ${selectedLandType}, day ${currentDay}...`);
        const data = await fetchFirebaseData(selectedLandType, currentDay, selectedCrop);
        console.log("Received sensor data:", data);

        // Check if we received valid data
        if (data && typeof data === 'object') {
          // Validate sensor data to ensure it has expected properties
          const hasRequiredProperties = ['soilTemp', 'soilMoisture', 'pH'].every(
            prop => data[prop] !== undefined && !isNaN(data[prop])
          );

          if (hasRequiredProperties) {
            // Update the live data
            console.log("Setting live data:", data);
            setLiveData(prevLiveData => {
              // Only update if data is actually different to avoid unnecessary re-renders
              if (!prevLiveData || 
                  prevLiveData.soilTemp !== data.soilTemp || 
                  prevLiveData.soilMoisture !== data.soilMoisture || 
                  prevLiveData.pH !== data.pH) {
                return data;
              }
              return prevLiveData;
            });

            // For the aggregated data, only add new data points to avoid duplication
            if (data.isNewData || aggregatedData.length === 0) {
              console.log("Adding new data point to aggregation");
              // Use functional updates to avoid stale state issues
              setAggregatedData(prevData => {
                const newData = [...prevData, data];
                // Keep last 15 minutes worth of readings (90 readings at 10-second intervals)
                return newData.length > 90 ? newData.slice(-90) : newData;
              });
            } else {
              console.log("Not adding duplicate data to aggregation");
            }
          } else {
            console.error("Received invalid sensor data - missing required properties:", data);
          }
        } else {
          console.error("Received invalid sensor data format:", data);
        }
      } catch (error) {
        console.error("Error fetching live data:", error);
      }
    } else {
      console.log("Skipping data fetch - conditions not met:", {
        selectedLandType,
        currentDay,
        showRecommendations
      });
    }
  };

  // Clear any existing interval
  if (dataInterval) {
    clearInterval(dataInterval);
    console.log("Cleared existing data fetch interval");
  }

  // Only set up the interval if we have selected a land type and generated a plan
  if (selectedLandType && showRecommendations) {
    console.log("Setting up data fetch interval...");

    // Fetch data immediately
    fetchAndUpdateData();

    // Set up polling interval (every 10 seconds)
    const interval = setInterval(fetchAndUpdateData, 10000);
    setDataInterval(interval);
    console.log("Data fetch interval set");
  }

  // Clean up interval on unmount or when dependencies change
  return () => {
    if (dataInterval) {
      clearInterval(dataInterval);
      console.log("Cleaned up data fetch interval");
    }
  };
}, [selectedLandType, currentDay, selectedCrop, showRecommendations]);

  // Calculate 15-minute averages
  const fifteenMinuteAverage = useMemo(() => {
    if (!aggregatedData.length) return null;

    const sum = aggregatedData.reduce((acc, item) => {
      return {
        soilTemp: acc.soilTemp + item.soilTemp,
        soilMoisture: acc.soilMoisture + item.soilMoisture,
        pH: acc.pH + item.pH,
        ec: acc.ec + item.ec,
        nitrogen: acc.nitrogen + item.nitrogen,
        phosphorus: acc.phosphorus + item.phosphorus,
        potassium: acc.potassium + item.potassium
      };
    }, {
      soilTemp: 0,
      soilMoisture: 0,
      pH: 0,
      ec: 0,
      nitrogen: 0,
      phosphorus: 0,
      potassium: 0
    });

    return {
      soilTemp: sum.soilTemp / aggregatedData.length,
      soilMoisture: sum.soilMoisture / aggregatedData.length,
      pH: sum.pH / aggregatedData.length,
      ec: sum.ec / aggregatedData.length,
      nitrogen: sum.nitrogen / aggregatedData.length,
      phosphorus: sum.phosphorus / aggregatedData.length,
      potassium: sum.potassium / aggregatedData.length
    };
  }, [aggregatedData]);

// REPLACE THIS SECTION IN App.js - Recommendations useEffect

// Calculate 15-minute averages for ML system
useEffect(() => {
  let isMounted = true; // Flag to prevent updates if component unmounts
  console.log("Recommendations useEffect triggered with:", {
    aggregatedDataLength: aggregatedData?.length || 0,
    currentDayPlanExists: !!currentDayPlan
  });

  // Skip if no data available
  if (!aggregatedData || !aggregatedData.length || !currentDayPlan) {
    console.log("Missing data for recommendations, skipping");
    if (isMounted) setRecommendations([]);
    return () => { isMounted = false; };
  }

  async function updateRecommendations() {
    try {
      // Calculate 15-minute average from aggregated data
      const sum = aggregatedData.reduce((acc, item) => {
        return {
          soilTemp: acc.soilTemp + (item.soilTemp || 0),
          soilMoisture: acc.soilMoisture + (item.soilMoisture || 0),
          pH: acc.pH + (item.pH || 0),
          ec: acc.ec + (item.ec || 0),
          nitrogen: acc.nitrogen + (item.nitrogen || 0),
          phosphorus: acc.phosphorus + (item.phosphorus || 0),
          potassium: acc.potassium + (item.potassium || 0)
        };
      }, {
        soilTemp: 0,
        soilMoisture: 0,
        pH: 0,
        ec: 0,
        nitrogen: 0,
        phosphorus: 0,
        potassium: 0
      });

      const fifteenMinuteAverage = {
        soilTemp: sum.soilTemp / aggregatedData.length,
        soilMoisture: sum.soilMoisture / aggregatedData.length,
        pH: sum.pH / aggregatedData.length,
        ec: sum.ec / aggregatedData.length,
        nitrogen: sum.nitrogen / aggregatedData.length,
        phosphorus: sum.phosphorus / aggregatedData.length,
        potassium: sum.potassium / aggregatedData.length
      };

      console.log('Using 15-minute average for ML predictions:', fifteenMinuteAverage);

      // Make sure we have valid ML input data
      const hasValidMLInputs = ['soilTemp', 'soilMoisture', 'pH'].every(
        prop => fifteenMinuteAverage[prop] !== undefined && !isNaN(fifteenMinuteAverage[prop])
      );

      if (!hasValidMLInputs) {
        console.error("Invalid ML input data:", fifteenMinuteAverage);
        return;
      }

      // Use the 15-minute average for ML predictions
      console.log("Calling generateRecommendations with:", {
        currentDayPlan,
        fifteenMinuteAverage
      });
      
      const recs = await generateRecommendations(currentDayPlan, fifteenMinuteAverage);
      console.log("Received recommendations:", recs);
      
      // Only update state if component is still mounted
      if (isMounted) {
        setRecommendations(recs);
      }
    } catch (error) {
      console.error("Error generating recommendations:", error);
      if (isMounted) {
        setRecommendations([]);
      }
    }
  }

  // Use setTimeout to prevent synchronous updates that could cause loops
  const timer = setTimeout(() => {
    updateRecommendations();
  }, 0);

  // Clean up function
  return () => {
    isMounted = false;
    clearTimeout(timer);
  };
}, [aggregatedData, currentDayPlan]);

  const generatePlan = () => {
    if (!selectedLandType) {
      alert("Please select a land type to generate a plan.");
      return;
    }
    setShowRecommendations(true);
    setShowPlanDashboard(false);

    // Show all components
    setVisibleComponents({
      growthStage: true,
      sensorData: true,
      recommendations: true,
      idealRanges: true,
      graphs: false
    });
  };

  const viewFullPlan = () => {
    if (!selectedLandType) {
      alert("Please select a land type to view the full plan.");
      return;
    }
    setShowPlanDashboard(true);
    setShowRecommendations(false);
  };

  const backToMainDashboard = () => {
    setShowPlanDashboard(false);
    setShowRecommendations(true);
  };

  // Updated login handler for Firebase
  const handleLogin = (user) => {
    // This function will be called after successful login/signup
    console.log("User logged in:", user?.email);
    // Authentication state will be updated by the auth state listener
  };

  // Updated logout handler for Firebase
  const handleLogout = async () => {
    try {
      const { success, error } = await logoutUser();
      if (!success) {
        console.error("Logout failed:", error);
        alert("Logout failed. Please try again.");
      }
    } catch (err) {
      console.error("Unexpected error during logout:", err);
      alert("An error occurred during logout.");
    }
  };

  // Handle navigation from sidebar
  const handleNavigate = (menuId) => {
    setActiveSection(menuId);

    // Set which components to display based on navigation
    switch (menuId) {
      case 'dashboard':
        setVisibleComponents({
          growthStage: true,
          sensorData: true,
          recommendations: true,
          idealRanges: true,
          graphs: false
        });
        setShowPlanDashboard(false);
        break;
      case 'crops':
        setVisibleComponents({
          growthStage: true,
          sensorData: false,
          recommendations: false,
          idealRanges: true,
          graphs: false
        });
        setShowPlanDashboard(false);
        break;
      case 'sensor':
        setVisibleComponents({
          growthStage: false,
          sensorData: true,
          recommendations: false,
          idealRanges: false,
          graphs: false
        });
        setShowPlanDashboard(false);
        break;
      case 'ml':
        setVisibleComponents({
          growthStage: false,
          sensorData: false,
          recommendations: true,
          idealRanges: false,
          graphs: false
        });
        setShowPlanDashboard(false);
        break;
      case 'graphs':
        setVisibleComponents({
          growthStage: false,
          sensorData: false,
          recommendations: false,
          idealRanges: false,
          graphs: true
        });
        setShowPlanDashboard(false);
        break;
      default:
        break;
    }

    // Scroll to the section
    setTimeout(() => {
      const refs = {
        dashboard: dashboardRef,
        crops: growthStageRef,
        sensor: sensorDataRef,
        ml: recommendationsRef,
        graphs: graphsRef
      };

      const ref = refs[menuId];
      if (ref && ref.current) {
        ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <AppLayout
      onLogout={handleLogout}
      mlModelStatus={mlModelStatus}
      onNavigate={handleNavigate}
      activeSection={activeSection}
      currentUser={currentUser}
    >
      <div className="dashboard-container">
        {showPlanDashboard ? (
          <PlanDashboard
            fullPlan={fullPlan}
            selectedCrop={selectedCrop}
            selectedLandType={selectedLandType}
            backToMainDashboard={backToMainDashboard}
            setCurrentDay={setCurrentDay}
            totalDays={totalDays}
          />
        ) : (
          <>
            <div ref={dashboardRef}>
              <Dashboard
                selectedCrop={selectedCrop}
                setSelectedCrop={setSelectedCrop}
                selectedLandType={selectedLandType}
                setSelectedLandType={setSelectedLandType}
                totalDays={totalDays}
                setTotalDays={setTotalDays}
                currentDay={currentDay}
                setCurrentDay={setCurrentDay}
                landTypes={landTypes}
                availableCrops={availableCrops}
                generatePlan={generatePlan}
                viewFullPlan={viewFullPlan}
                showRecommendations={showRecommendations}
              />
            </div>
<div>{activeSection === 'chatbot' && <ChatbotInterface />}</div>
            {currentDayPlan && showRecommendations && (
              <div className="dashboard-grid">
                {visibleComponents.growthStage && (
                  <div className={`dashboard-card ${activeSection === 'crops' ? 'active' : ''}`} ref={growthStageRef}>
                    <GrowthStage
                      currentDayPlan={currentDayPlan}
                      currentDay={currentDay}
                      totalDays={totalDays}
                    />
                  </div>
                )}

                {visibleComponents.sensorData && (
                  <div className={`dashboard-card ${activeSection === 'sensor' ? 'active' : ''}`} ref={sensorDataRef}>
                    <SensorDataWithAverage
                      currentDayPlan={currentDayPlan}
                      liveData={liveData}
                      aggregatedData={aggregatedData}
                    />

                    {/* Add graphs in the sensor data section */}
                    {liveData && aggregatedData && aggregatedData.length > 0 && (
                      <SensorDataGraphs
                        liveData={liveData}
                        aggregatedData={aggregatedData}
                        currentDayPlan={currentDayPlan}
                      />
                    )}
                  </div>
                )}

                {visibleComponents.recommendations && (
                  <div className={`dashboard-card ${activeSection === 'ml' ? 'active' : ''}`} ref={recommendationsRef}>
                    <Recommendations
                      recommendations={recommendations}
                      mlActive={mlModelStatus === "ready"}
                    />
                  </div>
                )}

                {visibleComponents.idealRanges && (
                  <div className="dashboard-card">
                    <IdealRanges
                      currentDayPlan={currentDayPlan}
                      selectedLandType={selectedLandType}
                    />
                  </div>
                )}

                {/* Dedicated Graphs Section */}
                {visibleComponents.graphs && (
                  <div className={`dashboard-card ${activeSection === 'graphs' ? 'active' : ''}`} ref={graphsRef}>
                    <div className="card-header">
                      <h2>Advanced Data Visualizations</h2>
                    </div>

                    {liveData && aggregatedData && aggregatedData.length > 0 ? (
                      <SensorDataGraphs
                        liveData={liveData}
                        aggregatedData={aggregatedData}
                        currentDayPlan={currentDayPlan}
                      />
                    ) : (
                      <div className="no-data-message" style={{ padding: '30px', textAlign: 'center' }}>
                        <p>No sensor data available yet. Data will appear here once readings begin.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {(!currentDayPlan || !showRecommendations) && (
              <div className="welcome-panel">
                <h2>Welcome to {selectedCrop} Crop Yield Management</h2>
                <p>Select your land type and number of days to generate a customized growing plan.</p>

                <div className="features">
                  <div className="feature">
                    <div className="feature-icon">
                      <MdInsertChart size={40} />
                    </div>
                    <h3>Day-by-Day Planning</h3>
                    <p>Generate detailed growing conditions for up to 120 days</p>
                  </div>

                  <div className="feature">
                    <div className="feature-icon">
                      <MdAutorenew size={40} />
                    </div>
                    <h3>Real-Time Monitoring</h3>
                    <p>Compare sensor data with planned targets in real time</p>
                  </div>

                  <div className="feature">
                    <div className="feature-icon">
                      <MdPsychology size={40} />
                    </div>
                    <h3>Smart ML Recommendations</h3>
                    <p>Get actionable advice to maximize your crop yield</p>
                  </div>

                  <div className="feature">
                    <div className="feature-icon">
                      <MdShowChart size={40} />
                    </div>
                    <h3>Advanced Visualizations</h3>
                    <p>Interactive graphs for monitoring all sensor parameters</p>
                  </div>
                </div>

                {/* Development tools section */}
                <div style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5', borderRadius: '5px' }}>
                  <h3>Development Tools</h3>
                  <button
                    onClick={testGoogleSheetsConnection}
                    style={{
                      padding: '8px 16px',
                      background: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Test Google Sheets Connection
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}

export default App;