import React, { useEffect, useState } from "react"
import axiosInstance from "../../utils/axiosInstance"
import "./AddressSelectModal.scss"

// onConfirm(address) — trả về địa chỉ được chọn khi bấm "Xác nhận"
// onAddNew() — mở form thêm địa chỉ mới (tái dùng AddressModal đã có ở Profile)
const AddressSelectModal = ({ isOpen, onClose, onConfirm }) => {
  // list address
  const [addresses, setAddresses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  // selectedId là lựa chọn địa chỉ default
  const [selectedId, setSelectedId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const getAddresses = async () => {
    try {
      setIsLoading(true)
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_APP_URL}/address/all`,
      )
      const list = response.data.addresses || []
      setAddresses(list)

      // Mặc định chọn sẵn địa chỉ is_default, không có thì chọn cái đầu tiên
      const defaultAddr = list.find((a) => a.is_default) || list[0]
      setSelectedId(defaultAddr?._id || null)
    } catch (error) {
      alert(error.response?.data?.message || "Không tải được danh sách địa chỉ")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) getAddresses()
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  const handleConfirm = () => {
    const selected = addresses.find((a) => a._id === selectedId)
    if (!selected) return
    onConfirm(selected)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="address-select-backdrop"
      onClick={onClose}
    >
      <div
        className="address-select-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Chọn địa chỉ nhận hàng</h3>
          <button
            className="close-btn"
            onClick={onClose}
            type="button"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="address-select-body">
          {isLoading && <p className="empty-state">Đang tải địa chỉ...</p>}

          {!isLoading && addresses.length === 0 && (
            <p className="empty-state">Bạn chưa có địa chỉ nào được lưu.</p>
          )}

          {!isLoading &&
            addresses.map((a) => {
              const isDeleting = deletingId === a._id
              return (
                <div
                  key={a._id}
                  className={`address-option ${
                    selectedId === a._id ? "selected" : ""
                  } ${isDeleting ? "is-deleting" : ""}`}
                  onClick={() => !isDeleting && setSelectedId(a._id)}
                >
                  <span className="radio-dot"></span>

                  <div className="address-option-body">
                    {a.is_default && (
                      <span className="default-tag">Mặc định</span>
                    )}
                    <p className="receiver">
                      {a.receiver_name} &nbsp;&nbsp; {a.phone}
                    </p>
                    <p className="detail">
                      <i className="fa-solid fa-location-dot"></i> {a.detail},{" "}
                      {a.ward}, {a.district}, {a.province}
                    </p>
                  </div>

                  <div className="address-option-actions"></div>
                </div>
              )
            })}
        </div>

        <div className="modal-footer">
          <button
            className="cancel-btn"
            onClick={onClose}
          >
            Huỷ
          </button>
          <button
            className="confirm-btn"
            onClick={handleConfirm}
            disabled={!selectedId}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddressSelectModal
