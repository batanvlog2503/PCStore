import React, { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { NAV_ITEMS } from "./NAV_ITEMS"

const AdminSidebar = ({ isSidebarOpen, onCloseSidebar }) => {
  const navigate = useNavigate()
  const [openSubmenu, setOpenSubmenu] = useState("Sản phẩm") // menu con đang mở, mặc định mở sẵn "Sản phẩm"

  const toggleSubmenu = (label) => {
    setOpenSubmenu((prev) => (prev === label ? null : label))
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    navigate("/login")
  }

  return (
    <aside className={`admin-sidebar ${isSidebarOpen ? "open" : ""}`}>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) =>
          item.children ? (
            <div
              className="nav-group"
              key={item.label}
            >
              <button
                className={`nav-parent ${
                  openSubmenu === item.label ? "expanded" : ""
                }`}
                onClick={() => toggleSubmenu(item.label)}
              >
                <i className={item.icon}></i>
                <span>{item.label}</span>
                <i className="fa-solid fa-chevron-down chevron"></i>
              </button>

              <div
                className={`nav-submenu ${
                  openSubmenu === item.label ? "open" : ""
                }`}
              >
                <ul>
                  {item.children.map((child) => (
                    <li key={child.to}>
                      <NavLink
                        to={child.to}
                        end
                        className={({ isActive }) => (isActive ? "active" : "")}
                        onClick={onCloseSidebar}
                      >
                        {child.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
              onClick={onCloseSidebar}
            >
              <i className={item.icon}></i>
              <span>{item.label}</span>
            </NavLink>
          ),
        )}
      </nav>

      <button
        className="logout-btn"
        onClick={handleLogout}
      >
        <i className="fa-solid fa-right-from-bracket"></i>
        <span>Đăng xuất</span>
      </button>
    </aside>
  )
}

export default AdminSidebar
