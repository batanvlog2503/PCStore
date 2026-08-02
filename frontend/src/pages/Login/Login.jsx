import React from "react"
import "./Login.scss"
import axiosInstance from "../../utils/axiosInstance"
const gioiThieu = ["/gioithieu.png"]
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
export const Login = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState({
    password: "",
    email: "",
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axiosInstance.post(
        `${import.meta.env.VITE_APP_URL}/auth/login`,
        user,
      )

      const accessToken = response.data.accessToken
      const refreshToken = response.data.refreshToken
      console.log(response.data.user)
      if (response.data.accessToken) {
        console.log("Have an Access Token")
      }
      const userData = response.data.user
      if (response.data.success) {
        console.log("Login SuccessFully", response.data.message)
        localStorage.setItem("accessToken", accessToken)
        localStorage.setItem("refreshToken", refreshToken)
        localStorage.setItem("user", JSON.stringify(userData))
        alert("Login Successfully")
        navigate("/")
      }
    } catch (error) {
      alert(error.response?.data.message || "Error Submit Login")
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
          <label htmlFor="">Email</label>
          <br />
          <input
            type="email"
            value={user.email}
            name="email"
            className="email input"
            onChange={handleInputChange}
            placeholder="Nhập email của bạn"
            required
          />

          <label htmlFor="">Mật khẩu</label>
          <br />
          <input
            type="password"
            value={user.password}
            name="password"
            onChange={handleInputChange}
            className="password input"
            placeholder="Vui lòng nhập mật khẩu"
            required
          />
          <button type="submit">Đăng nhập</button>
        </form>
        <a href="">Quên mật khẩu</a>

        <p onClick={() => navigate("/register")}>
          Bạn chưa có tài khoản? <a href="">Đăng kí ngay</a>
        </p>
        <p>
          Mua sắm và sửa chữa tại <b>PC Store</b>
        </p>
      </div>
    </div>
  )
}
