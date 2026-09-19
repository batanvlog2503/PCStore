import React, { useEffect, useState } from "react"
import AddressModal from "./AddressModal.jsx"
import "./MyAddress.scss"
import axiosInstance from "../../../utils/axiosInstance.js"
import { toast } from "../../Toast/Toast.jsx"

const MyAddress = () => {
  const [addresses, setAddresses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)

  useEffect(() => {
    getAllAddresses()
  }, [])

  const getAllAddresses = async () => {
    try {
      setIsLoading(true)
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_APP_URL}/address/all`,
      )
      setAddresses(response.data.addresses)
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Lỗi khi lấy danh sách địa chỉ",
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetDefault = async (id) => {
    try {
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
      toast.success(response.data.message || "Đặt địa chỉ mặc định thành công")
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Lỗi khi đặt địa chỉ mặc định",
      )
    }
  }

  const handleSubmitAddress = async (formData) => {
    try {
      if (editingAddress) {
        await axiosInstance.put(
          `${import.meta.env.VITE_APP_URL}/address/update/${editingAddress._id}`,
          formData,
        )
        toast.success("Cập nhật địa chỉ thành công")
      } else {
        await axiosInstance.post(
          `${import.meta.env.VITE_APP_URL}/address/add`,
          formData,
        )
        toast.success("Thêm địa chỉ thành công")
      }
      await getAllAddresses()
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra")
    }
  }

  const handleDeleteAddress = async (id) => {
    try {
      await axiosInstance.delete(
        `${import.meta.env.VITE_APP_URL}/address/delete/${id}`,
      )
      toast.success("Xóa địa chỉ thành công")
      await getAllAddresses()
    } catch (error) {
      toast.error(error.response?.data?.message || "Xóa địa chỉ thất bại")
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
              <button
                className="edit"
                onClick={() => {
                  setEditingAddress(a)
                  setIsModalOpen(true)
                }}
              >
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
        onClose={() => {
          setIsModalOpen(false)
          setEditingAddress(null)
        }}
        onSubmit={handleSubmitAddress}
        initialData={
          editingAddress
            ? {
                receiver_name: editingAddress.receiver_name,
                phone: editingAddress.phone,
                province: editingAddress.province,
                district: editingAddress.district,
                ward: editingAddress.ward,
                detail: editingAddress.detail,
                is_default: editingAddress.is_default,
              }
            : null
        }
      />
    </div>
  )
}

export default MyAddress
