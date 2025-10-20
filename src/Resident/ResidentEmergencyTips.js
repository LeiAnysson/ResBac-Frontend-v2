import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ResidentDashboard.css';
import Header from '../Components/ComponentsHeaderWebApp/header.jsx';
import  BottomNav from '../Components/ComponentsBottomNavWebApp/BottomNav.jsx';
import { MdOutlineArrowCircleLeft } from 'react-icons/md';

function importAll(r) {
  return r.keys().map(r);
}

const tips = importAll(require.context('../assets/emergency-tips', false, /\.(png|jpe?g|svg)$/));

function ResidentEmergencyTips() {
    const navigate = useNavigate();

    return (
        <div className="dashboard-container">
            <Header />
            <div className="scroll-view">
                <div className="user-info-section">
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <MdOutlineArrowCircleLeft className="back-button" onClick={() => navigate(-1)}/>
                        <h1 style={{ fontSize: '22px' }}> Emergency Tips</h1>
                    </div>
                </div>

                <div className="tips-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                }}>
                    {tips.map((tip, index) => (
                        <div key={index} className="tip-card" style={{
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                            <img src={tip} alt={`Emergency Tip ${index + 1}`} style={{
                                width: '100%',
                                height: 'auto',
                                display: 'block'
                            }} />
                        </div>
                    ))}
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
export default ResidentEmergencyTips;
