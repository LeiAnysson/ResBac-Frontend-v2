import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import NavBar from "../../../Components/ComponentsNavBar/NavBar";
import TopBar from "../../../Components/ComponentsTopBar/TopBar";
import { apiFetch } from "../../../utils/apiFetch";
import Spinner from '../../../utils/Spinner';
import "./ComponentsTeam&User.css";

const AdminCreateTeam = ({ mode }) => {
  const { id: teamId } = useParams();
  const navigate = useNavigate();
  const isCreating = mode === "create";
  const location = useLocation();
  const startEditing = location.pathname.includes("/edit");
  const [isEditing, setIsEditing] = useState(isCreating || startEditing);
  const [teamData, setTeamData] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [showAddDropdown, setShowAddDropdown] = useState(false);

  useEffect(() => {
    const fetchAvailableUsers = async () => {
      try {
        if (isCreating) {
          const res = await apiFetch(
            `${process.env.REACT_APP_URL}/api/admin/users?role=Responder&no_team=1`
          );
          setAvailableUsers(res.data || []);
          setTeamData({
            teamName: "",
            availability: "Available",
            startDate: new Date().toISOString().split("T")[0],
            members: [],
          });
        } else {
          const team = await apiFetch(`${process.env.REACT_APP_URL}/api/admin/teams/${teamId}`);
          const freeRespondersRes = await apiFetch(
            `${process.env.REACT_APP_URL}/api/admin/users?role=Responder&no_team=1`
          );

          const currentMembers = team.members.map((m) => ({
            id: m.user?.id || m.id,
            name: m.user
              ? `${m.user.first_name} ${m.user.last_name}`
              : m.name || "Unknown",
          }));

          setAvailableUsers([...currentMembers, ...(freeRespondersRes.data || [])]);

          setTeamData({
            id: teamId,
            teamName: team.team_name || team.name || "Unnamed Team",
            availability:
              team.status
                ? team.status.charAt(0).toUpperCase() + team.status.slice(1)
                : "Unavailable",
            startDate: team.start_date || new Date().toISOString().split("T")[0],
            members: currentMembers,
          });
        }
      } catch (err) {
        console.error("Failed to fetch users or team:", err);
      }
    };

    fetchAvailableUsers();
  }, [teamId, isCreating]);


  if (!teamData) return <Spinner message="Loading..." />;

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setIsEditing(false);
    if (isCreating) navigate("/admin/response-team");
  };

  const handleSave = async () => {
    try {
      await apiFetch(`${process.env.REACT_APP_URL}/api/admin/teams/${teamId}`, {
        method: "PUT",
        body: JSON.stringify({
          name: teamData.teamName,
          status: teamData.availability.toLowerCase(),
          member_ids: teamData.members.map((m) => m.id),
          start_date: teamData.startDate,
        }),
      });
      setIsEditing(false);
      alert("Team updated successfully!");
    } catch (err) {
      console.error("Failed to save team:", err);
      alert("Failed to update team.");
    }
  };

  const handleCreate = async () => {
    try {
      await apiFetch(`${process.env.REACT_APP_URL}/api/admin/teams`, {
        method: "POST",
        body: JSON.stringify({
          name: teamData.teamName,
          status: teamData.availability.toLowerCase(),
          member_ids: teamData.members.map((m) => m.id),
          start_date: teamData.startDate,
        }),
      });
      alert("Team created successfully!");
      navigate("/admin/response-teams");
    } catch (err) {
      console.error("Failed to create team:", err);
      alert("Failed to create team. Please try again.");
    }
  };

  const handleDateChange = (e) => {
    setTeamData((prev) => ({ ...prev, startDate: e.target.value }));
  };

  const handleDeleteMember = async (memberId) => {
    if (!window.confirm("Remove this member?")) return;

    await apiFetch(
      `${process.env.REACT_APP_URL}/api/admin/teams/${teamId}/remove-member/${memberId}`,
      { method: "DELETE" }
    );

    setTeamData((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== memberId),
    }));

    const removedUser = availableUsers.find((u) => u.id === memberId);
    if (!removedUser)
      setAvailableUsers((prev) => [...prev, { id: memberId, name: "Unknown" }]);
  };

  const handleAddMember = async (userId) => {
    if (!userId) return;
    try {
      const response = await apiFetch(
        `${process.env.REACT_APP_URL}/api/admin/teams/${teamId}/add-member`,
        {
          method: "POST",
          body: JSON.stringify({ user_id: userId }),
        }
      );

      setTeamData((prev) => ({
        ...prev,
        members: [
          ...prev.members,
          { id: response.member.id, name: response.member.name },
        ],
      }));

      setAvailableUsers((prev) =>
        prev.filter((u) => u.id !== Number(userId))
      );
      setShowAddDropdown(false);
    } catch (err) {
      console.error("Failed to add member:", err);
    }
  };

  const formatDateForDisplay = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });

  // --- JSX ---
  return (
    <div className="admin-dashboard-container">
      <TopBar />
      <div className="dashboard-main-content">
        <NavBar />
        <main className="dashboard-content-area">
          <div className="create-team-wrapper compact">
            <div className="ct-header">
              <div className="cu-header-icon">🧑‍🚒</div>
              <h2>
                {isCreating ? "Create Response Team" : "Team " + teamData.teamName || ""}
              </h2>
            </div>

            {!isCreating && !isEditing && (
              <div className="ct-edit-section">
                <button
                  className="btn btn-primary edit-btn-separated"
                  onClick={handleEdit}
                >
                  Edit
                </button>
              </div>
            )}

            <div className="ct-content">
              <div className="ct-info-section">
                <div className="ct-info-item">
                  <label>Availability:</label>
                  {isEditing ? (
                    <select
                      value={teamData.availability}
                      onChange={(e) =>
                        setTeamData({
                          ...teamData,
                          availability: e.target.value,
                        })
                      }
                      className="cu-input"
                    >
                      <option value="Available">Available</option>
                      <option value="Unavailable">Unavailable</option>
                    </select>
                  ) : (
                    <span
                      className={`ct-status ${
                        teamData.availability === "Available"
                          ? "available"
                          : "unavailable"
                      }`}
                    >
                      {teamData.availability}
                    </span>
                  )}
                </div>

                <div className="ct-info-item">
                <label>Members:</label>

                <div className="ct-members-list">
                  {teamData.members && teamData.members.length > 0 ? (
                    teamData.members.map((member) => (
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
                    ))
                  ) : (
                    <p>No members assigned to this team.</p>
                  )}

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

              <div className="ct-schedule-section">
                <div className="ct-info-item">
                  <label>Start Date:</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={teamData.startDate}
                      onChange={handleDateChange}
                      className="cu-input"
                    />
                  ) : (
                    <span>{formatDateForDisplay(teamData.startDate)}</span>
                  )}
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="ct-actions">
                <button
                  className="btn btn-primary"
                  onClick={isCreating ? handleCreate : handleSave}
                >
                  {isCreating ? "Create" : "Save"}
                </button>
                <button className="btn btn-outline-delete" onClick={handleCancel} style={{background:'#dc2626', color:'white'}}>
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

export default AdminCreateTeam;
