import React from 'react';
import './SensorData.css';
import { 
    MdOutlineWaterDrop, 
    MdOutlineWbSunny, 
    MdScience, 
    MdBolt, 
    MdGrass, 
    MdUpdate,
    MdSpeed,
    MdShowChart,
    MdInfo,
    MdHistoryToggleOff,
    MdAccessTime
} from 'react-icons/md';

const SensorDataWithAverage = ({ currentDayPlan, liveData, aggregatedData }) => {
    if (!currentDayPlan) return null;

    // Format last update time in a human-readable way
    const formatLastUpdate = (timestamp) => {
        if (!timestamp) return "N/A";
        
        const now = Date.now();
        const diff = now - timestamp;
        
        if (diff < 60000) { // Less than a minute
            return `${Math.floor(diff / 1000)} seconds ago`;
        } else if (diff < 3600000) { // Less than an hour
            return `${Math.floor(diff / 60000)} minutes ago`;
        } else if (diff < 86400000) { // Less than a day
            return `${Math.floor(diff / 3600000)} hours ago`;
        } else {
            // Format as date string
            const date = new Date(timestamp);
            return date.toLocaleString();
        }
    };

    // Check if data is stale (over 5 minutes old)
    const isDataStale = liveData && liveData.timestamp && (Date.now() - liveData.timestamp > 300000);

    // Calculate 15-minute average
    const calculateAverage = () => {
        if (!aggregatedData || aggregatedData.length === 0) return null;

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

        return {
            soilTemp: sum.soilTemp / aggregatedData.length,
            soilMoisture: sum.soilMoisture / aggregatedData.length,
            pH: sum.pH / aggregatedData.length,
            ec: sum.ec / aggregatedData.length,
            nitrogen: sum.nitrogen / aggregatedData.length,
            phosphorus: sum.phosphorus / aggregatedData.length,
            potassium: sum.potassium / aggregatedData.length
        };
    };

    const averageData = calculateAverage();

    // Format values from data
    const formatValue = (value, defaultValue = "N/A", decimals = 1) => {
        if (value === 0 || value === null || value === undefined || isNaN(value)) {
            return defaultValue;
        }
        return value.toFixed(decimals);
    };

    // Show loading state if liveData is not yet available
    if (!liveData) {
        return (
            <div className="sensor-data-container">
                <div className="data-panel plan-panel">
                    <div className="panel-header">
                        <h3>Today's Growth Plan (Day {currentDayPlan.day})</h3>
                    </div>
                    <div className="parameter-grid">
                        <div className="parameter-row">
                            <div className="parameter-cell">
                                <div className="parameter-label">
                                    <MdOutlineWbSunny className="parameter-icon" /> 
                                    Soil Temperature
                                </div>
                                <div className="parameter-value">{currentDayPlan.soilTemp.toFixed(1)}°C</div>
                            </div>
                            <div className="parameter-cell">
                                <div className="parameter-label">
                                    <MdOutlineWaterDrop className="parameter-icon" /> 
                                    Soil Moisture
                                </div>
                                <div className="parameter-value">{currentDayPlan.soilMoisture.toFixed(1)}%</div>
                            </div>
                            <div className="parameter-cell">
                                <div className="parameter-label">
                                    <MdScience className="parameter-icon" /> 
                                    pH Level
                                </div>
                                <div className="parameter-value">{currentDayPlan.pH.toFixed(1)}</div>
                            </div>
                        </div>
                        <div className="parameter-row">
                            <div className="parameter-cell">
                                <div className="parameter-label">
                                    <MdBolt className="parameter-icon" /> 
                                    EC
                                </div>
                                <div className="parameter-value">{currentDayPlan.ec.toFixed(0)} µS/cm</div>
                            </div>
                            <div className="parameter-cell">
                                <div className="parameter-label">
                                    <MdGrass className="parameter-icon" /> 
                                    Nitrogen
                                </div>
                                <div className="parameter-value">{currentDayPlan.nitrogen.toFixed(0)} mg/kg</div>
                            </div>
                            <div className="parameter-cell">
                                <div className="parameter-label">
                                    <MdGrass className="parameter-icon" /> 
                                    Phosphorus
                                </div>
                                <div className="parameter-value">{currentDayPlan.phosphorus.toFixed(0)} mg/kg</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="data-panel loading-panel">
                    <div className="loading-indicator">
                        <div className="loading-spinner"></div>
                        <div className="loading-text">Loading sensor data...</div>
                    </div>
                </div>
            </div>
        );
    }

    // Determine the data source display
    const getDataSourceDisplay = () => {
        if (liveData.isFallback) {
            return (
                <div className="data-source fallback">
                    <MdSpeed className="source-icon" /> Generated Data (No Sensor Data Available)
                </div>
            );
        } else if (!liveData.isNewData || isDataStale) {
            return (
                <div className="data-source historical">
                    <MdAccessTime className="source-icon" /> Last Available Google Sheets Data
                </div>
            );
        } else {
            return (
                <div className="data-source">
                    <MdSpeed className="source-icon" /> Live Google Sheets Data
                </div>
            );
        }
    };

    return (
        <div className="sensor-data-container">
            <div className="data-panel plan-panel">
                <div className="panel-header">
                    <h3>Today's Growth Plan</h3>
                    <div className="panel-info">Day {currentDayPlan.day}</div>
                </div>
                <div className="parameter-grid">
                    <div className="parameter-row">
                        <div className="parameter-cell">
                            <div className="parameter-label">
                                <MdOutlineWbSunny className="parameter-icon" /> 
                                Soil Temperature
                            </div>
                            <div className="parameter-value">{currentDayPlan.soilTemp.toFixed(1)}°C</div>
                        </div>
                        <div className="parameter-cell">
                            <div className="parameter-label">
                                <MdOutlineWaterDrop className="parameter-icon" /> 
                                Soil Moisture
                            </div>
                            <div className="parameter-value">{currentDayPlan.soilMoisture.toFixed(1)}%</div>
                        </div>
                        <div className="parameter-cell">
                            <div className="parameter-label">
                                <MdScience className="parameter-icon" /> 
                                pH Level
                            </div>
                            <div className="parameter-value">{currentDayPlan.pH.toFixed(1)}</div>
                        </div>
                    </div>
                    <div className="parameter-row">
                        <div className="parameter-cell">
                            <div className="parameter-label">
                                <MdBolt className="parameter-icon" /> 
                                EC
                            </div>
                            <div className="parameter-value">{currentDayPlan.ec.toFixed(0)} µS/cm</div>
                        </div>
                        <div className="parameter-cell">
                            <div className="parameter-label">
                                <MdGrass className="parameter-icon" /> 
                                Nitrogen
                            </div>
                            <div className="parameter-value">{currentDayPlan.nitrogen.toFixed(0)} mg/kg</div>
                        </div>
                        <div className="parameter-cell">
                            <div className="parameter-label">
                                <MdGrass className="parameter-icon" /> 
                                Phosphorus
                            </div>
                            <div className="parameter-value">{currentDayPlan.phosphorus.toFixed(0)} mg/kg</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="data-panel live-panel">
                <div className="panel-header">
                    <h3>Current Sensor Data</h3>
                    <div className={`status-indicator ${isDataStale || !liveData.isNewData ? 'stale' : ''}`}>
                        {isDataStale || !liveData.isNewData ? (
                            <><MdHistoryToggleOff className="status-icon" /> Last Available Data</>
                        ) : (
                            <><MdUpdate className="status-icon" /> Live</>
                        )}
                    </div>
                </div>
                {getDataSourceDisplay()}
                <div className="update-info">
                    <MdUpdate className="update-icon" /> 
                    Last updated: {liveData.timestamp ? formatLastUpdate(liveData.timestamp) : "N/A"}
                </div>
                <div className="parameter-grid">
                    <div className="parameter-row">
                        <div className="parameter-cell">
                            <div className="parameter-label">
                                <MdOutlineWbSunny className="parameter-icon" /> 
                                Soil Temperature
                            </div>
                            <div className="parameter-value">{formatValue(liveData.soilTemp)}°C</div>
                        </div>
                        <div className="parameter-cell">
                            <div className="parameter-label">
                                <MdOutlineWaterDrop className="parameter-icon" /> 
                                Soil Moisture
                            </div>
                            <div className="parameter-value">{formatValue(liveData.soilMoisture)}%</div>
                        </div>
                        <div className="parameter-cell">
                            <div className="parameter-label">
                                <MdScience className="parameter-icon" /> 
                                pH Level
                            </div>
                            <div className="parameter-value">{formatValue(liveData.pH)}</div>
                        </div>
                    </div>
                    <div className="parameter-row">
                        <div className="parameter-cell">
                            <div className="parameter-label">
                                <MdBolt className="parameter-icon" /> 
                                EC
                            </div>
                            <div className="parameter-value">
                                {formatValue(liveData.ec, "N/A")} {liveData.ec > 0 ? 'µS/cm' : ''}
                            </div>
                        </div>
                        <div className="parameter-cell">
                            <div className="parameter-label">
                                <MdGrass className="parameter-icon" /> 
                                Nitrogen
                            </div>
                            <div className="parameter-value">
                                {formatValue(liveData.nitrogen, "N/A")} {liveData.nitrogen > 0 ? 'mg/kg' : ''}
                            </div>
                        </div>
                        <div className="parameter-cell">
                            <div className="parameter-label">
                                <MdGrass className="parameter-icon" /> 
                                Phosphorus
                            </div>
                            <div className="parameter-value">
                                {formatValue(liveData.phosphorus, "N/A")} {liveData.phosphorus > 0 ? 'mg/kg' : ''}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="panel-footer">
                    <MdUpdate className="footer-icon" /> {liveData.isFallback ? 'Using generated data until sensor data is available' : 'Data refreshes every 10 seconds'}
                </div>
            </div>
            
            <div className="data-panel average-panel">
                <div className="panel-header">
                    <h3>15-Minute Average</h3>
                    <div className="status-indicator ml-indicator">
                        <MdInfo className="status-icon" /> ML Input
                    </div>
                </div>
                <div className="data-source">
                    <MdShowChart className="source-icon" /> Used for ML Predictions
                </div>
                <div className="update-info">
                    <MdInfo className="update-icon" /> 
                    Using {aggregatedData?.length || 0} data points
                </div>
                <div className="parameter-grid">
                    <div className="parameter-row">
                        <div className="parameter-cell">
                            <div className="parameter-label">
                                <MdOutlineWbSunny className="parameter-icon" /> 
                                Soil Temperature
                            </div>
                            <div className="parameter-value">
                                {averageData ? formatValue(averageData.soilTemp) : "N/A"}°C
                            </div>
                        </div>
                        <div className="parameter-cell">
                            <div className="parameter-label">
                                <MdOutlineWaterDrop className="parameter-icon" /> 
                                Soil Moisture
                            </div>
                            <div className="parameter-value">
                                {averageData ? formatValue(averageData.soilMoisture) : "N/A"}%
                            </div>
                        </div>
                        <div className="parameter-cell">
                            <div className="parameter-label">
                                <MdScience className="parameter-icon" /> 
                                pH Level
                            </div>
                            <div className="parameter-value">
                                {averageData ? formatValue(averageData.pH) : "N/A"}
                            </div>
                        </div>
                    </div>
                    <div className="parameter-row">
                        <div className="parameter-cell">
                            <div className="parameter-label">
                                <MdBolt className="parameter-icon" /> 
                                EC
                            </div>
                            <div className="parameter-value">
                                {averageData ? formatValue(averageData.ec, "N/A") : "N/A"} 
                                {averageData && averageData.ec > 0 ? 'µS/cm' : ''}
                            </div>
                        </div>
                        <div className="parameter-cell">
                            <div className="parameter-label">
                                <MdGrass className="parameter-icon" /> 
                                Nitrogen
                            </div>
                            <div className="parameter-value">
                                {averageData ? formatValue(averageData.nitrogen, "N/A") : "N/A"} 
                                {averageData && averageData.nitrogen > 0 ? 'mg/kg' : ''}
                            </div>
                        </div>
                        <div className="parameter-cell">
                            <div className="parameter-label">
                                <MdGrass className="parameter-icon" /> 
                                Phosphorus
                            </div>
                            <div className="parameter-value">
                                {averageData ? formatValue(averageData.phosphorus, "N/A") : "N/A"} 
                                {averageData && averageData.phosphorus > 0 ? 'mg/kg' : ''}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="panel-footer">
                    <MdInfo className="footer-icon" /> Based on {aggregatedData?.length || 0} samples
                </div>
            </div>
        </div>
    );
};

export default SensorDataWithAverage;