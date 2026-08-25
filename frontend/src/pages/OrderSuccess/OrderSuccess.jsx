import React, { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import axiosInstance from "../../utils/axiosInstance"
import "./OrderSuccess.scss"

const PAYMENT_LABELS = {
  cod: "Thanh toán khi nhận hàng (COD)",
  bank: "Chuyển khoản ngân hàng",
  e_wallet: "Ví điện tử",
}

const OrderSuccess = () => {
  const { orderId } = useParams() // lấy orderId từ navigate
  const navigate = useNavigate()

  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [isCopied, setIsCopied] = useState(false)
  // format price thêm đ
  const formatPrice = (price) => {
    if (price == null) return ""
    return price.toLocaleString("vi-VN") + "đ"
  }

  // format Time
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
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_APP_URL}/order/${orderId}`,
      )
      setOrder(response.data.order) // setOrder
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
    navigator.clipboard.writeText(order.order_code) // copy vào clipboard vào hẹ thống

    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 1500)
  }

  if (isLoading) {
    return (
      <div className="order-success-loading">
        <div className="spinner"></div>
        <p>Đang tải thông tin đơn hàng...</p>
      </div>
    )
  }

  if (loadError || !order) {
    return (
      <div className="order-success-error">
        <i className="fa-solid fa-circle-exclamation"></i>
        <p>{loadError || "Không tìm thấy đơn hàng"}</p>
        <Link
          to="/"
          className="back-home-btn"
        >
          Về trang chủ
        </Link>
      </div>
    )
  }

  return (
    <div className="container p-0 order-success-page">
      {/* ================= HEADER: ICON CHECK + LỜI CẢM ƠN ================= */}
      <div className="success-header">
        <div className="success-icon-wrap">
          <span className="confetti c1"></span>
          <span className="confetti c2"></span>
          <span className="confetti c3"></span>
          <span className="confetti c4"></span>
          <span className="confetti c5"></span>
          <span className="confetti c6"></span>
          <div className="success-icon">
            <i className="fa-solid fa-check"></i>
          </div>
        </div>

        <h2>Đặt hàng thành công!</h2>
        <p>
          Cảm ơn bạn đã đặt hàng tại PC Store. Đơn hàng của bạn đã được ghi nhận
          và đang được xử lý.
        </p>

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

      {/* ================= THÔNG TIN + CHI TIẾT ĐƠN HÀNG ================= */}
      <div className="success-card">
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
        </div>

        <div className="detail-col">
          <h4>
            <i className="fa-regular fa-square-check"></i> Chi tiết đơn hàng
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

      {/* ================= BANNER TRẠNG THÁI ================= */}
      <div className="processing-banner">
        <i className="fa-regular fa-clock"></i>
        <div>
          <p>Đơn hàng của bạn đang được xử lý</p>
          <span>
            Chúng tôi sẽ nhanh chóng xác nhận đơn hàng và liên hệ với bạn để
            thông báo chi tiết. Bạn có thể theo dõi trạng thái đơn hàng trong
            mục "Đơn hàng của tôi".
          </span>
        </div>
      </div>

      {/* ================= NÚT HÀNH ĐỘNG ================= */}
      <div className="success-actions">
        <button
          className="continue-shopping-btn"
          onClick={() => navigate("/")}
        >
          <i className="fa-solid fa-cart-shopping"></i> Tiếp tục mua sắm
        </button>
        <button
          className="view-orders-btn"
          onClick={() => navigate("/profile", { state: { tab: "orders" } })}
        >
          <i className="fa-solid fa-list-ul"></i> Xem đơn hàng của tôi
        </button>
      </div>
    </div>
  )
}

export default OrderSuccess
