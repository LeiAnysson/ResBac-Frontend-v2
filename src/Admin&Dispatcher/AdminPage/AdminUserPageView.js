import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "../../Components/ComponentsNavBar/NavBar";
import TopBar from "../../Components/ComponentsTopBar/TopBar";
import { apiFetch } from "../../utils/apiFetch";
import Spinner from '../../utils/Spinner';
import "./Functionalities/ComponentsTeam&User.css";

const AdminUserPageView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
        try {
        const user = await apiFetch(`${process.env.REACT_APP_URL}/api/admin/users/${id}`);

        const isResident = user.role === "Resident";
        
        const photoPath = isResident && user.resident_profile?.id_image_path
        ? `${process.env.REACT_APP_URL}/storage/${user.resident_profile.id_image_path}`
        : null;

        setUserData({
            id: user.id,
            firstName: isResident ? user.name.split(" ")[0] : user.first_name,
            lastName: isResident ? user.name.split(" ").slice(1).join(" ") : user.last_name,
            contact: user.contact || "",
            dateOfBirth: user.birthdate || "",
            address: user.address || "",
            role: isResident ? "Resident" : `Role ${user.role_id}`,
            email: user.email || "",
            photo: photoPath,
            residencyStatus: isResident ? user.status || "pending" : null,
        });
        console.log("Photo URL being set in state:", photoPath);
        } catch (err) {
            console.error("Failed to fetch user:", err);
        } finally {
            setLoading(false);
        }
    };
    fetchUser();
    }, [id]);

  if (loading) return <Spinner message="Loading user data..." />;
  if (!userData) return <div>User not found.</div>;

  const handleApprove = async () => {
    try {
      await apiFetch(`${process.env.REACT_APP_URL}/api/admin/residents/${id}/approve`, {
        method: "PUT",
      });
      setUserData(prev => ({ ...prev, residencyStatus: "approved" }));
      alert("User approved successfully!");
    } catch (err) {
      console.error("Failed to approve user:", err);
      alert("Failed to approve user. Check console.");
    }
  };

  const handleReject = async () => {
    try {
      await apiFetch(`${process.env.REACT_APP_URL}/api/admin/residents/${id}/reject`, {
        method: "PUT",
      });
      setUserData(prev => ({ ...prev, residencyStatus: "rejected" }));
      alert("User rejected!");
    } catch (err) {
      console.error("Failed to reject user:", err);
      alert("Failed to reject user. Check console.");
    }
  };

  const handleBack = () => navigate("/admin/user-management");

  return (
    <div className="admin-dashboard-container">
        <TopBar />
        <div className="dashboard-main-content">
            <NavBar />
            <main className="dashboard-content-area">
            <div className="create-user-wrapper compact">
                <div className="cu-header">
                <div className="cu-header-icon">👤</div>
                    <h4>User Information</h4>
                </div>

                <div className="cu-content">
                    <table className="cu-info-table">
                        <tbody>
                            <tr>
                            <td className="label">Full Name:</td>
                            <td className="value">{userData.firstName} {userData.lastName}</td>
                            <td className="image-label" rowSpan={8}>
                                {userData.photo ? (
                                <>
                                    <label>Image Attachment:</label>
                                    <br />
                                    <img
                                    src={userData.photo}
                                    alt="Profile"
                                    style={{ width: "250px", height: "100%", objectFit: "cover", borderRadius: "6px" }}
                                    />
                                </>
                                ) : null}
                            </td>
                            </tr>
                            <tr>
                            <td className="label">Contact:</td>
                            <td className="value">{userData.contact}</td>
                            </tr>
                            <tr>
                            <td className="label">Date of Birth:</td>
                            <td className="value">{userData.dateOfBirth}</td>
                            <td className="image-label"></td>
                            </tr>
                            <tr>
                            <td className="label">Address:</td>
                            <td className="value">{userData.address}</td>
                            <td></td>
                            </tr>
                            <tr>
                            <td className="label">Email:</td>
                            <td className="value">{userData.email}</td>
                            <td></td>
                            </tr>
                            <tr>
                            <td className="label">Role:</td>
                            <td className="value">{userData.role}</td>
                            <td></td>
                            </tr>
                            <tr>
                            <td className="label">Residency Status:</td>
                            <td className="value">{userData.residencyStatus}</td>
                            <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="cu-actions">
                    {userData.role === "Resident" && userData.residencyStatus === "pending" && (
                        <>
                        <button className="btn btn-reject" onClick={handleReject} style={{background:'#dc2626', color:'white'}}>
                            Reject
                        </button>
                        <button className="btn btn-approve" onClick={handleApprove} style={{background:'#1e40af', color:'white'}}>
                            Approve
                        </button>
                        </>
                    )}
                </div>
            </div>
            </main>
        </div>
    </div>
  );
};

export default AdminUserPageView;
