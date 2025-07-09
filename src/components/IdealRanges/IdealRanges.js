import React from 'react';
import { getIdealRanges } from '../../utils/cropUtils';
import './IdealRanges.css'

/**
 * Component to display ideal parameter ranges for a specific growth stage and land type
 * 
 * @param {Object} currentDayPlan - The plan data for the current day
 * @param {String} selectedLandType - The selected land type (Dry land, Coastal land, or Malnad region)
 * @returns {JSX.Element} - Panel showing ideal ranges for all growth parameters
 */
const IdealRanges = ({ currentDayPlan, selectedLandType }) => {
    // Don't render if no plan is available
    if (!currentDayPlan) return null;

    // Get ideal ranges based on growth stage and land type
    const idealRanges = getIdealRanges(currentDayPlan.growthStage, selectedLandType);

    // Function to format parameter names for display
    const formatParameterName = (param) => {
        switch (param) {
            case "soilTemp": return "Soil Temperature";
            case "soilMoisture": return "Soil Moisture";
            case "ec": return "EC";
            case "nitrogen": return "Nitrogen";
            case "phosphorus": return "Phosphorus";
            case "potassium": return "Potassium";
            default: return param;
        }
    };

    return (
        <div className="ideal-ranges-panel">
            <h3>Ideal Ranges for {currentDayPlan.growthStage} Stage in {selectedLandType}</h3>
            <div className="ideal-ranges-grid">
                {Object.entries(idealRanges).map(([param, range]) => (
                    <div className="ideal-range-item" key={param}>
                        <span className="range-param">{formatParameterName(param)}</span>
                        <span className="range-value">{range}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default IdealRanges;