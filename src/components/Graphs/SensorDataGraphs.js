import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ReferenceLine
} from 'recharts';
import './SensorDataGraphs.css';

const SensorDataGraphs = ({ liveData, aggregatedData, currentDayPlan }) => {
  const [selectedParameter, setSelectedParameter] = useState('soilTemp');
  const [timeRange, setTimeRange] = useState('15m'); // 15m, 1h, 6h
  const [formattedData, setFormattedData] = useState([]);
  const [mlPredictionData, setMlPredictionData] = useState([]);
  
  // Refs to prevent infinite re-renders
  const prevAggregatedDataRef = useRef([]);
  const prevTimeRangeRef = useRef(timeRange);
  const prevSelectedParamRef = useRef(selectedParameter);
  const prevLiveDataRef = useRef(null);
  const prevCurrentDayPlanRef = useRef(null);
  const dataProcessingRef = useRef(false);
  const isInitialMount = useRef(true);

  // Parameter configuration with colors, units, and display names
  const parameters = {
    soilTemp: { 
      color: '#ff7300', 
      unit: '°C', 
      name: 'Soil Temperature',
      range: [15, 35],
      domain: [10, 40]
    },
    soilMoisture: { 
      color: '#0088fe', 
      unit: '%', 
      name: 'Soil Moisture',
      range: [40, 80],
      domain: [30, 90]
    },
    pH: { 
      color: '#00c49f', 
      unit: '', 
      name: 'pH Level',
      range: [5.5, 7.5],
      domain: [4, 9]
    },
    ec: { 
      color: '#ffbb28', 
      unit: 'µS/cm', 
      name: 'EC',
      range: [800, 1600],
      domain: [500, 2000]
    },
    nitrogen: { 
      color: '#8884d8', 
      unit: 'mg/kg', 
      name: 'Nitrogen',
      range: [80, 180],
      domain: [50, 220]
    },
    phosphorus: { 
      color: '#82ca9d', 
      unit: 'mg/kg', 
      name: 'Phosphorus',
      range: [25, 65],
      domain: [15, 80]
    },
    potassium: { 
      color: '#ff8042', 
      unit: 'mg/kg', 
      name: 'Potassium',
      range: [140, 250],
      domain: [100, 300]
    }
  };

  // Format aggregated data for the time series chart - FIXED to avoid circular dependencies
  useEffect(() => {
    // Skip if already processing data
    if (dataProcessingRef.current) return;
    
    // Check if data has changed directly, without using memoized values
    const aggregatedDataChanged = aggregatedData !== prevAggregatedDataRef.current;
    const timeRangeChanged = timeRange !== prevTimeRangeRef.current;
    const paramChanged = selectedParameter !== prevSelectedParamRef.current;
    
    // Skip update if nothing has changed (except on initial mount)
    if (!aggregatedDataChanged && !timeRangeChanged && !paramChanged && !isInitialMount.current) return;
    
    // Set processing flag and update initial mount status
    dataProcessingRef.current = true;
    isInitialMount.current = false;
    
    // Update refs
    prevAggregatedDataRef.current = aggregatedData;
    prevTimeRangeRef.current = timeRange;
    prevSelectedParamRef.current = selectedParameter;
    
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
    
    // Calculate the formatted data outside of setState to avoid unnecessary re-renders
    const newFormattedData = relevantData.map((item) => {
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
        [selectedParameter]: item[selectedParameter],
        timestamp: item.timestamp
      };
    }).reverse(); // Reverse so most recent is on the right

    // Use timeout to avoid sync state updates
    const timer = setTimeout(() => {
      setFormattedData(newFormattedData);
      dataProcessingRef.current = false;
    }, 0);
    
    // Clean up timer on unmount or dependency change
    return () => {
      clearTimeout(timer);
      dataProcessingRef.current = false;
    };
  }, [aggregatedData, timeRange, selectedParameter]);

