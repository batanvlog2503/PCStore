import React, { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import "./Header.scss"
import axiosInstance from "../../../utils/axiosInstance.js"
export const Header = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Đọc user đã lưu trong localStorage khi component mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        setUser(null)
      }
    }
  }, [])

  // Click ra ngoài dropdown -> tự đóng lại
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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
    <div className="container-fluid p-0 header">
      <div className="header-top p-0">
        <div className="row">
          <div className="header-top-1">
            <div className="in-header-top hotline">
              <i className="fa-solid fa-phone"></i> Hotline: 0947.584.056
            </div>
            <div className="in-header-top email">
              <i className="fa-solid fa-at"></i> Email: tanden1367@gmail.com
            </div>
          </div>
          <div className="header-top-2">
            <div className="in-header-top freeship">
              <i className="fa-solid fa-cart-arrow-down"></i> Miễn phí giao hàng
              cho đơn hàng từ 2 củ.
            </div>
          </div>
          <div className="header-top-3">
            <div className="in-header-top map">
              <i className="fa-solid fa-location-crosshairs"></i> Hệ thống cửa
              hàng
            </div>

            {/* Chưa đăng nhập -> hiện link Đăng nhập/Đăng kí như cũ */}
            {!user && (
              <Link
                to="/login"
                className="in-header-top register"
              >
                <i className="fa-solid fa-user"></i> Đăng nhập/Đăng kí
              </Link>
            )}

            {/* Đã đăng nhập -> hiện tên + dropdown tài khoản */}
            {user && (
              <div
                className="account"
                ref={dropdownRef}
                onClick={() => setIsDropdownOpen((prev) => !prev)}
              >
                <div className="in-header-top account-trigger">
                  <i className="fa-solid fa-circle-user"></i>
                  {user.username}
                  <i
                    className={`fa-solid fa-chevron-down chevron ${
                      isDropdownOpen ? "open" : ""
                    }`}
                  ></i>
                </div>

                <ul
                  className={`account-dropdown ${isDropdownOpen ? "show" : ""}`}
                >
                  <li>
                    <Link to="/account">
                      <i className="fa-solid fa-id-card"></i> Thông tin tài
                      khoản
                    </Link>
                  </li>
                  <li>
                    <Link to="/account/orders">
                      <i className="fa-solid fa-box"></i> Đơn hàng của tôi
                    </Link>
                  </li>
                  <li>
                    <Link to="/account/wishlist">
                      <i className="fa-regular fa-heart"></i> Yêu thích
                    </Link>
                  </li>
                  <li>
                    <Link to="/account/addresses">
                      <i className="fa-solid fa-location-dot"></i> Địa chỉ của
                      tôi
                    </Link>
                  </li>
                  <li className="divider"></li>
                  <li
                    onClick={handleLogout}
                    className="logout"
                  >
                    <i className="fa-solid fa-right-from-bracket"></i> Đăng xuất
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="header-middle p-0">
        <div className="header-middle-1 logo">
          <div className="image">
            <img
              width="50"
              height="auto"
              src="/logo1.jpg"
              alt="PC Store Logo"
            />
          </div>
          <div
            className="title"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          >
            <h4>PC Store</h4>
            <p>Technology For Life</p>
          </div>
        </div>
        <div className="header-middle-2 search"></div>
        <div className="header-middle-3">
          <div className="love">
            <i className="fa-regular fa-heart"></i> <span>Yêu thích</span>
          </div>
          <div className="my-cart">
            <Link
              to="/cart"
              style={{ color: "white", textDecoration: "none" }}
              className="navigate-cart"
            >
              <i className="fa-solid fa-cart-shopping"></i>{" "}
              <span>Giỏ hàng</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="header-bottom p-0">
        <div className="dropdown">
          <ul className="list">
            <li>Trang chủ</li>
            <li>Sản phẩm</li>
            <li>PC Build</li>
            <li>Khuyến mãi</li>
            <li>Tin Tức</li>
            <li>Liên hệ</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
