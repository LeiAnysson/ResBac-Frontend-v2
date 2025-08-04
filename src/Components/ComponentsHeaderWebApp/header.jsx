import React, {useState}  from 'react'
import { useNavigate } from 'react-router-dom';
import shared from '../Shared/SharedComponents.css'

function header(){
    const navigate = useNavigate();

    return(
        <>
        <div className="header">
        <div className="header-left"></div>
        <button className="account-button" onClick={() => navigate('')}>
          <div className="avatar">
            <span>👤</span>
          </div>
        </button>
      </div>
        </>
    )
}

export default header;