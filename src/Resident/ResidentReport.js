import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResidentReport.css';
import BottomNav from '../Components/ComponentsBottomNavWebApp/BottomNav.jsx';
import '../Components/Shared/SharedComponents.css';
import BackButton from '../assets/backbutton.png'
import Header from '../Components/ComponentsHeaderWebApp/header.jsx'
import { apiFetch } from '../utils/apiFetch';

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
          const res = await apiFetch(`http://127.0.0.1:8000/api/incident-types?page=${page}`);
          allTypes = [...allTypes, ...res.data]; 
          totalPages = res.last_page; 
          page++;
        } while (page <= totalPages);

        const styledTypes = allTypes.map((type) => {
          let color = '#ff6666'; 
          if (type.priority) {
            switch (type.priority.priority_level) {
              case 4: color = '#ff4d4f'; break; 
              case 3: color = '#ffa940'; break; 
              case 2: color = '#40a9ff'; break; 
              case 1: color = '#73d13d'; break; 
            }
          }
          return { ...type, color };
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

        const data = await apiFetch("http://127.0.0.1:8000/api/incidents/from-resident", {
          method: "POST",
          body: JSON.stringify(payload),
        }).catch(err => console.error('POST error:', err));

        console.log("Incident created:", data);

        if (reporterType === "Witness") {
          navigate("/resident/witness-report", { state: { incidentType: incidentType.name, incident: data.incident } });
        } else if (reporterType === "Victim") {
          navigate("/resident/call", { state: { incidentType: incidentType.name, incident: data.incident } });
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
            <button className="back-button" onClick={() => navigate(-1)}>
            <img className='back-button-icon' src={BackButton}/>
          </button>
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
              <span className="incident-button-text">{item.name}</span>
            </button>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ResidentReport;
