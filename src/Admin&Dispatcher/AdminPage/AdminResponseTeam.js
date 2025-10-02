import NavBar from "../../Components/ComponentsNavBar/NavBar";
import TopBar from "../../Components/ComponentsTopBar/TopBar";
import "./AdminResponseTeam.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from '../../utils/apiFetch';
import AdminTeamPageView from "./AdminTeamPageView";

const TeamPage = () => {
    const [teams, setTeams] = useState([]);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
    const navigate = useNavigate();
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [search, setSearch] = useState("");
    const [editForm, setEditForm] = useState({
      team_name: "",
      status: "",
      schedules: [],
    });
    
    const fetchTeams = async (page = 1, filters = {}, searchQuery = "") => {
      const params = new URLSearchParams({
        page,
        ...(searchQuery && { search: searchQuery }),
      });
      try {
        const data = await apiFetch(`${process.env.REACT_APP_URL}/api/admin/teams?${params}`);
        setTeams(data.data);
        setPagination({
          current_page: data.current_page,
          last_page: data.last_page,
        });
      } catch (err) {
        console.error("Failed to fetch teams: ", err);
      }
    };

    useEffect(() => {
      const delayDebounce = setTimeout(() => {
        fetchTeams(1, search);
      }, 300);

      return () => clearTimeout(delayDebounce);
    }, [search]);


    const handlePageChange = (newPage) => {
      if (newPage >= 1 && newPage <= pagination.last_page) {
        fetchTeams(newPage, search);
      }
    };

    const formatAvailability = (status) => {
      return status.toLowerCase() === "active" ? "Available" : "Unavailable";
    };

    const getAvailabilityClass = (status) => {
      return status.toLowerCase() === "active" ? "availability" : "unavailable";
    };

     const handleView = (team) => {
      setSelectedTeam(team);
      setIsViewModalOpen(true);
    };

    const closeViewModal = () => {
      setIsViewModalOpen(false);
      setSelectedTeam(null);
      setIsEditing(false);
    };

    const handleDelete = async (id) => {
      if (!window.confirm("Are you sure you want to delete this team?")) return;

      try {
        await apiFetch(`${process.env.REACT_APP_URL}/api/admin/teams/${id}`, {
          method: "DELETE",
        });

        fetchTeams(pagination.current_page);
      } catch (err) {
        console.error("Failed to delete team:", err);
      }
    };

    const handleSaveEdit = async () => {
      try {
        // PUT request to update team
        await apiFetch(`${process.env.REACT_APP_URL}/api/admin/teams/${selectedTeam.id}`, {
          method: "PUT",
          body: JSON.stringify(editForm),
        });

        // refresh team list after save
        fetchTeams(pagination.current_page);

        // close modal + reset
        setIsEditing(false);
        setIsViewModalOpen(false);
        setSelectedTeam(null);

      } catch (err) {
        console.error("Failed to save edits:", err);
      }
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
                <input
                  className="search-input search-input-filled"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button className="create-team-btn" onClick={handleCreateTeam}>Create Team</button>
              </div>
              <table className="response-team-table">
                <thead>
                  <tr>
                    <th>Team Name</th>
                    <th>Availability</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team) => (
                    <tr key={team.id}>
                      <td>{team.team_name}</td>
                      <td className={getAvailabilityClass(team.status)}>
                        {formatAvailability(team.status)}
                      </td>
                      <td>
                        <button className="view-btn" onClick={() => navigate(`/admin/response-teams/${team.id}`)}>View</button>
                        <button className="delete-btn" onClick={() => handleDelete(team.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {isViewModalOpen && selectedTeam && (
                <AdminTeamPageView
                  team={selectedTeam}
                  onClose={() => setIsViewModalOpen(false)}
                />
              )}

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
