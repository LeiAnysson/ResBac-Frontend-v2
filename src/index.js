import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Echo from '@ably/laravel-echo';
import Ably from 'ably';

window.Ably = Ably;

window.initEcho = () => {
  if (window.Echo) {
    return window.Echo;
  }

  window.Echo = new Echo({
    broadcaster: 'ably',
    key: null,
    authEndpoint: "http://127.0.0.1:8000/api/ably-auth", 
    auth: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, 
        Accept: "application/json"
      }
    }
  }); 

  const ablyClient = window.Echo.connector.ably.connection;

  if (ablyClient) {
    ablyClient.on((stateChange) => {
      console.log("Ably connection state:", stateChange.current);
    });
  } else {
    console.error("Ably client not found inside Echo connector");
  }

  return window.Echo;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App initEcho={window.initEcho} />
  </React.StrictMode>
);

reportWebVitals();
