import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, Bar, Area, ReferenceLine
} from 'recharts';
import './SensorDataGraphs.css';

const AllParametersGraph = ({ liveData, aggregatedData, currentDayPlan }) => {
  const [formattedData, setFormattedData] = useState([]);
  const [timeRange, setTimeRange] = useState('15m'); // 15m, 1h, 6h
  const [showParameters, setShowParameters] = useState({
    soilTemp: true,
    soilMoisture: true,
    pH: true,
    ec: false,
    nitrogen: false,
    phosphorus: false,
    potassium: false
  });

  // Refs to prevent infinite re-renders
  const prevAggregatedDataRef = useRef([]);
  const prevTimeRangeRef = useRef(timeRange);
  const prevShowParametersRef = useRef(showParameters);
  const dataProcessingRef = useRef(false);
  const isInitialMount = useRef(true);

  // Parameter configuration with colors, units, and display names
  const parameters = {
    soilTemp: { 
      color: '#ff7300', 
      unit: '°C', 
      name: 'Soil Temperature',
      yAxisId: 'temp'
    },
    soilMoisture: { 
      color: '#0088fe', 
      unit: '%', 
      name: 'Soil Moisture',
      yAxisId: 'moisture'
    },
    pH: { 
      color: '#00c49f', 
      unit: '', 
      name: 'pH Level',
      yAxisId: 'ph'
    },
    ec: { 
      color: '#ffbb28', 
      unit: 'µS/cm', 
      name: 'EC',
      yAxisId: 'ec'
    },
    nitrogen: { 
      color: '#8884d8', 
      unit: 'mg/kg', 
      name: 'Nitrogen',
      yAxisId: 'npk'
    },
    phosphorus: { 
      color: '#82ca9d', 
      unit: 'mg/kg', 
      name: 'Phosphorus',
      yAxisId: 'npk'
    },
    potassium: { 
      color: '#ff8042', 
      unit: 'mg/kg', 
      name: 'Potassium',
      yAxisId: 'npk'
    }
  };

  // Format aggregated data for the multi-parameter chart
  useEffect(() => {
    // Skip if already processing data
    if (dataProcessingRef.current) return;
    
    // Skip if data hasn't changed
    const aggregatedDataChanged = aggregatedData !== prevAggregatedDataRef.current;
    const timeRangeChanged = timeRange !== prevTimeRangeRef.current;
    
    if (!aggregatedDataChanged && !timeRangeChanged && !isInitialMount.current) return;
    
    // Set processing flag to prevent concurrent updates
    dataProcessingRef.current = true;
    isInitialMount.current = false;
    
    // Update refs
    prevAggregatedDataRef.current = aggregatedData;
    prevTimeRangeRef.current = timeRange;
    
    if (!aggregatedData || aggregatedData.length === 0) {
      setFormattedData([]);
      dataProcessingRef.current = false;
      return;
    }

    // Determine how many data points to include based on selected time range
    let dataPoints;
    switch (timeRange) {
      case '15m': // 15 minutes = 90 points at 10-second intervals
        dataPoints = 90;
        break;
      case '1h': // 1 hour = 360 points
        dataPoints = 360;
        break;
      case '6h': // 6 hours = 2160 points
        dataPoints = 2160;
        break;
      default:
        dataPoints = 90;
    }

    // Limit to available data points
    const relevantData = aggregatedData.slice(-Math.min(dataPoints, aggregatedData.length));
    
    // Process data in a separate function to avoid re-renders
    const processData = () => {
      // Format data for chart
      const formattedData = relevantData.map((item) => {
        // Calculate time label (e.g., "-5m" for 5 minutes ago)
        const now = Date.now();
        const timeDiff = now - (item.timestamp || now);
        let timeLabel;
        
        if (timeDiff < 60000) { // Less than a minute
          timeLabel = `${Math.floor(timeDiff / 1000)}s`;
        } else if (timeDiff < 3600000) { // Less than an hour
          timeLabel = `${Math.floor(timeDiff / 60000)}m`;
        } else { // Hours
          timeLabel = `${Math.floor(timeDiff / 3600000)}h`;
        }

        return {
          name: timeLabel,
          timestamp: item.timestamp,
          // Actual values (not normalized)
          soilTemp: item.soilTemp,
          soilMoisture: item.soilMoisture,
          pH: item.pH,
          ec: item.ec,
          nitrogen: item.nitrogen,
          phosphorus: item.phosphorus,
          potassium: item.potassium
        };
      });

      return formattedData.reverse(); // Reverse so most recent is on the right
    };

    // Avoid sync state updates that might cause re-render loops
    const timer = setTimeout(() => {
      const newData = processData();
      setFormattedData(newData);
      dataProcessingRef.current = false;
    }, 0);
    
    // Clean up timer on unmount or dependency change
    return () => {
      clearTimeout(timer);
      dataProcessingRef.current = false;
    };
  }, [aggregatedData, timeRange]);

  // Handle parameter toggle with a stable reference
  const toggleParameter = (param) => {
    setShowParameters(prev => {
      const newState = { ...prev, [param]: !prev[param] };
      prevShowParametersRef.current = newState;
      return newState;
    });
  };

  // Handle time range change with a stable reference
  const handleTimeRangeChange = (newRange) => {
    setTimeRange(newRange);
  };

  // Custom tooltip that shows actual values with units - memoized to prevent recreation
  const CustomTooltip = useMemo(() => {
    return ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        return (
          <div className="custom-tooltip">
            <p className="label">{`Time: ${label}`}</p>
            {payload.map((entry, index) => {
              // Skip parameters that are not being shown
              if (!showParameters[entry.dataKey]) return null;
              
              const param = parameters[entry.dataKey];
              return (
                <p 
                  key={`item-${index}`} 
                  className="value" 
                  style={{ color: entry.color }}
                >
                  {`${param.name}: ${entry.value?.toFixed(1)}${param.unit}`}
                </p>
              );
            })}
          </div>
        );
      }
      return null;
    };
  }, [showParameters, parameters]);

  // Safe render to prevent errors if data is missing
  if (!aggregatedData || !liveData) {
    return (
      <div className="all-parameters-graph-container">
        <div className="graph-panel">
          <div className="graph-header">
            <h3>All Sensor Parameters</h3>
          </div>
          <div className="graph-body multi-parameter">
            <div className="no-data-message">
              <p>No sensor data available. Data will appear here when collected.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="all-parameters-graph-container">
      <div className="graph-panel">
        <div className="graph-header">
          <h3>All Sensor Parameters</h3>
          <div className="graph-controls">
            <div className="time-range-selector">
              <label>Time Range:</label>
              <div className="time-buttons">
                <button 
                  className={timeRange === '15m' ? 'active' : ''} 
                  onClick={() => handleTimeRangeChange('15m')}
                >
                  15m
                </button>
                <button 
                  className={timeRange === '1h' ? 'active' : ''} 
                  onClick={() => handleTimeRangeChange('1h')}
                >
                  1h
                </button>
                <button 
                  className={timeRange === '6h' ? 'active' : ''} 
                  onClick={() => handleTimeRangeChange('6h')}
                >
                  6h
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="graph-body multi-parameter">
          {formattedData.length > 0 ? (
            <>
              <div className="parameter-toggles">
                {Object.entries(parameters).map(([key, { name, color }]) => (
                  <div 
                    key={key} 
                    className={`parameter-toggle ${showParameters[key] ? 'active' : ''}`}
                    onClick={() => toggleParameter(key)}
                    style={{ borderColor: showParameters[key] ? color : '#ddd' }}
                  >
                    <span 
                      className="color-indicator" 
                      style={{ backgroundColor: color }}
                    ></span>
                    <span className="param-name">{name}</span>
                  </div>
                ))}
              </div>
              
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    label={{ value: "Time", position: "insideBottomRight", offset: -5 }}
                  />
                  
                  {/* Temperature Y-axis (left) */}
                  {showParameters.soilTemp && (
                    <YAxis 
                      yAxisId="temp" 
                      orientation="left"
                      domain={[10, 40]}
                      label={{ 
                        value: "Temperature (°C)", 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle' }
                      }}
                    />
                  )}
                  
                  {/* Moisture Y-axis (right) */}
                  {showParameters.soilMoisture && (
                    <YAxis 
                      yAxisId="moisture" 
                      orientation="right"
                      domain={[30, 90]}
                      label={{ 
                        value: "Moisture (%)", 
                        angle: 90, 
                        position: 'insideRight',
                        style: { textAnchor: 'middle' }
                      }}
                    />
                  )}
                  
                  {/* pH Y-axis (far left) */}
                  {showParameters.pH && (
                    <YAxis 
                      yAxisId="ph" 
                      orientation="left"
                      domain={[4, 9]}
                      hide={true} // Hide axis but still use for scaling
                    />
                  )}
                  
                  {/* EC Y-axis (far right) */}
                  {showParameters.ec && (
                    <YAxis 
                      yAxisId="ec" 
                      orientation="right"
                      domain={[500, 2000]}
                      hide={true} // Hide axis but still use for scaling
                    />
                  )}
                  
                  {/* NPK Y-axis (hidden) */}
                  {(showParameters.nitrogen || showParameters.phosphorus || showParameters.potassium) && (
                    <YAxis 
                      yAxisId="npk" 
                      orientation="right"
                      domain={[0, 300]}
                      hide={true} // Hide axis but still use for scaling
                    />
                  )}
                  
                  <Tooltip content={CustomTooltip} />
                  <Legend />
                  
                  {/* Lines for each parameter - only render if the parameter is selected */}
                  {showParameters.soilTemp && (
                    <Line 
                      yAxisId="temp"
                      type="monotone" 
                      dataKey="soilTemp" 
                      name="Soil Temperature"
                      stroke={parameters.soilTemp.color} 
                      dot={false}
                      activeDot={{ r: 6 }}
                      strokeWidth={2}
                      isAnimationActive={false}
                    />
                  )}
                  
                  {showParameters.soilMoisture && (
                    <Line 
                      yAxisId="moisture"
                      type="monotone" 
                      dataKey="soilMoisture" 
                      name="Soil Moisture"
                      stroke={parameters.soilMoisture.color} 
                      dot={false}
                      activeDot={{ r: 6 }}
                      strokeWidth={2}
                      isAnimationActive={false}
                    />
                  )}
                  
                  {showParameters.pH && (
                    <Line 
                      yAxisId="ph"
                      type="monotone" 
                      dataKey="pH" 
                      name="pH Level"
                      stroke={parameters.pH.color} 
                      dot={false}
                      activeDot={{ r: 6 }}
                      strokeWidth={2}
                      isAnimationActive={false}
                    />
                  )}
                  
                  {showParameters.ec && (
                    <Line 
                      yAxisId="ec"
                      type="monotone" 
                      dataKey="ec" 
                      name="EC"
                      stroke={parameters.ec.color} 
                      dot={false}
                      activeDot={{ r: 6 }}
                      strokeWidth={2}
                      isAnimationActive={false}
                    />
                  )}
                  
                  {showParameters.nitrogen && (
                    <Line 
                      yAxisId="npk"
                      type="monotone" 
                      dataKey="nitrogen" 
                      name="Nitrogen"
                      stroke={parameters.nitrogen.color} 
                      dot={false}
                      activeDot={{ r: 6 }}
                      strokeWidth={2}
                      isAnimationActive={false}
                    />
                  )}
                  
                  {showParameters.phosphorus && (
                    <Line 
                      yAxisId="npk"
                      type="monotone" 
                      dataKey="phosphorus" 
                      name="Phosphorus"
                      stroke={parameters.phosphorus.color} 
                      dot={false}
                      activeDot={{ r: 6 }}
                      strokeWidth={2}
                      isAnimationActive={false}
                    />
                  )}
                  
                  {showParameters.potassium && (
                    <Line 
                      yAxisId="npk"
                      type="monotone" 
                      dataKey="potassium" 
                      name="Potassium"
                      stroke={parameters.potassium.color} 
                      dot={false}
                      activeDot={{ r: 6 }}
                      strokeWidth={2}
                      isAnimationActive={false}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </>
          ) : (
            <div className="no-data-message">
              <p>No sensor data available. Data will appear here when collected.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllParametersGraph;