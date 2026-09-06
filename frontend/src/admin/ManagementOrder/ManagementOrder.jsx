import React, { useEffect, useMemo, useState } from "react"
import "./ManagementOrder.scss"
import axiosInstance from "../../utils/axiosInstance.js"

import OrderFilter from "./components/OrderFilter.jsx"
import OrderTable from "./components/OrderTable.jsx"
import OrderStatusModal from "./components/OrderStatusModal.jsx"
import ModalOrderDetail from "./ModalOrderDetail.jsx"

const INITIAL_FILTERS = {
  search: "",
  status: "all",
  payment: "all",
  fromDate: "",
  toDate: "",
}

const ManagementOrder = () => {
  const [mounted, setMounted] = useState(false)

  // dữ liệu bảng
  const [orders, setOrders] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  // thống kê tổng quan
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    shipping: 0,
    completed: 0,
    cancelled: 0,
  })

  // filter (đang gõ, chưa submit) + filter đã áp dụng (dùng để gọi API)
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(INITIAL_FILTERS)

  // phân trang
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  // modal
  const [statusModalOrder, setStatusModalOrder] = useState(null)
  const [detailModalOrder, setDetailModalOrder] = useState(null)
  const [submittingStatus, setSubmittingStatus] = useState(false)

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(t)
  }, [])

  const getOrders = async () => {
    try {
      setLoading(true)

      const response = await axiosInstance.get(
        `${import.meta.env.VITE_APP_URL}/admin/orders`,
        {
          params: {
            page,
            limit,
            search: appliedFilters.search || undefined,
            status:
              appliedFilters.status === "all"
                ? undefined
                : appliedFilters.status,
            payment:
              appliedFilters.payment === "all"
                ? undefined
                : appliedFilters.payment,
            fromDate: appliedFilters.fromDate || undefined,
            toDate: appliedFilters.toDate || undefined,
          },
        },
      )
      setOrders(response.data.orders)
      setTotal(response.data.total)
      setStats(response.data.stats)
    } catch (error) {
      console.error("Lỗi lấy danh sách đơn hàng:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getOrders()
  }, [page, limit, appliedFilters])

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  const handleSearch = () => {
    setPage(1)
    setAppliedFilters(filters)
  }

  const handleReset = () => {
    setFilters(INITIAL_FILTERS)
    setAppliedFilters(INITIAL_FILTERS)
    setPage(1)
  }

  const handleExportExcel = () => {
    alert("Chức năng xuất Excel — nối API export khi backend sẵn sàng.")
  }
  const handleRefresh = () => {
    getOrders()
  }
  const handleUpdateStatus = async ({ orderId, newStatus }) => {
    try {
      setSubmittingStatus(true)

      const response = await axiosInstance.patch(
        `${import.meta.env.VITE_APP_URL}/admin/orders/${orderId}/status`,
        {
          status: newStatus,
        },
      )

      alert(response.data.message)

      setStatusModalOrder(null)

      await getOrders()
    } catch (error) {
      alert(error.response?.data?.message || "Cập nhật trạng thái thất bại")
    } finally {
      setSubmittingStatus(false)
    }
  }

  const handleCancel = async (order) => {
    if (!window.confirm(`Bạn có chắc muốn hủy đơn hàng ${order.order_code}?`)) {
      return
    }

    try {
      const response = await axiosInstance.patch(
        `${import.meta.env.VITE_APP_URL}/admin/orders/${order._id}/status`,
        {
          status: "cancelled",
        },
      )

      alert(response.data.message || "Hủy đơn hàng thành công")

      await getOrders()
    } catch (error) {
      alert(error.response?.data?.message || "Hủy đơn hàng thất bại")
    }
  }

  const STATS = [
    {
      key: "total",
      label: "Tổng đơn hàng",
      sub: "Tất cả đơn hàng",
      value: stats.total,
      icon: "fa-solid fa-file-invoice",
      tone: "purple",
    },
    {
      key: "pending",
      label: "Chờ xác nhận",
      sub: "Đơn chờ xử lý",
      value: stats.pending,
      icon: "fa-solid fa-house-chimney",
      tone: "orange",
    },
    {
      key: "shipping",
      label: "Đang giao",
      sub: "Đơn đang giao",
      value: stats.shipping,
      icon: "fa-solid fa-truck-fast",
      tone: "blue",
    },
    {
      key: "completed",
      label: "Hoàn thành",
      sub: "Đơn đã hoàn thành",
      value: stats.completed,
      icon: "fa-solid fa-circle-check",
      tone: "green",
    },
    {
      key: "cancelled",
      label: "Đã huỷ",
      sub: "Đơn đã huỷ",
      value: stats.cancelled,
      icon: "fa-solid fa-circle-xmark",
      tone: "red",
    },
  ]

  return (
    <div className={`management-order ${mounted ? "is-mounted" : ""}`}>
      {/* ===== HEADER ===== */}
      <div className="mo-header">
        <div className="mo-header-text">
          <h1>Quản lý đơn hàng</h1>
          <p>Quản lý và theo dõi tất cả đơn hàng trong hệ thống</p>
        </div>
        <div className="mo-header-actions">
          <button
            className="mo-export-btn"
            onClick={handleExportExcel}
          >
            <i className="fa-solid fa-file-export"></i> Xuất Excel
          </button>
          <button
            className="mo-refresh-btn"
            onClick={handleRefresh}
          >
            <i className="fa-solid fa-rotate-right"></i> Làm mới
          </button>
        </div>
      </div>

      {/* ===== STAT CARDS ===== */}
      <div className="mo-stat-cards">
        {STATS.map((s, i) => (
          <div
            className="mo-stat-card"
            key={s.key}
            style={{ transitionDelay: `${i * 70}ms` }}
          >
            <div className={`mo-stat-icon tone-${s.tone}`}>
              <i className={s.icon}></i>
            </div>
            <div className="mo-stat-body">
              <span className="mo-stat-label">{s.label}</span>
              <span className="mo-stat-value">
                {s.value.toLocaleString("vi-VN")}
              </span>
              <span className="mo-stat-sub">{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ===== FILTER ===== */}
      <OrderFilter
        filters={filters}
        onChange={handleFilterChange}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      {/* ===== TABLE ===== */}
      <OrderTable
        orders={orders}
        loading={loading}
        page={page}
        limit={limit}
        total={total}
        onPageChange={setPage}
        onLimitChange={(l) => {
          setLimit(l)
          setPage(1)
        }}
        onView={(order) => setDetailModalOrder(order)}
        onEdit={(order) => setStatusModalOrder(order)}
        onCancel={handleCancel}
      />

      {/* ===== MODALS ===== */}
      {statusModalOrder && (
        <OrderStatusModal
          order={statusModalOrder}
          onClose={() => setStatusModalOrder(null)}
          onSubmit={handleUpdateStatus}
          submitting={submittingStatus}
        />
      )}

      {detailModalOrder && (
        <ModalOrderDetail
          order={detailModalOrder}
          onClose={() => setDetailModalOrder(null)}
        />
      )}
    </div>
  )
}

export default ManagementOrder
