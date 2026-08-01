import React from "react"
import "../Login/Login.scss"

import axios from "axios"
import { useState, useEffect } from "react"
const gioiThieu = ["/gioithieu.png"]
export const Register = () => {
  const [user, setUser] = useState({
    username: "",
    phone: "",
    password: "",
    email: "",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    try {
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
        <form action="">
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
