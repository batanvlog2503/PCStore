import React, { useEffect, useState } from "react"
import AddressModal from "./AddressModal.jsx"
import "./MyAddress.scss"
import axiosInstance from "../../../utils/axiosInstance.js"
const MyAddress = () => {
  const [addresses, setAddresses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    getAllAddresses()
    setIsLoading(false)
  }, [])
  // lấy hết địa chỉ
  const getAllAddresses = async () => {
    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_APP_URL}/address/all`,
      )

      setAddresses(response.data.addresses)

      setIsLoading(false)
    } catch (error) {
      alert("Lỗi khi lấy danh sách địa chỉ: " + error.message)
    }
  }
  // id đây là addressId được chọn làm mặc định, gửi lên backend để set default
  const handleSetDefault = async (id) => {
    try {
      // id này là id của address được chọn làm mặc định
      const response = await axiosInstance.patch(
        `${import.meta.env.VITE_APP_URL}/address/${id}/default`,
      )
      if (response.data.success) {
        setAddresses((prev) =>
          prev.map((addr) => ({
            ...addr,
            is_default: addr._id === id,
          })),
        )
      }
      alert(response.data.message || "Đặt địa chỉ mặc định thành công")
    } catch (error) {
      alert("Lỗi khi đặt địa chỉ mặc định: " + error.message)
    }
  }

  // thêm địa chỉ
  const handleAddAddress = async (formData) => {
    try {
      const response = await axiosInstance.post(
        `${import.meta.env.VITE_APP_URL}/address/add`,
        formData,
      )

      alert("Add address successfully")
    } catch (error) {
      alert(error.response?.data?.message || "Add address failed")
    }
  }
  // xóa địa chỉ

  const handleDeleteAddress = async (id) => {
    try {
      const response = await axiosInstance.delete(
        `${import.meta.env.VITE_APP_URL}/address/delete/${id}`,
      )
      alert("Xóa địa chỉ thành công")
      await getAllAddresses() // lấy lại danh sách mới
    } catch (error) {
      alert(error.response?.data?.message || "Xóa địa chỉ failed")
    }
  }

  return (
    <div className="container-fluid p-0 address">
      <div className="introduction">
        <div className="title left">
          <h3>Địa chỉ của tôi</h3>
          <p>Quản lý và cập nhật địa chỉ của bạn</p>
        </div>
        <div className="add-address right">
          <button onClick={() => setIsModalOpen(true)}>
            <i className="fa-solid fa-plus"></i> Thêm địa chỉ mới
          </button>
        </div>
      </div>

      <div className="number-address">
        <div className="icon">
          <i className="fa-solid fa-location-dot"></i>
        </div>
        <div className="number">
          <h5>Bạn có {addresses.length} địa chỉ nhận hàng</h5>
          <p>Chọn địa chỉ mặc định để sử dụng khi thanh toán</p>
        </div>
      </div>

      <div className="addresses">
        {isLoading && <p className="empty-state">Đang tải địa chỉ...</p>}

        {!isLoading && addresses.length === 0 && (
          <p className="empty-state">
            Bạn chưa có địa chỉ nào. Hãy thêm địa chỉ đầu tiên!
          </p>
        )}

        {addresses.map((a, index) => (
          <div
            key={a._id || index}
            className={`address-card ${a.is_default ? "is-default" : ""}`}
          >
            {a.is_default && (
              <span className="default-tag">
                <i className="fa-solid fa-circle-check"></i> Địa chỉ mặc định
              </span>
            )}

            <h4>{a.receiver_name}</h4>
            <p>
              <i className="fa-solid fa-phone"></i> {a.phone}
            </p>
            <p>
              <i className="fa-solid fa-location-dot"></i> {a?.detail},{" "}
              {a?.ward}, {a?.district}, {a?.province}
            </p>

            <div className="address-actions">
              {!a.is_default && (
                <button
                  className="set-default"
                  onClick={() => handleSetDefault(a._id)}
                >
                  Đặt làm mặc định
                </button>
              )}
              <button className="edit">
                <i className="fa-solid fa-pen"></i> Sửa
              </button>
              <button
                className="delete"
                onClick={() => {
                  handleDeleteAddress(a._id)
                }}
              >
                <i className="fa-solid fa-trash"></i> Xoá
              </button>
            </div>
          </div>
        ))}
      </div>

      <AddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddAddress}
      />
    </div>
  )
}

export default MyAddress
