import NavBar from "../../Components/ComponentsNavBar/NavBar";
import TopBar from "../../Components/ComponentsTopBar/TopBar";
import "./AdminUserManagement.css";
import React, { useState, useEffect } from "react";
import { apiFetch } from '../../utils/apiFetch';
import { useNavigate } from "react-router-dom";

const UserPage = () => {
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
    const [filters, setFilters] = useState({ role: "", residency_status: "" });
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    const fetchUsers = async (page = 1, filters = {}, searchQuery = "") => {
      const params = new URLSearchParams({
        page,
        ...(filters.role && { role: filters.role }),
        ...(filters.residency_status && { residency_status: filters.residency_status }),
        ...(searchQuery && { search: searchQuery }),
      });

      try {
        const data = await apiFetch(`${process.env.REACT_APP_URL}/api/admin/users?${params}`); 
        setUsers(data.data);
        setPagination({
          current_page: data.current_page,
          last_page: data.last_page,
        });
      } catch (err) {
        console.error('Failed to fetch users:', err.message);
      }
    };

    useEffect(() => {
      const delayDebounce = setTimeout(() => {
        fetchUsers(1, filters, search);
      }, 300);

      return () => clearTimeout(delayDebounce);
    }, [search, filters]);

    const handlePageChange = (newPage) => {
      fetchUsers(newPage, filters, search);
    };

    const handleFilterChange = (e) => {
      setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleDeleteUser = async (id) => {
      if (!window.confirm("Are you sure you want to delete this user?")) return;

      try {
        await apiFetch(`${process.env.REACT_APP_URL}/api/admin/users/${id}`, {
          method: "DELETE",
        });

        fetchUsers(pagination.current_page);
      } catch (err) {
        console.error("Failed to delete user:", err);
      }
    };
    
    return (
      <div className="admin-dashboard-container">
        <TopBar />
        <div className="dashboard-main-content">
          <NavBar />
          <main className="dashboard-content-area">
            <h1 className="user-management-title">User Overview</h1>
            <div className="user-management-card">
              <div className="user-management-controls">
                <input
                  className="u-search-input search-input search-input-filled"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select className="user-filter-select"
                  name="role"
                  value={filters.role} 
                  onChange={handleFilterChange}
                >
                  <option value = "">All Users</option>
                  <option value = "1">Admin</option>
                  <option value = "2">MDRRMO</option>
                  <option value = "3">Responder</option>
                  <option value = "4">Residents</option>
                </select>
                <select
                  className="user-filter-select"
                  name="residency_status"
                  value={filters.residency_status}
                  onChange={handleFilterChange}
                >
                  <option value = "">All Status</option>
                  <option value = "approved">Approved</option>
                  <option value = "pending">Pending</option>
                </select>
                <button className="create-user-btn" onClick={() => navigate('/admin/users/create')}>Create User</button>
              </div>
              <div className="user-table-wrapper">
                <table className="user-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Registered</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, idx) => (
                      <tr key={idx}>
                        <td>{`${user.first_name} ${user.last_name}`}</td>
                        <td>{user.email}</td>
                        <td>{user.role?.name || 'No role'}</td>
                        <td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : "No date"}</td>
                        <td>
                          <span
                            className={`user-status 
                              ${user.residency_status === "approved" ? "active" : ""} 
                              ${user.residency_status === "pending" ? "pending" : ""} 
                              ${user.residency_status === "rejected" ? "rejected" : ""}`}
                          >
                            {user.residency_status === "approved" ? "Active" : user.residency_status || "N/A"}
                          </span>
                        </td>
                        <td>
                          <button className="view-btn" onClick={() => navigate(`/admin/users/${user.id}`)}>View</button>
                          <button className="view-btn" onClick={() => navigate(`/admin/users/${user.id}/edit`)}>Edit</button>
                          <button className="delete-btn" onClick={() => handleDeleteUser(user.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="emergency-reports-pagination">
                <button className="pagination-btn"  onClick={() => handlePageChange(pagination.current_page - 1)} disabled={pagination.current_page === 1}>
                  &lt; Prev
                </button>
                <span>
                  Page <b>{pagination.current_page}</b> of {pagination.last_page}
                </span>
                <button className="pagination-btn"  onClick={() => handlePageChange(pagination.current_page + 1)} disabled={pagination.current_page === pagination.last_page}>
                  Next &gt;
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
};

export default UserPage;