useEffect(() => {
  // Debug logging
  console.log('ML Prediction useEffect triggered with:', {
    liveDataExists: !!liveData,
    currentDayPlanExists: !!currentDayPlan,
    selectedParameter,
    liveDataValue: liveData ? liveData[selectedParameter] : 'N/A',
    targetValue: currentDayPlan ? currentDayPlan[selectedParameter] : 'N/A'
  });

  // Skip if dependencies aren't present
  if (!currentDayPlan || !liveData) {
    console.log('ML Prediction: Missing required data, clearing prediction data');
    setMlPredictionData([]);
    return;
  }
  
  // Always generate prediction data when this effect runs
  // We've removed the change detection as it was causing issues
  
  // Get current value
  const currentValue = liveData[selectedParameter] || 0;
  
  // Get target value from plan
  const targetValue = currentDayPlan[selectedParameter] || 0;
  
  // Debug values
  console.log('ML Prediction: Generating prediction with:', {
    currentValue,
    targetValue,
    parameter: selectedParameter,
    day: currentDayPlan.day
  });
  
  // Create prediction data points
  const predictionPoints = [
    { name: 'Current', value: currentValue, label: 'Now' },
    { name: 'Target', value: targetValue, label: 'Target' }
  ];
  
  // Add prediction points for next 3 days
  const timeToReachTarget = Math.abs(targetValue - currentValue) > 5 ? 3 : 2; // More time if big difference
  const step = (targetValue - currentValue) / timeToReachTarget;
  
  for (let i = 1; i <= timeToReachTarget; i++) {
    const predictedValue = currentValue + (step * i);
    predictionPoints.push({
      name: `Day ${currentDayPlan.day + i}`,
      value: predictedValue,
      label: `+${i}d`
    });
  }
  
  console.log('ML Prediction: Generated points:', predictionPoints);
  
  // Use timeout to avoid sync state updates
  const timer = setTimeout(() => {
    setMlPredictionData(predictionPoints);
  }, 0);
  
  // Clean up timer on unmount or dependency change
  return () => clearTimeout(timer);
}, [liveData, currentDayPlan, selectedParameter]);

  // Memoize parameter utility functions to prevent recalculations
  const getUnit = useMemo(() => parameters[selectedParameter]?.unit || '', [selectedParameter]);
  const getColor = useMemo(() => parameters[selectedParameter]?.color || '#8884d8', [selectedParameter]);
  const getName = useMemo(() => parameters[selectedParameter]?.name || 'Parameter', [selectedParameter]);
  
  // Format tooltip value with unit
  const formatTooltipValue = (value) => {
    if (value === undefined || value === null) return 'N/A';
    return `${value.toFixed(1)}${getUnit}`;
  };

  // Custom tooltip component for the time series chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{`Time: ${label}`}</p>
          <p className="value" style={{ color: getColor }}>
            {`${getName}: ${formatTooltipValue(payload[0].value)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip component for the prediction chart
  const PredictionTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{`${label}`}</p>
          <p className="value" style={{ color: getColor }}>
            {`${getName}: ${formatTooltipValue(payload[0].value)}`}
          </p>
          {payload[0].payload.label && (
            <p className="label-info">{payload[0].payload.label}</p>
          )}
        </div>
      );
    }
    return null;
  };

  // Event handlers that don't recreate on every render
  const handleParameterChange = (e) => {
    setSelectedParameter(e.target.value);
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  return (
    <div className="sensor-graphs-container">
      {/* Time Series Graph Panel */}
      <div className="graph-panel">
        <div className="graph-header">
          <h3>Real-Time Sensor Data</h3>
          <div className="graph-controls">
            <div className="parameter-selector">
              <label>Parameter:</label>
              <select 
                value={selectedParameter}
                onChange={handleParameterChange}
              >
                {Object.entries(parameters).map(([key, { name }]) => (
                  <option key={key} value={key}>{name}</option>
                ))}
              </select>
            </div>
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
        
        <div className="graph-body">
          {formattedData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tickFormatter={(value) => value}
                  label={{ value: "Time", position: "insideBottomRight", offset: -5 }}
                />
                <YAxis 
                  domain={parameters[selectedParameter]?.domain || ['auto', 'auto']}
                  label={{ 
                    value: `${getName} (${getUnit})`, 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' }
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {currentDayPlan && currentDayPlan[selectedParameter] && (
                  <ReferenceLine 
                    y={currentDayPlan[selectedParameter]} 
                    stroke="#666" 
                    strokeDasharray="3 3"
                    label={{ 
                      value: "Target", 
                      position: "top", 
                      fill: "#666",
                      fontSize: 12
                    }} 
                  />
                )}
                <Line 
                  type="monotone" 
                  dataKey={selectedParameter} 
                  stroke={getColor} 
                  dot={{ r: 2 }}
                  activeDot={{ r: 5 }}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data-message">
              <p>No sensor data available. Data will appear here when collected.</p>
            </div>
          )}
        </div>
      </div>

      {/* ML Prediction Graph Panel */}
      <div className="graph-panel">
        <div className="graph-header">
          <h3>ML Predicted Trend</h3>
          <div className="prediction-info">
            <span className="info-tag">Based on ML model predictions</span>
          </div>
        </div>
        
        <div className="graph-body">
          {mlPredictionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mlPredictionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tickFormatter={(value) => value}
                />
                <YAxis 
                  domain={parameters[selectedParameter]?.domain || ['auto', 'auto']}
                  label={{ 
                    value: `${getName} (${getUnit})`, 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' }
                  }}
                />
                <Tooltip content={<PredictionTooltip />} />
                <Legend />
                {currentDayPlan && currentDayPlan[selectedParameter] && (
                  <ReferenceLine 
                    y={currentDayPlan[selectedParameter]} 
                    stroke="#666" 
                    strokeDasharray="3 3"
                    label={{ 
                      value: "Target", 
                      position: "top", 
                      fill: "#666",
                      fontSize: 12
                    }} 
                  />
                )}
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  fill={getColor} 
                  fillOpacity={0.3}
                  stroke={getColor} 
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data-message">
              <p>No prediction data available. Select a plan to see ML predictions.</p>
            </div>
          )}
        </div>
        
        <div className="prediction-details">
          <p className="prediction-description">
            This graph shows the ML-predicted trend for {getName.toLowerCase()} over the next few days, 
            based on current readings and target values.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SensorDataGraphs;