import React, {useState} from "react";
import { useNavigate, useLocation } from 'react-router-dom';
//import Shared from '../Shared/SharedComponents.css';
import homeIcon from '../../assets/home.png';
import reportIcon from '../../assets/report.png';
import notificationIcon from '../../assets/notification.png';

function BottomNav(){
    const navigate = useNavigate();
    const location = useLocation();
    
    const isActive = (path) => {
        return location.pathname === path;
    };
    
    return(
        <>
            <div className="bottom-nav">
                    <button className="nav-icon" onClick={() => navigate('/responder/reports')}>
                      <img src={reportIcon} alt="Report" className="nav-img" />
                    </button>
                    <button className={`nav-icon ${isActive('/responder') ? 'active' : ''}`} onClick={() => navigate('/responder')}>
                      <img src={homeIcon} alt="Home" className="nav-img" />
                    </button>
                    <button className={`nav-icon ${isActive('/responder/notification') ? 'active' : ''}`} onClick={() => navigate('/responder/notification')}>
                      <img src={notificationIcon} alt="Notification" className="nav-img" />
                    </button>
            </div>
        </>
    )
}

export default BottomNav;