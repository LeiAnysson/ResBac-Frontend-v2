import { useEffect, useState } from "react";

export default function InAppNotificationContainer() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleNotification = (e) => {
      setNotifications((prev) => [...prev, e.detail]);
      setTimeout(() => {
        setNotifications((prev) => prev.filter(n => n !== e.detail));
      }, 5000);
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
