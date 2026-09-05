import React, { useState } from "react"
import { Outlet } from "react-router-dom"
import AdminSidebar from "../../admin/AdminSidebar/AdminSidebar"
import "./AdminLayout.scss"

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // dùng cho mobile (off-canvas)

  const closeSidebar = () => setIsSidebarOpen(false)

  return (
    <div className="admin-layout">
      {/* ================= HEADER ================= */}
      <header className="admin-header">
        <button
          className="sidebar-toggle"
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          aria-label="Mở/đóng menu"
        >
          <i className="fa-solid fa-bars"></i>
        </button>

        <div className="admin-brand">
          <span className="brand-icon">
            <i className="fa-solid fa-cube"></i>
          </span>
          <span className="brand-text">PC Store Admin</span>
        </div>

        <div className="admin-header-actions">
          <button
            className="header-icon-btn"
            title="Thông báo"
          >
            <i className="fa-regular fa-bell"></i>
            <span className="notif-dot"></span>
          </button>

          <div className="admin-account">
            <div className="avatar">A</div>
            <span className="admin-name">Admin</span>
          </div>
        </div>
      </header>

      <div className="admin-body">
        {/* ================= OVERLAY (mobile, khi sidebar mở) ================= */}
        {isSidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={closeSidebar}
          ></div>
        )}

        {/* ================= SIDEBAR ================= */}
        <AdminSidebar
          isSidebarOpen={isSidebarOpen}
          onCloseSidebar={closeSidebar}
        />

        {/* ================= NỘI DUNG ================= */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
