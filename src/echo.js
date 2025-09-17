import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

let echoInstance = null;

export const getEcho = () => {
  if (!echoInstance) {
    const token = localStorage.getItem("token") || ""; 
    echoInstance = new Echo({
      broadcaster: "pusher",
      key: process.env.REACT_APP_ABLY_KEY,
      wsHost: "realtime-pusher.ably.io",
      wsPort: 443,
      wssPort: 443,
      forceTLS: true,
      disableStats: true,
      cluster: "mt1",
      authEndpoint: "http://127.0.0.1:8000/broadcasting/auth",
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    });
  }
  return echoInstance;
};
