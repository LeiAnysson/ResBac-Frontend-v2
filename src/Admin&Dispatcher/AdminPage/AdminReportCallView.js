import React, { useState, useEffect } from "react";
import ReportDetailsCard from "./Functionalities/ReportDetailsCard";
import CallPopup from "./Functionalities/CallPopup";
import { apiFetch } from '../../utils/apiFetch';

const AdminReportCallView = () => {
    const [report, setReport] = useState(null);
    const [callStatus, setCallStatus] = useState(null);
    const [showPopup, setShowPopup] = useState(false);

    const handleAnswer = async () => {
        setCallStatus("active");
        setShowPopup(false);

        try {
        const payload = {
            incident_type_id: 1,
            description: "Caller reported a fire in the area.",
            location: "Poblacion, Bocaue",
            caller_name: "Juan Dela Cruz",
            caller_phone: "+63 912 345 6789",
            priority_id: 1,
            landmark: "Near Barangay Hall",
        };

        const data = await apiFetch(`${process.env.REACT_APP_URL}/api/admin/incidents/accept-call`,
            {
            method: "POST",
            body: JSON.stringify(payload),
            }
        );

        console.log("Incident accepted:", data);

        setReport(data.incident);

        } catch (err) {
        console.error("Error accepting call:", err);
        setCallStatus("error");
        }
    };

    const handleDecline = () => {
        setCallStatus("declined");
        setReport(null);
        setShowPopup(false);
    };

    return (
        <div className="admin-report-call-view">
        {callStatus === "active" && report && (
            <>
            <ReportDetailsCard report={report} />
            <div className="floating-call-popup">
                <CallPopup
                show={true}
                onAnswer={handleAnswer}
                onDecline={handleDecline}
                caller={{ name: report.resident_name }}
                callStatus="active"
                />
            </div>
            </>
        )}

        {showPopup && callStatus === "incoming" && (
            <div className="floating-call-popup">
            <CallPopup
                show={true}
                onAnswer={handleAnswer}
                onDecline={handleDecline}
                caller={{ name: report?.resident_name }}
                callStatus="incoming"
            />
            </div>
        )}
        </div>
    );
};

export default AdminReportCallView;
