export const saveNotification = async (user_id, message) => {
  try {
    await fetch("/api/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id, message }),
    });
  } catch (err) {
    console.error("Failed to save notification:", err);
  }
};