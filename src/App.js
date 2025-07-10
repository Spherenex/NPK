

// // App.js with ML model integration
// import React, { useState, useEffect, useMemo } from 'react';
// import './App.css';
// import Dashboard from './components/Dashboard/Dashboard';
// import GrowthStage from './components/GrowthStage/GrowthStage';
// import SensorData from './components/SensorData/SensorData';
// import Recommendations from './components/Recommendations/Recommendations';
// import IdealRanges from './components/IdealRanges/IdealRanges';
// import PlanDashboard from './components/PlanDashboard/PlanDashboard';
// import { parseCSVData, generateRecommendations, getMLSystem } from './utils/cropUtils';
// import { fetchFirebaseData } from './services/firebaseService';

// function App() {
//   // State for selections
//   const [selectedCrop, setSelectedCrop] = useState("Tomato"); // Default to Tomato
//   const [selectedLandType, setSelectedLandType] = useState("");
//   const [totalDays, setTotalDays] = useState(120); // Default to 120 days (updated from 90)
//   const [currentDay, setCurrentDay] = useState(1); // Start with day 1
//   const [liveData, setLiveData] = useState(null);
//   const [dataInterval, setDataInterval] = useState(null);
//   const [aggregatedData, setAggregatedData] = useState([]);
//   const [showRecommendations, setShowRecommendations] = useState(false);
//   const [showPlanDashboard, setShowPlanDashboard] = useState(false);
//   const [mlModelStatus, setMlModelStatus] = useState("loading"); // "loading", "ready", "error"
//   const [availableCrops, setAvailableCrops] = useState(["Tomato", "Brinjal", "Capsicum", "Potato"]);

//   // Initialize ML model
//   useEffect(() => {
//     async function initializeML() {
//       try {
//         setMlModelStatus("loading");
//         const mlSystem = await getMLSystem();
//         if (mlSystem.initialized) {
//           setMlModelStatus("ready");
//           console.log("ML model successfully initialized");
//         } else {
//           setMlModelStatus("error");
//           console.error("ML model initialization failed");
//         }
//       } catch (error) {
//         setMlModelStatus("error");
//         console.error("Error initializing ML model:", error);
//       }
//     }

//     initializeML();
//   }, []);

//   // Parse data from CSV (simulated)
//   const { data, landTypes } = useMemo(() => parseCSVData(), []);

//   // Filter data based on selections
//   const filteredData = useMemo(() => {
//     if (!selectedLandType) return [];

//     return data.filter(item =>
//       item.crop === selectedCrop &&
//       item.landType === selectedLandType &&
//       item.day <= totalDays
//     );
//   }, [data, selectedCrop, selectedLandType, totalDays]);

//   // Get plan for the current day
//   const currentDayPlan = useMemo(() => {
//     if (!filteredData.length) return null;
//     return filteredData.find(item => item.day === currentDay);
//   }, [filteredData, currentDay]);

//   // Generate full plan for all days
//   const fullPlan = useMemo(() => {
//     if (!filteredData.length) return [];

//     const days = Array.from({ length: totalDays }, (_, i) => i + 1);

//     return days.map(day => {
//       const dayPlan = filteredData.find(item => item.day === day);
//       return dayPlan || null;
//     }).filter(Boolean);
//   }, [filteredData, totalDays]);

//   // Simulate data from Firebase (every 10 seconds)
//   useEffect(() => {
//     if (selectedLandType && showRecommendations) {
//       // Initial data
//       setLiveData(fetchFirebaseData(selectedLandType, currentDay, selectedCrop));

//       // Set up interval to simulate data coming in every 10 seconds
//       const interval = setInterval(() => {
//         const newData = fetchFirebaseData(selectedLandType, currentDay, selectedCrop);
//         setLiveData(newData);

//         // Add to aggregated data (simulating the 15-minute averaging)
//         setAggregatedData(prev => {
//           const newAggregated = [...prev, newData];
//           // Keep only the last 90 data points (15 minutes worth if we get data every 10 seconds)
//           if (newAggregated.length > 90) {
//             return newAggregated.slice(newAggregated.length - 90);
//           }
//           return newAggregated;
//         });

//       }, 10000); // 10 seconds

//       setDataInterval(interval);

//       return () => {
//         clearInterval(interval);
//         setDataInterval(null);
//       };
//     } else {
//       // Clear interval if selections are incomplete
//       if (dataInterval) {
//         clearInterval(dataInterval);
//         setDataInterval(null);
//       }
//     }
//   }, [selectedLandType, showRecommendations, currentDay, selectedCrop]);

//   // Calculate 15-minute averages
//   const fifteenMinuteAverage = useMemo(() => {
//     if (!aggregatedData.length) return null;

//     const sum = aggregatedData.reduce((acc, item) => {
//       return {
//         soilTemp: acc.soilTemp + item.soilTemp,
//         soilMoisture: acc.soilMoisture + item.soilMoisture,
//         pH: acc.pH + item.pH,
//         ec: acc.ec + item.ec,
//         nitrogen: acc.nitrogen + item.nitrogen,
//         phosphorus: acc.phosphorus + item.phosphorus,
//         potassium: acc.potassium + item.potassium
//       };
//     }, {
//       soilTemp: 0,
//       soilMoisture: 0,
//       pH: 0,
//       ec: 0,
//       nitrogen: 0,
//       phosphorus: 0,
//       potassium: 0
//     });

//     return {
//       soilTemp: sum.soilTemp / aggregatedData.length,
//       soilMoisture: sum.soilMoisture / aggregatedData.length,
//       pH: sum.pH / aggregatedData.length,
//       ec: sum.ec / aggregatedData.length,
//       nitrogen: sum.nitrogen / aggregatedData.length,
//       phosphorus: sum.phosphorus / aggregatedData.length,
//       potassium: sum.potassium / aggregatedData.length
//     };
//   }, [aggregatedData]);

//   // Generate recommendations using ML system or fallback to rule-based
//   const [recommendations, setRecommendations] = useState([]);

//   // Update recommendations when relevant data changes
//   useEffect(() => {
//     async function updateRecommendations() {
//       if (!fifteenMinuteAverage || !currentDayPlan) {
//         setRecommendations([]);
//         return;
//       }

//       try {
//         // Generate recommendations using ML or rule-based fallback
//         const recs = await generateRecommendations(currentDayPlan, liveData);
//         setRecommendations(recs);
//       } catch (error) {
//         console.error("Error generating recommendations:", error);
//         setRecommendations([]);
//       }
//     }

//     updateRecommendations();
//   }, [fifteenMinuteAverage, currentDayPlan, liveData, mlModelStatus]);

//   const generatePlan = () => {
//     if (!selectedLandType) {
//       alert("Please select a land type to generate a plan.");
//       return;
//     }

//     setShowRecommendations(true);
//     setShowPlanDashboard(false);
//   };

//   const viewFullPlan = () => {
//     if (!selectedLandType) {
//       alert("Please select a land type to view the full plan.");
//       return;
//     }

//     setShowPlanDashboard(true);
//     setShowRecommendations(false);
//   };

//   const backToMainDashboard = () => {
//     setShowPlanDashboard(false);
//     setShowRecommendations(true);
//   };

//   return (
//     <div className="app-container">
//       <header>
//         <h1>{selectedCrop} Crop Yield Prediction & Management</h1>
//         {mlModelStatus === "loading" && <div className="ml-status loading">ML Model: Loading...</div>}
//         {mlModelStatus === "ready" && <div className="ml-status ready1">ML Model: Active</div>}
//         {mlModelStatus === "error" && <div className="ml-status error">ML Model: Error (Using Rule-Based Fallback)</div>}
//       </header>

//       <div className="dashboard-container">
//         {!showPlanDashboard ? (
//           <>
//             <Dashboard
//               selectedCrop={selectedCrop}
//               setSelectedCrop={setSelectedCrop}
//               selectedLandType={selectedLandType}
//               setSelectedLandType={setSelectedLandType}
//               totalDays={totalDays}
//               setTotalDays={setTotalDays}
//               currentDay={currentDay}
//               setCurrentDay={setCurrentDay}
//               landTypes={landTypes}
//               availableCrops={availableCrops}
//               generatePlan={generatePlan}
//               viewFullPlan={viewFullPlan}
//               showRecommendations={showRecommendations}
//             />

//             <div className="main-content">
//               {currentDayPlan && showRecommendations ? (
//                 <>
//                   <GrowthStage currentDayPlan={currentDayPlan} currentDay={currentDay} totalDays={totalDays} />
//                   <SensorData currentDayPlan={currentDayPlan} liveData={liveData} />
//                   <Recommendations recommendations={recommendations} mlActive={mlModelStatus === "ready"} />
//                   <IdealRanges currentDayPlan={currentDayPlan} selectedLandType={selectedLandType} />
//                 </>
//               ) : (
//                 <div className="welcome-panel">
//                   <h2>Welcome to {selectedCrop} Crop Yield Prediction & Management</h2>
//                   <p>Select your land type and number of days to generate a customized growing plan for {selectedCrop.toLowerCase()}.</p>
//                   <div className="features">
//                     <div className="feature">
//                       <div className="feature-icon">📊</div>
//                       <h3>Day-by-Day Planning</h3>
//                       <p>Generate detailed growing conditions for up to 120 days</p>
//                     </div>
//                     <div className="feature">
//                       <div className="feature-icon">🔄</div>
//                       <h3>Real-Time Monitoring</h3>
//                       <p>Compare sensor data with planned targets in real time</p>
//                     </div>
//                     <div className="feature">
//                       <div className="feature-icon">💡</div>
//                       <h3>Smart ML Recommendations</h3>
//                       <p>Get actionable advice to maximize your {selectedCrop.toLowerCase()} yield</p>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </>
//         ) : (
//           <PlanDashboard
//             fullPlan={fullPlan}
//             selectedCrop={selectedCrop}
//             selectedLandType={selectedLandType}
//             backToMainDashboard={backToMainDashboard}
//             setCurrentDay={setCurrentDay}
//             totalDays={totalDays}
//           />
//         )}
//       </div>
//     </div>
//   );
// }

// export default App;




import React, { useState, useEffect, useMemo, useRef } from 'react';
import './App.css';
import AdminLogin from './components/AdminLogin/AdminLogin';
import AppLayout from './components/Layout/AppLayout';
import Dashboard from './components/Dashboard/Dashboard';
import GrowthStage from './components/GrowthStage/GrowthStage';
import SensorData from './components/SensorData/SensorData';
import Recommendations from './components/Recommendations/Recommendations';
import IdealRanges from './components/IdealRanges/IdealRanges';
import PlanDashboard from './components/PlanDashboard/PlanDashboard';
import { parseCSVData, generateRecommendations, getMLSystem } from './utils/cropUtils';
import { fetchFirebaseData } from './services/firebaseService';

function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Section refs for scrolling
  const dashboardRef = useRef(null);
  const growthStageRef = useRef(null);
  const sensorDataRef = useRef(null);
  const recommendationsRef = useRef(null);
  const mlSystemRef = useRef(null);
  
  // Active section for navigation
  const [activeSection, setActiveSection] = useState('dashboard');
  
  // State for UI components
  const [visibleComponents, setVisibleComponents] = useState({
    growthStage: true,
    sensorData: true,
    recommendations: true,
    idealRanges: true
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

  // Simulate data from Firebase (every 10 seconds)
  useEffect(() => {
    if (selectedLandType && showRecommendations) {
      // Initial data
      setLiveData(fetchFirebaseData(selectedLandType, currentDay, selectedCrop));

      // Set up interval to simulate data coming in every 10 seconds
      const interval = setInterval(() => {
        const newData = fetchFirebaseData(selectedLandType, currentDay, selectedCrop);
        setLiveData(newData);

        // Add to aggregated data (simulating the 15-minute averaging)
        setAggregatedData(prev => {
          const newAggregated = [...prev, newData];
          // Keep only the last 90 data points
          if (newAggregated.length > 90) {
            return newAggregated.slice(newAggregated.length - 90);
          }
          return newAggregated;
        });
      }, 10000);

      setDataInterval(interval);
      return () => clearInterval(interval);
    } else if (dataInterval) {
      clearInterval(dataInterval);
      setDataInterval(null);
    }
  }, [selectedLandType, showRecommendations, currentDay, selectedCrop]);

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

  // Generate recommendations
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    async function updateRecommendations() {
      if (!fifteenMinuteAverage || !currentDayPlan) {
        setRecommendations([]);
        return;
      }

      try {
        const recs = await generateRecommendations(currentDayPlan, liveData);
        setRecommendations(recs);
      } catch (error) {
        console.error("Error generating recommendations:", error);
        setRecommendations([]);
      }
    }

    updateRecommendations();
  }, [fifteenMinuteAverage, currentDayPlan, liveData]);

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
      idealRanges: true
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

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };
  
  // Handle navigation from sidebar
  const handleNavigate = (menuId) => {
    setActiveSection(menuId);
    
    // Set which components to display based on navigation
    switch(menuId) {
      case 'dashboard':
        setVisibleComponents({
          growthStage: true,
          sensorData: true,
          recommendations: true,
          idealRanges: true
        });
        setShowPlanDashboard(false);
        break;
      case 'crops':
        setVisibleComponents({
          growthStage: true,
          sensorData: false,
          recommendations: false,
          idealRanges: true
        });
        setShowPlanDashboard(false);
        break;
      case 'sensor':
        setVisibleComponents({
          growthStage: false,
          sensorData: true,
          recommendations: false,
          idealRanges: false
        });
        setShowPlanDashboard(false);
        break;
      case 'ml':
        setVisibleComponents({
          growthStage: false,
          sensorData: false,
          recommendations: true,
          idealRanges: false
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
        ml: recommendationsRef
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
                    <SensorData 
                      currentDayPlan={currentDayPlan} 
                      liveData={liveData} 
                    />
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
              </div>
            )}

            {(!currentDayPlan || !showRecommendations) && (
              <div className="welcome-panel">
                <h2>Welcome to {selectedCrop} Crop Yield Prediction & Management</h2>
                <p>Select your land type and number of days to generate a customized growing plan.</p>
                
                <div className="features">
                  <div className="feature">
                    <div className="feature-icon">📊</div>
                    <h3>Day-by-Day Planning</h3>
                    <p>Generate detailed growing conditions for up to 120 days</p>
                  </div>
                  
                  <div className="feature">
                    <div className="feature-icon">🔄</div>
                    <h3>Real-Time Monitoring</h3>
                    <p>Compare sensor data with planned targets in real time</p>
                  </div>
                  
                  <div className="feature">
                    <div className="feature-icon">🧠</div>
                    <h3>Smart ML Recommendations</h3>
                    <p>Get actionable advice to maximize your crop yield</p>
                  </div>
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