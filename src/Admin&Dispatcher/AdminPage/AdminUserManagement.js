import React from "react";
import NavBar from "../../Components/ComponentsNavBar/NavBar";
import TopBar from "../../Components/ComponentsTopBar/TopBar";
import "./AdminUserManagement.css";

const users = [
  {
    name: "Lei Anysson Marquez",
    email: "leianysson@gmail.com",
    role: "Resident",
    registered: "02-31-2025",
    status: "Active",
  },
  {
    name: "Grace Bayonito",
    email: "Grace@gmail.com",
    role: "Resident",
    registered: "02-31-2025",
    status: "Active",
  },
  {
    name: "Kurt Papruz",
    email: "Kurt@gmail.com",
    role: "Responder",
    registered: "02-31-2025",
    status: "Active",
  },
  {
    name: "Jayson Visnar",
    email: "Eson@gmail.com",
    role: "Dispatcher",
    registered: "02-31-2025",
    status: "Active",
  },
];

export default function AdminUserManagement() {
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
              <select className="user-filter-select">
                <option>All Users</option>
                {/* Add more filter options if needed */}
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
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{user.registered}</td>
                      <td>
                        <span className="user-status-active">{user.status}</span>
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
              <span>1 of 1 items</span>
              <span>
                &lt; <b>Page 1</b> of 1 &gt;
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}