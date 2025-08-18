import NavBar from "../../Components/ComponentsNavBar/NavBar";
import TopBar from "../../Components/ComponentsTopBar/TopBar";
import "./AdminUserManagement.css";
import React, { useState, useEffect } from "react";
import { apiFetch } from '../../utils/apiFetch';

const UserPage = () => {
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
    const [filters, setFilters] = useState({ role: "", residency_status: "" });

    const fetchUsers = async (page = 1, filters = {}) => {
      const params = new URLSearchParams({
        page,
        ...(filters.role && { role: filters.role }),
        ...(filters.residency_status && { residency_status: filters.residency_status }),
      });

      try {
        const data = await apiFetch(`http://127.0.0.1:8000/api/admin/users?${params}`); 
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
      fetchUsers(1, filters);
    }, [filters]);

    const handlePageChange = (newPage) => {
      fetchUsers(newPage, filters);
    };

    const handleFilterChange = (e) => {
      setFilters({ ...filters, [e.target.name]: e.target.value });
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
                  className="user-search-input"
                  type="text"
                  placeholder="Search..."
                />
                <button className="user-search-btn">Search</button>
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
                          <span className="user-status-active">{user.residency_status || "N/A"}</span>
                        </td>
                        <td>
                          <button className="user-action-btn" title="Edit">
                            <span role="img" aria-label="edit">📝</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="user-pagination">
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

export default UserPage;