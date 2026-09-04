import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import axiosInstance from "../../../utils/axiosInstance"
import "./MyOrder.scss"

const TABS = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ xác nhận" },
  { key: "shipping", label: "Đang giao" },
  { key: "completed", label: "Hoàn thành" },
  { key: "cancelled", label: "Đã hủy" },
]

const STATUS_LABEL = {
  pending: "Chờ xác nhận",
  shipping: "Đang giao",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
}

const PAYMENT_LABEL = {
  cod: "Thanh toán khi nhận hàng (COD)",
  bank: "Chuyển khoản ngân hàng",
  e_wallet: "Ví điện tử",
  momo: "Ví MoMo",
}

const PAGE_SIZE = 4

const MyOrder = () => {
  const [orders, setOrders] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [searchInput, setSearchInput] = useState("") // giá trị gõ trực tiếp trong ô input
  const [searchTerm, setSearchTerm] = useState("") // giá trị ĐÃ debounce, dùng để gọi API
  const [currentPage, setCurrentPage] = useState(1)
  const [orderToCancel, setOrderToCancel] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)

  const formatPrice = (price) => {
    if (price == null) return ""
    return price.toLocaleString("vi-VN") + "đ"
  }

  const formatDateTime = (date) => {
    if (!date) return ""
    return new Date(date).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Toàn bộ việc lọc + phân trang giờ do BACKEND làm (filterMyOrder +
  // skip/limit trong OrderService.getMyOrders) -> FE chỉ gửi tham số lên,
  // không tự filter/slice mảng nữa
  const getMyOrders = async () => {
    try {
      setIsLoading(true)
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_APP_URL}/order/my-orders`,
        {
          params: {
            status: activeTab === "all" ? undefined : activeTab,
            search: searchTerm || undefined,
            page: currentPage,
            limit: PAGE_SIZE,
          },
        },
      )
      setOrders(response.data.orders || [])
      setTotal(response.data.total || 0)
      setTotalPages(response.data.totalPages || 1)
    } catch (error) {
      alert(
        error.response?.data?.message || "Không tải được danh sách đơn hàng",
      )
    } finally {
      setIsLoading(false)
    }
  }

  // CHỈ 1 effect gọi API, phụ thuộc đúng 3 thứ ảnh hưởng tới kết quả:
  // tab, trang hiện tại, và từ khoá tìm kiếm ĐÃ debounce
  useEffect(() => {
    getMyOrders()
  }, [activeTab, currentPage, searchTerm])

  // Đổi tab -> quay lại trang 1 (tránh đứng ở trang 3 của tab cũ mà tab
  // mới chỉ có 1 trang). Effect ở trên sẽ tự chạy lại khi currentPage đổi.
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab])

  // Debounce ô tìm kiếm 400ms: gõ xong mới thực sự cập nhật searchTerm
  // (kích hoạt gọi API), tránh gọi API liên tục mỗi lần gõ 1 ký tự
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput.trim())
      setCurrentPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  const handleCancelOrder = async () => {
    if (!orderToCancel) return
    const id = orderToCancel._id

    setCancellingId(id)
    setOrderToCancel(null)

    try {
      await axiosInstance.patch(
        `${import.meta.env.VITE_APP_URL}/order/${id}/cancel`,
      )
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status: "cancelled" } : o)),
      )
    } catch (error) {
      alert(error.response?.data?.message || "Huỷ đơn hàng thất bại")
    } finally {
      setCancellingId(null)
    }
  }

  if (isLoading && orders.length === 0) {
    return (
      <div className="my-order-loading">
        <div className="spinner"></div>
        <p>Đang tải đơn hàng...</p>
      </div>
    )
  }

  return (
    <div className="my-order">
      <div className="my-order-header">
        <h2>Đơn hàng của tôi ({total})</h2>

        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm theo mã đơn hàng..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <i className="fa-solid fa-magnifying-glass"></i>
        </div>
      </div>

      <div className="order-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? "active" : ""}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="order-empty">
          <i className="fa-solid fa-box-open"></i>
          <p>Không có đơn hàng nào</p>
        </div>
      ) : (
        <div className="order-list">
          {orders.map((order) => {
            const isCancelling = cancellingId === order._id

            return (
              <div
                className={`order-card ${isCancelling ? "is-cancelling" : ""}`}
                key={order._id}
              >
                <div className="order-card-header">
                  <div className="order-meta">
                    <span className="order-code">
                      Mã đơn hàng: <strong>#{order.order_code}</strong>
                    </span>
                    <span className="order-date">
                      Ngày đặt: {formatDateTime(order.created_at)}
                    </span>
                    {order.items?.length > 0 && (
                      <span className="order-products-summary">
                        Sản phẩm:{" "}
                        {order.items
                          .slice(0, 2)
                          .map(
                            (item) => `${item.product_name} x${item.quantity}`,
                          )
                          .join(", ")}
                        {order.items.length > 2 &&
                          ` và ${order.items.length - 2} sản phẩm khác`}
                      </span>
                    )}
                  </div>

                  <div className="order-total">
                    <span className="label">Tổng tiền:</span>
                    <span className="value">
                      {formatPrice(order.total_amount)}
                    </span>
                  </div>

                  <div className="order-status">
                    <span className="label">Trạng thái:</span>
                    <span className={`status-badge status-${order.status}`}>
                      {STATUS_LABEL[order.status] || order.status}
                    </span>
                  </div>

                  <div className="order-payment">
                    <span className="label">Phương thức thanh toán:</span>
                    <span className="value">
                      {PAYMENT_LABEL[order.payment_method] ||
                        order.payment_method}
                    </span>
                  </div>
                </div>

                <div className="order-items">
                  {order.items?.map((item) => {
                    const hasDiscount =
                      item.discount_price != null &&
                      item.discount_price < item.price

                    return (
                      <div
                        className="order-item"
                        key={item._id}
                      >
                        <img
                          src={
                            item.product_image
                              ? `${import.meta.env.VITE_APP_URL}${item.product_image}`
                              : "/no-image.png"
                          }
                          alt={item.product_name}
                        />
                        <div className="item-text">
                          <p className="name">{item.product_name}</p>
                          {item.config_name && (
                            <p className="config">{item.config_name}</p>
                          )}
                          <span className="qty">Số lượng: {item.quantity}</span>
                        </div>
                        <div className="item-price">
                          {/* subtotal = backend đã tự tính sẵn (giá sau giảm x
                              số lượng), không tự nhân tay item.price * quantity
                              vì đó là giá GỐC, chưa trừ giảm giá */}
                          <span className="price-new">
                            {formatPrice(item.subtotal)}
                          </span>
                          {hasDiscount && (
                            <span className="price-old">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="order-actions">
                  <Link
                    to={`/order/${order._id}`}
                    className="view-btn"
                  >
                    Xem chi tiết đơn hàng
                  </Link>

                  {order.status === "pending" && (
                    <button
                      className="cancel-btn"
                      onClick={() => setOrderToCancel(order)}
                      disabled={isCancelling}
                    >
                      {isCancelling ? (
                        <i className="fa-solid fa-spinner fa-spin"></i>
                      ) : (
                        "Hủy đơn hàng"
                      )}
                    </button>
                  )}

                  {order.status === "shipping" && (
                    <button className="track-btn">Theo dõi đơn hàng</button>
                  )}

                  {order.status === "completed" && (
                    <button className="reorder-btn">Mua lại</button>
                  )}
                </div>

                {isCancelling && <div className="order-card-overlay"></div>}
              </div>
            )
          })}
        </div>
      )}

      {total > 0 && (
        <div className="order-pagination">
          <span className="page-info">
            Hiển thị {(currentPage - 1) * PAGE_SIZE + 1}-
            {Math.min(currentPage * PAGE_SIZE, total)} trong {total} đơn hàng
          </span>

          <div className="page-controls">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={page === currentPage ? "active" : ""}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      )}

      {orderToCancel && (
        <div
          className="cancel-modal-backdrop"
          onClick={() => setOrderToCancel(null)}
        >
          <div
            className="cancel-modal-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cancel-modal-icon">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h3>Huỷ đơn hàng?</h3>
            <p>
              Bạn có chắc muốn huỷ đơn hàng{" "}
              <strong>#{orderToCancel.order_code}</strong> không? Hành động này
              không thể hoàn tác.
            </p>
            <div className="cancel-modal-actions">
              <button
                className="keep-btn"
                onClick={() => setOrderToCancel(null)}
              >
                Giữ lại đơn hàng
              </button>
              <button
                className="confirm-cancel-btn"
                onClick={handleCancelOrder}
              >
                Huỷ đơn hàng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyOrder
