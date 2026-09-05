import React, { useEffect, useState } from "react"
import axiosInstance from "../../utils/axiosInstance"
import "./ModalEditUser.scss"

const ROLE_LABEL = {
  admin: "Admin",
  staff: "Nhân viên",
  user: "Khách hàng",
}

const STATUS_LABEL = {
  active: "Hoạt động",
  blocked: "Bị khóa",
  inactive: "Chưa kích hoạt",
}

const validateForm = (form) => {
  const errors = {}
  if (!form.username.trim()) errors.username = "Vui lòng nhập tên đăng nhập"
  return errors
}

const ModalEditUser = ({ user, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    username: user?.username || "",
    phone: user?.phone || "",
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!user) return null

  const handleClose = () => {
    if (isSubmitting) return
    onClose?.()
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  // Chỉ những field trong form (username, phone) có thay đổi mới cần gửi lên
  const isUnchanged =
    form.username.trim() === (user.username || "") &&
    form.phone.trim() === (user.phone || "")

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = validateForm(form)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }
    if (isUnchanged) {
      handleClose()
      return
    }

    setIsSubmitting(true)
    try {
      const response = await axiosInstance.patch(
        `${import.meta.env.VITE_APP_URL}/admin/users/update/${user._id}`,
        {
          username: form.username.trim(),
          phone: form.phone.trim(),
        },
      )
      onSuccess?.(
        response.data?.user || {
          username: form.username.trim(),
          phone: form.phone.trim(),
        },
      )
      onClose?.()
    } catch (error) {
      setErrors({
        submit: error.response?.data?.message || "Cập nhật người dùng thất bại",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div
        className="modal-box edit-user-modal"
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <div>
            <h3>Sửa người dùng</h3>
            <p>Chỉ có thể đổi tên đăng nhập và số điện thoại</p>
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
            <label>Email</label>
            <input
              type="email"
              value={user.email || ""}
              disabled
              readOnly
            />
          </div>

          <div className="form-grid">
            <div className="form-row">
              <label>Vai trò</label>
              <input
                type="text"
                value={ROLE_LABEL[user.role] || user.role}
                disabled
                readOnly
              />
            </div>

            <div className="form-row">
              <label>Trạng thái</label>
              <input
                type="text"
                value={STATUS_LABEL[user.status] || user.status}
                disabled
                readOnly
              />
            </div>
          </div>

          <p className="edit-note">
            <i className="fa-solid fa-circle-info"></i>
            Muốn đổi vai trò hoặc khoá/mở khoá tài khoản, vui lòng dùng thao tác
            riêng ngoài bảng.
          </p>

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
                  <i className="fa-solid fa-spinner fa-spin"></i> Đang lưu...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-check"></i> Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalEditUser
