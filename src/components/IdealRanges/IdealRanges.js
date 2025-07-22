import React from 'react';
import { getIdealRanges } from '../../utils/cropUtils';
import './IdealRanges.css';
import { 
    MdOutlineWaterDrop, 
    MdOutlineWbSunny, 
    MdScience, 
    MdBolt, 
    MdGrass, 
    MdSettings
} from 'react-icons/md';

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

    // Function to get icon for parameter
    const getParameterIcon = (param) => {
        switch (param) {
            case "soilTemp": return <MdOutlineWbSunny className="param-icon" />;
            case "soilMoisture": return <MdOutlineWaterDrop className="param-icon" />;
            case "pH": return <MdScience className="param-icon" />;
            case "ec": return <MdBolt className="param-icon" />;
            case "nitrogen": 
            case "phosphorus": 
            case "potassium": return <MdGrass className="param-icon" />;
            default: return <MdSettings className="param-icon" />;
        }
    };

    return (
        <div className="parameters-panel">
            <div className="panel-header">
                <h3>Ideal Parameter Ranges</h3>
                <div className="panel-subtitle">
                    For {currentDayPlan.growthStage} Stage in {selectedLandType}
                </div>
            </div>
            
            <div className="parameters-grid">
                {Object.entries(idealRanges).map(([param, range]) => (
                    <div className="parameter-card" key={param}>
                        <div className="parameter-header">
                            {getParameterIcon(param)}
                            <span className="parameter-name">{formatParameterName(param)}</span>
                        </div>
                        <div className="parameter-value">{range}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default IdealRanges;