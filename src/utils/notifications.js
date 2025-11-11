import Echo from "@ably/laravel-echo";
import Ably from "ably";
import LogoB from "../assets/LogoB.png";
import { saveNotification } from "./saveNotifications";
import { apiFetch } from "./apiFetch";

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
            saveNotification({ user_id: currentUser.id, message });

            window.dispatchEvent(new CustomEvent("incidentCallCreated", { detail: event }));
        }
    });

    window.Echo.channel("dispatcher").listen(".CallEnded", (event) => {
        window.dispatchEvent(new CustomEvent("callEnded", { detail: event }));
    });

    window.Echo.channel("dispatcher").listen(".CallAlreadyAccepted", (event) => {
        console.log("Another dispatcher already accepted this call:", event.call_id);
        window.dispatchEvent(new CustomEvent("callAlreadyAccepted", { detail: event }));
    });

    window.Echo.channel("dispatcher").listen(".DuplicateReportCreated", (event) => {
        if (event.target_role === 2 && currentUser.role_id === 2) {
            const message = `Incident #${event.duplicate.incident_id} has duplicate reports. Total: ${event.duplicate.duplicate_count}`;
            console.log("Duplicate report detected for dispatcher:", event);

            showNotification("Duplicate Report Detected", message);
            showInAppNotification({ title: "Duplicate Report Detected", message });
            saveNotification({ user_id: currentUser.id, message });

            window.dispatchEvent(new CustomEvent("duplicateReportCreated", { detail: event.duplicate }));
        }
    });

    window.Echo.channel("dispatcher").listen(".IncidentStatusUpdated", (event) => {
        if (!event.target_roles?.includes(currentUser.role_id)) return;
        console.log("[dispatcher] IncidentStatusUpdated received:", event);

        const { incident } = event;
        showInAppNotification({
            title: "Incident Status Updated",
            message: `Incident #${incident.id} is now "${incident.status}".`,
            actions: [
                { label: "View Incident", path: `/dispatcher/emergency-reports/${incident.id}` }
            ]
        });
    });

    window.Echo.channel("dispatcher").listen(".BackupRequestCreated", async (event) => {
        if (event.target_role !== 2 || currentUser.role_id !== 2) return;

        console.log("[dispatcher] BackupRequestCreated:", event);

        const incidentId = event.incident_id ?? event.incident?.id ?? null;
        const backupId = event.backup_id ?? event.backup?.id ?? null;
        const backupType = event.backup_type ?? event.backup?.backup_type ?? "lgu";

        const message = `LGU backup requested for Incident #${incidentId}.`;

        const actions = [];

        if (backupType === "lgu" && backupId) {
            actions.push({
                label: "Acknowledge",
                onClick: async () => {
                    try {
                        const data = await apiFetch(`${process.env.REACT_APP_URL}/api/incidents/backups/${backupId}/acknowledge`, {
                            method: "POST",
                        });

                        if (data.success) {
                            showInAppNotification({
                                title: "Backup Acknowledged",
                                message: `You have acknowledged the LGU backup request for Incident #${incidentId}.`,
                            });
                        }
                    } catch (err) {
                        console.error("Acknowledge failed:", err);
                    }
                },
            });
        }

        showInAppNotification({
            title: "Backup Request",
            message,
            persistent: true,
            actions,
        });

        saveNotification({ user_id: currentUser.id, message });
        window.dispatchEvent(new CustomEvent("backupRequestCreated", { detail: event }));
    });

    window.Echo.channel("dispatcher").listen(".BackupAutomaticallyAssigned", (event) => {
        if (!event.target_roles?.includes(currentUser.role_id)) return;
        const message = `A medical team has been automatically assigned to Incident #${event.incident.id} (${event.incident.incident_type}).`;
        console.log("Medical backup automatically assigned:", event);

        showInAppNotification({
            title: "Medic Backup Automatically Assigned",
            message,
            actions: [
                { label: "View Incident", path: `/dispatcher/emergency-reports/${event.incident.id}` }
            ]
        });
        saveNotification({ user_id: currentUser.id, message });

        window.dispatchEvent(new CustomEvent("backupAutomaticallyAssigned", { detail: event })); 
    });

    /* ---------------- RESIDENT NOTIFICATIONS ---------------- */

    window.Echo.channel("resident").listen(".CallAccepted", (event) => {
        if (event.target_role === 4 && event.reporter_id === currentUser.id) {
            const message = "A dispatcher is now handling your call.";
            console.log("Dispatcher accepted your call:", event);

            showNotification("Call Accepted", message);
            saveNotification({ user_id: currentUser.id, message });
        }
    });

    window.Echo.channel("resident").listen(".CallEnded", (event) => {
        window.dispatchEvent(new CustomEvent("callEnded", { detail: event }));
    });

    window.Echo.channel("responder-location").listen(".LocationUpdated", (event) => {
        console.log("Responder location update:", event);
        window.dispatchEvent(new CustomEvent("responderLocationUpdate", { detail: event }));
    });

    window.Echo.channel("resident").listen(".IncidentStatusUpdated", (event) => {
        if (!event.target_roles?.includes(currentUser.role_id)) return;
        if (event.incident.user_id !== currentUser.id) return;
        console.log("[resident] IncidentStatusUpdated received:", event);

        const { incident } = event;
        showInAppNotification({
            title: "Incident Status Updated",
            message: `The response team updated your incident status to "${incident.status}".`,
            actions: [
                { label: "View Incident", path: `/resident/waiting` }
            ]
        });
    });

    window.Echo.channel("resident").listen(".IncidentDetailsUpdated", (event) => {
        const incident = event.incident || {};
        const targetRoles = event.target_roles || [];

        if (currentUser.role_id !== 4) return;

        if (incident.user_id !== currentUser.id) return;

        if (targetRoles.length > 0 && !targetRoles.includes(currentUser.role_id)) return;

        showInAppNotification({
            title: "Incident Updated",
            message: `Your incident report has been updated by the dispatcher.`,
            actions: [
                { label: "View Details", path: `/resident/waiting` }
            ]
        });
    });


    /* ---------------- RESPONDER NOTIFICATIONS ---------------- */

    window.Echo.channel("responder").listen(".IncidentAssigned", (event) => {
        const incident = event.incident || {};
        const targetRole = event.target_role;
        const teamIdFromEvent = event.team_id;

        console.log("[responder] IncidentAssigned payload:", event, "currentUser.team_id:", currentUser.team_id);

        if (targetRole !== 3) return;

        const currentTeamId = currentUser.team_id ?? teamIdFromEvent;

        if (!currentTeamId || Number(teamIdFromEvent) !== Number(currentTeamId)) return;

        const incidentTypeName = incident.incident_type?.name || "Unknown Incident";
        const landmarkOrCoords = incident.landmark || `${incident.latitude}, ${incident.longitude}`;
        const message = `${incidentTypeName} reported at ${landmarkOrCoords}`;

        alert("IncidentAssigned received: " + message);

        showInAppNotification({
            title: "New Incident Assigned",
            message,
            actions: [
                { label: "View Incident", path: `/responder/reports/view-report/${incident.id}` }
            ],
        });

        saveNotification({ team_id: teamIdFromEvent, message });

        window.dispatchEvent(new CustomEvent("incidentAssigned", { detail: incident }));
    });

    window.Echo.channel("responder").listen(".IncidentDetailsUpdated", (event) => {
        if (currentUser.role_id !== 3) return;
        console.log("[responder] IncidentDetailsUpdated received:", event);

        const { incident } = event;
        if (!event.target_roles.includes(currentUser.role_id)) return;

        showInAppNotification({
            title: "Incident Details Updated",
            message: `Incident #${incident.id} has updated information.`,
            actions: [
                { label: "View Incident", path: `/responder/reports/view-report/${incident.id}` }
            ]
        });

        window.dispatchEvent(new CustomEvent("incidentDetailsUpdated", { detail: event.incident }));
    });

    window.Echo.channel("responder").listen(".BackupAcknowledged", (event) => {
        if (event.target_role !== currentUser.role_id) return;

        const message = `Dispatcher confirmed your ${event.backup_type} backup request for Incident #${event.incident.id}.`;
        console.log("Backup acknowledged:", event);

        showInAppNotification({
            title: "Backup Request Acknowledged",
            message,
            actions: [
                { label: "View Incident", path: `/responder/reports/view-report/${event.incident.id}` }
            ]
        });
        saveNotification({ team_id: event.team_id, message });

        window.dispatchEvent(new CustomEvent("backupAcknowledged", { detail: event }));
    });

    window.Echo.channel("responder").listen(".BackupAutomaticallyAssigned", (event) => {
        const teamId = event.team_id;
        if (!teamId || teamId !== currentUser.team_id) return;

        const backupType = event.backup?.backup_type ?? "medic";
        const message = `A ${backupType} backup has been assigned to Incident #${event.incident.id}.`;
        console.log("Medical backup automatically assigned to your team:", event);

        showInAppNotification({
            title: "Medical Backup Assigned",
            message,
            actions: [
                { label: "View Incident", path: `/responder/reports/view-report/${event.incident.id}` }
            ]
        });
        saveNotification({ team_id: teamId, message });

        window.dispatchEvent(new CustomEvent("backupAutomaticallyAssigned", { detail: event }));
    });


    /*---------------------ADMIN-----------------------*/

    
    window.Echo.channel("admin").listen(".UserRegistered", (event) => {
        console.log("UserRegistered received:", event);

        if (currentUser.role_id !== 1) return;

        const user = event.user;
        const message = `New resident registration: ${user.first_name} ${user.last_name}`;

        showInAppNotification({
            title: "New User Registration",
            message,
            actions: [
                { label: "Review", path: "/admin/users" }
            ],
        });
    });


    /*---------------------ANNOUNCEMENTS----------------------*/

    window.Echo.channel("announcements").listen(".AnnouncementPosted", (event) => {
        console.log("New announcement:", event);
        if (currentUser.role_id === 1 || currentUser.role_id === 3) return;

        const message = event.announcement?.title || "New announcement posted";

        showInAppNotification({
            title: "New Announcement",
            message,
            actions: [
                { label: "View", path: getAnnouncementPath(currentUser.role_id) }
            ],
        });
    });

};



/* ---------------- FUNCTIONS ---------------- */

export const showInAppNotification = ({ title, message, actions = [] }) => {
    if (!title && !message) return;

    const wrappedActions = actions.map(action => ({
        ...action,
        onClick: (...args) => {
            if (action.path) {
                window.dispatchEvent(new CustomEvent("navigateTo", { detail: { path: action.path } }));
            } else if (action.onClick) {
                action.onClick(...args);
            }
        }
    }));

    window.dispatchEvent(
        new CustomEvent("inAppNotification", { detail: { title, message, actions: wrappedActions } })
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

function getAnnouncementPath(roleId) {
    switch (roleId) {
        case 2: 
            return "/dispatcher/announcements";
        case 4: 
            return "/resident/announcement";
        default:
            return "/";
    }
}
