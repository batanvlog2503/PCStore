import React, { useEffect, useState } from "react"
import "./OrderStatusModal.scss"

const STATUS_LABEL = {
  pending: "Chờ xác nhận",
  shipping: "Đang giao",
  completed: "Hoàn thành",
  cancelled: "Đã huỷ",
}

// Trạng thái mới hợp lệ tương ứng với từng trạng thái hiện tại
// (tránh cho phép nhảy lung tung, ví dụ completed -> pending)
const NEXT_STATUS_OPTIONS = {
  pending: ["shipping", "cancelled"],
  shipping: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
}

const OrderStatusModal = ({ order, onClose, onSubmit, submitting }) => {
  const [newStatus, setNewStatus] = useState("")

  useEffect(() => {
    setNewStatus("")
  }, [order])

  if (!order) return null

  const availableOptions = NEXT_STATUS_OPTIONS[order.status] || []

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newStatus) return
    onSubmit({ orderId: order._id, newStatus })
  }

  return (
    <div
      className="order-status-modal-backdrop"
      onClick={() => !submitting && onClose()}
    >
      <div
        className="order-status-modal-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="osm-header">
          <h3>Cập nhật trạng thái đơn hàng</h3>
          <button
            className="osm-close-btn"
            onClick={onClose}
            disabled={submitting}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form
          className="osm-body"
          onSubmit={handleSubmit}
        >
          <div className="osm-info-row">
            <span className="label">Mã đơn hàng:</span>
            <span className="value">{order.order_code}</span>
          </div>
          <div className="osm-info-row">
            <span className="label">Khách hàng:</span>
            <span className="value">{order?.user_id?.username}</span>
          </div>

          <div className="osm-field">
            <label>Trạng thái hiện tại</label>
            <span className={`osm-status-badge status-${order.status}`}>
              {STATUS_LABEL[order.status] || order.status}
            </span>
          </div>

          <div className="osm-field">
            <label htmlFor="new-status">Trạng thái mới</label>
            <select
              id="new-status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              disabled={availableOptions.length === 0}
            >
              <option value="">Chọn trạng thái mới</option>
              {availableOptions.map((s) => (
                <option
                  key={s}
                  value={s}
                >
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
            {availableOptions.length === 0 && (
              <span className="osm-hint">
                Đơn hàng ở trạng thái này không thể cập nhật thêm.
              </span>
            )}
          </div>

          <div className="osm-actions">
            <button
              type="button"
              className="osm-cancel-btn"
              onClick={onClose}
              disabled={submitting}
            >
              Huỷ
            </button>
            <button
              type="submit"
              className="osm-submit-btn"
              disabled={!newStatus || submitting}
            >
              {submitting ? (
                <i className="fa-solid fa-spinner fa-spin"></i>
              ) : (
                <>
                  <i className="fa-solid fa-check"></i> Cập nhật
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default OrderStatusModal
