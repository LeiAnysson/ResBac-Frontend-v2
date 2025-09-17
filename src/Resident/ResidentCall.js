import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ResidentCall.css";
import endCallIcon from "../assets/endcall.png";
import AgoraRTC from "agora-rtc-sdk-ng";
import { apiFetch } from "../utils/apiFetch";

const ResidentCall = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [incidentType, setIncidentType] = useState(location.state?.incidentType || "");
  const [callStatus, setCallStatus] = useState("calling");
  const [callDuration, setCallDuration] = useState(0);
  const [timerRef, setTimerRef] = useState(null);

  const residentId = localStorage.getItem("userId");
  const clientRef = useRef(null);
  const localAudioTrackRef = useRef(null);

  useEffect(() => {
    if (!incidentType) {
      navigate("/resident/report");
    }
  }, [incidentType, navigate]);

  useEffect(() => {
    if (!residentId) return;
    if (!window.echo) return;

    const privateChannel = `resident.${residentId}`;
    console.log(`Subscribing to channel: ${privateChannel}`);

    window.echo.private(privateChannel).listen(".CallAccepted", async (event) => {
      console.log("Call accepted by dispatcher:", event);

      try {
        const data = await apiFetch(
          `http://127.0.0.1:8000/api/agora/token?channel=incident_${event.id}&uid=${residentId}`
        );

        const { appID, token, channelName, uid } = data;

        clientRef.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

        await clientRef.current.join(appID, channelName, token, uid);

        localAudioTrackRef.current = await AgoraRTC.createMicrophoneAudioTrack();
        await clientRef.current.publish([localAudioTrackRef.current]);

        setCallStatus("connected");
      } catch (err) {
        console.error("Agora join error:", err);
      }
    });

    return () => {
      window.echo.leave(privateChannel);
      cleanupAgora();
    };
  }, [residentId]);


  useEffect(() => {
    if (callStatus === "connected") {
      const timer = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
      setTimerRef(timer);
      return () => clearInterval(timer);
    }
  }, [callStatus]);

  const cleanupAgora = async () => {
    try {
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.stop();
        localAudioTrackRef.current.close();
      }
      if (clientRef.current) {
        await clientRef.current.leave();
      }
    } catch (err) {
      console.error("Error cleaning up Agora:", err);
    }
  };

  const handleEndCall = async () => {
    if (timerRef) clearInterval(timerRef);
    await cleanupAgora();
    setCallStatus("ended");

    navigate("/resident/waiting", {
      state: {
        incidentType,
        callDuration,
        timestamp: new Date().toISOString(),
        fromSOS: location.state?.fromSOS || false,
      },
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="call-container">
      <div className="content-scroll">
        <div className="call-interface">
          <div className="call-info">
            <h1 className="caller-name">MDRRMO</h1>
            {callStatus === "calling" && <p className="call-status-text">Calling...</p>}
            {callStatus === "connected" && (
              <p className="call-duration">{formatTime(callDuration)}</p>
            )}
            {callStatus === "ended" && <p className="call-status-text">Call Ended</p>}
          </div>

          {callStatus !== "ended" && (
            <div className="call-controls">
              <button className="control-button end-call" onClick={handleEndCall}>
                <div className="control-icon">
                  <img src={endCallIcon} alt="End Call" className="control-img" />
                </div>
                <span className="control-label">End Call</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResidentCall;
