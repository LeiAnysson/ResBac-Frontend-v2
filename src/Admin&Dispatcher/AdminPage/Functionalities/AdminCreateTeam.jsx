import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../../Components/ComponentsNavBar/NavBar";
import TopBar from "../../../Components/ComponentsTopBar/TopBar";
import "./ComponentsTeam&User.css";

const AdminCreateTeam = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [teamData, setTeamData] = useState({
    teamName: "Team Alpha",
    availability: "Available",
    startDate: "2025-08-18",
    members: [
      { id: 1, name: "Responder One", isSelected: false },
      { id: 2, name: "Responder Two", isSelected: false },
      { id: 3, name: "Responder Three", isSelected: false },
      { id: 4, name: "Responder Four", isSelected: false },
      { id: 5, name: "Responder Five", isSelected: false }
    ]
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Handle save logic here
    console.log("Team data saved:", teamData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data if needed
    console.log("Edit cancelled");
  };

  const handleMemberToggle = (memberId) => {
    setTeamData(prev => ({
      ...prev,
      members: prev.members.map(member =>
        member.id === memberId
          ? { ...member, isSelected: !member.isSelected }
          : member
      )
    }));
  };

  const handleDeleteMember = (memberId) => {
    setTeamData(prev => ({
      ...prev,
      members: prev.members.filter(member => member.id !== memberId)
    }));
  };

  const handleAddMember = () => {
    const newMember = {
      id: Date.now(),
      name: `Responder ${teamData.members.length + 1}`,
      isSelected: false
    };
    setTeamData(prev => ({
      ...prev,
      members: [...prev.members, newMember]
    }));
  };

  const handleDateChange = (e) => {
    setTeamData(prev => ({
      ...prev,
      startDate: e.target.value
    }));
  };

  const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const handleBackToTeams = () => {
    navigate('/admin/response-team');
  };

  return (
    <div className="admin-dashboard-container">
      <TopBar />
      <div className="dashboard-main-content">
        <NavBar />
        <main className="dashboard-content-area">
          <div className="create-team-wrapper compact">
            {/* Header - Just the team name and icon */}
            <div className="ct-header">
              <div className="cu-header-icon">i</div>
              <h2>{teamData.teamName}</h2>
            </div>

            {/* Edit button separated below header */}
            {!isEditing && (
              <div className="ct-edit-section">
                <button
                  type="button"
                  className="btn btn-primary edit-btn-separated"
                  onClick={handleEdit}
                >
                  Edit
                </button>
              </div>
            )}

            {/* Main Content */}
            <div className="ct-content">
              {/* Left Column - Team Information */}
              <div className="ct-info-section">
                <div className="ct-info-item">
                  <label>Availability:</label>
                  <span className="ct-status available">{teamData.availability}</span>
                </div>
                
                <div className="ct-info-item">
                  <label>Members:</label>
                  <div className="ct-members-list">
                    {teamData.members.map(member => (
                      <div key={member.id} className="ct-member-item">
                        {isEditing && (
                          <input
                            type="checkbox"
                            checked={member.isSelected}
                            onChange={() => handleMemberToggle(member.id)}
                            className="ct-checkbox"
                          />
                        )}
                        <span className="ct-member-name">{member.name}</span>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => handleDeleteMember(member.id)}
                            className="ct-delete-btn"
                            title="Delete member"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    ))}
                    {isEditing && (
                      <button
                        type="button"
                        onClick={handleAddMember}
                        className="ct-add-member-btn"
                        title="Add new member"
                      >
                        <span className="ct-plus">+</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Schedule */}
              <div className="ct-schedule-section">
                <div className="ct-info-item">
                  <label>Schedule:</label>
                  <div className="ct-date-input">
                    <label htmlFor="startDate">Start Date:</label>
                    {isEditing ? (
                      <input
                        id="startDate"
                        type="date"
                        value={teamData.startDate}
                        onChange={handleDateChange}
                        className="cu-input"
                      />
                    ) : (
                      <span className="ct-date-display">
                        {formatDateForDisplay(teamData.startDate)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions - Only show Save/Cancel when editing */}
            {isEditing && (
              <div className="ct-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSave}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleCancel}
                >
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