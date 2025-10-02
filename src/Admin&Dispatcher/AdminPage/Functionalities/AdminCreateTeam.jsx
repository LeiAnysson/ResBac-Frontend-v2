import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "../../../Components/ComponentsNavBar/NavBar";
import TopBar from "../../../Components/ComponentsTopBar/TopBar";
import { apiFetch } from "../../../utils/apiFetch";
import "./ComponentsTeam&User.css";

const AdminCreateTeam = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [teamData, setTeamData] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [showAddDropdown, setShowAddDropdown] = useState(false);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const data = await apiFetch(`${process.env.REACT_APP_URL}/api/admin/teams/${teamId}`);
        setTeamData({
          id: teamId,
          teamName: data.name,
          availability: data.status === "active" ? "Available" : "Unavailable",
          startDate: data.start_date || new Date().toISOString().split("T")[0],
          members: data.members.map(m => ({
            id: m.user.id,
            name: `${m.user.first_name} ${m.user.last_name}`,
          })),
        });
      } catch (err) {
        console.error("Failed to fetch team:", err);
      }
    };

    const fetchAvailableUsers = async () => {
      try {
        const users = await apiFetch(`${process.env.REACT_APP_URL}/api/admin/users?role=Responder&no_team=1`);
        setAvailableUsers(users.data);
      } catch (err) {
        console.error("Failed to fetch available responders:", err);
      }
    };

    fetchTeam();
    fetchAvailableUsers();
  }, [teamId]);

  if (!teamData) return <div>Loading...</div>;

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => setIsEditing(false);
  const handleSave = async () => {
    try {
      await apiFetch(`${process.env.REACT_APP_URL}/api/admin/teams/${teamId}`, {
        method: "PUT",
        body: JSON.stringify(teamData),
      });
      setIsEditing(false);
      console.log("Team saved:", teamData);
    } catch (err) {
      console.error("Failed to save team:", err);
    }
  };

  const handleDateChange = async (e) => {
    const newDate = e.target.value;
    setTeamData(prev => ({ ...prev, startDate: newDate }));

    try {
      await apiFetch(`${process.env.REACT_APP_URL}/admin/teams/rotation/start-date`, {
        method: "PUT",
        body: JSON.stringify({ rotation_start_date: newDate }),
      });
    } catch (err) {
      console.error("Failed to update rotation date:", err);
    }
  };

  const formatDateForDisplay = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

  const handleDeleteMember = async (memberId) => {
    if (!window.confirm("Remove this member?")) return;

    await apiFetch(`${process.env.REACT_APP_URL}/admin/teams/${teamId}/remove-member/${memberId}`, { method: "DELETE" });

    setTeamData(prev => ({
      ...prev,
      members: prev.members.filter(m => m.id !== memberId)
    }));

    const removedUser = availableUsers.find(u => u.id === memberId);
    if (!removedUser) setAvailableUsers(prev => [...prev, { id: memberId, name: "Unknown" }]);
  };

  const handleAddMember = async (userId) => {
    try {
      const response = await apiFetch(
        `${process.env.REACT_APP_URL}/admin/teams/${teamId}/add-member`,
        {
          method: "POST",
          body: JSON.stringify({ user_id: userId }),
        }
      );

      setTeamData(prev => ({
        ...prev,
        members: [...prev.members, { id: response.member.id, name: response.member.name }]
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
              <h2>{teamData.teamName}</h2>
            </div>

            {!isEditing && (
              <div className="ct-edit-section">
                <button className="btn btn-primary edit-btn-separated" onClick={handleEdit}>
                  Edit
                </button>
              </div>
            )}

            <div className="ct-content">
              <div className="ct-info-section">
                <div className="ct-info-item">
                  <label>Availability:</label>
                  <span className={`ct-status ${teamData.availability === "Available" ? "available" : "unavailable"}`}>
                    {teamData.availability}
                  </span>
                </div>

                <div className="ct-info-item">
                  <label>Members:</label>
                  <div className="ct-members-list">
                    {teamData.members.map(member => (
                      <div key={member.id} className="ct-member-item">
                        <span className="ct-member-name">{member.name}</span>
                        {isEditing && (
                          <button onClick={() => handleDeleteMember(member.id)} className="ct-delete-btn">🗑️</button>
                        )}
                      </div>
                    ))}

                    {isEditing && (
                      <div className="ct-add-member-wrapper">
                        <button onClick={() => setShowAddDropdown(!showAddDropdown)} className="ct-add-member-btn">+</button>
                        {showAddDropdown && (
                          <select
                            onChange={(e) => handleAddMember(e.target.value)}
                            defaultValue=""
                          >
                            <option value="">Select responder...</option>
                            {availableUsers.map(u => (
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

              <div className="ct-schedule-section">
                <div className="ct-info-item">
                  <label>Start Date:</label>
                  {isEditing ? (
                    <input type="date" value={teamData.startDate} onChange={handleDateChange} className="cu-input" />
                  ) : (
                    <span>{formatDateForDisplay(teamData.startDate)}</span>
                  )}
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="ct-actions">
                <button className="btn btn-primary" onClick={handleSave}>Save</button>
                <button className="btn btn-outline" onClick={handleCancel}>Cancel</button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminCreateTeam;
