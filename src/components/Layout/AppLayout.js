// import React, { useState } from 'react';
// import './AppLayout.css';
// import { 
//   MdChevronRight, 
//   MdChevronLeft, 
//   MdDashboard, 
//   MdGrass, 
//   MdSensors, 
//   MdPsychology, 
//   MdLogout,
//   MdShowChart
// } from 'react-icons/md';

// // SphereNex Logo Component
// const SphereNexLogo = ({ collapsed }) => {
//   const logoStyle = {
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: collapsed ? 'center' : 'flex-start',
//     fontWeight: 'bold',
//     fontSize: collapsed ? '0.8rem' : '1.2rem',
//     whiteSpace: 'nowrap'
//   };

//   const sphereStyle = {
//     color: '#0077FF', // Blue color
//   };

//   const nexStyle = {
//     color: '#FF6600', // Orange color
//   };

//   // If collapsed, just show an "S" or small logo version
//   if (collapsed) {
//     return <span style={logoStyle}><span style={sphereStyle}>S</span><span style={nexStyle}>X</span></span>;
//   }

//   return (
//     <div style={logoStyle}>
//       <span style={sphereStyle}>SPHERE</span>
//       <span style={nexStyle}>NEX</span>
//     </div>
//   );
// };

// const AppLayout = ({ children, onLogout, onNavigate, activeSection, currentUser }) => {
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

//   const toggleSidebar = () => {
//     setSidebarCollapsed(!sidebarCollapsed);
//   };

//   // Array of sidebar menu items - added the new Visualizations item
//   const menuItems = [
//     { id: 'dashboard', icon: <MdDashboard />, text: 'Dashboard' },
//     { id: 'crops', icon: <MdGrass />, text: 'Crop Management' },
//     { id: 'sensor', icon: <MdSensors />, text: 'Sensor Data' },
//     { id: 'ml', icon: <MdPsychology />, text: 'ML System' },
//     { id: 'graphs', icon: <MdShowChart />, text: 'Visualizations' }
//   ];

//   return (
//     <div className="app-container">
//       {/* Sidebar */}
//       <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
//         <div className="sidebar-header">
//           <div className="app-logo">
//             {/* Replace MdEco and NPK text with the SphereNex logo */}
//             <SphereNexLogo collapsed={sidebarCollapsed} />
//           </div>
//           <button className="collapse-button" onClick={toggleSidebar} aria-label="Toggle sidebar">
//             {sidebarCollapsed ? <MdChevronRight /> : <MdChevronLeft />}
//           </button>
//         </div>
        
//         <nav className="nav-menu">
//           {menuItems.map(item => (
//             <button 
//               key={item.id}
//               className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
//               onClick={() => onNavigate(item.id)}
//             >
//               <span className="nav-icon">{item.icon}</span>
//               {!sidebarCollapsed && <span className="nav-text">{item.text}</span>}
//             </button>
//           ))}
//         </nav>
        
//         <div className="sidebar-footer">
//           <button className="nav-item logout-button" onClick={onLogout}>
//             <span className="nav-icon"><MdLogout /></span>
//             {!sidebarCollapsed && <span className="nav-text">Logout</span>}
//           </button>
//         </div>
//       </aside>
      
//       {/* Main Content Area */}
//       <div className="main-content-wrapper">
//         {/* Header */}
//         <header className="header">
//           <h1 className="page-title">Crop Yield Prediction & Management</h1>
          
//           <div className="user-section">
//             <div className="user-profile">
//               <div className="avatar">{currentUser?.displayName?.[0] || 'A'}</div>
//               <span className="username">{currentUser?.displayName || 'Admin'}</span>
//             </div>
//           </div>
//         </header>
        
//         {/* Page Content */}
//         <main className="content-area">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default AppLayout;



import React, { useState } from 'react';
import './AppLayout.css';
import { 
  MdChevronRight, 
  MdChevronLeft, 
  MdDashboard, 
  MdGrass, 
  MdSensors, 
  MdPsychology, 
  MdLogout,
  MdShowChart,
  MdChat  // Added icon for chatbot
} from 'react-icons/md';

// SphereNex Logo Component
const SphereNexLogo = ({ collapsed }) => {
  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: collapsed ? 'center' : 'flex-start',
    fontWeight: 'bold',
    fontSize: collapsed ? '0.8rem' : '1.2rem',
    whiteSpace: 'nowrap'
  };

  const sphereStyle = {
    color: '#0077FF', // Blue color
  };

  const nexStyle = {
    color: '#FF6600', // Orange color
  };

  // If collapsed, just show an "S" or small logo version
  if (collapsed) {
    return <span style={logoStyle}><span style={sphereStyle}>S</span><span style={nexStyle}>X</span></span>;
  }

  return (
    <div style={logoStyle}>
      <span style={sphereStyle}>SPHERE</span>
      <span style={nexStyle}>NEX</span>
    </div>
  );
};

const AppLayout = ({ children, onLogout, onNavigate, activeSection, currentUser }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Array of sidebar menu items - added the new AI Chatbot item
  const menuItems = [
    { id: 'dashboard', icon: <MdDashboard />, text: 'Dashboard' },
    { id: 'crops', icon: <MdGrass />, text: 'Crop Management' },
    { id: 'sensor', icon: <MdSensors />, text: 'Sensor Data' },
    { id: 'ml', icon: <MdPsychology />, text: 'ML System' },
    { id: 'graphs', icon: <MdShowChart />, text: 'Visualizations' },
    // { id: 'chatbot', icon: <MdChat />, text: 'Agriculture AI Chatbot' } // New menu item
  ];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="app-logo">
            {/* Replace MdEco and NPK text with the SphereNex logo */}
            <SphereNexLogo collapsed={sidebarCollapsed} />
          </div>
          <button className="collapse-button" onClick={toggleSidebar} aria-label="Toggle sidebar">
            {sidebarCollapsed ? <MdChevronRight /> : <MdChevronLeft />}
          </button>
        </div>
        
        <nav className="nav-menu">
          {menuItems.map(item => (
            <button 
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {!sidebarCollapsed && <span className="nav-text">{item.text}</span>}
            </button>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <button className="nav-item logout-button" onClick={onLogout}>
            <span className="nav-icon"><MdLogout /></span>
            {!sidebarCollapsed && <span className="nav-text">Logout</span>}
          </button>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <div className="main-content-wrapper">
        {/* Header */}
        <header className="header">
          <h1 className="page-title">Crop Yield Prediction & Management</h1>
          
          <div className="user-section">
            <div className="user-profile">
              <div className="avatar">{currentUser?.displayName?.[0] || 'A'}</div>
              <span className="username">{currentUser?.displayName || 'Admin'}</span>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;