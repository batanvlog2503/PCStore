import React, { useEffect, useState } from "react"
import "./AddressModal.scss"

const EMPTY_FORM = {
  receiver_name: "",
  phone: "",
  province: "",
  district: "",
  ward: "",
  detail: "",
  is_default: false,
}

// initialData: truyền vào khi sửa địa chỉ có sẵn; bỏ trống (undefined) khi thêm mới
const AddressModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mỗi lần mở modal -> nạp lại data (sửa) hoặc reset trắng (thêm mới)
  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || EMPTY_FORM)
    }
  }, [isOpen, initialData])

  // Nhấn phím Esc -> đóng modal, tiện hơn phải rê chuột ra ngoài
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="address-modal-backdrop"
      onClick={onClose}
    >
      {/* Chặn click bên trong panel lan ra backdrop làm modal tự đóng */}
      <div
        className="address-modal-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{initialData ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}</h3>
          <button
            className="close-btn"
            onClick={onClose}
            type="button"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="receiver_name">Họ và tên người nhận</label>
            <input
              id="receiver_name"
              name="receiver_name"
              type="text"
              maxLength={100}
              required
              value={formData.receiver_name}
              onChange={handleChange}
              placeholder="Nhập họ và tên"
            />
          </div>

          <div className="form-row">
            <label htmlFor="phone">Số điện thoại</label>
            <input
              id="phone"
              name="phone"
              type="text"
              maxLength={20}
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
            />
          </div>

          <div className="form-grid">
            <div className="form-row">
              <label htmlFor="province">Tỉnh / Thành phố</label>
              <input
                id="province"
                name="province"
                type="text"
                maxLength={100}
                required
                value={formData.province}
                onChange={handleChange}
                placeholder="VD: Hà Nội"
              />
            </div>

            <div className="form-row">
              <label htmlFor="district">Quận / Huyện</label>
              <input
                id="district"
                name="district"
                type="text"
                maxLength={100}
                required
                value={formData.district}
                onChange={handleChange}
                placeholder="VD: Cầu Giấy"
              />
            </div>

            <div className="form-row ward-row">
              <label htmlFor="ward">Phường / Xã</label>
              <input
                id="ward"
                name="ward"
                type="text"
                maxLength={100}
                required
                value={formData.ward}
                onChange={handleChange}
                placeholder="VD: Dịch Vọng"
              />
            </div>
          </div>

          <div className="form-row">
            <label htmlFor="detail">Địa chỉ chi tiết</label>
            <input
              id="detail"
              name="detail"
              type="text"
              maxLength={255}
              required
              value={formData.detail}
              onChange={handleChange}
              placeholder="Số nhà, tên đường..."
            />
          </div>

          <label className="checkbox-row">
            <input
              type="checkbox"
              name="is_default"
              checked={formData.is_default}
              onChange={handleChange}
            />
            <span>Đặt làm địa chỉ mặc định</span>
          </label>

          <div className="modal-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="save-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang lưu..." : "Lưu địa chỉ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddressModal
