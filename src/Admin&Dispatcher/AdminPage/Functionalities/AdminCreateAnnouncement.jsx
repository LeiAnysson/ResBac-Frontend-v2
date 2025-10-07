import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from "../../../Components/ComponentsNavBar/NavBar";
import TopBar from "../../../Components/ComponentsTopBar/TopBar";
import { apiFetch } from '../../../utils/apiFetch';
import "./ComponentsTeam&User.css";

const AdminCreateAnnouncement = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        content: ''
    });
    const [images, setImages] = useState([]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setImages(prev => [...prev, ...files]);
    };

    const handleRemoveImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = new FormData();
            payload.append('title', formData.title);
            payload.append('content', formData.content);

            images.forEach(img => payload.append('images[]', img));

            const token = localStorage.getItem('token');

            const response = await fetch(`${process.env.REACT_APP_URL}/api/admin/announcements/create`, {
                method: 'POST',
                body: payload,
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Failed to create announcement');

            alert('Announcement created!');
            navigate('/admin/announcements');

        } catch (err) {
            console.error('Failed to create announcement:', err);
            alert('Error creating announcement. Check console.');
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
                <div className="cu-header-icon">📢</div>
                <h2>Create Announcement</h2>
                </div>
                <form className="cu-form" onSubmit={handleSubmit}>
                <div className="ca-grid compact">
                    <div className="ca-col">
                    <label className="ca-label">Title:</label>
                    <input name="title" value={formData.title} onChange={handleInputChange} className="cu-input" required />
                    <label className="ca-label">Content:</label>
                    <textarea name="content" value={formData.content} onChange={handleInputChange} className="cu-input" rows={6} required />
                    <label className="ca-label">Upload Images:</label>
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="cu-input" />
                    {images.length > 0 && (
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                            {images.map((img, i) => (
                            <div key={i} style={{ position: 'relative' }}>
                                <img
                                src={URL.createObjectURL(img)}
                                alt="Preview"
                                style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 6 }}
                                />
                                <button type="button" onClick={() => handleRemoveImage(i)}
                                    style={{position: 'absolute', top: -8, right: -8, background: '#dc2626', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20,
                                    cursor: 'pointer', fontSize: 12, lineHeight: '20px', textAlign: 'center', padding: 0,}}>×
                                </button>
                            </div>
                            ))}
                        </div>
                        )}
                    </div>
                </div>
                <div className="cu-actions">
                    <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/announcements')} style={{background:'#dc2626', color:'white'}}>Cancel</button>
                    <button type="submit" className="btn btn-primary" onClick={handleSubmit}>Create</button>
                </div>
                </form>
            </div>
            </main>
        </div>
        </div>
    );
};

export default AdminCreateAnnouncement;
