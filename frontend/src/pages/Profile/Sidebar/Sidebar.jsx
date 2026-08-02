import React from "react"
import { OPTIONS } from "../Profile.jsx"
import "./Sidebar.scss"
import axiosInstance from "../../../utils/axiosInstance.js"
const Sidebar = ({ activeTab, onSelect }) => {
  const items = [
    {
      key: OPTIONS.INFO,
      label: "Thông tin của tôi",
      icon: "fa-solid fa-id-card",
    },
    { key: OPTIONS.ORDER, label: "Đơn hàng của tôi", icon: "fa-solid fa-box" },
    {
      key: OPTIONS.WISHLIST,
      label: "Đơn hàng yêu thích",
      icon: "fa-regular fa-heart",
    },
    {
      key: OPTIONS.ADDRESS,
      label: "Địa chỉ của tôi",
      icon: "fa-solid fa-location-dot",
    },
    {
      key: OPTIONS.LOG,
      label: "Lịch sử mua đồ",
      icon: "fa-solid fa-clock-rotate-left",
    },
  ]

  const handleLogout = async (e) => {
    e.preventDefault()
    try {
      const response = await axiosInstance.post(
        `${import.meta.env.VITE_APP_URL}/auth/logout`,
        {
          refreshToken: localStorage.getItem("refreshToken"),
        },
      )

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
            <li
              key={item.key}
              className={activeTab === item.key ? "active" : ""}
              onClick={() => onSelect(item.key)}
            >
              <i className={item.icon}></i>
              <span>{item.label}</span>
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
