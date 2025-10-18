import React, { useState, useEffect } from "react";
import { apiFetch } from "../../../utils/apiFetch";
import "./IncidentTypeEditor.css";

const IncidentTypeEditor = ({ isOpen, onClose, refreshList }) => {
    const [incidentTypes, setIncidentTypes] = useState([]);
    const [newIncident, setNewIncident] = useState({ name: "", priority_id: "" });
    const [priorities, setPriorities] = useState([]);

    useEffect(() => {
        if (!isOpen) return;
        fetchIncidentTypes();
    }, [isOpen]);

    useEffect(() => {
        fetchPriorities();
    }, []);

    const fetchPriorities = async () => {
        const data = await apiFetch(`${process.env.REACT_APP_URL}/api/admin/priorities`);
        setPriorities(data.data || data);
    };

    const fetchIncidentTypes = async () => {
        const data = await apiFetch(`${process.env.REACT_APP_URL}/api/admin/incident-types/all`);
        setIncidentTypes(data.data || data); 
    };

    const handleAdd = async () => {
        if (!newIncident.name.trim()) return alert("Enter a name!");
        try {
        await apiFetch(`${process.env.REACT_APP_URL}/api/admin/incident-types`, {
            method: "POST",
            body: JSON.stringify(newIncident),
        });
        setNewIncident({ name: "", priority_id: "" });
        alert("Incident type added!");

        fetchIncidentTypes();
        refreshList();
        } catch (err) { console.error(err); }
    };

    const handleUpdate = async (id, updated) => {
        try {
        await apiFetch(`${process.env.REACT_APP_URL}/api/admin/incident-types/${id}`, {
            method: "PUT",
            body: JSON.stringify({
                name: updated.name,
                priority_id: updated.priority_id
            }),
        });
        alert("Incident type updated!");

        fetchIncidentTypes();
        refreshList();
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this incident type?")) return;
        try {
        await apiFetch(`${process.env.REACT_APP_URL}/api/admin/incident-types/${id}`, { method: "DELETE" });
        alert("Incident type deleted!");
        
        fetchIncidentTypes();
        refreshList();
        } catch (err) { console.error(err); }
    };

    if (!isOpen) return null;

    return (
        <div className="incident-editor-backdrop">
        <div className="incident-editor-modal">
            <div className="ie-header">
            <h3>Edit Incident Types</h3>
            </div>

            <div className="ie-table-container">
            <table className="ie-table">
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Priority</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {incidentTypes.map((incident) => (
                    <tr key={incident.id}>
                    <td>
                        <input
                        type="text"
                        value={incident.name}
                        onChange={(e) =>
                            setIncidentTypes(prev =>
                            prev.map(i => i.id === incident.id ? { ...i, name: e.target.value } : i)
                            )
                        }
                        />
                    </td>
                    <td>
                        <select
                            className="priority-select"
                            value={incident.priority_id || ""}
                            onChange={(e) =>
                            setIncidentTypes(prev =>
                                prev.map(i =>
                                i.id === incident.id ? { ...i, priority_id: e.target.value } : i
                                )
                            )
                            }
                        >
                            <option value="">Select Priority</option>
                            {priorities.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.priority_name} ({p.priority_level})
                            </option>
                            ))}
                        </select>
                    </td>
                    <td className="ie-actions">
                        <button className="btn-save" disabled={!incident.name || !incident.priority_id} onClick={() => handleUpdate(incident.id, incident)}>Save</button>
                        <button className="btn-delete" onClick={() => handleDelete(incident.id)}>Delete</button>
                    </td>
                    </tr>
                ))}

                <tr className="ie-new-row">
                    <td>
                        <input
                            type="text"
                            placeholder="New incident name"
                            value={newIncident.name}
                            onChange={(e) => setNewIncident({ ...newIncident, name: e.target.value })}
                        />
                    </td>
                    <td>
                        <select
                            className="priority-select"
                            value={newIncident.priority_id || ""}
                            onChange={(e) => setNewIncident({ ...newIncident, priority_id: e.target.value })}
                        >
                            <option value="">Select Priority</option>
                            {priorities.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.priority_name} ({p.priority_level})
                            </option>
                            ))}
                        </select>
                    </td>

                    <td className="ie-actions">
                    <button className="btn-save" onClick={handleAdd} disabled={!newIncident.name || !newIncident.priority_id}>Add</button>
                    </td>
                </tr>
                </tbody>
            </table>
            </div>

            <button className="ie-close-btn" onClick={onClose}>Close</button>
        </div>
        </div>
    );
};

export default IncidentTypeEditor;
