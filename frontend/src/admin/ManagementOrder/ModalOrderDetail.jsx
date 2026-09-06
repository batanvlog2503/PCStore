import React, { useEffect, useState } from "react"
import "./ModalOrderDetail.scss"
import axiosInstance from "../../utils/axiosInstance"
const STATUS_LABEL = {
  pending: "Chờ xác nhận",
  shipping: "Đang giao",
  completed: "Hoàn thành",
  cancelled: "Đã huỷ",
}

const PAYMENT_LABEL = {
  cod: "COD",
  bank: "Chuyển khoản",
}

const ModalOrderDetail = ({ order, onClose }) => {
  const [items, setItems] = useState([])
  const [loadingItems, setLoadingItems] = useState(true)

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

  useEffect(() => {
    getOrderItems()
  }, [order?._id])
  if (!order) return null

  const getOrderItems = async () => {
    try {
      setLoadingItems(true)

      const response = await axiosInstance.get(
        `${import.meta.env.VITE_APP_URL}/admin/orders/${order?._id}/items`,
      )

      setItems(response.data.items || [])
    } catch (error) {
      console.error("Không thể lấy sản phẩm trong đơn hàng:", error)
      setItems([])
    } finally {
      setLoadingItems(false)
    }
  }
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
                <span className="value">{order?.user_id?.username}</span>
              </div>
              <div className="customer-item">
                <span className="label">Số điện thoại</span>
                <span className="value">{order?.user_id?.phone}</span>
              </div>
              <div className="customer-item">
                <span className="label">Email</span>
                <span className="value">{order?.user_id?.email}</span>
              </div>
              <div className="customer-item full">
                <span className="label">Địa chỉ</span>
                <span className="value">
                  {[
                    order.address_id?.detail,
                    order.address_id?.ward,
                    order.address_id?.district,
                    order.address_id?.province,
                  ].join(", ")}
                </span>
              </div>
            </div>
          </div>

          <div className="mod-section">
            <h4>Sản phẩm ({items.length})</h4>
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
                  {loadingItems && (
                    <tr>
                      <td colSpan="5">Đang tải sản phẩm...</td>
                    </tr>
                  )}

                  {!loadingItems && items.length === 0 && (
                    <tr>
                      <td colSpan="5">Không có sản phẩm</td>
                    </tr>
                  )}

                  {!loadingItems &&
                    items.map((it) => (
                      <tr key={it._id}>
                        <td className="product-cell">
                          {it?.product_image ? (
                            <img
                              src={it.product_image}
                              alt={it.product_name}
                            />
                          ) : (
                            <span className="thumb-fallback"></span>
                          )}

                          {it.product_name}
                        </td>

                        <td>{it.config_name || "—"}</td>

                        <td>{formatPrice(it.discount_price)}</td>

                        <td>{it.quantity}</td>

                        <td className="strong">{formatPrice(it.subtotal)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="mod-totals">
              <div className="totals-row">
                <span>Tạm tính</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="totals-row">
                <span>Phí vận chuyển</span>
                <span>{formatPrice(order.shipping_fee)}</span>
              </div>
              {order?.product_discount > 0 && (
                <div className="totals-row discount">
                  <span>Giảm giá</span>
                  <span>-{formatPrice(order?.product_discount)}</span>
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
