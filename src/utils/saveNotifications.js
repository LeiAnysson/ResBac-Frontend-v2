export const saveNotification = async ({ user_id, team_id, message }) => {
  try {
    await fetch(`${process.env.REACT_APP_URL}/api/notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ user_id, team_id, message }),
    });
  } catch (err) {
    console.error("Failed to save notification:", err);
  }
};