import React from "react"
import { NavLink } from "react-router-dom"
import "./Sidebar.scss"
import axiosInstance from "../../../utils/axiosInstance.js"
import { items } from "./items.js"
const Sidebar = () => {
  const handleLogout = async (e) => {
    e.preventDefault()
    try {
      await axiosInstance.post(`${import.meta.env.VITE_APP_URL}/auth/logout`, {
        refreshToken: localStorage.getItem("refreshToken"),
      })

      alert("Đăng xuất thành công")
      localStorage.removeItem("user")
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      window.location.href = "/login"
    } catch (err) {
      alert("Có lỗi xảy ra khi đăng xuất")
    }
  }

  return (
    <div className="container-fluid sidebar-information p-0">
      <div className="feature">
        <ul className="list-feature row">
          {items.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <i className={item.icon}></i>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}

          <hr />

          <li
            className="logout"
            onClick={handleLogout}
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>Đăng xuất</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Sidebar
