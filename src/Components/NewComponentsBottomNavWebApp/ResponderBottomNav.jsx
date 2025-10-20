import React, {useState} from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { MdHome, MdNotifications } from 'react-icons/md';
import { PiSirenFill } from "react-icons/pi";

function BottomNav(){
    const navigate = useNavigate();
    const location = useLocation();
    
    const isActive = (path) => {
        return location.pathname === path;
    };
    
    return(
        <>
            <div className="bottom-nav">
                    <PiSirenFill className="nav-icon" onClick={() => navigate('/responder/reports')}/>
                    <MdHome className={`nav-icon ${isActive('/responder') ? 'active' : ''}`} onClick={() => navigate('/responder')}/>
                    <MdNotifications className={`nav-icon ${isActive('/responder/notification') ? 'active' : ''}`} onClick={() => navigate('/responder/notification')}/>
            </div>
        </>
    )
}

export default BottomNav;