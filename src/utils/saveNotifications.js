export const saveNotification = async ({ user_id, team_id, message }) => {
  try {
    const payload = { message };

    if (user_id) payload.user_id = user_id;
    if (team_id) payload.team_id = team_id;

    await fetch(`${process.env.REACT_APP_URL}/api/notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("Failed to save notification:", err);
  }
};
