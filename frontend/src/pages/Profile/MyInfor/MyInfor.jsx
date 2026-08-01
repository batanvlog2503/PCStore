import React, { useState } from "react"
import "./MyInfor.scss"
import axiosInstance from "../../../utils/axiosInstance"
const formatDate = (dateString) => {
  if (!dateString) return ""
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ""

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

const MyInfor = () => {
  const profile = JSON.parse(localStorage.getItem("user"))
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")))

  // Form phải là controlled input (có value + onChange) để user sửa được,
  // và để prefill sẵn dữ liệu hiện có từ localStorage

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault() // chặn form reload lại trang
    setIsSubmitting(true)
    try {
      const response = await axiosInstance.put(
        `${import.meta.env.VITE_APP_URL}/user/update/me`,
        { username: user.username, phone: user.phone },
      )
      const updatedUser = {
        ...user,
        ...response.data.user,
      }
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))
      alert(response.data.message || "Profile updated successfully")
    } catch (error) {
      alert(error.response?.data?.message || "Unable to update profile")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container-fluid p-0 my-infor">
      <h2>Thông tin của tôi</h2>
      <p>Quản lý và cập nhật thông tin tài khoản của bạn</p>

      <div className="information row">
        <div className="infor left-3">
          <div className="infor-top">
            <div className="avatar">
              {profile?.username
                ? profile.username.charAt(0).toUpperCase()
                : "?"}
            </div>
            <h3>{profile?.username || "Chưa có tên"}</h3>
            <span className="badge">Thành viên vàng</span>
          </div>

          <hr />

          <div className="infor-bottom">
            <div className="infor-row">
              <i className="fa-solid fa-envelope"></i>
              <span>{profile?.email || "Chưa cập nhật"}</span>
            </div>
            <div className="infor-row">
              <i className="fa-solid fa-phone"></i>
              <span>{profile?.phone || "Chưa cập nhật"}</span>
            </div>
            <div className="infor-row">
              <i className="fa-regular fa-calendar"></i>
              <span>Tham gia vào: {formatDate(user?.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="edit-info right-7">
          <h4>Thông tin cá nhân</h4>
          <form onSubmit={handleSubmit}>
            <div className="row-1">
              <div className="fullname">
                <label htmlFor="fullname">Họ và tên</label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={user?.username || ""}
                  onChange={handleChange}
                  placeholder="Nhập họ và tên"
                />
              </div>
            </div>

            <div className="row-2">
              <div className="email">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                />
                <small>Email dùng để đăng nhập, không thể thay đổi</small>
              </div>
            </div>

            <div className="row-3">
              <div className="phone">
                <label htmlFor="phone">Số điện thoại</label>
                <input
                  id="phone"
                  type="text"
                  name="phone"
                  value={user?.phone || ""}
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại"
                />
              </div>
            </div>

            <button
              type="submit"
              className="right-bottom submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang lưu..." : "Cập nhật thông tin"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default MyInfor
