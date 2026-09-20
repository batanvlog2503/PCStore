import React, { useEffect, useState } from "react"
import axiosInstance from "../../utils/axiosInstance.js"
import { toast } from "../../pages/Toast/Toast.jsx"
import ListVoucher from "./ListVoucher.jsx"
import VoucherFormModal from "./VoucherFormModal.jsx"
import "./ManagementVoucher.scss"

const LIMIT = 8

const ManagementVoucher = () => {
  const [vouchers, setVouchers] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    hidden: 0,
  })
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  const [search, setSearch] = useState("")
  const [voucherType, setVoucherType] = useState("all") // "all" | "product" | "shipping"
  const [statusFilter, setStatusFilter] = useState("all") // "all" | "active" | "not-started" | "expired" | "hidden"
  const [page, setPage] = useState(1)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVoucher, setEditingVoucher] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getVouchers = async (page) => {
    try {
      setIsLoading(true)
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_APP_URL}/voucher/all`,
        {
          params: {
            page,
            limit: LIMIT,
            search: search.trim() || undefined,
            voucher_type: voucherType === "all" ? undefined : voucherType,
            status: statusFilter === "all" ? undefined : statusFilter,
          },
        },
      )

      setVouchers(response.data.vouchers || [])
      setStats(response.data.stats)
      setTotal(response.data.pagination?.total ?? 0)
      setTotalPages(response.data.pagination?.totalPages ?? 1)
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không tải được danh sách voucher",
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(() => getVouchers(page), 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, voucherType, statusFilter])

  const handleOpenCreate = () => {
    setEditingVoucher(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (voucher) => {
    setEditingVoucher(voucher)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    if (isSubmitting) return
    setIsModalOpen(false)
    setEditingVoucher(null)
  }

  const handleSubmitVoucher = async (payload) => {
    try {
      setIsSubmitting(true)

      if (editingVoucher) {
        await axiosInstance.put(
          `${import.meta.env.VITE_APP_URL}/admin/voucher/update/${editingVoucher._id}`,
          payload,
        )
        console.log(payload)
        toast.success("Cập nhật voucher thành công")
      } else {
        await axiosInstance.post(
          `${import.meta.env.VITE_APP_URL}/admin/voucher/add`,
          payload,
        )
        toast.success("Tạo voucher thành công")
      }

      setIsModalOpen(false)
      setEditingVoucher(null)
      await getVouchers(page)
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          (editingVoucher
            ? "Cập nhật voucher thất bại"
            : "Tạo voucher thất bại"),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (voucher) => {
    if (
      !window.confirm(
        `Xoá voucher "${voucher.code}"? Hành động này không thể hoàn tác.`,
      )
    ) {
      return
    }
    try {
      await axiosInstance.delete(
        `${import.meta.env.VITE_APP_URL}/admin/voucher/delete/${voucher._id}`,
      )
      toast.success("Đã xoá voucher")

      // Nếu xoá hết voucher cuối cùng của trang hiện tại (page > 1), lùi
      // về trang trước để không bị đứng ở 1 trang rỗng.
      const isLastItemOnPage = vouchers.length === 1 && page > 1
      const nextPage = isLastItemOnPage ? page - 1 : page
      if (isLastItemOnPage) setPage(nextPage)
      await getVouchers(nextPage)
    } catch (error) {
      toast.error(error.response?.data?.message || "Xoá voucher thất bại")
    }
  }

  return (
    <div className="management-voucher">
      <ListVoucher
        vouchers={vouchers}
        stats={stats}
        isLoading={isLoading}
        search={search}
        onSearchChange={(v) => {
          setSearch(v)
          setPage(1)
        }}
        voucherType={voucherType}
        onVoucherTypeChange={(v) => {
          setVoucherType(v)
          setPage(1)
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(v) => {
          setStatusFilter(v)
          setPage(1)
        }}
        page={page}
        totalPages={totalPages}
        total={total}
        limit={LIMIT}
        onPageChange={setPage}
        onAddNew={handleOpenCreate}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      <VoucherFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitVoucher}
        initialData={editingVoucher}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}

export default ManagementVoucher
