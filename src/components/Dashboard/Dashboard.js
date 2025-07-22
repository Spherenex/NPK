import React from 'react';
import { FaWater, FaSun, FaSeedling, FaThermometerHalf, FaLeaf } from 'react-icons/fa';
import './Dashboard.css';

/**
 * Dashboard component for selecting crop parameters and generating plans
 */
const Dashboard = ({
    selectedCrop,
    setSelectedCrop,
    selectedLandType,
    setSelectedLandType,
    totalDays,
    setTotalDays,
    currentDay,
    setCurrentDay,
    landTypes,
    availableCrops,
    generatePlan,
    viewFullPlan,
    showRecommendations
}) => {
    return (
        <div className="dashboard-container">
            <div className="selection-panel">
                <div className="panel-header">
                    <FaSeedling className="panel-icon" />
                    <h2 className="panel-title">Crop Parameters</h2>
                </div>

                <div className="form-container">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="crop-select" className="form-label">
                                Crop Type:
                            </label>
                            <select
                                id="crop-select"
                                value={selectedCrop}
                                onChange={(e) => setSelectedCrop(e.target.value)}
                                className="form-select"
                            >
                                {availableCrops.map((crop, index) => (
                                    <option key={index} value={crop}>{crop}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="land-select" className="form-label">
                                Land Type:
                            </label>
                            <select
                                id="land-select"
                                value={selectedLandType}
                                onChange={(e) => setSelectedLandType(e.target.value)}
                                className="form-select"
                            >
                                <option value="">Select Land Type</option>
                                {landTypes.map((land, index) => (
                                    <option key={index} value={land}>{land}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="days-select" className="form-label">
                            Total Days to Plan:
                        </label>
                        <div className="input-control">
                            <div className="numeric-input">
                                <button 
                                    className="numeric-btn"
                                    onClick={() => setTotalDays(Math.max(1, totalDays - 1))}
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    id="days-select-number"
                                    min="1"
                                    max="120"
                                    value={totalDays}
                                    onChange={(e) => setTotalDays(parseInt(e.target.value) || 1)}
                                    className="numeric-value"
                                />
                                <button 
                                    className="numeric-btn"
                                    onClick={() => setTotalDays(Math.min(120, totalDays + 1))}
                                >
                                    +
                                </button>
                            </div>
                            <div className="day-label">days</div>
                        </div>
                    </div>

                    {showRecommendations && (
                        <div className="form-group">
                            <label htmlFor="current-day" className="form-label">
                                Current Day:
                            </label>
                            <div className="input-control">
                                <div className="numeric-input">
                                    <button 
                                        className="numeric-btn"
                                        onClick={() => setCurrentDay(Math.max(1, currentDay - 1))}
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        id="current-day-number"
                                        min="1"
                                        max={totalDays}
                                        value={currentDay}
                                        onChange={(e) => setCurrentDay(parseInt(e.target.value) || 1)}
                                        className="numeric-value"
                                    />
                                    <button 
                                        className="numeric-btn"
                                        onClick={() => setCurrentDay(Math.min(totalDays, currentDay + 1))}
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="day-label">of {totalDays}</div>
                            </div>
                        </div>
                    )}

                    <div className="button-group">
                        <button
                            className="btn btn-primary"
                            onClick={generatePlan}
                            disabled={!selectedLandType}
                        >
                            Generate Growth Plan
                        </button>

                        {showRecommendations && (
                            <button
                                className="btn btn-secondary"
                                onClick={viewFullPlan}
                            >
                                View Full Plan
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {showRecommendations && (
                <div className="quick-tips">
                    <div className="panel-header">
                        <FaLeaf className="panel-icon" />
                        <h3 className="panel-title">Quick Growing Tips</h3>
                    </div>
                    <ul className="tips-list">
                        <li className="tip-item">
                            <span className="tip-icon tip-icon-water">
                                <FaWater />
                            </span>
                            <span className="tip-text">
                                Water deeply but infrequently to encourage deep root growth
                            </span>
                        </li>
                        <li className="tip-item">
                            <span className="tip-icon tip-icon-sun">
                                <FaSun />
                            </span>
                            <span className="tip-text">
                                Ensure 6-8 hours of sunlight daily for optimal growth
                            </span>
                        </li>
                        <li className="tip-item">
                            <span className="tip-icon tip-icon-seedling">
                                <FaSeedling />
                            </span>
                            <span className="tip-text">
                                {selectedCrop === "Tomato" && "Prune suckers to direct energy to fruit production"}
                                {selectedCrop === "Brinjal" && "Stake plants to support heavy fruits and improve air circulation"}
                                {selectedCrop === "Capsicum" && "Maintain proper spacing between plants for better yields"}
                                {selectedCrop === "Potato" && "Hill soil around stems as plants grow to protect tubers"}
                            </span>
                        </li>
                        <li className="tip-item">
                            <span className="tip-icon tip-icon-temp">
                                <FaThermometerHalf />
                            </span>
                            <span className="tip-text">
                                {selectedCrop === "Tomato" && "Maintain soil temperature between 18-26°C for best results"}
                                {selectedCrop === "Brinjal" && "Maintain soil temperature between 20-30°C for best results"}
                                {selectedCrop === "Capsicum" && "Maintain soil temperature between 18-24°C for best results"}
                                {selectedCrop === "Potato" && "Maintain soil temperature between 15-20°C for best results"}
                            </span>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Dashboard;