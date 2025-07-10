import React, { useState } from 'react';
import './AppLayout.css';
import { 
  MdEco, 
  MdChevronRight, 
  MdChevronLeft, 
  MdDashboard, 
  MdGrass, 
  MdSensors, 
  MdPsychology, 
  MdCalendarMonth, 
  MdSettings, 
  MdLogout, 
  MdCheckCircle, 
  MdHourglassEmpty, 
  MdWarning 
} from 'react-icons/md';

const AppLayout = ({ children, onLogout, mlModelStatus }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="sidebar-logo-icon"><MdEco /></span>
            {!sidebarCollapsed && <span className="sidebar-logo-text">NPK</span>}
          </div>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarCollapsed ? <MdChevronRight /> : <MdChevronLeft />}
          </button>
        </div>
        
        <div className="sidebar-menu">
          <div 
            className={`sidebar-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveMenu('dashboard')}
          >
            <span className="sidebar-item-icon"><MdDashboard /></span>
            {!sidebarCollapsed && <span className="sidebar-item-text">Dashboard</span>}
          </div>
          
          <div 
            className={`sidebar-item ${activeMenu === 'crops' ? 'active' : ''}`}
            onClick={() => setActiveMenu('crops')}
          >
            <span className="sidebar-item-icon"><MdGrass /></span>
            {!sidebarCollapsed && <span className="sidebar-item-text">Crop Management</span>}
          </div>
          
          <div 
            className={`sidebar-item ${activeMenu === 'sensor' ? 'active' : ''}`}
            onClick={() => setActiveMenu('sensor')}
          >
            <span className="sidebar-item-icon"><MdSensors /></span>
            {!sidebarCollapsed && <span className="sidebar-item-text">Sensor Data</span>}
          </div>
          
          <div 
            className={`sidebar-item ${activeMenu === 'ml' ? 'active' : ''}`}
            onClick={() => setActiveMenu('ml')}
          >
            <span className="sidebar-item-icon"><MdPsychology /></span>
            {!sidebarCollapsed && <span className="sidebar-item-text">ML System</span>}
          </div>
        </div>
        
        <div className="sidebar-footer">
          <div className="sidebar-item" onClick={onLogout}>
            <span className="sidebar-item-icon"><MdLogout /></span>
            {!sidebarCollapsed && <span className="sidebar-item-text">Logout</span>}
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className={`main-area ${sidebarCollapsed ? 'expanded' : ''}`}>
        {/* Header */}
        <div className="main-header">
          <h1>Crop Yield Prediction & Management</h1>
          
          <div className="header-right">
            
            
            <div className="user-profile">
              <div className="user-avatar">A</div>
              <span className="user-name">Admin</span>
            </div>
          </div>
        </div>
        
        {/* Page Content */}
        <div className="main-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AppLayout;

