import React from 'react';
import './GrowthStage.css';

const GrowthStage = ({ currentDayPlan, currentDay, totalDays }) => {
    if (!currentDayPlan) return null;
    
    // Define all stages and determine which is active
    const stages = [
        { id: "seedling", name: "Seedling", position: 0 },
        { id: "vegetative", name: "Vegetative", position: 25 },
        { id: "flowering", name: "Flowering", position: 50 },
        { id: "fruiting", name: "Fruiting", position: 75 },
        { id: "ripening", name: "Ripening", position: 100 }
    ];
    
    // Calculate completion percentage
    const completionPercentage = Math.round((currentDay / totalDays) * 100);
    
    // Find current stage index
    const currentStageIndex = stages.findIndex(stage => 
        stage.name === currentDayPlan.growthStage
    );
    
    return (
        <div className="growth-status-panel">
            <div className="status-header">
                <div className="status-title">Growth Progress</div>
                <div className="status-summary">
                    <div className="status-metric">
                        <div className="metric-value">{currentDayPlan.growthStage}</div>
                        <div className="metric-label">Current Stage</div>
                    </div>
                    <div className="status-metric">
                        <div className="metric-value">Day {currentDay}</div>
                        <div className="metric-label">of {totalDays}</div>
                    </div>
                    <div className="status-metric">
                        <div className="metric-value">{completionPercentage}%</div>
                        <div className="metric-label">Completed</div>
                    </div>
                </div>
            </div>
            
            <div className="progress-section">
                <div className="progress-container">
                    <div className="progress-track">
                        <div 
                            className="progress-fill"
                            style={{ width: `${completionPercentage}%` }}
                        ></div>
                    </div>
                    
                    <div className="stage-markers">
                        {stages.map((stage, index) => {
                            // Determine stage status
                            const isCompleted = index < currentStageIndex;
                            const isCurrent = index === currentStageIndex;
                            const isPending = index > currentStageIndex;
                            
                            return (
                                <div 
                                    key={stage.id}
                                    className={`stage-marker ${isCompleted ? 'completed' : ''} 
                                              ${isCurrent ? 'current' : ''} ${isPending ? 'pending' : ''}`}
                                    style={{ left: `${stage.position}%` }}
                                    title={`${stage.name} Stage`}
                                >
                                    <div className="marker-indicator"></div>
                                    <div className="marker-label">{stage.name}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GrowthStage;