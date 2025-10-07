import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "../../../Components/ComponentsNavBar/NavBar";
import TopBar from "../../../Components/ComponentsTopBar/TopBar";
import { apiFetch } from "../../../utils/apiFetch";
import "./ComponentsTeam&User.css";

const ResidentApprovalView = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const [resident, setResident] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResident = async () => {
      try {
        const data = await apiFetch(`${process.env.REACT_APP_URL}/api/admin/residents/${id}`);
        setResident(data);
      } catch (err) {
        console.error("Error fetching resident:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResident();
  }, [id]);

  const handleApprove = async () => {
    try {
      await apiFetch(`${process.env.REACT_APP_URL}/api/admin/residents/${id}/approve`, {
        method: "POST",
      });
      alert("Resident approved successfully!");
      navigate("/admin/user-management");
    } catch (err) {
      console.error("Approve failed:", err);
      alert("Error approving resident.");
    }
  };

  const handleReject = async () => {
    try {
      await apiFetch(`${process.env.REACT_APP_URL}/api/admin/residents/${id}/reject`, {
        method: "POST",
      });
      alert("Resident rejected.");
      navigate("/admin/user-management");
    } catch (err) {
      console.error("Reject failed:", err);
      alert("Error rejecting resident.");
    }
  };

  if (loading) return <div>Loading resident details...</div>;
  if (!resident) return <div>No resident found.</div>;

  return (
    <div className="admin-dashboard-container">
      <TopBar />
      <div className="dashboard-main-content">
        <NavBar />
        <main className="dashboard-content-area">
          <div className="user-display-wrapper">
            {/* Header */}
            <div className="ud-header">
              <div className="ud-header-icon">i</div>
              <h2>Resident Registration Details</h2>
            </div>

            {/* Content */}
            <div className="ud-content">
              {/* Details Section */}
              <div className="ud-details-section">
                <h3>Resident Information</h3>
                <div className="ud-details-list">
                  <div className="ud-detail-item">
                    <label>Full Name:</label>
                    <span>{resident.first_name} {resident.last_name}</span>
                  </div>
                  <div className="ud-detail-item">
                    <label>Contact:</label>
                    <span>{resident.contact}</span>
                  </div>
                  <div className="ud-detail-item">
                    <label>Date of Birth:</label>
                    <span>{resident.date_of_birth}</span>
                  </div>
                  <div className="ud-detail-item">
                    <label>Address:</label>
                    <span>{resident.address}</span>
                  </div>
                  <div className="ud-detail-item">
                    <label>Email:</label>
                    <span>{resident.email}</span>
                  </div>
                  <div className="ud-detail-item">
                    <label>Residency Status:</label>
                    <span>{resident.residency_status}</span>
                  </div>
                </div>
              </div>

              {/* Image Section */}
              <div className="ud-image-section">
                <h3>Uploaded ID</h3>
                <div className="ud-image-container">
                  {resident.id_image_path ? (
                    <img
                      src={resident.id_image_path}
                      alt="Valid ID"
                      className="ud-id-image"
                    />
                  ) : (
                    <div className="ud-no-image">No ID uploaded</div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="ud-actions">
              <button
                type="button"
                className="btn btn-reject"
                onClick={handleReject}
              >
                Reject
              </button>
              <button
                type="button"
                className="btn btn-approve"
                onClick={handleApprove}
              >
                Approve
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ResidentApprovalView;
