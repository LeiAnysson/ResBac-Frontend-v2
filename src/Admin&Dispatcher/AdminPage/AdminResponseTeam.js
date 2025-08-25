import NavBar from "../../Components/ComponentsNavBar/NavBar";
import TopBar from "../../Components/ComponentsTopBar/TopBar";
import "./AdminResponseTeam.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const TeamPage = () => {
    const [teams, setTeams] = useState([]);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
    const navigate = useNavigate();

    const fetchTeams = async (page = 1) => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/admin/teams?page=${page}`);
        const data = await response.json();
        setTeams(data.data);
        setPagination({
          current_page: data.current_page,
          last_page: data.last_page,
        });
      } catch (err) {
        console.error("Failed to fetch teams", err);
      }
    };

    useEffect(() => {
      fetchTeams();
    }, []);

    const handlePageChange = (newPage) => {
      if (newPage >= 1 && newPage <= pagination.last_page) {
        fetchTeams(newPage);
      }
    };

    const formatAvailability = (status) => {
      return status.toLowerCase() === "active" ? "Available" : "Unavailable";
    };

    const getAvailabilityClass = (status) => {
      return status.toLowerCase() === "active" ? "availability" : "unavailable";
    };

    const handleCreateTeam = () => {
      navigate('/admin/create-team');
    };

    return (
      <div className="admin-dashboard-container">
        <TopBar />
        <div className="dashboard-main-content">
          <NavBar />
          <main className="dashboard-content-area">
            <h2 className="response-team-title">Response Team</h2>
            <div className="response-team-card">
              <div className="response-team-controls">
                <input className="search-input search-input-filled" placeholder="Search..." />
                <button className="search-btn search-btn-primary search-btn-icon">
                  <span className="search-icon">🔍</span>
                </button>
                <button className="create-team-btn" onClick={handleCreateTeam}>Create Team</button>
              </div>
              <table className="response-team-table">
                <thead>
                  <tr>
                    <th>Team Name</th>
                    <th>Name</th>
                    <th>Availability</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team, idx) => (
                    <tr key={idx}>
                      <td>{team.team_name}</td>
                      <td>
                        {team.members && team.members.length > 0 ? (
                          team.members.map((member, i) => (
                            <div key={i} style={{ marginBottom: "4px" }}>
                              {(member.first_name || member.last_name) ? `${member.first_name} ${member.last_name}` : "Unnamed"}
                            </div>
                          ))) : (
                            <div>No members</div>
                        )}
                      </td>
                      <td>
                        <span className={`availability-badge ${getAvailabilityClass(team.status)}`}>
                          {formatAvailability(team.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="response-team-pagination">
                <button onClick={() => handlePageChange(pagination.current_page - 1)} disabled={pagination.current_page === 1}>
                  &lt; Prev
                </button>
                <span>
                  Page <b>{pagination.current_page}</b> of {pagination.last_page}
                </span>
                <button onClick={() => handlePageChange(pagination.current_page + 1)} disabled={pagination.current_page === pagination.last_page}>
                  Next &gt;
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
};

export default TeamPage;
