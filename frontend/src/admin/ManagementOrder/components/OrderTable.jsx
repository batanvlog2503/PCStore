import React, { useMemo } from "react"
import { Link } from "react-router-dom"
import "./OrderTable.scss"

export const STATUS_LABEL = {
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

const PAGE_SIZE_OPTIONS = [10, 20, 50]

/**
 * Props:
 * - orders: mảng đơn hàng của trang hiện tại
 * - loading: boolean
 * - page, limit, total: dùng để tính phân trang + dòng "Hiển thị..."
 * - onPageChange(nextPage)
 * - onLimitChange(nextLimit)
 * - onView(order) / onEdit(order) / onDelete(order): các action ở cột "Thao tác"
 */
const OrderTable = ({
  orders,
  loading,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  onView,
  onEdit,
  onDelete,
}) => {
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

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1
  const rangeEnd = Math.min(page * limit, total)

  const pageNumbers = useMemo(() => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
      return pages
    }

    pages.push(1)
    let start = Math.max(2, page - 1)
    let end = Math.min(totalPages - 1, page + 3)

    if (page <= 3) {
      start = 2
      end = 5
    }

    if (start > 2) pages.push("...")
    for (let i = start; i <= end; i++) pages.push(i)
    if (end < totalPages - 1) pages.push("...")

    pages.push(totalPages)
    return pages
  }, [page, totalPages])

  return (
    <div className="order-table-card">
      <div className="order-table-head">
        <h4>Danh sách đơn hàng</h4>
      </div>

      <div className="order-table-scroll">
        <table>
          <thead>
            <tr>
              <th className="col-index">#</th>
              <th>Mã đơn hàng</th>
              <th>Khách hàng</th>
              <th>SĐT</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Phương thức TT</th>
              <th>Ngày đặt</th>
              <th className="col-actions">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: limit > 6 ? 6 : limit }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 9 }).map((__, j) => (
                    <td key={j}>
                      <span className="ot-skeleton-line w-70"></span>
                    </td>
                  ))}
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="ot-empty"
                >
                  <i className="fa-solid fa-box-open"></i>
                  <p>Không tìm thấy đơn hàng nào</p>
                </td>
              </tr>
            ) : (
              orders.map((order, i) => (
                <tr
                  key={order._id}
                  style={{ transitionDelay: `${i * 40}ms` }}
                >
                  <td className="col-index">{(page - 1) * limit + i + 1}</td>
                  <td>
                    <Link
                      to={`/admin/orders/${order._id}`}
                      className="order-code-link"
                      onClick={(e) => {
                        // Nếu component cha muốn tự xử lý (mở modal) thay vì điều hướng route
                        if (onView) {
                          e.preventDefault()
                          onView(order)
                        }
                      }}
                    >
                      {order.order_code}
                    </Link>
                  </td>
                  <td>{order.customer_name}</td>
                  <td>{order.phone}</td>
                  <td className="price-cell">
                    {formatPrice(order.total_amount)}
                  </td>
                  <td>
                    <span className={`ot-status-badge status-${order.status}`}>
                      {STATUS_LABEL[order.status] || order.status}
                    </span>
                  </td>
                  <td>
                    {PAYMENT_LABEL[order.payment_method] ||
                      order.payment_method}
                  </td>
                  <td className="date-cell">
                    {formatDateTime(order.created_at)}
                  </td>
                  <td>
                    <div className="ot-row-actions">
                      <button
                        className="ot-icon-btn"
                        title="Xem chi tiết"
                        onClick={() => onView && onView(order)}
                      >
                        <i className="fa-regular fa-eye"></i>
                      </button>
                      <button
                        className="ot-icon-btn"
                        title="Cập nhật trạng thái"
                        onClick={() => onEdit && onEdit(order)}
                      >
                        <i className="fa-regular fa-pen-to-square"></i>
                      </button>
                      <button
                        className="ot-icon-btn is-danger"
                        title="Xoá đơn hàng"
                        onClick={() => onDelete && onDelete(order)}
                      >
                        <i className="fa-regular fa-trash-can"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="order-table-footer">
        <div className="page-size-wrap">
          <span>Hiển thị</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option
                key={n}
                value={n}
              >
                {n}
              </option>
            ))}
          </select>
          <span>/ trang</span>
        </div>

        <span className="range-info">
          Hiển thị {rangeStart} đến {rangeEnd} trong tổng số{" "}
          {total.toLocaleString("vi-VN")} đơn hàng
        </span>

        <div className="page-controls">
          <button
            disabled={page === 1}
            onClick={() => onPageChange(Math.max(1, page - 1))}
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>

          {pageNumbers.map((n, i) =>
            n === "..." ? (
              <span
                className="dots"
                key={`dots-${i}`}
              >
                ...
              </span>
            ) : (
              <button
                key={n}
                className={page === n ? "active" : ""}
                onClick={() => onPageChange(n)}
              >
                {n}
              </button>
            ),
          )}

          <button
            disabled={page === totalPages}
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderTable
