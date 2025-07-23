import React from "react";
import NavBar from "./ComponentsNavBar/NavBar";
import TopBar from "./ComponentsTopBar/TopBar";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="admin-page-container">
      <NavBar />
      <div className="admin-main-content">
        <TopBar />
        <Outlet />
      </div>
    </div>
  );
}
