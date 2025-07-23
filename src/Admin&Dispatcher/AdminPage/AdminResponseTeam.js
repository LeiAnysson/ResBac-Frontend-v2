// capstone/src/Admin&Dispatcher/AdminPage/AdminResponseTeam.js
import React from "react";
import NavBar from "../../Components/ComponentsNavBar/NavBar";
import TopBar from "../../Components/ComponentsTopBar/TopBar";
import "./AdminResponseTeam.css";

const teams = [
  {
    name: "Team Alpha",
    members: [
      "Lei Anysson Marquez",
      "Grace Bayonito",
      "Kurt Papruz",
      "Jayson Visnar",
      "Victor Magtanggol"
    ],
    availability: "Available"
  },
  {
    name: "Team Bravo",
    members: [
      "Lei Anysson Marquez",
      "Grace Bayonito",
      "Kurt Papruz",
      "Jayson Visnar",
      "Victor Magtanggol"
    ],
    availability: "Unavailable"
  },
  {
    name: "Team Charlie",
    members: [
      "Lei Anysson Marquez",
      "Grace Bayonito",
      "Kurt Papruz",
      "Jayson Visnar",
      "Victor Magtanggol"
    ],
    availability: "Unavailable"
  },
  {
    name: "Medical Team",
    members: [
      "Lei Anysson Marquez",
      "Grace Bayonito",
      "Kurt Papruz",
      "Jayson Visnar",
      "Victor Magtanggol"
    ],
    availability: "Available"
  }
];

export default function AdminResponseTeam() {
  return (
    <div className="admin-dashboard-container">
      <TopBar />
      <div className="dashboard-main-content">
        <NavBar />
        <main className="dashboard-content-area">
          <h2 className="response-team-title">Response Team</h2>
          <div className="response-team-card">
            <div className="response-team-controls">
              <input className="response-team-search" placeholder="Search..." />
              <button className="response-team-search-btn">
                <span role="img" aria-label="search">🔍</span>
              </button>
              <button className="create-team-btn">Create Team</button>
            </div>
            <table className="response-team-table">
              <thead>
                <tr>
                  <th>Team Name</th>
                  <th>Name</th>
                  <th>Availability</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team, idx) => (
                  <tr key={idx}>
                    <td>{team.name}</td>
                    <td>
                      {team.members.map((member, i) => (
                        <div key={i}>{member}</div>
                      ))}
                    </td>
                    <td>
                      <span className={`availability-badge ${team.availability.toLowerCase()}`}>
                        {team.availability}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="response-team-pagination">
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
