import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "../../Components/ComponentsNavBar/NavBar";
import TopBar from "../../Components/ComponentsTopBar/TopBar";
import { apiFetch } from "../../utils/apiFetch";
import Spinner from '../../utils/Spinner';
import "./Functionalities/ComponentsTeam&User.css";

const AdminTeamPageView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teamData, setTeamData] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user")); // current logged-in user

  useEffect(() => {
    const fetchData = async () => {
      try {
        const team = await apiFetch(`${process.env.REACT_APP_URL}/api/admin/teams/${id}`);
        setTeamData({
          id: team.id,
          teamName: team.team_name || team.name || "Unnamed Team",
          availability: team.status || "unavailable",
          members:
            team.members?.map((m) => ({
              id: m.user?.id || m.id,
              name: m.user
                ? `${m.user.first_name} ${m.user.last_name}`
                : m.name || "Unknown",
            })) || [],
        });
      } catch (err) {
        console.error("Failed to fetch team data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <Spinner message="Loading team data..." />;
  if (!teamData) return <div>Team not found.</div>;

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => (setIsEditing(false), navigate('/admin/response-team'));

  const handleSave = async () => {
    try {
      await apiFetch(`${process.env.REACT_APP_URL}/api/admin/teams/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: teamData.teamName,
          status: teamData.availability.toLowerCase(),
        }),
      });
      setIsEditing(false);
      alert("Team updated successfully!");
    } catch (err) {
      console.error("Failed to save team:", err);
      alert("Failed to save team. Please try again.");
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!window.confirm("Remove this member?")) return;
    try {
      await apiFetch(`${process.env.REACT_APP_URL}/admin/teams/${id}/remove-member/${memberId}`, {
        method: "DELETE",
      });
      setTeamData(prev => ({
        ...prev,
        members: prev.members.filter(m => m.id !== memberId),
      }));
    } catch (err) {
      console.error("Failed to remove member:", err);
    }
  };

  const handleAddMember = async (userId) => {
    try {
      const response = await apiFetch(
        `${process.env.REACT_APP_URL}/admin/teams/${id}/add-member`,
        {
          method: "POST",
          body: JSON.stringify({ user_id: userId }),
        }
      );
      setTeamData(prev => ({
        ...prev,
        members: [...prev.members, { id: response.member.id, name: response.member.name }],
      }));
      setAvailableUsers(prev => prev.filter(u => u.id !== Number(userId)));
      setShowAddDropdown(false);
    } catch (err) {
      console.error("Failed to add member:", err);
    }
  };

  return (
    <div className="admin-dashboard-container">
      <TopBar />
      <div className="dashboard-main-content">
        <NavBar />
        <main className="dashboard-content-area">
          <div className="create-team-wrapper compact">
            <div className="ct-header">
              <div className="cu-header-icon">i</div>
              <h2>Team {teamData.teamName}</h2>
            </div>

            <div className="ct-content">
              <div className="ct-info-section ct-top-row">
                <div className="ct-info-item ct-status-item">
                  <label>Availability:</label>
                  <span
                    className={`ct-status ${
                      teamData.availability.toLowerCase() === "available"
                        ? "available"
                        : "unavailable"
                    }`}
                  >
                    {teamData.availability.charAt(0).toUpperCase() +
                      teamData.availability.slice(1)}
                  </span>
                </div>

                {/* Edit button only for Admin */}
                {!isEditing && user?.role?.name === 'Admin' && (
                  <button
                    className="btn btn-primary a-edit-btn-inline"
                    onClick={() =>
                      navigate(`/admin/response-teams/${teamData.id}/edit`)
                    }
                  >
                    Edit
                  </button>
                )}
              </div>

              {/* Members section */}
              <div className="ct-info-item">
                <label>Members:</label>
                <div className="ct-members-list">
                  {teamData.members.map((member) => (
                    <div key={member.id} className="ct-member-item">
                      <span className="ct-member-name">{member.name}</span>
                      {isEditing && (
                        <button
                          onClick={() => handleDeleteMember(member.id)}
                          className="ct-delete-btn"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  ))}

                  {isEditing && (
                    <div className="ct-add-member-wrapper">
                      <button
                        onClick={() => setShowAddDropdown(!showAddDropdown)}
                        className="ct-add-member-btn"
                      >
                        +
                      </button>
                      {showAddDropdown && (
                        <select
                          onChange={(e) => handleAddMember(e.target.value)}
                          defaultValue=""
                        >
                          <option value="">Select responder...</option>
                          {availableUsers.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.first_name} {u.last_name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Editing actions */}
            {isEditing && (
              <div className="ct-actions">
                <button className="btn btn-primary" onClick={handleSave}>
                  Save
                </button>
                <button className="btn btn-outline" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminTeamPageView;
