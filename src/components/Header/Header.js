import React from "react";
import "./Header.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faUserCircle } from "@fortawesome/free-solid-svg-icons";

const Header = ({ toggleSidebar }) => {
  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-button" onClick={toggleSidebar}>
          <FontAwesomeIcon icon={faBars} size="lg" />
        </button>
        <h1>Foodzy Admin</h1>
      </div>
      <div className="header-right">
        <button className="profile-button" onClick={() => window.location.href = "/dashboard/profile"}>
          <FontAwesomeIcon icon={faUserCircle} size="lg" />
        </button>
      </div>
    </header>
  );
};

export default Header;
