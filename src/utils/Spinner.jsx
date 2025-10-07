import React from "react";
import "./Spinner.css";

const Spinner = ({ message = "Loading..." }) => {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <span>{message}</span>
    </div>
  );
};

export default Spinner;
