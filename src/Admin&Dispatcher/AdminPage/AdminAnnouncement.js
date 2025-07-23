import React from "react";
import NavBar from "../../Components/ComponentsNavBar/NavBar";
import TopBar from "../../Components/ComponentsTopBar/TopBar";
import "./AdminAnnouncement.css";

const announcements = [
  {
    title: "Typhoon Preparedness Advisory",
    date: "April 29, 2025, 2:23PM",
    content: "With the upcoming rainy season, please ensure your emergency kits are ready. Secure loose items around your property and stay updated with official weather bulletins from PAGASA. Visit the MDRRMO website for more tips.",
    image: "https://i.ibb.co/6bQ7Q2d/typhoon.png"
  },
  {
    title: "Safety Advisory: What To Do If Your Clothes Catch Fire",
    date: "April 29, 2025, 3:45PM",
    content: (
      <div>
        Knowing what to do if your clothes catch fire can save your life. Remember these crucial steps:
        <ul>
          <li>1. STOP: Stop immediately where you are. Do not run.</li>
          <li>2. DROP: Drop to the ground as quickly as possible.</li>
          <li>3. ROLL: Cover your face with your hands and roll over and over to smother the flames.</li>
        </ul>
        Stay calm and act fast. Share this important safety information with your family and friends.
      </div>
    ),
    image: "https://i.ibb.co/6bQ7Q2d/fire-safety.png"
  }
];

export default function AdminAnnouncement() {
  return (
    <div className="admin-dashboard-container">
      <TopBar />
      <div className="dashboard-main-content">
        <NavBar />
        <main className="dashboard-content-area">
          <h2 className="announcement-title">Announcements & Updates</h2>
          <button className="create-announcement-btn">+ Create Announcement</button>
          <div className="announcement-list">
            {announcements.map((a, idx) => (
              <div className="announcement-card" key={idx}>
                <div className="announcement-icon">
                  <span role="img" aria-label="announcement">💬</span>
                </div>
                <div className="announcement-content">
                  <h3>{a.title}</h3>
                  <div className="announcement-date">Posted: {a.date}</div>
                  <div className="announcement-text">{a.content}</div>
                </div>
                <div className="announcement-image">
                  <img src={a.image} alt="Announcement" />
                </div>
              </div>
            ))}
          </div>
          <div className="announcement-pagination">
            <span>1 of 1 items</span>
            <span>
              &lt; <b>Page 1</b> of 1 &gt;
            </span>
          </div>
        </main>
      </div>
    </div>
  );
}
