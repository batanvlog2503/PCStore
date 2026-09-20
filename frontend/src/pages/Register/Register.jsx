import React, { useState } from "react"
import "../Login/Login.scss"
import axiosInstance from "../../utils/axiosInstance"
import { toast } from "../Toast/Toast"
import { useNavigate } from "react-router-dom"

const gioiThieu = ["/gioithieu.png"]

export const Register = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState({
    username: "",
    phone: "",
    password: "",
    email: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await axiosInstance.post(
        `${import.meta.env.VITE_APP_URL}/auth/register`,
        user,
      )

      if (response.data.success) {
        toast.success("Đăng ký thành công")
        navigate("/login")
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Đăng ký không thành công")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value })
  }

  return (
    <div className="container-fluid login p-0">
      <button
        type="button"
        className="back-home"
        onClick={() => navigate("/")}
      >
        <i className="fa-solid fa-arrow-left"></i>
        <span>Trang chủ</span>
      </button>
      <div className="privacy">
        <img
          src={gioiThieu[0]}
          alt=""
        />
      </div>
      <div className="form-login">
        <h2>Đăng ký PC Store</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={user.username}
            name="username"
            className="username input"
            placeholder="Username"
            onChange={handleInputChange}
            required
          />

          <label htmlFor="phone">Số điện thoại</label>
          <input
            id="phone"
            type="text"
            value={user.phone}
            name="phone"
            className="phone input"
            onChange={handleInputChange}
            placeholder="Nhập số điện thoại của bạn"
            required
          />

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={user.email}
            name="email"
            className="email input"
            required
            onChange={handleInputChange}
            placeholder="Email"
          />

          <label htmlFor="password">Mật khẩu</label>
          <input
            id="password"
            type="password"
            value={user.password}
            name="password"
            onChange={handleInputChange}
            className="password input"
            placeholder="Vui lòng nhập mật khẩu!"
            required
          />

          <button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang đăng ký..." : "Đăng Ký"}
          </button>
        </form>

        <p>
          Bạn đã có tài khoản?{" "}
          <a
            href="/login"
            onClick={(e) => {
              e.preventDefault()
              navigate("/login")
            }}
          >
            Đăng nhập ngay
          </a>
        </p>
        <p>
          Mua sắm và sửa chữa tại <b>PC Store</b>
        </p>
      </div>
    </div>
  )
}
