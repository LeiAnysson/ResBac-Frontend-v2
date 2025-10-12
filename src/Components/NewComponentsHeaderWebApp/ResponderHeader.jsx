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