import { useNavigate } from "react-router-dom";
import NavBar from "../../Components/ComponentsNavBar/NavBar";
import TopBar from "../../Components/ComponentsTopBar/TopBar";
import "./AdminReportsHistory.css";
import React, { useState, useEffect } from "react";
import { printTable } from "../../utils/printTable";
import { apiFetch } from '../../utils/apiFetch';

const AdminReportsHistory = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
    const [search, setSearch] = useState("");
    const [selectedReports, setSelectedReports] = useState([]);
    const [filters, setFilters] = useState({ incident_type: "", status: "", team: "" });
    const [incidentTypes, setIncidentTypes] = useState([]);

    const fetchReports = async (page = 1, searchQuery = "", filters = {}) => {
        try {
            const params = new URLSearchParams({ page });
            
            if (searchQuery) params.append("search", searchQuery);
            if (filters.incident_type) params.append("incident_type", filters.incident_type);
            if (filters.status) params.append("status", filters.status);
            if (filters.team) params.append("team", filters.team);

            const response = await fetch(
            `${process.env.REACT_APP_URL}/api/admin/reports/all?${params.toString()}`,
            {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            }
            );

            const data = await response.json();
            setReports(data.data || []);
            setPagination({ current_page: data.current_page, last_page: data.last_page });
        } catch (error) {
            console.error("Failed to fetch reports:", error);
        }
    };

    const fetchIncidentTypes = async () => {
        try {
            const data = await apiFetch(`${process.env.REACT_APP_URL}/api/admin/incident-types/all`);
            setIncidentTypes(data.data || data);
        } catch (err) {
            console.error("Failed to fetch incident types:", err);
        }
    };

    useEffect(() => {
        fetchIncidentTypes();
    }, []);

    useEffect(() => {
        const delay = setTimeout(() => {
        fetchReports(1, search, filters);
        }, 300);

        return () => clearTimeout(delay);
    }, [search, filters]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.last_page) fetchReports(newPage);
    };

    const toggleSelect = (id) => {
        setSelectedReports((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedReports.length === reports.length) setSelectedReports([]);
        else setSelectedReports(reports.map((r) => r.id));
    };

    const handlePrintSelected = async () => {
        if (selectedReports.length === 0) {
        alert("No reports selected for printing.");
        return;
        }

        try {
        const response = await fetch(`${process.env.REACT_APP_URL}/api/admin/reports/all`, {
            method: "GET",
            headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            Accept: "application/json",
            },
        });

        const data = await response.json();

        const filtered = (data.data || []).filter((r) => selectedReports.includes(r.id));

        const formattedData = filtered.map((report) => {
            const statusHistory = (report.status_logs || [])
            .map((s) => `${s.status} (${new Date(s.created_at).toLocaleString()})`)
            .join("\n↓\n");

            return {
            ...report,
            status_history: statusHistory,
            team_name: report.team_name,
            };
        });

        const columns = [
            { header: "Incident Type", key: "incident_type" },
            { header: "Resident", key: "resident_name" },
            { header: "Landmark", key: "landmark" },
            { header: "Latitude", key: "latitude" },
            { header: "Longitude", key: "longitude" },
            { header: "Status History", key: "status_history" },
            { header: "Team Assigned", key: "team_name" },
            { header: "Reporter Type", key: "reporter_type" },
            { header: "Date Reported", key: "created_at" },
        ];

        printTable(formattedData, columns, "Detailed Emergency Incident Reports");
        } catch (error) {
        console.error("Error generating selected report PDF:", error);
        }
    };
    
    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    return (
        <div className="admin-dashboard-container">
        <TopBar />
        <div className="dashboard-main-content">
            <NavBar />

            <main className="dashboard-content-area">
            <h1 className="emergency-reports-title">Reports History</h1>

            <div className="emergency-reports-card">
                <div className="emergency-reports-controls">
                    <input
                        className="search-input search-input-filled"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select className="h-filter-select" name="incident_type" value={filters.incident_type} onChange={handleFilterChange}>
                        <option value="">All Incident Types</option>
                        {incidentTypes.map((type) => (
                            <option key={type.id} value={type.name}>
                            {type.name}
                            </option>
                        ))}
                    </select>
                    <select className="h-filter-select" name="status" value={filters.status} onChange={handleFilterChange}>
                        <option value="">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Accepted">Accepted</option>
                        <option value="En Route">En Route</option>
                        <option value="On Scene">On Scene</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Invalid">Invalid</option>
                    </select>
                    <select className="h-filter-select" name="team" value={filters.team} onChange={handleFilterChange}>
                        <option value="">All Teams</option>
                        <option value="Alpha">Alpha</option>
                        <option value="Bravo">Bravo</option>
                        <option value="Charlie">Charlie</option>
                        <option value="Medical">Medical</option>
                    </select>
                    <button
                        className="h-print-btn"
                        onClick={handlePrintSelected}
                        style={{ marginLeft: "10px" }}
                    >
                        Print Selected
                    </button>
                </div>

                <div style={{ overflowX: "auto" }}>
                <table className="h-table">
                    <thead>
                    <tr>
                        <th>
                        <input
                            type="checkbox"
                            checked={reports.length > 0 && selectedReports.length === reports.length}
                            onChange={toggleSelectAll}
                        />
                        </th>
                        <th>ID</th>
                        <th>Incident Type</th>
                        <th>Resident</th>
                        <th>Landmark</th>
                        <th>Latitude</th>
                        <th>Longitude</th>
                        <th>Status History</th>
                        <th>Team Assigned</th>
                        <th>Reporter Type</th>
                        <th>Date Reported</th>
                    </tr>
                    </thead>

                    <tbody>
                    {reports.length === 0 ? (
                        <tr>
                        <td colSpan="11">No reports found</td>
                        </tr>
                    ) : (
                        reports.map((report) => (
                        <tr key={report.id}>
                            <td>
                            <input
                                type="checkbox"
                                checked={selectedReports.includes(report.id)}
                                onChange={() => toggleSelect(report.id)}
                            />
                            </td>
                            <td>{report.id}</td>
                            <td>{report.incident_type}</td>
                            <td>{report.resident_name}</td>
                            <td>{report.landmark || "—"}</td>
                            <td>{report.latitude || "—"}</td>
                            <td>{report.longitude || "—"}</td>
                            <td>
                            <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                                {report.status_history}
                            </pre>
                            </td>
                            <td>{report.team_name || "Unassigned"}</td>
                            <td>{report.reporter_type}</td>
                            <td>{new Date(report.created_at).toLocaleString()}</td>
                        </tr>
                        ))
                    )}
                    </tbody>
                </table>
                </div>

                <div className="emergency-reports-pagination">
                <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                    disabled={pagination.current_page === 1}
                >
                    &lt; Prev
                </button>

                <span>
                    Page <b>{pagination.current_page}</b> of {pagination.last_page}
                </span>

                <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(pagination.current_page + 1)}
                    disabled={pagination.current_page === pagination.last_page}
                >
                    Next &gt;
                </button>
                </div>
            </div>
            </main>
        </div>
        </div>
    );
};

export default AdminReportsHistory;
