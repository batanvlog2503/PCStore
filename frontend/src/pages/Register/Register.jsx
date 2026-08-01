import React from "react"
import "../Login/Login.scss"

import axios from "axios"
import axiosInstance from "../../utils/axiosInstance"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
const gioiThieu = ["/gioithieu.png"]
export const Register = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState({
    username: "",
    phone: "",
    password: "",
    email: "",
  })
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  })
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type })

    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" })
    }, 3000)
  }

  const [message, setMessage] = useState("")
  const [type, setType] = useState("")
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axiosInstance.post(
        `${import.meta.env.VITE_APP_URL}/auth/register`,
        user,
      )

      if (response.data.success) {
        console.log("Register SuccessFully", response.data.message)
        alert("Register Successfully")
        navigate("/login")
      }
    } catch (error) {
      alert(error.response?.data.message || "Error Submit Register")
    }
  }
  const handleInputChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value })
  }
  return (
    <div className="container-fluid login p-0">
      <div className="privacy">
        <img
          src={gioiThieu[0]}
          alt=""
        />
      </div>
      <div className="form-login">
        <h2>Đăng nhập PC Store</h2>
        <form
          action=""
          onSubmit={handleSubmit}
        >
          <label htmlFor="">Username</label>

          <input
            type="text"
            value={user.username}
            name="username"
            className="username input"
            placeholder="Username"
            onChange={handleInputChange}
            required
          />
          <label htmlFor="">Số điện thoại</label>

          <input
            type="text"
            value={user.phone}
            name="phone"
            className="phone input"
            onChange={handleInputChange}
            placeholder="Nhập số điện thoại của bạn"
            required
          />
          <label htmlFor="">Email</label>

          <input
            type="email"
            value={user.email}
            name="email"
            className="email input"
            required
            onChange={handleInputChange}
            placeholder="Email"
          />
          <label htmlFor="">Mật khẩu</label>

          <input
            type="password"
            value={user.password}
            name="password"
            onChange={handleInputChange}
            className="password input"
            placeholder="Vui lòng nhập mật khẩu !"
            required
          />
          <button type="submit">Đăng Ký</button>
        </form>
        <p>
          Bạn đã có tài khoản? <a href="">Đăng nhập ngay</a>
        </p>
        <p>
          Mua sắm và sửa chữa tại <b>PC Store</b>
        </p>
      </div>
    </div>
  )
}
