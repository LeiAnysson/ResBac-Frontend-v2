import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResidentReport.css';
import BottomNav from '../Components/ComponentsBottomNavWebApp/BottomNav.jsx';
import '../Components/Shared/SharedComponents.css';
import { MdOutlineArrowCircleLeft } from 'react-icons/md';
import Header from '../Components/ComponentsHeaderWebApp/header.jsx'
import { apiFetch } from '../utils/apiFetch';
import * as FaIcons from "react-icons/fa";

const ResidentReport = () => {
  const navigate = useNavigate();
  const [reporterType, setReporterType] = useState('Victim');
  const [incidentTypes, setIncidentTypes] = useState([]);

  useEffect(() => {
    const fetchAllIncidentTypes = async () => {
      try {
        let page = 1;
        let allTypes = [];
        let totalPages = 1;

        do {
          const res = await apiFetch(`${process.env.REACT_APP_URL}/api/incident-types?page=${page}`);
          allTypes = [...allTypes, ...res.data]; 
          totalPages = res.last_page; 
          page++;
        } while (page <= totalPages);

        const styledTypes = allTypes.map((type) => {
          let color = '#c94c4c';
          let fontColor = '#222';
          if (type.priority) {
            switch (type.priority.priority_level) {
              case 4:
                color = '#ac3737ff'; fontColor = '#fff';
                break;
              case 3:
                color = '#c94c4c'; fontColor = '#fff';
                break;
              case 2:
                color = '#dc6b6bff'; fontColor = '#fff';
                break;
              case 1:
                color = '#e59595'; fontColor = '#000'; 
                break;
            }
          }
          return { ...type, color, fontColor };
        });

        setIncidentTypes(styledTypes);
      } catch (err) {
        console.error("Failed to fetch incident types:", err);
      }
    };

    fetchAllIncidentTypes();
  }, []);


  const mapIncidentLabelToId = (label) => {
    const found = incidentTypes.find((type) => type.name === label);
    return found ? found.id : null;
  };

  const handleIncidentClick = async (incidentType) => {
    if (reporterType === "Witness") {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const latitude = pos.coords.latitude;
          const longitude = pos.coords.longitude;

          navigate("/resident/witness-report", {
            state: {
              incidentType: incidentType.name,
              incidentTypeId: mapIncidentLabelToId(incidentType.name),
              latitude,
              longitude
            }
          });
        },
        (err) => {
          console.error("Geolocation error:", err);
          alert("Failed to detect your location. The map will default to Bocaue.");
          navigate("/resident/witness-report", {
            state: {
              incidentType: incidentType.name,
              incidentTypeId: mapIncidentLabelToId(incidentType.name)
            }
          });
        },
        { enableHighAccuracy: true }
      );

      return;
    }
    try {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;

        const payload = {
          incident_type_id: mapIncidentLabelToId(incidentType.name),
          reporter_type: reporterType.toLowerCase(),
          latitude,
          longitude,
          description: null,
        };

        const data = await apiFetch(`${process.env.REACT_APP_URL}/api/incidents/from-resident`, {
          method: "POST",
          body: JSON.stringify(payload),
        }).catch(err => console.error('POST error:', err));

        console.log("Incident created:", data);

        if (data.duplicate_of) {
          alert(
            "Your report has been acknowledged! " +
            "It seems this incident was already reported, so we've added you as a duplicate reporter. " +
            "Thank you for helping keep the community safe."
          );

          navigate("/resident", {
            state: { 
              duplicateOf: data.duplicate_of,
              duplicates: data.duplicates
            }
          });
          return;
        }
        if (reporterType === "Victim") {
          navigate("/resident/call", { 
            state: { 
              incidentType: incidentType.name, 
              incident: data.incident 
            } 
          });
        }

      },
      (err) => {
        console.error("Geolocation error:", err);
        alert("Failed to detect your location. Please enable GPS.");
      });
    } catch (error) {
      console.error("Error creating incident:", error);
      alert("Failed to report incident. Please try again.");
    }
  };

  return (
    <div className="report-container">
      <Header />
      <div className='title-container'>
          <MdOutlineArrowCircleLeft className="back-button" onClick={() => navigate(-1)}/>
          <h1>Report</h1>
      </div>

      <div className="toggle-row">
              <span className="toggle-label">Reporter Type:</span>
          <button
            className={`toggle-button ${reporterType === 'Victim' ? 'toggle-button-active-victim' : ''}`}
            onClick={() => setReporterType('Victim')}
          >
            <span className={`toggle-button-text ${reporterType === 'Victim' ? 'toggle-button-text-active-victim' : ''}`}>
              Victim
            </span>
          </button>
          <button
            className={`toggle-button ${reporterType === 'Witness' ? 'toggle-button-active-witness' : ''}`}
            onClick={() => setReporterType('Witness')}
          >
            <span className={`toggle-button-text ${reporterType === 'Witness' ? 'toggle-button-text-active-witness' : ''}`}>
              Witness
            </span>
          </button>
      </div>

      <div className="incident-container">
        <h2 className="incident-label">Incident Type:</h2>
        <div className="incident-grid">
          {incidentTypes.map((item) => (
            <button
              key={item.id}
              className="incident-button"
              style={{ backgroundColor: item.color }}
              onClick={() => handleIncidentClick(item)}
            >
              <div className="incident-button-content">
                {item.icon && FaIcons[item.icon] ? (
                  React.createElement(FaIcons[item.icon], { className: "incident-icon" })
                ) : (
                  <FaIcons.FaExclamationTriangle className="incident-icon" />
                )}
                <span className="incident-button-text" style={{ color: item.fontColor }}>
                  {item.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ResidentReport;
