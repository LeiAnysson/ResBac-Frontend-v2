import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ResidentIncidentDetails.css';
import Header from '../Components/ComponentsHeaderWebApp/header.jsx';
import BottomNav from '../Components/ComponentsBottomNavWebApp/BottomNav.jsx';
import { apiFetch } from "../utils/apiFetch";

const ResidentIncidentDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const incidentId = location.state?.incidentId;
  const incidentType = location.state?.incidentType || "";

  const [landmark, setLandmark] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!landmark || !description) {
      alert("Please fill in both fields.");
      return;
    }

    setLoading(true);
    try {
      await apiFetch(`${process.env.REACT_APP_URL}/api/resident/reports/${incidentId}/add-details`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          landmark,
          description
        }),
      });

      alert("Details submitted. Our team will respond shortly. Thank you for your patience.");
      navigate("/resident/waiting", {
        state: { incidentId, fromFallbackForm: true }
      });
    } catch (err) {
      console.error(err);
      alert("Failed to send details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="incident-details-container">
      <Header title="Provide Incident Details" />

      <div className="details-form-container">
        <div className="form-header">
          <h2>Additional Details Needed</h2>
          <p>Your report is <strong>Unanswered</strong>. Please provide details to continue.</p>
        </div>

        <div className="form-group">
          <label className="incident-details-label">Incident Type: </label>
          <span style={{ fontWeight: "500", marginLeft: "6px" }}>
            {incidentType}
          </span>
        </div>

        <div className="form-group">
          <label className="incident-details-label">Nearest Landmark</label>
          <input 
            className="input-field" 
            placeholder="e.g., Near Barangay Hall"
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="incident-details-label">Describe the Emergency</label>
          <textarea
            className="textarea-field"
            placeholder="Tell us what is happening"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        <div className="button-section">
          <button className="secondary-btn" onClick={() => navigate("/resident")}>Cancel</button>
          <button className="primary-btn" onClick={handleSubmit}>Submit Details</button>
        </div>

      </div>

      <BottomNav />
    </div>
  );
};

export default ResidentIncidentDetails;
