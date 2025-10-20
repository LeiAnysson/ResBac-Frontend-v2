import React, {useState} from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { MdHome, MdAssignment, MdNotifications } from 'react-icons/md';
import { PiSirenFill } from "react-icons/pi";
import { FaBullhorn } from "react-icons/fa";

function BottomNav(){
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path;
    };

    return(
        <>
            <div className="bottom-nav">
              <MdAssignment
                className={`nav-icon smaller-icon ${isActive('/resident/history') ? 'active' : ''}`}
                onClick={() => navigate('/resident/history')}
              />
              <FaBullhorn
                className={`nav-icon even-smaller-icon ${isActive('/resident/announcement') ? 'active' : ''}`}
                onClick={() => navigate('/resident/announcement')}
              />
              <MdHome
                className={`nav-icon ${isActive('/resident') ? 'active' : ''}`}
                onClick={() => navigate('/resident')}
              />
              <PiSirenFill
                className={`nav-icon ${isActive('/resident/report') ? 'active' : ''}`}
                onClick={() => navigate('/resident/report')}
              />
              <MdNotifications
                className={`nav-icon ${isActive('/resident/notification') ? 'active' : ''}`}
                onClick={() => navigate('/resident/notification')}
              />
            </div>
        </>
    )
}

export default BottomNav;