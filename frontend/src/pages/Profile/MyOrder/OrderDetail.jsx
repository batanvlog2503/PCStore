import React, { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import axiosInstance from "../../../utils/axiosInstance"
import "./OrderDetail.scss"

const PAYMENT_LABELS = {
  cod: "Thanh toán khi nhận hàng (COD)",
  bank: "Chuyển khoản ngân hàng",
  e_wallet: "Ví điện tử",
  momo: "Ví MoMo",
}

const STATUS_LABEL = {
  pending: "Chờ xác nhận",
  shipping: "Đang giao",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
}

// Thứ tự các bước trong timeline (đơn hàng bình thường, không bị huỷ)
const STATUS_STEPS = [
  { key: "pending", label: "Chờ xác nhận", icon: "fa-receipt" },
  { key: "shipping", label: "Đang giao", icon: "fa-truck-fast" },
  { key: "completed", label: "Hoàn thành", icon: "fa-box-open" },
]

const OrderDetail = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()

  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [isCopied, setIsCopied] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

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

  const getOrder = async () => {
    try {
      setIsLoading(true)
      setLoadError(null)
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_APP_URL}/order/${orderId}`,
      )
      setOrder(response.data.order)
    } catch (error) {
      setLoadError(
        error.response?.data?.message || "Không tìm thấy đơn hàng này",
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getOrder()
  }, [orderId])

  const handleCopyCode = () => {
    if (!order?.order_code) return
    navigator.clipboard.writeText(order.order_code)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 1500)
  }

  const handleCancelOrder = async () => {
    if (!order) return
    setIsCancelling(true)
    try {
      await axiosInstance.patch(
        `${import.meta.env.VITE_APP_URL}/order/${order._id}/cancel`,
      )
      setOrder((prev) => ({ ...prev, status: "cancelled" }))
      setShowCancelModal(false)
    } catch (error) {
      alert(error.response?.data?.message || "Huỷ đơn hàng thất bại")
    } finally {
      setIsCancelling(false)
    }
  }

  if (isLoading) {
    return (
      <div className="order-detail-loading">
        <div className="spinner"></div>
        <p>Đang tải thông tin đơn hàng...</p>
      </div>
    )
  }

  if (loadError || !order) {
    return (
      <div className="order-detail-error">
        <i className="fa-solid fa-circle-exclamation"></i>
        <p>{loadError || "Không tìm thấy đơn hàng"}</p>
        <Link
          to="/profile"
          state={{ tab: "orders" }}
          className="back-home-btn"
        >
          Về đơn hàng của tôi
        </Link>
      </div>
    )
  }

  const isCancelled = order.status === "cancelled"
  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status)

  return (
    <div className="container p-0 order-detail-page">
      {/* ================= HEADER ================= */}
      <div className="detail-header">
        <button
          className="back-btn"
          onClick={() => navigate("/account/order")}
        >
          <i className="fa-solid fa-arrow-left"></i> Đơn hàng của tôi
        </button>

        <div className="header-main">
          <div className="header-title">
            <h2>Chi tiết đơn hàng</h2>
            <div className="order-code-badge">
              <span>
                Mã đơn hàng: <strong>{order.order_code}</strong>
              </span>
              <button
                onClick={handleCopyCode}
                title="Sao chép mã đơn hàng"
              >
                <i
                  className={`fa-regular ${isCopied ? "fa-circle-check" : "fa-copy"}`}
                ></i>
              </button>
            </div>
          </div>

          <span className={`status-badge status-${order.status}`}>
            {STATUS_LABEL[order.status] || order.status}
          </span>
        </div>

        {/* ============ TIMELINE TRẠNG THÁI ============ */}
        {!isCancelled ? (
          <div className="status-timeline">
            {STATUS_STEPS.map((step, index) => (
              <div
                className={`timeline-step ${
                  index <= currentStepIndex ? "done" : ""
                } ${index === currentStepIndex ? "current" : ""}`}
                key={step.key}
              >
                <div className="step-icon">
                  <i className={`fa-solid ${step.icon}`}></i>
                </div>
                <span className="step-label">{step.label}</span>
                {index < STATUS_STEPS.length - 1 && (
                  <div className="step-line"></div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="status-timeline cancelled">
            <div className="timeline-step done current">
              <div className="step-icon">
                <i className="fa-solid fa-ban"></i>
              </div>
              <span className="step-label">Đơn hàng đã bị huỷ</span>
            </div>
          </div>
        )}
      </div>

      {/* ================= THÔNG TIN + CHI TIẾT ĐƠN HÀNG ================= */}
      <div className="detail-card">
        <div className="info-col">
          <h4>
            <i className="fa-regular fa-calendar"></i> Thông tin đơn hàng
          </h4>

          <div className="info-row">
            <span className="label">Ngày đặt hàng</span>
            <span className="value">{formatDateTime(order.created_at)}</span>
          </div>
          <div className="info-row">
            <span className="label">Hình thức thanh toán</span>
            <span className="value">
              {PAYMENT_LABELS[order.payment_method] || order.payment_method}
            </span>
          </div>
          <div className="info-row">
            <span className="label">Phương thức vận chuyển</span>
            <span className="value">Giao hàng tiêu chuẩn</span>
          </div>
          <div className="info-row align-top">
            <span className="label">Địa chỉ giao hàng</span>
            <span className="value address">
              {order.address_id?.receiver_name}
              <br />
              {order.address_id?.detail}, {order.address_id?.ward},{" "}
              {order.address_id?.district}, {order.address_id?.province}
              <br />
              SĐT: {order.address_id?.phone}
            </span>
          </div>

          {order.status === "pending" && (
            <button
              className="cancel-order-btn"
              onClick={() => setShowCancelModal(true)}
            >
              <i className="fa-solid fa-xmark"></i> Huỷ đơn hàng
            </button>
          )}
        </div>

        <div className="items-col">
          <h4>
            <i className="fa-regular fa-square-check"></i> Sản phẩm đã đặt
          </h4>

          <div className="order-items">
            {order.items?.map((item) => (
              <div
                className="order-item"
                key={item._id}
              >
                <img
                  src={
                    item.product_image
                      ? `${import.meta.env.VITE_APP_URL}${item?.product_image}`
                      : "/no-image.png"
                  }
                  alt={item?.product_id?.name}
                />
                <div className="item-text">
                  <p className="name">{item?.product_id?.name}</p>
                  {item.config_name && (
                    <p className="config">{item?.variant_id?.config_name}</p>
                  )}
                  <span className="qty">SL: {item?.quantity}</span>
                </div>
                <div className="item-price">
                  {item.discount_price != null &&
                  item.discount_price < item.price ? (
                    <>
                      <span className="price-new">
                        {formatPrice(item.discount_price * item.quantity)}
                      </span>
                      <span className="price-old">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </>
                  ) : (
                    <span className="price-new">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="totals">
            <div className="totals-row">
              <span>Tạm tính</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.product_discount > 0 && (
              <div className="totals-row discount">
                <span>Giảm giá sản phẩm</span>
                <span>-{formatPrice(order.product_discount)}</span>
              </div>
            )}
            {order.voucher_discount > 0 && (
              <div className="totals-row discount">
                <span>Mã giảm giá</span>
                <span>-{formatPrice(order.voucher_discount)}</span>
              </div>
            )}
            <div className="totals-row">
              <span>Phí vận chuyển</span>
              <span>
                {order.shipping_fee > 0
                  ? formatPrice(order.shipping_fee)
                  : "0đ"}
              </span>
            </div>
            <div className="totals-row total">
              <span>Tổng thanh toán</span>
              <span>{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= NÚT HÀNH ĐỘNG ================= */}
      <div className="detail-actions">
        <button
          className="continue-shopping-btn"
          onClick={() => navigate("/")}
        >
          <i className="fa-solid fa-cart-shopping"></i> Tiếp tục mua sắm
        </button>
        {order.status === "completed" && (
          <button className="reorder-btn">
            <i className="fa-solid fa-rotate-right"></i> Mua lại
          </button>
        )}
      </div>

      {/* ================= MODAL XÁC NHẬN HUỶ ĐƠN ================= */}
      {showCancelModal && (
        <div
          className="cancel-modal-backdrop"
          onClick={() => !isCancelling && setShowCancelModal(false)}
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
              Bạn có chắc muốn huỷ đơn hàng <strong>#{order.order_code}</strong>{" "}
              không? Hành động này không thể hoàn tác.
            </p>
            <div className="cancel-modal-actions">
              <button
                className="keep-btn"
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
              >
                Giữ lại đơn hàng
              </button>
              <button
                className="confirm-cancel-btn"
                onClick={handleCancelOrder}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <i className="fa-solid fa-spinner fa-spin"></i>
                ) : (
                  "Huỷ đơn hàng"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderDetail
