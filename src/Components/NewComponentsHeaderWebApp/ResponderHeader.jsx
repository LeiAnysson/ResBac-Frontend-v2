//import React, {useState}  from 'react'
import { useNavigate } from 'react-router-dom';
//import shared from '../Shared/SharedComponents.css'
import userIcon from '../../assets/user.png';

function Header(){
    const navigate = useNavigate();

    return(
    <>
        <div className="header">
        <div className="header-left"></div>
        <button className="account-button" onClick={() => navigate('/responder/profile')}>
          <div className="avatar">
            <img src={userIcon} alt="User" className="nav-img" />          
            </div>
        </button>
        </div>
    </>
    )
}

export default Header;