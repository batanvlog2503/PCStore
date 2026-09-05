import React, { useEffect, useState } from "react"
import axiosInstance from "../../utils/axiosInstance"

const INITIAL_FORM = {
  username: "",
  email: "",
  password: "",
  phone: "",
  role: "user",
  status: "active",
}

const validateForm = (form) => {
  const errors = {}
  if (!form.username.trim()) errors.username = "Vui lòng nhập tên đăng nhập"
  if (!form.email.trim()) {
    errors.email = "Vui lòng nhập email"
  } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
    errors.email = "Email không hợp lệ"
  }
  if (!form.password || form.password.length < 6) {
    errors.password = "Mật khẩu cần ít nhất 6 ký tự"
  }
  return errors
}

const ModalAddUser = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleClose = () => {
    if (isSubmitting) return
    onClose?.()
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = validateForm(form)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setIsSubmitting(true)
    try {
      const response = await axiosInstance.post(
        `${import.meta.env.VITE_APP_URL}/admin/add/users`,
        form,
      )
      alert(response.data.message)
    } catch (error) {
      setErrors({
        submit: error.response?.data?.message || "Thêm người dùng thất bại",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      <div
        className="modal-box add-user-modal"
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <div>
            <h3>Thêm người dùng</h3>
            <p>Tạo tài khoản mới cho hệ thống</p>
          </div>
          <button
            className="modal-close-btn"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Đóng"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form
          className="modal-body"
          onSubmit={handleSubmit}
        >
          <div className="form-grid">
            <div className="form-row">
              <label>
                Tên đăng nhập <span className="required">*</span>
              </label>
              <input
                type="text"
                placeholder="vd: nguyenvana"
                value={form.username}
                onChange={(e) => handleChange("username", e.target.value)}
                className={errors.username ? "has-error" : ""}
              />
              {errors.username && (
                <span className="field-error">{errors.username}</span>
              )}
            </div>

            <div className="form-row">
              <label>Số điện thoại</label>
              <input
                type="text"
                placeholder="09xxxxxxxx"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <label>
              Email <span className="required">*</span>
            </label>
            <input
              type="email"
              placeholder="email@example.com"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={errors.email ? "has-error" : ""}
            />
            {errors.email && (
              <span className="field-error">{errors.email}</span>
            )}
          </div>

          <div className="form-row">
            <label>
              Mật khẩu <span className="required">*</span>
            </label>
            <input
              type="password"
              placeholder="Ít nhất 6 ký tự"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className={errors.password ? "has-error" : ""}
            />
            {errors.password && (
              <span className="field-error">{errors.password}</span>
            )}
          </div>

          <div className="form-grid">
            <div className="form-row">
              <label>Vai trò</label>
              <select
                value={form.role}
                onChange={(e) => handleChange("role", e.target.value)}
              >
                <option value="user">Khách hàng</option>

                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="form-row">
              <label>Trạng thái</label>
              <select
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Chưa kích hoạt</option>
              </select>
            </div>
          </div>

          {errors.submit && (
            <div className="form-submit-error">
              <i className="fa-solid fa-circle-exclamation"></i>
              {errors.submit}
            </div>
          )}

          <div className="modal-footer">
            <button
              type="button"
              className="btn-cancel"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Huỷ
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Đang tạo...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-plus"></i> Tạo người dùng
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalAddUser
