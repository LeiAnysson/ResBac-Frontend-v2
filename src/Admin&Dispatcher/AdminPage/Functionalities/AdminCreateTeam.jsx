import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import NavBar from "../../../Components/ComponentsNavBar/NavBar";
import TopBar from "../../../Components/ComponentsTopBar/TopBar";
import { apiFetch } from "../../../utils/apiFetch";
import Spinner from '../../../utils/Spinner';
import "./ComponentsTeam&User.css";

const getDataArray = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (res.data && Array.isArray(res.data.data)) return res.data.data;
  return [];
};

const makeDisplayName = (u) => {
  if (!u) return "Unknown";
  const first = u.first_name ?? u.firstName ?? "";
  const last = u.last_name ?? u.lastName ?? "";
  const combined = `${first} ${last}`.trim();
  if (combined) return combined;
  return u.name ?? u.full_name ?? "Unknown";
};

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
  const [removedMemberIds, setRemovedMemberIds] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const freeRespondersRes = await apiFetch(
          `${process.env.REACT_APP_URL}/api/admin/users?role=3&no_team=1`
        );
        console.log("Available responders from backend:", freeRespondersRes);
        const freeByIdRes = getDataArray(freeRespondersRes);

        if (isCreating) {
          setAvailableUsers(freeByIdRes);
          setTeamData({ teamName: "", members: [] });
        } else {
          const team = await apiFetch(`${process.env.REACT_APP_URL}/api/admin/teams/${teamId}`);

          const currentMembers = (team.members || []).map((m) => ({
            id: m.user?.id ?? m.user_id ?? null, 
            name: makeDisplayName(m.user ?? m),
            raw: m.user ?? null,
            memberRecordId: m.id ?? null,  
          }));

          const freeUsers = freeByIdRes.filter(u => {
            const uid = u.id ?? u.user_id;
            return !currentMembers.some(cm => Number(cm.id) === Number(uid));
          });

          setAvailableUsers(freeUsers);
          setTeamData({
            id: teamId,
            teamName: team.team_name ?? team.name ?? "",
            members: currentMembers,
          });
        }
      } catch (err) {
        console.error("Failed to fetch users or team:", err);
      }
    };

    fetchData();
  }, [teamId, isCreating]);

  if (!teamData) return <Spinner message="Loading..." />;

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => navigate(-1);

  const handleCreate = async () => {
    if (!teamData.teamName?.trim()) {
      alert("Please enter a team name.");
      return;
    }

    try {
      const payload = new FormData();
      payload.append("team_name", teamData.teamName.trim());
      teamData.members.forEach(m => {
        payload.append("member_ids[]", m.id);
      });

      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_URL}/api/admin/teams/create-team`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        body: payload,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to create team");

      alert("Team created successfully!");
      navigate("/admin/response-team");
    } catch (err) {
      console.error(err);
      alert("Failed to create team");
    }
  };

  const handleDeleteMember = (memberRecordId) => {
    if (!window.confirm("Remove this member?")) return;

    setTeamData(prev => ({
      ...prev,
      members: prev.members.filter(m => m.memberRecordId !== memberRecordId) 
    }));

    if (memberRecordId) {
      setRemovedMemberIds(prev => [...prev, memberRecordId]); 
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");

      const memberIds = teamData.members.map(m => m.id).filter(Boolean); 

      const response = await fetch(`${process.env.REACT_APP_URL}/api/admin/teams/${teamId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          team_name: teamData.teamName,
          member_ids: memberIds,
          removed_member_ids: removedMemberIds
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to update team");

      alert("Team updated successfully!");
      setIsEditing(false);
      setRemovedMemberIds([]);
    } catch (err) {
      console.error("Failed to save team:", err);
      alert("Failed to update team (see console)");
    }
  };

  const handleAddMember = async (userId) => {
    if (!userId) return;

    const selectedUser = availableUsers.find(u => Number(u.id ?? u.user_id) === Number(userId));
    if (!selectedUser) return;

    const newMember = {
      id: Number(userId),        
      name: makeDisplayName(selectedUser),
      raw: selectedUser,
      memberRecordId: null   
    };

    if (!isCreating) {
      try {
        const res = await apiFetch(`${process.env.REACT_APP_URL}/api/admin/teams/${teamId}/add-member`, {
          method: "POST",
          body: JSON.stringify({ user_id: Number(userId) }),
        });
        const memberRow = res.member ?? res;
        newMember.memberRecordId = memberRow.id ?? null; 
      } catch (err) {
        console.error("Failed to add member via API:", err);
        alert("Failed to add member (see console)");
        return;
      }
    }

    setTeamData(prev => ({
      ...prev,
      members: [...prev.members, newMember]
    }));

    setAvailableUsers(prev => prev.filter(u => Number(u.id ?? u.user_id) !== Number(userId)));
    setShowAddDropdown(false);
  };

  return (
    <div className="admin-dashboard-container">
      <TopBar />
      <div className="dashboard-main-content">
        <NavBar />
        <main className="dashboard-content-area">
          <div className="create-team-wrapper compact">
            <div className="ct-header">
              <div className="cu-header-icon">🧑‍🚒</div>
              <h2>{isCreating ? "Create Response Team" : `Team ${teamData.teamName}`}</h2>
            </div>

            {!isCreating && !isEditing && (
              <div className="ct-edit-section">
                <button className="btn btn-primary edit-btn-separated" onClick={handleEdit}>Edit</button>
              </div>
            )}

            <div className="ct-content">
              <div className="ct-info-item">
                <label>Team Name:</label>
                {isEditing ? (
                  <>
                    <input type="text" className="cu-input" value={teamData.teamName} onChange={(e) => setTeamData({ ...teamData, teamName: e.target.value })} placeholder="e.g., Alpha" />
                    <small style={{ color: "#6b7280" }}>Do not include "Team" — it will be added automatically.</small>
                  </>
                ) : (
                  <span>Team {teamData.teamName}</span>
                )}
              </div>

              <div className="ct-info-item">
                <label>Members:</label>
                <div className="ct-members-list">
                  {teamData.members && teamData.members.length > 0 ? (
                    teamData.members.map((member) => (
                      <div key={member.memberRecordId ?? member.id} className="ct-member-item">
                        <span className="ct-member-name">{member.name}</span>
                        {isEditing && !isCreating && (
                          <button onClick={() => handleDeleteMember(member.memberRecordId)} className="ct-delete-btn">🗑️</button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p>{isCreating ? "You can add members after creating the team." : "No members assigned to this team."}</p>
                  )}

                  {isEditing && (
                    <div className="ct-add-member-wrapper">
                      <button onClick={() => setShowAddDropdown(!showAddDropdown)} className="ct-add-member-btn">+</button>
                      {showAddDropdown && (
                        <select onChange={(e) => handleAddMember(e.target.value)} defaultValue="">
                          <option value="">Select responder...</option>
                          {availableUsers.length === 0 && <option disabled>No available responders</option>}
                          {availableUsers.map((u) => {
                            const uid = u.id ?? u.user_id;
                            return <option key={uid} value={uid}>{makeDisplayName(u)}</option>;
                          })}
                        </select>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="ct-actions">
                <button className="btn btn-outline-delete" onClick={handleCancel} style={{ background:'#dc2626', color:'white' }}>Cancel</button>
                <button className="btn btn-primary" onClick={isCreating ? handleCreate : handleSave}>{isCreating ? "Create" : "Save"}</button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminCreateTeam;
