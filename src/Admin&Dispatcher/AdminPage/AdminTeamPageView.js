import { useParams } from "react-router-dom";
import NavBar from "../../Components/ComponentsNavBar/NavBar";
import TopBar from "../../Components/ComponentsTopBar/TopBar";
import "./AdminResponseTeam.css"; 
import React, { useState, useEffect } from "react";
import { apiFetch } from '../../utils/apiFetch';

const AdminTeamPageView = () => {
    const { id } = useParams();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
            const data = await apiFetch(`${process.env.REACT_APP_URL}/api/admin/teams/${id}`);
            setTeam(data);
            } catch (err) {
            console.error("Failed to fetch team:", err.message);
            } finally {
            setLoading(false);
            }
        };

        fetchTeam();
    }, [id]);



  if (loading) {
    return (
      <div className="admin-dashboard-container">
        <TopBar />
        <div className="dashboard-main-content">
          <NavBar />
          <main className="dashboard-content-area">
            <h2>Loading team...</h2>
          </main>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="admin-dashboard-container">
        <TopBar />
        <div className="dashboard-main-content">
          <NavBar />
          <main className="dashboard-content-area">
            <h2>Team Not Found</h2>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <TopBar />
      <div className="dashboard-main-content">
        <NavBar />
        <main className="dashboard-content-area">
          <h1 className="team-title">Team Name here</h1>
          <div className="team-wrapper">
            <div className="team-card">
            <div className="team-header">
                <h2>{team.name}</h2>
                <p><b>Status:</b> {team.status ?? "Unknown"}</p>  
            </div>

            <div className="team-members">
                <h4>Members</h4>
                {team.members && team.members.length > 0 ? (
                <ul>
                    {team.members.map((member) => (
                    <li key={member.id}>{member.name}</li>
                    ))}
                </ul>
                ) : (
                <p>No members assigned to this team.</p>
                )}
            </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminTeamPageView;
