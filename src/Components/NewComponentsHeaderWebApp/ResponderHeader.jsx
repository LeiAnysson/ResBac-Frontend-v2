import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LogoB from '../../assets/LogoB.png';

const DEFAULT_PROFILE = "https://static.vecteezy.com/system/resources/previews/021/548/095/original/default-profile-picture-avatar-user-avatar-icon-person-icon-head-icon-profile-picture-icons-default-anonymous-user-male-and-female-businessman-photo-placeholder-social-network-avatar-portrait-free-vector.jpg";

function Header() {
    const navigate = useNavigate();
    const [profileImage, setProfileImage] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return;

        const user = JSON.parse(storedUser);
        const id = user.id;
        const token = localStorage.getItem("token");

        fetch(`${process.env.REACT_APP_URL}/api/responders/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .then(res => res.json())
        .then(data => {
            setProfileImage(data.profile_image_url || '');
        })
        .catch(err => console.error('Failed to fetch responder image:', err));
    }, []);

    const profileImageUrl = profileImage
        ? profileImage.startsWith('http') || profileImage.startsWith('data:') || profileImage.startsWith('blob:')
            ? profileImage
            : `${process.env.REACT_APP_URL}${profileImage}`
        : DEFAULT_PROFILE;

    return (
        <div className="header">
            <div className="header-left">
                <img src={LogoB} alt="ResBac" className="app-logo" />
            </div>
            
            <button className="account-button" onClick={() => navigate('/responder/profile')}>
                <div className="avatar">
                <img
                    src={profileImageUrl}
                    alt="Profile"
                    onError={(e) => { e.currentTarget.src = DEFAULT_PROFILE; }}
                />
                </div>
            </button>
        </div>
    );
}

export default Header;
