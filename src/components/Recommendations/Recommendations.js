// import './Recommendations.css'

// const Recommendations = ({ recommendations }) => {
//     return (
//         <div className="recommendations-panel">
//             <h3>Action Recommendations</h3>
//             {recommendations.length > 0 ? (
//                 <div className="recommendations-list">
//                     {recommendations.map((rec, index) => (
//                         <div className="recommendation-item" key={index}>
//                             <div className="rec-header">
//                                 <span className="rec-parameter">{rec.parameter}</span>
//                                 <div className="rec-values">
//                                     <span className="current-value">Current: {rec.current}</span>
//                                     <span className="target-value">Target: {rec.target}</span>
//                                 </div>
//                             </div>
//                             <div className="rec-action">{rec.action}</div>
//                         </div>
//                     ))}
//                 </div>
//             ) : (
//                 <p className="no-recommendations">All parameters are within optimal ranges. No adjustments needed at this time.</p>
//             )}
//         </div>
//     );
// };

// export default Recommendations;


import React, { useState } from 'react';
import './Recommendations.css';

/**
 * Enhanced Recommendations component to display ML-powered recommendations
 */
const Recommendations = ({ recommendations, mlActive = false }) => {
    const [expandedRec, setExpandedRec] = useState(null);
    
    // Toggle detailed view for a recommendation
    const toggleDetails = (index) => {
        if (expandedRec === index) {
            setExpandedRec(null);
        } else {
            setExpandedRec(index);
        }
    };
    
    return (
        <div className="recommendations-panel">
            <h3>
                <span className="recommendations-icon">💡</span>
                Action Recommendations
                {mlActive && <span className="ml-badge">ML-Powered</span>}
            </h3>
            
            {recommendations.length > 0 ? (
                <div className="recommendations-list">
                    {recommendations.map((rec, index) => (
                        <div 
                            key={index} 
                            className={`recommendation-item ${expandedRec === index ? 'expanded' : ''}`}
                            onClick={() => toggleDetails(index)}
                        >
                            <div className="recommendation-overlay"></div>
                            <div className="rec-header">
                                <span className="rec-parameter">
                                    <div className="rec-param-dot"></div>
                                    {rec.parameter}
                                </span>
                                
                                <div className="rec-values">
                                    <span className="current-value">
                                        <span className="value-icon">📊</span>
                                        Current: {rec.current}
                                    </span>
                                    <span className="target-value">
                                        <span className="value-icon">🎯</span>
                                        Target: {rec.target}
                                    </span>
                                    
                                    {/* Display confidence if available (from ML model) */}
                                    {rec.confidence && mlActive && (
                                        <span className="confidence-value">
                                            <span className="value-icon">🧠</span>
                                            Confidence: {rec.confidence}
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="rec-action">
                                <span className="action-arrow">→</span>
                                {rec.action}
                            </div>
                            
                            {/* Expanded details section */}
                            {expandedRec === index && (
                                <div className="rec-details">
                                    <h4>Why This Matters</h4>
                                    <p>
                                        {rec.parameter === "Soil Temperature" && 
                                            "Soil temperature affects seed germination, root development, nutrient uptake, and microbial activity. Maintaining optimal temperature ensures proper physiological processes."}
                                        {rec.parameter === "Soil Moisture" && 
                                            "Proper soil moisture is critical for nutrient transport, photosynthesis, and overall plant health. Too much water can cause root rot, while too little leads to wilting and stress."}
                                        {rec.parameter === "pH" && 
                                            "pH affects nutrient availability. Many nutrients become less available in extreme pH conditions, leading to deficiencies even when nutrients are present in the soil."}
                                        {rec.parameter === "EC" && 
                                            "Electrical Conductivity (EC) measures salt concentration in soil. High EC can cause osmotic stress and inhibit water uptake, while low EC indicates insufficient nutrients."}
                                        {rec.parameter === "Nitrogen" && 
                                            "Nitrogen is essential for leaf and stem growth, and protein production. Deficiency causes yellowing of leaves, while excess promotes vegetative growth at the expense of fruiting."}
                                        {rec.parameter === "Phosphorus" && 
                                            "Phosphorus is vital for energy transfer, root development, and flowering/fruiting. Deficiency results in stunted growth and poor yield."}
                                        {rec.parameter === "Potassium" && 
                                            "Potassium regulates water movement, activates enzymes, and improves disease resistance and fruit quality. Deficiency leads to weak stems and reduced yields."}
                                    </p>
                                    
                                    {mlActive && (
                                        <div className="ml-insight">
                                            <h4>ML Insight</h4>
                                            <p>
                                                Based on historical data from similar growing conditions, this adjustment 
                                                has a high likelihood of improving your crop performance. The recommendation 
                                                considers the specific growth stage, land type, and current environmental factors.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            <div className="rec-expand-indicator">
                                {expandedRec === index ? '▲' : '▼'}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="no-recommendations">
                    <div className="optimal-icon">✅</div>
                    <p>All parameters are within optimal ranges. No adjustments needed at this time.</p>
                </div>
            )}
        </div>
    );
};

export default Recommendations;