//import React, {useState}  from 'react'
import { useNavigate } from 'react-router-dom';
import '../Shared/SharedComponents.css'
import LogoB from '../../assets/LogoB.png';

function Header(){
    const navigate = useNavigate();

    return(
        <>
        <div className="header">
        <div className="header-left">
          <img src={LogoB} alt="ResBac" className="app-logo" />
        </div>
        <button className="account-button" onClick={() => navigate('/resident/profile')}>
          <div className="avatar">
            <img
              src="https://static.vecteezy.com/system/resources/previews/021/548/095/original/default-profile-picture-avatar-user-avatar-icon-person-icon-head-icon-profile-picture-icons-default-anonymous-user-male-and-female-businessman-photo-placeholder-social-network-avatar-portrait-free-vector.jpg"
              alt="Profile"
            />
          </div>
        </button>
      </div>
        </>
    )
}

export default Header;