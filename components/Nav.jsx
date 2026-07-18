import React, { useState, useEffect } from 'react';
import './Nav.css';
import { useNavigate, useLocation } from "react-router-dom";

const IconMagnify = ({ className }) => (
  <svg className={className} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="11" cy="11" r="4" stroke="currentColor" strokeWidth="1" opacity="0.6" />
    <line x1="16.5" y1="16.5" x2="24" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const IconBook = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="9" height="12" rx="1" stroke="currentColor" strokeWidth="1.2" />
    <rect x="5" y="1" width="9" height="12" rx="1" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
    <line x1="4" y1="6" x2="9" y2="6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    <line x1="4" y1="8.5" x2="8" y2="8.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

const IconBriefcase = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="6" width="12" height="9" rx="1" stroke="currentColor" strokeWidth="1.2" />
    <path d="M5 6V4.5a3 3 0 0 1 6 0V6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    <circle cx="8" cy="10" r="1.2" stroke="currentColor" strokeWidth="1" />
  </svg>
);

const IconChart = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="9" width="3" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.1" />
    <rect x="6.5" y="6" width="3" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.1" />
    <rect x="11" y="3" width="3" height="11" rx="0.5" stroke="currentColor" strokeWidth="1.1" />
  </svg>
);

const IconHome = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.5 7L8 1.5L14.5 7V14.5H10V10H6v4.5H1.5V7Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
  </svg>
);

const IconUser = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="5.5" r="2.8" stroke="currentColor" strokeWidth="1.2" />
    <path d="M2 13.5c0-2.5 2.7-4 6-4s6 1.5 6 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const IconStats = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polyline points="2,12 6,7 9,10 14,4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const IconSettings = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.2" />
    <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6 13 13M3 13l1.4-1.4M11.6 4.4 13 3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
);

const IconLogout = () => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <polyline points="10,5 14,8 10,11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <line x1="14" y1="8" x2="6" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const IconChevron = ({ open }) => (
  <svg
    className={`dropdown-icon${open ? ' open' : ''}`}
    viewBox="0 0 8 8"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <polyline points="1,2 4,6 7,2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const Nav = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Determine active tab based on current path
  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path === '/practice') return 'practice';
    if (path === '/cases') return 'cases';
    if (path === '/playground') return 'playground';
    return '';
  };
  
  const [activeTab, setActiveTab] = useState(getActiveTabFromPath());
  
  // Update active tab when location changes
  useEffect(() => {
    setActiveTab(getActiveTabFromPath());
  }, [location.pathname]);
  
  const tabs = [
    { id: 'practice', label: 'Practice', Icon: IconBook, path: '/practice' },
    { id: 'cases', label: 'Cases', Icon: IconBriefcase, path: '/cases' },
    { id: 'playground', label: 'Playground', Icon: IconChart, path: '/playground' },
  ];
  
  const dropdownItems = [
    { label: 'My Profile', Icon: IconUser, action: () => console.log('Profile') },
    { label: 'Statistics', Icon: IconStats, action: () => console.log('Stats') },
    { label: 'Settings', Icon: IconSettings, action: () => console.log('Settings') },
  ];
  
  const handleTabClick = (path) => {
    navigate(path);
  };
  
  const handleHomeClick = () => {
    navigate('/');
  };
  
  const handleDropdownAction = (action) => {
    action();
    setShowProfileMenu(false);
  };
  
  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/');
    setShowProfileMenu(false);
  };
  
  return (
    <nav className="navbar">
      <div className="nav-brand" onClick={handleHomeClick} style={{ cursor: 'pointer' }}>
        <IconMagnify className="nav-logo-icon" />
        <span className="nav-title">QueryQuest</span>
      </div>
      
      <ul className="nav-links">
        {tabs.map(({ id, label, Icon, path }) => (
          <li key={id}>
            <button
              className={`nav-link ${activeTab === id ? 'active' : ''}`}
              onClick={() => handleTabClick(path)}
            >
              <Icon />
              <span>{label}</span>
            </button>
          </li>
        ))}
      </ul>

      {/* Right Actions */}
      <div className="nav-actions">
        <button className="nav-cta" onClick={handleHomeClick}>
          <IconHome />
          <span>Home</span>
        </button>

        <div className="profile-wrapper">
          <button
            className="profile-trigger"
            onClick={() => setShowProfileMenu(prev => !prev)}
            aria-expanded={showProfileMenu}
            aria-label="Profile menu"
          >
            <div className="profile-avatar">
              <IconUser />
            </div>
            <span className="profile-name">Guest</span>
            <IconChevron open={showProfileMenu} />
          </button>

          {showProfileMenu && (
            <div className="profile-dropdown">
              {dropdownItems.map(({ label, Icon, action }) => (
                <button
                  key={label}
                  className="dropdown-item"
                  onClick={() => handleDropdownAction(action)}
                >
                  <Icon />
                  {label}
                </button>
              ))}
              <div className="dropdown-divider" />
              <button className="dropdown-item danger" onClick={handleLogout}>
                <IconLogout />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Nav;