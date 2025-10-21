import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from "../../../Components/ComponentsNavBar/NavBar";
import TopBar from "../../../Components/ComponentsTopBar/TopBar";
import { apiFetch } from '../../../utils/apiFetch';
import "./ComponentsTeam&User.css";

const AdminCreateUser = ({ mode }) => {
  const { id: userId } = useParams();
  const navigate = useNavigate();
  const isCreating = mode === "create";

  const [teams, setTeams] = useState([]);
  const [idImage, setIdImage] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    birthdate: '',
    address: '',
    contact_num: '',
    role: 'Responder',
    team_id: '',
    id_number: ''
  });

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await apiFetch(`${process.env.REACT_APP_URL}/api/admin/teams`);
        setTeams(data.data || []);
      } catch (err) {
        console.error("Failed to fetch teams:", err);
      }
    };

    fetchTeams();

    if (!isCreating) {
      const fetchUser = async () => {
        try {
          const user = await apiFetch(`${process.env.REACT_APP_URL}/api/admin/users/${userId}`);
          setFormData({
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            email: user.email || '',
            password: '',
            confirmPassword: '',
            age: user.birthdate ? calculateAge(user.birthdate) : '',
            birthdate: user.birthdate || '',
            address: user.address || '',
            contact_num: user.contact_num || '',
            role: user.role || 'Responder',
            team_id: user.team_id || user.team?.id || '',
            id_number: user.resident_profile?.id_number || '',
          });
          if (user.resident_profile?.id_image_path) {
            setIdImage(`${process.env.REACT_APP_URL}/storage/${user.resident_profile.id_image_path}`);
          }
        } catch (err) {
          console.error("Failed to fetch user:", err);
        }
      };
      fetchUser();
    }
  }, [isCreating, userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) setIdImage(file);
  };

  const handleCancel = () => navigate('/admin/user-management');

  const calculateAge = (birthdate) => {
    if (!birthdate) return '';
    const dob = new Date(birthdate);
    const diff = Date.now() - dob.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isCreating && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (formData.role === 'Resident' && !idImage) {
      alert("Valid ID is required for Residents!");
      return;
    }

    try {
      const payload = new FormData();
      const age = calculateAge(formData.birthdate);

      payload.append('first_name', formData.first_name);
      payload.append('last_name', formData.last_name);
      payload.append('email', formData.email);
      payload.append('age', age);
      payload.append('birthdate', formData.birthdate);
      payload.append('address', formData.address);
      payload.append('contact_num', formData.contact_num);
      payload.append('role', formData.role);

      if (formData.role === 'Responder' && formData.team_id) {
        payload.append('team_id', formData.team_id);
      }

      if (formData.role === 'Resident' && formData.id_number) {
        payload.append('id_number', formData.id_number);
      }

      if (isCreating) {
        payload.append('password', formData.password);
      }

      if (idImage && idImage instanceof File) {
        payload.append('id_image', idImage);
      }

      const url = isCreating
        ? `${process.env.REACT_APP_URL}/api/admin/users/create`
        : `${process.env.REACT_APP_URL}/api/admin/users/${userId}/edit`;

      if (!isCreating) {
        payload.append('_method', 'PUT');
      }

      const token = localStorage.getItem("token");
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: payload,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit user");
      }

      alert(isCreating ? "User created successfully!" : "User updated successfully!");
      navigate('/admin/user-management');
    } catch (err) {
      console.error("Failed to submit user:", err);
      alert("Error submitting user. Please check console for details.");
    }
  };

  return (
    <div className="admin-dashboard-container">
      <TopBar />
      <div className="dashboard-main-content">
        <NavBar />
        <main className="dashboard-content-area">
          <div className="create-user-wrapper compact">
            <div className="cu-header">
              <div className="cu-header-icon">👤</div>
              <h2>{isCreating ? "Create User" : "Edit User"}</h2>
            </div>

            <form className="cu-form" onSubmit={handleSubmit}>
              <div className="cu-grid compact">

                <div className="cu-col">
                  <label>First Name:</label>
                  <input name="first_name" value={formData.first_name} onChange={handleInputChange} className="cu-input" required />
                  <label>Last Name:</label>
                  <input name="last_name" value={formData.last_name} onChange={handleInputChange} className="cu-input" required />
                  <label>Contact Number:</label>
                  <input name="contact_num" value={formData.contact_num} onChange={handleInputChange} className="cu-input" required />
                  <label>Birthdate:</label>
                  <input
                    name="birthdate"
                    type="date"
                    value={formData.birthdate}
                    onChange={(e) => {
                      const birthdate = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        birthdate,
                        age: calculateAge(birthdate),
                      }));
                    }}
                    className="cu-input"
                    required
                  />
                  {formData.birthdate && (
                    <small style={{ color: "#666" }}>Age: {formData.age ? `${formData.age} years old` : "—"}</small>
                  )}
                  <label>Address:</label>
                  <input name="address" value={formData.address} onChange={handleInputChange} className="cu-input" required />
                </div>

                <div className="cu-col">
                  <label>Role:</label>
                  <select name="role" value={formData.role} onChange={handleInputChange} className="cu-input" required>
                    <option value="Resident">Resident</option>
                    <option value="Responder">Responder</option>
                    <option value="MDRRMO">MDRRMO</option>
                  </select>

                  {formData.role === 'Responder' && (
                    <>
                      <label>Response Team (optional):</label>
                      <select
                        name="team_id"
                        value={formData.team_id}
                        onChange={handleInputChange}
                        className="cu-input"
                      >
                        <option value="">Assign later</option>
                        {teams.map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.team_name}
                          </option>
                        ))}
                      </select>
                      <small style={{ color: "#666" }}>
                        You can leave this empty and assign the user to a team later.
                      </small>
                    </>
                  )}

                  <label>Email:</label>
                  <input name="email" type="email" value={formData.email} onChange={handleInputChange} className="cu-input" required />

                  {isCreating ? (
                    <>
                      <label>Password:</label>
                      <input name="password" type="password" value={formData.password} onChange={handleInputChange} className="cu-input" required />
                      <label>Confirm Password:</label>
                      <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} className="cu-input" required />
                    </>
                  ) : (
                    <>
                      <label>Password:</label>
                      <input type="password" className="cu-input" value="********" readOnly style={{ backgroundColor: "#f2f2f2", color: "#666" }} />
                      <small style={{ color: "#888" }}>Password changes can be done in the “Change Password” section.</small>
                    </>
                  )}
                </div>

                {formData.role === 'Resident' && (
                  <div className="cu-upload-col">
                    <label>Upload Valid ID:</label>
                    <div className="cu-upload-box" onClick={() => document.getElementById('id_image').click()}>
                      {idImage ? (
                        <img
                          src={idImage instanceof File ? URL.createObjectURL(idImage) : idImage}
                          alt="Valid ID"
                          style={{
                            width: '100%',
                            height: 'auto',
                            maxHeight: '200px',
                            borderRadius: '6px',
                            objectFit: 'contain',
                          }}
                        />
                      ) : (
                        <div className="ud-plus">+</div>
                      )}
                    </div>
                    <input type="file" id="id_image" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                    <label>ID Number (Optional):</label>
                    <input name="id_number" value={formData.id_number} onChange={handleInputChange} className="cu-input" />
                  </div>
                )}
              </div>

              <div className="cu-actions">
                <button type="button" className="btn btn-outline" onClick={handleCancel} style={{background:'#c94c4c', color:'white'}}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {isCreating ? "Create" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminCreateUser;
