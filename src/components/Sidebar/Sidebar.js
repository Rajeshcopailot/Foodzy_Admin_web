import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faClipboardList, faUser, faSignOutAlt, faUtensils } from '@fortawesome/free-solid-svg-icons';
import './Sidebar.css';

const Sidebar = ({ isOpen, onLogout }) => {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <FontAwesomeIcon icon={faHome} />
          Dashboard
        </NavLink>
        <NavLink to="/dashboard/menu" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <FontAwesomeIcon icon={faUtensils} />
          Menu
        </NavLink>
        <NavLink to="/dashboard/orders" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <FontAwesomeIcon icon={faClipboardList} />
          Orders
        </NavLink>
        <NavLink to="/dashboard/profile" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <FontAwesomeIcon icon={faUser} />
          Profile
        </NavLink>
        <button onClick={onLogout} className="nav-link logout-button">
          <FontAwesomeIcon icon={faSignOutAlt} />
          Logout
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
