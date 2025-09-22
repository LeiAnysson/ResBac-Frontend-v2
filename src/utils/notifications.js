import Echo from "@ably/laravel-echo";
import Ably from "ably";
import LogoB from "../assets/LogoB.png";

export const setupNotifications = () => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) return;

    window.Ably = Ably;

    const ablyClient = new Ably.Realtime({
        key: process.env.REACT_APP_ABLY_KEY,
    });

    window.Echo = new Echo({
        broadcaster: "ably",
        client: ablyClient,
    });

    /*
    |
    |
    |   DISPATCHER NOTIFICATIONS
    |
    |
    */
    window.Echo.channel("dispatcher").listen(".IncidentCallCreated", (event) => {
        if (event.target_role === 2 && currentUser.role_id === 2) {
        console.log("Incoming incident for dispatcher:", event);
        showNotification(
            "New Incident Reported",
            `${event.incident_type.name} reported by ${event.user.first_name}`
        );

        window.dispatchEvent(
            new CustomEvent("incidentCallCreated", { detail: event })
        );
        }
    });

    window.Echo.channel("dispatcher").listen(".CallEnded", (event) => {
        console.log("Call ended event for dispatcher:", event);
        window.dispatchEvent(new CustomEvent("callEnded", { detail: event }));
    });


    /*
    |
    |
    |   RESIDENT NOTIFICATIONS
    |
    |
    */
    window.Echo.channel("resident").listen(".CallAccepted", (event) => {
        if (event.target_role === 4 && event.reporter_id === currentUser.id) {
        console.log("Dispatcher accepted your call:", event);
        showNotification("Call Accepted", "A dispatcher is now handling your call.");
        }
    });
};

const showNotification = (title, body) => {
  if (Notification.permission === "granted") {
    new Notification(title, {
      body: body || "You have a new notification",
      icon: LogoB,
    });
  }
};
