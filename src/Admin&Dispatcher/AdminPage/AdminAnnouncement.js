import React, { useState, useEffect } from "react";
import NavBar from "../../Components/ComponentsNavBar/NavBar";
import TopBar from "../../Components/ComponentsTopBar/TopBar";
import "./AdminAnnouncement.css";
import { apiFetch } from "../../utils/apiFetch";
import { useNavigate } from "react-router-dom";

const AdminAnnouncement = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAnnouncements = async () => {
    try {
      const data = await apiFetch(`${process.env.REACT_APP_URL}/api/announcements`);
      setAnnouncements(data || []); 
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;

    try {
      await apiFetch(`${process.env.REACT_APP_URL}/api/admin/announcements/${id}`, {
        method: "DELETE",
      });

      setAnnouncements(prev => prev.filter(a => a.id !== id));
      alert("Announcement deleted!");
    } catch (err) {
      console.error("Failed to delete announcement:", err);
      alert("Error deleting announcement. Check console.");
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
          <h2 className="admin-announcement-title">Announcements & Updates</h2>
          
          {user?.role?.name === 'Admin' && (
            <button className="create-announcement-btn" onClick={() => navigate('/admin/announcement/create')}>Create Announcement</button>
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
                        <img key={img.id} src={`${process.env.REACT_APP_URL}${img.file_path}`} alt="Announcement" />
                      ))}
                    </div>
                  )}

                  {user?.role?.name === "Admin" && (
                    <button
                      className="announcement-delete-btn"
                      onClick={() => handleDelete(a.id)}
                      title="Delete announcement"
                    >
                      🗑️
                    </button>
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
