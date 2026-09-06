import React from "react"
import "./ModalOrderDetail.scss"

const STATUS_LABEL = {
  pending: "Chờ xác nhận",
  shipping: "Đang giao",
  completed: "Hoàn thành",
  cancelled: "Đã huỷ",
}

const PAYMENT_LABEL = {
  cod: "COD",
  bank: "Chuyển khoản",
  e_wallet: "Ví điện tử",
}

/**
 * Props:
 * - order: đơn hàng đầy đủ, gồm customer{}, address{}, items[]
 * - onClose(): đóng modal
 */
const ModalOrderDetail = ({ order, onClose }) => {
  if (!order) return null

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

  const items = order.items || []
  const subtotal =
    order.subtotal ?? items.reduce((sum, it) => sum + it.price * it.quantity, 0)
  const shippingFee = order.shipping_fee || 0
  const discount = order.discount || 0

  return (
    <div
      className="order-detail-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="order-detail-modal-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mod-header">
          <h3>Chi tiết đơn hàng</h3>
          <button
            className="mod-close-btn"
            onClick={onClose}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="mod-body">
          {/* ===== Thông tin đơn hàng ===== */}
          <div className="mod-summary-grid">
            <div className="summary-item">
              <span className="label">Mã đơn hàng</span>
              <span className="value code">{order.order_code}</span>
            </div>
            <div className="summary-item">
              <span className="label">Ngày đặt hàng</span>
              <span className="value">{formatDateTime(order.created_at)}</span>
            </div>
            <div className="summary-item">
              <span className="label">Trạng thái</span>
              <span className={`mod-status-badge status-${order.status}`}>
                {STATUS_LABEL[order.status] || order.status}
              </span>
            </div>
            <div className="summary-item">
              <span className="label">Phương thức thanh toán</span>
              <span className="value">
                {PAYMENT_LABEL[order.payment_method] || order.payment_method}
              </span>
            </div>
          </div>

          {/* ===== Thông tin khách hàng ===== */}
          <div className="mod-section">
            <h4>Thông tin khách hàng</h4>
            <div className="mod-customer-grid">
              <div className="customer-item">
                <span className="label">Họ và tên</span>
                <span className="value">{order.customer_name}</span>
              </div>
              <div className="customer-item">
                <span className="label">Số điện thoại</span>
                <span className="value">{order.phone}</span>
              </div>
              <div className="customer-item">
                <span className="label">Email</span>
                <span className="value">{order.email}</span>
              </div>
              <div className="customer-item full">
                <span className="label">Địa chỉ</span>
                <span className="value">{order.address}</span>
              </div>
            </div>
          </div>

          {/* ===== Sản phẩm ===== */}
          <div className="mod-section">
            <h4>Sản phẩm</h4>
            <div className="mod-items-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Phân loại</th>
                    <th>Đơn giá</th>
                    <th>Số lượng</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it._id}>
                      <td className="product-cell">
                        {it.image_url ? (
                          <img
                            src={it.image_url}
                            alt={it.product_name}
                          />
                        ) : (
                          <span className="thumb-fallback"></span>
                        )}
                        {it.product_name}
                      </td>
                      <td>{it.config_name || "—"}</td>
                      <td>{formatPrice(it.price)}</td>
                      <td>{it.quantity}</td>
                      <td className="strong">
                        {formatPrice(it.price * it.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mod-totals">
              <div className="totals-row">
                <span>Tạm tính</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="totals-row">
                <span>Phí vận chuyển</span>
                <span>{formatPrice(shippingFee)}</span>
              </div>
              {discount > 0 && (
                <div className="totals-row discount">
                  <span>Giảm giá</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="totals-row total">
                <span>Tổng cộng</span>
                <span>{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mod-footer">
          <button
            className="mod-close-action"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalOrderDetail
