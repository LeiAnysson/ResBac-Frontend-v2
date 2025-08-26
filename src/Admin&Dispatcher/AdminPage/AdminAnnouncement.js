import React, { useState, useEffect } from "react";
import NavBar from "../../Components/ComponentsNavBar/NavBar";
import TopBar from "../../Components/ComponentsTopBar/TopBar";
import "./AdminAnnouncement.css";
import { apiFetch } from "../../utils/apiFetch";

const AdminAnnouncement = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async () => {
    try {
      const data = await apiFetch(`http://127.0.0.1:8000/api/admin/announcements`);
      setAnnouncements(data || []); 
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return (
    <div className="admin-dashboard-container">
      <TopBar />
      <div className="dashboard-main-content">
        <NavBar />
        <main className="dashboard-content-area">
          <h2 className="announcement-title">Announcements & Updates</h2>
          
          {user?.role?.name === 'Admin' && (
            <button className="create-announcement-btn">Create Announcement</button>
          )}

          {announcements.length === 0 ? (
            <p>No announcements available.</p>
          ) : (
            <div className="announcement-list">
              {announcements.map((a) => (
                <div className="announcement-card" key={a.id}>

                  <div className="announcement-content">
                    <h3>{a.title}</h3>
                    <div className="announcement-date">
                      Posted:{" "}
                      {new Date(a.posted_at).toLocaleString("en-PH", {
                        hour12: true,
                      })}
                    </div>
                    <div
                      className="announcement-text"
                      dangerouslySetInnerHTML={{ __html: a.content }}
                    />
                  </div>

                  {a.images?.length > 0 && (
                    <div className="announcement-image">
                      {a.images.map(img => (
                        <img key={img.id} src={`http://127.0.0.1:8000${img.file_path}`} alt="Announcement" />
                      ))}
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default AdminAnnouncement;
