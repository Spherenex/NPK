import React from 'react';
import './GrowthStage.css';

const GrowthStage = ({ currentDayPlan, currentDay, totalDays }) => {
    if (!currentDayPlan) return null;

    // Calculate proper percentages for 120-day plan
    const getGrowthStagePosition = (stage) => {
        switch(stage) {
            case "Seedling": return '0%';
            case "Vegetative": return '20%';
            case "Flowering": return '45%';
            case "Fruiting": return '75%'; 
            case "Ripening": return '100%';
            default: return '0%';
        }
    };

    return (
        <div className="growth-stage-info">
            <h3>Current Growth Stage: {currentDayPlan.growthStage}</h3>
            <p>Day {currentDay} of {totalDays}</p>
            <div className="growth-timeline">
                <div className="timeline">
                    <div className="milestone" style={{ left: '0%' }}>
                        <div className="dot"></div>
                        <span>Seedling</span>
                    </div>
                    <div className="milestone" style={{ left: '20%' }}>
                        <div className="dot"></div>
                        <span>Vegetative</span>
                    </div>
                    <div className="milestone" style={{ left: '45%' }}>
                        <div className="dot"></div>
                        <span>Flowering</span>
                    </div>
                    <div className="milestone" style={{ left: '75%' }}>
                        <div className="dot"></div>
                        <span>Fruiting</span>
                    </div>
                    <div className="milestone" style={{ left: '100%' }}>
                        <div className="dot"></div>
                        <span>Ripening</span>
                    </div>
                    <div
                        className="current-marker"
                        style={{ left: `${(currentDay / totalDays) * 100}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default GrowthStage;