import Echo from "@ably/laravel-echo";
import Ably from "ably";
import LogoB from "../assets/LogoB.png";
import { saveNotification } from "./saveNotifications";

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


    /* ---------------- DISPATCHER NOTIFICATIONS ---------------- */


    window.Echo.channel("dispatcher").listen(".IncidentCallCreated", (event) => {
        if (event.target_role === 2 && currentUser.role_id === 2) {
            const message = `${event.incident_type.name} reported by ${event.user.first_name}`;
            console.log("Incoming incident for dispatcher:", event);

            showNotification("New Incident Reported", message);
            saveNotification(currentUser.id, message);

            window.dispatchEvent(new CustomEvent("incidentCallCreated", { detail: event }));
        }
    });

    window.Echo.channel("dispatcher").listen(".CallEnded", (event) => {
        window.dispatchEvent(new CustomEvent("callEnded", { detail: event }));
    });

    window.Echo.channel("dispatcher").listen(".DuplicateReportCreated", (event) => {
        const message = `Incident #${event.duplicate.incident_id} (${event.duplicate.incident_type?.name || "Unknown"}) has duplicate reports. Total: ${event.duplicate.duplicate_count}`;
        console.log("Duplicate report detected for dispatcher:", event);

        showNotification("Duplicate Report Detected", message);
        showInAppNotification({ title: "Duplicate Report Detected", message });
        saveNotification(currentUser.id, message);

        window.dispatchEvent(new CustomEvent("duplicateReportCreated", { detail: event.duplicate }));
    });

    window.Echo.channel("dispatcher").listen(".IncidentUpdated", (event) => {
        const message = `Incident #${event.incident.id} is now "${event.incident.status}"`;

        showInAppNotification({
            title: "Incident Status Updated",
            message,
            onClick: () => window.location.href = `/dispatcher/emergency-reports/${event.incident.id}`,
        });
        saveNotification(currentUser.id, message);

        window.dispatchEvent(new CustomEvent("incidentUpdated", { detail: event.incident }));
    });

    window.Echo.channel("dispatcher").listen(".BackupRequestCreated", (event) => {
        const message = `${event.backup_type === "LGU" ? "LGU backup requested." : "Medical backup handled automatically."} for Incident #${event.incident_id}`;
        console.log("%c[DISPATCHER] BackupRequestCreated event received:", "color: #1E90FF; font-weight: bold;", event);

        const actions = [];
        if (event.backup_type === "LGU") {
            actions.push({
                label: "Acknowledge",
                onClick: async () => {
                    try {
                        const response = await fetch(`/api/incidents/backups/${event.backup_id}/acknowledge`, { method: "POST" });
                        const data = await response.json();
                        if (data.success) {
                            showInAppNotification({
                                title: "Backup Acknowledged",
                                message: `You have acknowledged the LGU backup request for Incident #${event.incident_id}.`,
                            });
                        }
                    } catch (err) {
                        console.error("Failed to acknowledge backup:", err);
                    }
                },
            });
        }

        showInAppNotification({ title: "Backup Request", message, actions });
        saveNotification(currentUser.id, message);

        window.dispatchEvent(new CustomEvent("backupRequestCreated", { detail: event }));
    });

    window.Echo.channel("dispatcher").listen(".BackupAutomaticallyAssigned", (event) => {
        const message = `A medical team has been automatically assigned to Incident #${event.incident.id} (${event.incident.incident_type}).`;
        console.log("Medical backup automatically assigned:", event);

        showInAppNotification({
            title: "Medic Backup Automatically Assigned",
            message,
            onClick: () => window.location.href = `/dispatcher/emergency-reports/${event.incident.id}`,
        });
        saveNotification(currentUser.id, message);

        window.dispatchEvent(new CustomEvent("backupAutomaticallyAssigned", { detail: event }));
    });


    /* ---------------- RESIDENT NOTIFICATIONS ---------------- */


    window.Echo.channel("resident").listen(".CallAccepted", (event) => {
        if (event.target_role === 4 && event.reporter_id === currentUser.id) {
            const message = "A dispatcher is now handling your call.";
            console.log("Dispatcher accepted your call:", event);

            showNotification("Call Accepted", message);
            saveNotification(currentUser.id, message);
        }
    });

    window.Echo.channel("resident").listen(".CallEnded", (event) => {
        window.dispatchEvent(new CustomEvent("callEnded", { detail: event }));
    });

    window.Echo.channel("responder-location").listen(".LocationUpdated", (event) => {
        console.log("Responder location update:", event);
        window.dispatchEvent(new CustomEvent("responderLocationUpdate", { detail: event }));
    });

    window.Echo.channel("resident").listen(".IncidentUpdated", (event) => {
        const incident = event.incident;
        if (incident.status && incident.status !== "pending") {
            const message = `The Response team is now "${incident.status}".`;
            showInAppNotification({
                title: "Incident Status Updated",
                message,
                onClick: () => window.location.href = `/incidents/${incident.id}`,
            });
            saveNotification(currentUser.id, message);
        }
        window.dispatchEvent(new CustomEvent("incidentUpdated", { detail: incident }));
    });


    /* ---------------- RESPONDER NOTIFICATIONS ---------------- */


    window.Echo.channel("responder").listen(".IncidentAssigned", (event) => {
        if (event.team.id !== currentUser.team_id) return;

        const message = `${event.incident.incident_type?.name || "Unknown"} reported at ${event.incident.landmark || `${event.incident.latitude}, ${event.incident.longitude}`}`;
        console.log("New incident assigned to your team:", event);

        showInAppNotification({
            title: "New Incident Assigned",
            message,
            onClick: () => window.location.href = `/incidents/${event.incident.id}`,
        });
        saveNotification(currentUser.id, message);

        window.dispatchEvent(new CustomEvent("incidentAssigned", { detail: event.incident }));
    });

    window.Echo.channel("responder").listen(".IncidentUpdated", (event) => {
        console.log("Incident updated:", event);
        window.dispatchEvent(new CustomEvent("incidentUpdated", { detail: event.incident }));
    });

    window.Echo.channel("responder").listen(".BackupAcknowledged", (event) => {
        if (event.team.id !== currentUser.team_id) return;

        const message = `Dispatcher confirmed your ${event.backup_type} backup request for Incident #${event.incident.id}.`;
        console.log("Backup acknowledged:", event);

        showInAppNotification({
            title: "Backup Request Acknowledged",
            message,
            onClick: () => window.location.href = `/incidents/${event.incident.id}`,
        });
        saveNotification(currentUser.id, message);

        window.dispatchEvent(new CustomEvent("backupAcknowledged", { detail: event }));
    });

    window.Echo.channel("responder").listen(".BackupAutomaticallyAssigned", (event) => {
        if (event.assigned_team.id !== currentUser.team_id) return;

        const message = `A ${event.backup.type} backup has been assigned to Incident #${event.incident.id}.`;
        console.log("Medical backup automatically assigned to your team:", event);

        showInAppNotification({
            title: "Medical Backup Assigned",
            message,
            onClick: () => window.location.href = `/incidents/${event.incident.id}`,
        });
        saveNotification(currentUser.id, message);

        window.dispatchEvent(new CustomEvent("backupAutomaticallyAssigned", { detail: event }));
    });
};


/*---------------------FUNCTIONS---------------------*/


export const showInAppNotification = ({ title, message, actions }) => {
    window.dispatchEvent(
        new CustomEvent("inAppNotification", { detail: { title, message, actions } })
    );
};

const showNotification = (title, body) => {
    try {
        if (typeof Notification === "undefined") return;

        if (Notification.permission === "granted") {
            new Notification(title, { body, icon: LogoB });
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then((permission) => {
                if (permission === "granted") new Notification(title, { body, icon: LogoB });
            });
        }
    } catch (err) {
        console.log("Notification error:", err);
    }
};
