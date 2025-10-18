import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NavigationListener = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handler = (e) => {
            if (e.detail?.path) {
                navigate(e.detail.path);
            }
        };

        window.addEventListener("navigateTo", handler);
        return () => window.removeEventListener("navigateTo", handler);
    }, [navigate]);

    return null;
};

export default NavigationListener;
