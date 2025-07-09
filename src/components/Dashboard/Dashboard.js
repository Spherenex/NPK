// import React from 'react';
// import './Dashboard.css';

// /**
//  * Dashboard component for selecting crop parameters and generating plans
//  */
// const Dashboard = ({
//     selectedLandType,
//     setSelectedLandType,
//     totalDays,
//     setTotalDays,
//     currentDay,
//     setCurrentDay,
//     landTypes,
//     generatePlan,
//     viewFullPlan,
//     showRecommendations
// }) => {
//     return (
//         <div className="sidebar">
//             <div className="selection-panel">
//                 <h2>Select Crop Parameters</h2>

//                 <div className="form-group">
//                     <label htmlFor="crop-select">Crop Type:</label>
//                     <select id="crop-select" disabled>
//                         <option value="Tomato">Tomato</option>
//                     </select>
//                 </div>

//                 <div className="form-group">
//                     <label htmlFor="land-select">Land Type:</label>
//                     <select
//                         id="land-select"
//                         value={selectedLandType}
//                         onChange={(e) => setSelectedLandType(e.target.value)}
//                     >
//                         <option value="">Select Land Type</option>
//                         {landTypes.map((land, index) => (
//                             <option key={index} value={land}>{land}</option>
//                         ))}
//                     </select>
//                 </div>

//                 <div className="form-group">
//                     <label htmlFor="days-select">Total Days to Plan:</label>
//                     <div className="range-container">
//                         <input
//                             type="range"
//                             id="days-select"
//                             min="1"
//                             max="120"
//                             value={totalDays}
//                             onChange={(e) => setTotalDays(parseInt(e.target.value))}
//                         />
//                         <span className="range-value">{totalDays} days</span>
//                     </div>
//                 </div>

//                 {showRecommendations && (
//                     <div className="form-group">
//                         <label htmlFor="current-day">Current Day:</label>
//                         <div className="range-container">
//                             <input
//                                 type="range"
//                                 id="current-day"
//                                 min="1"
//                                 max={totalDays}
//                                 value={currentDay}
//                                 onChange={(e) => setCurrentDay(parseInt(e.target.value))}
//                             />
//                             <span className="range-value">Day {currentDay}</span>
//                         </div>
//                     </div>
//                 )}

//                 <button
//                     className="action-btn generate-btn"
//                     onClick={generatePlan}
//                     disabled={!selectedLandType}
//                 >
//                     Generate Growth Plan
//                 </button>

//                 {showRecommendations && (
//                     <button
//                         className="action-btn view-plan-btn"
//                         onClick={viewFullPlan}
//                     >
//                         View Full Plan
//                     </button>
//                 )}
//             </div>

//             {showRecommendations && (
//                 <div className="quick-tips">
//                     <h3>Quick Growing Tips</h3>
//                     <ul>
//                         <li>
//                             <span className="tip-icon">💧</span>
//                             <span className="tip-text">Water deeply but infrequently to encourage deep root growth</span>
//                         </li>
//                         <li>
//                             <span className="tip-icon">☀️</span>
//                             <span className="tip-text">Ensure 6-8 hours of sunlight daily for optimal growth</span>
//                         </li>
//                         <li>
//                             <span className="tip-icon">🌱</span>
//                             <span className="tip-text">Prune suckers to direct energy to fruit production</span>
//                         </li>
//                         <li>
//                             <span className="tip-icon">🌡️</span>
//                             <span className="tip-text">Maintain soil temperature between 18-26°C for best results</span>
//                         </li>
//                     </ul>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default Dashboard;





// Updated Dashboard.js to support multiple crops
import React from 'react';
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
        <div className="sidebar">
            <div className="selection-panel">
                <h2>Select Crop Parameters</h2>

                <div className="form-group">
                    <label htmlFor="crop-select">Crop Type:</label>
                    <select
                        id="crop-select"
                        value={selectedCrop}
                        onChange={(e) => setSelectedCrop(e.target.value)}
                    >
                        {availableCrops.map((crop, index) => (
                            <option key={index} value={crop}>{crop}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="land-select">Land Type:</label>
                    <select
                        id="land-select"
                        value={selectedLandType}
                        onChange={(e) => setSelectedLandType(e.target.value)}
                    >
                        <option value="">Select Land Type</option>
                        {landTypes.map((land, index) => (
                            <option key={index} value={land}>{land}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="days-select">Total Days to Plan:</label>
                    <div className="range-container">
                        <input
                            type="range"
                            id="days-select"
                            min="1"
                            max="120"
                            value={totalDays}
                            onChange={(e) => setTotalDays(parseInt(e.target.value))}
                        />
                        <span className="range-value">{totalDays} days</span>
                    </div>
                </div>

                {showRecommendations && (
                    <div className="form-group">
                        <label htmlFor="current-day">Current Day:</label>
                        <div className="range-container">
                            <input
                                type="range"
                                id="current-day"
                                min="1"
                                max={totalDays}
                                value={currentDay}
                                onChange={(e) => setCurrentDay(parseInt(e.target.value))}
                            />
                            <span className="range-value">Day {currentDay}</span>
                        </div>
                    </div>
                )}

                <button
                    className="action-btn generate-btn"
                    onClick={generatePlan}
                    disabled={!selectedLandType}
                >
                    Generate Growth Plan
                </button>

                {showRecommendations && (
                    <button
                        className="action-btn view-plan-btn"
                        onClick={viewFullPlan}
                    >
                        View Full Plan
                    </button>
                )}
            </div>

            {showRecommendations && (
                <div className="quick-tips">
                    <h3>Quick Growing Tips</h3>
                    <ul>
                        <li>
                            <span className="tip-icon">💧</span>
                            <span className="tip-text">Water deeply but infrequently to encourage deep root growth</span>
                        </li>
                        <li>
                            <span className="tip-icon">☀️</span>
                            <span className="tip-text">Ensure 6-8 hours of sunlight daily for optimal growth</span>
                        </li>
                        <li>
                            <span className="tip-icon">🌱</span>
                            <span className="tip-text">
                                {selectedCrop === "Tomato" && "Prune suckers to direct energy to fruit production"}
                                {selectedCrop === "Brinjal" && "Stake plants to support heavy fruits and improve air circulation"}
                                {selectedCrop === "Capsicum" && "Maintain proper spacing between plants for better yields"}
                                {selectedCrop === "Potato" && "Hill soil around stems as plants grow to protect tubers"}
                            </span>
                        </li>
                        <li>
                            <span className="tip-icon">🌡️</span>
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