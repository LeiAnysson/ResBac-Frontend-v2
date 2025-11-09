import NavBar from "../../Components/ComponentsNavBar/NavBar";
import TopBar from "../../Components/ComponentsTopBar/TopBar";
import "./AdminResponseTeam.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from '../../utils/apiFetch';
import { MdDelete, MdVisibility } from "react-icons/md";

const TeamPage = () => {
    const [teams, setTeams] = useState([]);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    // const [rotationStartDate, setRotationStartDate] = useState("");    //for rotation date changes
    // const [loadingRotation, setLoadingRotation] = useState(true);
    const user = JSON.parse(localStorage.getItem("user"));
    // const [lastRotationDate, setLastRotationDate] = useState("");
    
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
        fetchTeams(1, {}, search);
      }, 300);

      return () => clearTimeout(delayDebounce);
    }, [search]);

    // FOR TEAM ROTATION
    // useEffect(() => {
    //   const fetchRotationDates = async () => {
    //     try {
    //       const startData = await apiFetch(`${process.env.REACT_APP_URL}/api/admin/teams/rotation/start-date`);
    //       setRotationStartDate(startData?.rotation_start_date || "");

    //       const data = await apiFetch(`${process.env.REACT_APP_URL}/api/admin/teams`);
    //       const availableTeam = data.data.find(team => team.status === 'available');
    //       setLastRotationDate(availableTeam?.updated_at || "No data");
    //     } catch (err) {
    //       console.error("Failed to fetch rotation dates:", err);
    //       setRotationStartDate("");
    //       setLastRotationDate("No data");
    //     } finally {
    //       setLoadingRotation(false);
    //     }
    //   };

    //   fetchRotationDates();
    // }, []);

    // const handleRotationDateChange = async (e) => {
    //   const newDate = e.target.value;
    //   setRotationStartDate(newDate);

    //   try {
    //     await apiFetch(`${process.env.REACT_APP_URL}/api/admin/teams/rotation/start-date`, {
    //       method: "PUT",
    //       body: JSON.stringify({ rotation_start_date: newDate }),
    //     });
    //     alert("Rotation start date updated! The rotation has been reset — Team Alpha is now set as available.");
    //   } catch (err) {
    //     console.error("Failed to update rotation start date:", err);
    //     alert("Failed to update rotation start date. Try again.");
    //   }
    // };

    const handlePageChange = (newPage) => {
      if (newPage >= 1 && newPage <= pagination.last_page) {
        fetchTeams(newPage, search);
      }
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
                {user?.role?.name === 'Admin' && (
                  <>
                    {/* FOR TEAM ROTATION
                    <input
                      type="date"
                      className="cu-input"
                      value={rotationStartDate}
                      onChange={handleRotationDateChange}
                      disabled={loadingRotation}
                      min={new Date().toISOString().split("T")[0]}
                      title="Pick a date to reset rotation (Alpha becomes available)"
                    /> 
                    */}
                    <button className="create-team-btn" onClick={() => navigate('/admin/response-teams/create')}>Create Team</button>
                  </>
                )}
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
                      <td className={team.status === 'available' ? 'status-available' : 'status-unavailable'}>
                        {team.status.charAt(0).toUpperCase() + team.status.slice(1)}
                      </td>
                      <td>
                        <MdVisibility className="view-btn" onClick={() => {if (user?.role?.name === "Admin") {
                            navigate(`/admin/response-teams/${team.id}`);
                          } else if (user?.role?.name === "MDRRMO") {
                            navigate(`/dispatcher/response-teams/${team.id}`);
                          }
                        }}/>
                        {user?.role?.name === 'Admin' && (
                          <MdDelete className="delete-btn" onClick={() => handleDelete(team.id)}/>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="response-team-pagination">
                <button className="pagination-btn" onClick={() => handlePageChange(pagination.current_page - 1)} disabled={pagination.current_page === 1}>
                  &lt; Prev
                </button>
                <span>
                  Page <b>{pagination.current_page}</b> of {pagination.last_page}
                </span>
                <button className="pagination-btn" onClick={() => handlePageChange(pagination.current_page + 1)} disabled={pagination.current_page === pagination.last_page}>
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
