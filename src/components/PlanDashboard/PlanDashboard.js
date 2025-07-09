import React, { useState, useEffect } from 'react';
import './PlanDashboard.css';

/**
 * Component to display the full growth plan for all days
 */
const PlanDashboard = ({
    fullPlan,
    selectedLandType,
    backToMainDashboard,
    setCurrentDay,
    totalDays
}) => {
    const [filterStage, setFilterStage] = useState('all');
    const [filteredPlan, setFilteredPlan] = useState(fullPlan);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Apply filters when stage filter changes
    useEffect(() => {
        if (filterStage === 'all') {
            setFilteredPlan(fullPlan);
        } else {
            setFilteredPlan(fullPlan.filter(day => day.growthStage === filterStage));
        }
        setCurrentPage(1);
    }, [filterStage, fullPlan]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredPlan.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const visiblePlan = filteredPlan.slice(startIndex, startIndex + itemsPerPage);

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Select a day and go back to main dashboard
    const selectDay = (day) => {
        setCurrentDay(day);
        backToMainDashboard();
    };

    // Function to get color class for parameter values
    const getColorClass = (param, value) => {
        if (!value) return '';

        // Define thresholds for different parameters
        const thresholds = {
            soilTemp: { low: 18, high: 26 },
            soilMoisture: { low: 55, high: 75 },
            pH: { low: 5.8, high: 6.8 },
            ec: { low: 800, high: 1600 },
            nitrogen: { low: 100, high: 180 },
            phosphorus: { low: 30, high: 60 },
            potassium: { low: 150, high: 250 }
        };

        // Select the right threshold based on parameter
        const threshold = thresholds[param] || { low: 0, high: 0 };

        // Return appropriate class
        if (value < threshold.low) return 'param-value-low';
        if (value > threshold.high) return 'param-value-high';
        return 'param-value-good';
    };

    // Function to get stage badge class
    const getStageBadgeClass = (stage) => {
        switch (stage) {
            case 'Seedling': return 'stage-badge-seedling';
            case 'Vegetative': return 'stage-badge-vegetative';
            case 'Flowering': return 'stage-badge-flowering';
            case 'Fruiting': return 'stage-badge-fruiting';
            case 'Ripening': return 'stage-badge-ripening';
            default: return '';
        }
    };

    return (
        <div className="plan-dashboard">
            <div className="plan-header">
                <h2>Complete Growth Plan for {selectedLandType}</h2>
                <p>This plan shows the optimal growing conditions for each day of your {totalDays}-day tomato growing cycle.</p>

                <div className="plan-actions">
                    <div className="filter-container">
                        <label htmlFor="stage-filter">Filter by Growth Stage:</label>
                        <select
                            id="stage-filter"
                            value={filterStage}
                            onChange={(e) => setFilterStage(e.target.value)}
                        >
                            <option value="all">All Stages</option>
                            <option value="Seedling">Seedling</option>
                            <option value="Vegetative">Vegetative</option>
                            <option value="Flowering">Flowering</option>
                            <option value="Fruiting">Fruiting</option>
                            <option value="Ripening">Ripening</option>
                        </select>
                    </div>

                    <button className="back-btn" onClick={backToMainDashboard}>
                        Back to Dashboard
                    </button>
                </div>
            </div>

            <div className="plan-legend">
                <div className="legend-item">
                    <span className="legend-color param-value-low"></span>
                    <span>Below Optimal</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color param-value-good"></span>
                    <span>Optimal Range</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color param-value-high"></span>
                    <span>Above Optimal</span>
                </div>
            </div>

            <div className="plan-table-container">
                <table className="plan-table">
                    <thead>
                        <tr>
                            <th>Day</th>
                            <th>Growth Stage</th>
                            <th>Soil Temp (°C)</th>
                            <th>Soil Moisture (%)</th>
                            <th>pH</th>
                            <th>EC (µS/cm)</th>
                            <th>N (mg/kg)</th>
                            <th>P (mg/kg)</th>
                            <th>K (mg/kg)</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visiblePlan.length > 0 ? (
                            visiblePlan.map((day) => (
                                <tr key={day.day}>
                                    <td className="day-cell">Day {day.day}</td>
                                    <td>
                                        <span className={`stage-badge ${getStageBadgeClass(day.growthStage)}`}>
                                            {day.growthStage}
                                        </span>
                                    </td>
                                    <td className={getColorClass('soilTemp', day.soilTemp)}>
                                        {day.soilTemp.toFixed(1)}
                                    </td>
                                    <td className={getColorClass('soilMoisture', day.soilMoisture)}>
                                        {day.soilMoisture.toFixed(1)}
                                    </td>
                                    <td className={getColorClass('pH', day.pH)}>
                                        {day.pH.toFixed(1)}
                                    </td>
                                    <td className={getColorClass('ec', day.ec)}>
                                        {day.ec.toFixed(0)}
                                    </td>
                                    <td className={getColorClass('nitrogen', day.nitrogen)}>
                                        {day.nitrogen.toFixed(0)}
                                    </td>
                                    <td className={getColorClass('phosphorus', day.phosphorus)}>
                                        {day.phosphorus.toFixed(0)}
                                    </td>
                                    <td className={getColorClass('potassium', day.potassium)}>
                                        {day.potassium.toFixed(0)}
                                    </td>
                                    <td>
                                        <button
                                            className="view-day-btn"
                                            onClick={() => selectDay(day.day)}
                                            title="View this day in detail"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="10" className="no-data">
                                    No data available for the selected filter.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                    >
                        &laquo;
                    </button>
                    <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        &lsaquo;
                    </button>

                    <div className="pagination-info">
                        Page {currentPage} of {totalPages}
                    </div>

                    <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        &rsaquo;
                    </button>
                    <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                    >
                        &raquo;
                    </button>
                </div>
            )}

            <div className="download-section">
                <p>Need offline access to your plan? Download it in your preferred format:</p>
                <div className="download-buttons">
                    <button className="download-btn pdf-btn">
                        Download PDF
                    </button>
                    <button className="download-btn csv-btn">
                        Download CSV
                    </button>
                    <button className="download-btn print-btn">
                        Print Plan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlanDashboard;