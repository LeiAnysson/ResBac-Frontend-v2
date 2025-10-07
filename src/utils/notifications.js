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
        window.dispatchEvent(new CustomEvent("callEnded", { detail: event }));
    });

    window.Echo.channel("dispatcher").listen(".DuplicateReportCreated", (event) => {
        console.log("Duplicate report detected for dispatcher:", event);

        showNotification(
            "Duplicate Report Detected",
            `Incident #${event.duplicate.incident_id} (${event.duplicate.incident_type?.name || "Unknown"}) has duplicate reports. Total: ${event.duplicate.duplicate_count}`
        );

        window.dispatchEvent(
            new CustomEvent("duplicateReportCreated", { detail: event.duplicate })
        );
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

    window.Echo.channel("resident").listen(".CallEnded", (event) => {
        window.dispatchEvent(new CustomEvent("callEnded", { detail: event }));
    });

    /*
    |
    |   RESIDENT REAL-TIME TRACKING
    |
    */
    window.Echo.channel("responder-location").listen(".LocationUpdated", (event) => {
        console.log("Responder location update:", event);

        window.dispatchEvent(
            new CustomEvent("responderLocationUpdate", { detail: event })
        );
    });

    /*
    |
    |
    |   RESPONDER NOTIFICATIONS
    |
    |
    */
    window.Echo.channel("responder").listen(".IncidentAssigned", (event) => {
        if (event.team.id !== currentUser.team_id) return;

        console.log("New incident assigned to your team:", event);

        showNotification(
            "New Incident Assigned",
            `${event.incident.incident_type?.name || "Unknown"} reported at ${event.incident.landmark || `${event.incident.latitude}, ${event.incident.longitude}`}`
        );

        window.dispatchEvent(
            new CustomEvent("incidentAssigned", { detail: event.incident })
        );
    });


};

const showNotification = (title, body) => {
  try {
    if (typeof Notification === "undefined") {
      console.log("Web Notifications not supported on this browser.");
      return;
    }

    if (Notification.permission === "granted") {
      new Notification(title, {
        body: body || "You have a new notification",
        icon: LogoB,
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(title, {
            body: body || "You have a new notification",
            icon: LogoB,
          });
        }
      });
    }
  } catch (err) {
    console.log("Notification error:", err);
  }
};