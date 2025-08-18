import React, {useState} from "react";
import { useNavigate } from 'react-router-dom';
//import Shared from '../Shared/SharedComponents.css';
import homeIcon from '../../assets/home.png';
import historyIcon from '../../assets/history.png';
import announcementIcon from '../../assets/announcement.png';
import reportIcon from '../../assets/report.png';
import notificationIcon from '../../assets/notification.png';

function BottomNav(){
    const navigate = useNavigate();
    return(
        <>
            <div className="bottom-nav">
                    <button className="nav-icon" onClick={() => navigate('/resident/history')}>
                      <img src={historyIcon} alt="History" className="nav-img" />
                    </button>
                    <button className="nav-icon" onClick={() => navigate('/resident/announcement')}>
                      <img src={announcementIcon} alt="Announcement" className="nav-img" />
                    </button>
                    <button className="nav-icon" onClick={() => navigate('/resident')}>
                      <img src={homeIcon} alt="Home" className="nav-img" />
                    </button>
                    <button className="nav-icon" onClick={() => navigate('/resident/report')}>
                      <img src={reportIcon} alt="Report" className="nav-img" />
                    </button>
                    <button className="nav-icon" onClick={() => navigate('/resident/notification')}>
                      <img src={notificationIcon} alt="Notification" className="nav-img" />
                    </button>
            </div>
        </>
    )
}

export default BottomNav;