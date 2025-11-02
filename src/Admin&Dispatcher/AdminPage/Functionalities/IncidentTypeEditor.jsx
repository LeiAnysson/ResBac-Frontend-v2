import React, { useState, useEffect } from "react";
import { apiFetch } from "../../../utils/apiFetch";
import * as FaIcons from "react-icons/fa";
import { FaSave } from "react-icons/fa";
import { MdDelete, MdAdd} from "react-icons/md";
import "./IncidentTypeEditor.css";

const iconOptions = [
    { name: "FaFire", label: "Fire" },
    { name: "FaBomb", label: "Explosion" },
    { name: "FaHeartbeat", label: "Medical" },
    { name: "FaSkullCrossbones", label: "Poisoning" },
    { name: "FaUserInjured", label: "Trauma" },
    { name: "FaTint", label: "Flood" },
    { name: "FaWater", label: "Rescue" },
    { name: "FaMountain", label: "Earthquake" },
    { name: "FaHouseDamage", label: "Building Collapse" },
    { name: "FaWind", label: "Disasters (Weather-Related)" },
    { name: "FaCarCrash", label: "Vehicular Accident" },
    { name: "FaPaw", label: "Animal Attack / Bite" },
    { name: "FaBolt", label: "Power Interruption" },
    { name: "FaExclamationTriangle", label: "General Hazard / Risk" },
    { name: "FaUsers", label: "Public Disturbance" },
    { name: "FaBiohazard", label: "Chemical / Biohazard" },
];

    const IncidentTypeEditor = ({ isOpen, onClose, refreshList }) => {
    const [incidentTypes, setIncidentTypes] = useState([]);
    const [newIncident, setNewIncident] = useState({ name: "", priority_id: "", icon: "" });
    const [priorities, setPriorities] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [open, setOpen] = useState(false);

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
            setNewIncident({ name: "", priority_id: "", icon: "" });
            alert("Incident type added!");
            fetchIncidentTypes();
            refreshList();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveAll = async () => {
        try {
            const updates = incidentTypes.filter(
            (i) => i.name && i.priority_id 
            );

            for (const incident of updates) {
                await apiFetch(`${process.env.REACT_APP_URL}/api/admin/incident-types/${incident.id}`, {
                    method: "PUT",
                    body: JSON.stringify({
                    name: incident.name,
                    priority_id: incident.priority_id,
                    icon: incident.icon || null,
                    }),
                });
            }

            alert("All changes saved!");
            fetchIncidentTypes();
            refreshList();
        } catch (err) {
            console.error(err);
            alert("Failed to save all changes.");
        }
        };

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return alert("No rows selected!");
        if (!window.confirm("Delete selected incident types?")) return;

        try {
            for (const id of selectedIds) {
                await apiFetch(`${process.env.REACT_APP_URL}/api/admin/incident-types/${id}`, {
                method: "DELETE",
                });
            }
            alert("Selected incident types deleted!");
            setSelectedIds([]);
            fetchIncidentTypes();
            refreshList();
        } catch (err) {
        console.error(err);
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const IconDropdown = ({ value, onChange }) => {
        const [open, setOpen] = useState(false);

        const handleSelect = (iconName) => {
            onChange(iconName);
            setOpen(false);
        };

        const SelectedIcon = value ? FaIcons[value] : null;

        return (
            <div className="icon-dropdown">
            <div
                className="icon-dropdown-selected"
                onClick={() => setOpen(!open)}
            >
                {SelectedIcon ? (
                <SelectedIcon className="icon-preview" />
                ) : (
                <div className="icon-placeholder">+</div>
                )}
            </div>

            {open && (
                <div className="icon-dropdown-list">
                {iconOptions.map((opt) => {
                    const IconComp = FaIcons[opt.name];
                    return (
                    <div
                        key={opt.name}
                        className="icon-dropdown-item"
                        onClick={() => handleSelect(opt.name)}
                    >
                        <IconComp className="icon-preview" />
                    </div>
                    );
                })}
                </div>
            )}
            </div>
        );
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
                        <th></th>
                        <th>Name</th>
                        <th>Icon</th>
                        <th>Priority</th>
                    </tr>
                    </thead>
                    <tbody>
                    {incidentTypes.map((incident) => (
                        <tr key={incident.id}>
                        <td>
                            <input
                            type="checkbox"
                            checked={selectedIds.includes(incident.id)}
                            onChange={() => toggleSelect(incident.id)}
                            />
                        </td>
                        <td>
                            <input
                            type="text"
                            value={incident.name}
                            onChange={(e) =>
                                setIncidentTypes((prev) =>
                                prev.map((i) =>
                                    i.id === incident.id ? { ...i, name: e.target.value } : i
                                ))
                            }
                            />
                        </td>
                        <td>
                            <IconDropdown
                                className="priority-select"
                                value={incident.icon}
                                onChange={(iconName) =>
                                    setIncidentTypes((prev) =>
                                    prev.map((i) =>
                                        i.id === incident.id ? { ...i, icon: iconName } : i
                                    )
                                    )
                                }
                            />
                        </td>
                        <td>
                            <select
                            className="priority-select"
                            value={incident.priority_id || ""}
                            onChange={(e) =>
                                setIncidentTypes((prev) =>
                                prev.map((i) =>
                                    i.id === incident.id
                                    ? { ...i, priority_id: e.target.value }
                                    : i
                                ))
                            }
                            >
                            <option value="">Select Priority</option>
                            {priorities.map((p) => (
                                <option key={p.id} value={p.id}>
                                {p.priority_name} ({p.priority_level})
                                </option>
                            ))}
                            </select>
                        </td>
                        </tr>
                    ))}

                    <tr className="ie-new-row">
                        <td></td>
                        <td>
                        <input
                            type="text"
                            placeholder="New incident name"
                            value={newIncident.name}
                            onChange={(e) =>
                            setNewIncident({ ...newIncident, name: e.target.value })
                            }
                        />
                        </td>
                        <td>
                            <IconDropdown
                            className="priority-select"
                                value={newIncident.icon}
                                onChange={(iconName) =>
                                    setNewIncident({ ...newIncident, icon: iconName })
                                }
                            />
                        </td>
                        <td>
                        <select
                            className="priority-select"
                            value={newIncident.priority_id || ""}
                            onChange={(e) =>
                            setNewIncident({
                                ...newIncident,
                                priority_id: e.target.value,
                            })
                            }
                        >
                            <option value="">Select Priority</option>
                            {priorities.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.priority_name} ({p.priority_level})
                            </option>
                            ))}
                        </select>
                        </td>
                    </tr>
                    </tbody>
                </table>
                </div>

                <div className="ie-footer">
                    <button
                        className="btn-save-all"
                        onClick={handleSaveAll}
                    >
                        <FaSave className="card-icon" />
                    </button>
                    <button
                        className="btn-delete-all"
                        onClick={handleDeleteSelected}
                        disabled={selectedIds.length === 0}
                    >
                        <MdDelete className="card-icon" />
                    </button>
                    <button
                        className="btn-add"
                        onClick={handleAdd}
                        disabled={!newIncident.name || !newIncident.priority_id}
                    >
                        <MdAdd className="card-icon" />
                    </button>
                    <button className="ie-close-btn" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IncidentTypeEditor;
