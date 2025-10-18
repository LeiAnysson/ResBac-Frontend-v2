import { useEffect, useState } from "react";
import './InAppNotificationContainer.css';

export default function InAppNotificationContainer() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleNotification = (e) => {
      const { title, message, persistent } = e.detail || {};
      if (!title && !message) return;
      
      setNotifications((prev) => [...prev, e.detail]);

      if (!persistent) {
        setTimeout(() => {
          setNotifications((prev) => prev.filter(n => n !== e.detail));
        }, 10000);
      }
    };

    window.addEventListener("inAppNotification", handleNotification);

    return () => window.removeEventListener("inAppNotification", handleNotification);
  }, []);

  return (
    <div className="in-app-notification-container">
      {notifications.map((n, idx) => (
        <div key={idx} className="in-app-notification">
          <strong>{n.title}</strong>
          <p>{n.message}</p>
          {n.actions?.map((action, i) => (
            <button key={i} onClick={action.onClick}>{action.label}</button>
          ))}
        </div>
      ))}
    </div>
  );
}
