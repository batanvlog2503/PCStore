import React, { useEffect, useMemo, useState } from "react"
import "./ManagementOrder.scss"
import axiosInstance from "../../utils/axiosInstance"

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

// ================= MOCK DATA (thay bằng API thật khi backend sẵn sàng) =================
const MOCK_ORDERS = [
  {
    _id: "1",
    order_code: "ORD001234",
    customer_name: "Nguyễn Văn A",
    phone: "0901234567",
    email: "nguyenvana@gmail.com",
    address: "123 Nguyễn Trãi, Thanh Xuân, Hà Nội",
    total_amount: 12500000,
    status: "pending",
    payment_method: "cod",
    created_at: "2025-06-12T10:30:00",
    subtotal: 25450000,
    shipping_fee: 30000,
    discount: 2980000,
    items: [
      {
        _id: "i1",
        product_name: "Laptop Lenovo Legion 5",
        config_name: "16GB RAM - 512GB SSD",
        price: 25000000,
        quantity: 1,
        image_url: "",
      },
      {
        _id: "i2",
        product_name: "Chuột Logitech G102",
        config_name: "Đen",
        price: 450000,
        quantity: 1,
        image_url: "",
      },
    ],
  },
  {
    _id: "2",
    order_code: "ORD001233",
    customer_name: "Trần Thị B",
    phone: "0912345678",
    email: "tranthib@gmail.com",
    address: "45 Lê Lợi, Q.1, TP.HCM",
    total_amount: 8900000,
    status: "shipping",
    payment_method: "bank",
    created_at: "2025-06-11T09:15:00",
    subtotal: 8900000,
    shipping_fee: 0,
    discount: 0,
    items: [
      {
        _id: "i3",
        product_name: "Bàn phím cơ Akko 3068B",
        config_name: "Blue switch",
        price: 8900000,
        quantity: 1,
        image_url: "",
      },
    ],
  },
  {
    _id: "3",
    order_code: "ORD001232",
    customer_name: "Lê Văn C",
    phone: "0934567890",
    email: "levanc@gmail.com",
    address: "78 Trần Phú, Hải Châu, Đà Nẵng",
    total_amount: 15200000,
    status: "completed",
    payment_method: "cod",
    created_at: "2025-06-11T21:45:00",
    subtotal: 15200000,
    shipping_fee: 0,
    discount: 0,
    items: [
      {
        _id: "i4",
        product_name: "Màn hình LG 27 inch",
        config_name: "IPS 144Hz",
        price: 7600000,
        quantity: 2,
        image_url: "",
      },
    ],
  },
  {
    _id: "4",
    order_code: "ORD001231",
    customer_name: "Phạm Thị D",
    phone: "0945678901",
    email: "phamthid@gmail.com",
    address: "12 Hai Bà Trưng, Huế",
    total_amount: 6750000,
    status: "cancelled",
    payment_method: "bank",
    created_at: "2025-06-11T16:20:00",
    subtotal: 6750000,
    shipping_fee: 0,
    discount: 0,
    items: [
      {
        _id: "i5",
        product_name: "Tai nghe Sony WH-CH510",
        config_name: "",
        price: 6750000,
        quantity: 1,
        image_url: "",
      },
    ],
  },
  {
    _id: "5",
    order_code: "ORD001230",
    customer_name: "Hoàng Văn E",
    phone: "0956789012",
    email: "hoangvane@gmail.com",
    address: "56 Nguyễn Huệ, Q.1, TP.HCM",
    total_amount: 22300000,
    status: "shipping",
    payment_method: "cod",
    created_at: "2025-06-11T14:10:00",
    subtotal: 22300000,
    shipping_fee: 0,
    discount: 0,
    items: [
      {
        _id: "i6",
        product_name: "Laptop Dell XPS 13",
        config_name: "16GB RAM - 1TB SSD",
        price: 22300000,
        quantity: 1,
        image_url: "",
      },
    ],
  },
]

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

      // Khi có API thật, thay đoạn MOCK bên dưới bằng:
      // const response = await axiosInstance.get(
      //   `${import.meta.env.VITE_APP_URL}/admin/orders`,
      //   {
      //     params: {
      //       page,
      //       limit,
      //       search: appliedFilters.search || undefined,
      //       status: appliedFilters.status === "all" ? undefined : appliedFilters.status,
      //       payment: appliedFilters.payment === "all" ? undefined : appliedFilters.payment,
      //       fromDate: appliedFilters.fromDate || undefined,
      //       toDate: appliedFilters.toDate || undefined,
      //     },
      //   },
      // )
      // setOrders(response.data.orders)
      // setTotal(response.data.total)
      // setStats(response.data.stats)

      // ----- MOCK: lọc + phân trang tạm ở client để demo giao diện -----
      let filtered = MOCK_ORDERS.filter((o) => {
        const term = appliedFilters.search.trim().toLowerCase()
        const matchSearch =
          !term ||
          o.order_code.toLowerCase().includes(term) ||
          o.customer_name.toLowerCase().includes(term) ||
          o.phone.includes(term)
        const matchStatus =
          appliedFilters.status === "all" || o.status === appliedFilters.status
        const matchPayment =
          appliedFilters.payment === "all" ||
          o.payment_method === appliedFilters.payment
        return matchSearch && matchStatus && matchPayment
      })

      setTotal(filtered.length)
      const start = (page - 1) * limit
      setOrders(filtered.slice(start, start + limit))

      setStats({
        total: 1234,
        pending: 156,
        shipping: 320,
        completed: 678,
        cancelled: 80,
      })
      // ------------------------------------------------------------------
    } catch (error) {
      console.error("Lỗi lấy danh sách đơn hàng:", error)
    } finally {
      setTimeout(() => setLoading(false), 300)
    }
  }

  useEffect(() => {
    getOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // Gợi ý: gọi API trả về file (blob) rồi tạo link tải, ví dụ:
    // const res = await axiosInstance.get(".../admin/orders/export", { responseType: "blob", params: appliedFilters })
    alert("Chức năng xuất Excel — nối API export khi backend sẵn sàng.")
  }

  const handleRefresh = () => {
    handleReset()
  }

  const handleUpdateStatus = async ({ orderId, newStatus, note }) => {
    try {
      setSubmittingStatus(true)

      // Khi có API thật:
      // await axiosInstance.patch(
      //   `${import.meta.env.VITE_APP_URL}/admin/orders/${orderId}/status`,
      //   { status: newStatus, note },
      // )

      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)),
      )
      setStatusModalOrder(null)
    } catch (error) {
      alert(error.response?.data?.message || "Cập nhật trạng thái thất bại")
    } finally {
      setSubmittingStatus(false)
    }
  }

  const handleDelete = (order) => {
    if (!window.confirm(`Xoá đơn hàng ${order.order_code}?`)) return
    // Khi có API thật: gọi DELETE rồi mới cập nhật state
    setOrders((prev) => prev.filter((o) => o._id !== order._id))
    setTotal((prev) => prev - 1)
  }

  const STATS = useMemo(
    () => [
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
    ],
    [stats],
  )

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
        onDelete={handleDelete}
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
