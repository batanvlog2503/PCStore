import React, { useCallback, useEffect, useState } from "react"
import axiosInstance from "../../utils/axiosInstance.js"
import { toast } from "../../pages/Toast/Toast.jsx"
import BrandList from "./BrandList.jsx"
import BrandFormPanel from "./BrandFormPanel.jsx"
import "./ManagementBrand.scss"

const ManagementBrand = () => {
  const [brands, setBrands] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getBrands = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_APP_URL}/brand/admin/all`,
      )
      setBrands(response.data.brands || [])
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không tải được danh sách thương hiệu",
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    getBrands()
  }, [getBrands])

  // ================= CRUD =================

  const handleOpenCreate = () => {
    setEditingBrand(null)
    setIsPanelOpen(true)
  }

  const handleOpenEdit = (row) => {
    setEditingBrand(row)
    setIsPanelOpen(true)
  }

  const handleClosePanel = () => {
    if (isSubmitting) return
    setIsPanelOpen(false)
    setEditingBrand(null)
  }

  const handleSubmitBrand = async (formData) => {
    try {
      setIsSubmitting(true)

      if (editingBrand) {
        await axiosInstance.put(
          `${import.meta.env.VITE_APP_URL}/brand/admin/update/${editingBrand._id}`,
          formData,
        )
        toast.success("Cập nhật thương hiệu thành công")
      } else {
        await axiosInstance.post(
          `${import.meta.env.VITE_APP_URL}/brand/admin/add`,
          formData,
        )
        toast.success("Thêm thương hiệu thành công")
      }

      setIsPanelOpen(false)
      setEditingBrand(null)
      await getBrands()
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          (editingBrand
            ? "Cập nhật thương hiệu thất bại"
            : "Thêm thương hiệu thất bại"),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (row) => {
    if (
      !window.confirm(
        `Xoá thương hiệu "${row.name}"? Hành động này không thể hoàn tác.`,
      )
    ) {
      return
    }

    try {
      await axiosInstance.delete(
        `${import.meta.env.VITE_APP_URL}/brand/admin/delete/${row._id}`,
      )
      toast.success("Đã xoá thương hiệu")
      await getBrands()
    } catch (error) {
      toast.error(error.response?.data?.message || "Xoá thương hiệu thất bại")
    }
  }

  return (
    <div className="management-brand">
      <div className={`mb-main ${isPanelOpen ? "mb-main--with-panel" : ""}`}>
        <BrandList
          rows={brands}
          isLoading={isLoading}
          onAddNew={handleOpenCreate}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />
      </div>

      {isPanelOpen && (
        <BrandFormPanel
          onClose={handleClosePanel}
          onSubmit={handleSubmitBrand}
          initialData={editingBrand}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  )
}

export default ManagementBrand
