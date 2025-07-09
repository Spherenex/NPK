import './SensorData.css'

const SensorData = ({ currentDayPlan, liveData }) => {
    if (!currentDayPlan || !liveData) return null;

    return (
        <div className="data-panels">
            <div className="panel">
                <h3>Today's Growth Plan (Day {currentDayPlan.day})</h3>
                <div className="parameters-grid">
                    <div className="parameter">
                        <span className="param-label">Soil Temperature:</span>
                        <span className="param-value">{currentDayPlan.soilTemp.toFixed(1)}°C</span>
                    </div>
                    <div className="parameter">
                        <span className="param-label">Soil Moisture:</span>
                        <span className="param-value">{currentDayPlan.soilMoisture.toFixed(1)}%</span>
                    </div>
                    <div className="parameter">
                        <span className="param-label">pH Level:</span>
                        <span className="param-value">{currentDayPlan.pH.toFixed(1)}</span>
                    </div>
                    <div className="parameter">
                        <span className="param-label">EC:</span>
                        <span className="param-value">{currentDayPlan.ec.toFixed(0)} µS/cm</span>
                    </div>
                    <div className="parameter">
                        <span className="param-label">Nitrogen:</span>
                        <span className="param-value">{currentDayPlan.nitrogen.toFixed(0)} mg/kg</span>
                    </div>
                    <div className="parameter">
                        <span className="param-label">Phosphorus:</span>
                        <span className="param-value">{currentDayPlan.phosphorus.toFixed(0)} mg/kg</span>
                    </div>
                    <div className="parameter">
                        <span className="param-label">Potassium:</span>
                        <span className="param-value">{currentDayPlan.potassium.toFixed(0)} mg/kg</span>
                    </div>
                </div>
            </div>

            <div className="panel">
                <h3>Current Sensor Data <span className="live-indicator">LIVE</span></h3>
                <div className="parameters-grid">
                    <div className="parameter">
                        <span className="param-label">Soil Temperature:</span>
                        <span className="param-value">{liveData.soilTemp.toFixed(1)}°C</span>
                    </div>
                    <div className="parameter">
                        <span className="param-label">Soil Moisture:</span>
                        <span className="param-value">{liveData.soilMoisture.toFixed(1)}%</span>
                    </div>
                    <div className="parameter">
                        <span className="param-label">pH Level:</span>
                        <span className="param-value">{liveData.pH.toFixed(1)}</span>
                    </div>
                    <div className="parameter">
                        <span className="param-label">EC:</span>
                        <span className="param-value">{liveData.ec.toFixed(0)} µS/cm</span>
                    </div>
                    <div className="parameter">
                        <span className="param-label">Nitrogen:</span>
                        <span className="param-value">{liveData.nitrogen.toFixed(0)} mg/kg</span>
                    </div>
                    <div className="parameter">
                        <span className="param-label">Phosphorus:</span>
                        <span className="param-value">{liveData.phosphorus.toFixed(0)} mg/kg</span>
                    </div>
                    <div className="parameter">
                        <span className="param-label">Potassium:</span>
                        <span className="param-value">{liveData.potassium.toFixed(0)} mg/kg</span>
                    </div>
                </div>
                <div className="data-update-info">
                    Data updates every 10 seconds | 15-minute average used for recommendations
                </div>
            </div>
        </div>
    );
};

export default SensorData;