import React from "react"
import "./OrderFilter.scss"

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "shipping", label: "Đang giao" },
  { value: "completed", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã huỷ" },
]

const PAYMENT_OPTIONS = [
  { value: "all", label: "Tất cả phương thức" },
  { value: "cod", label: "COD" },
  { value: "bank", label: "Chuyển khoản" },
  { value: "e_wallet", label: "Ví điện tử" },
]

/**
 * Props:
 * - filters: { search, status, payment, fromDate, toDate }
 * - onChange(field, value): cập nhật 1 field trong filters (chưa submit)
 * - onSearch(): áp dụng bộ lọc hiện tại
 * - onReset(): xoá hết bộ lọc
 */
const OrderFilter = ({ filters, onChange, onSearch, onReset }) => {
  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch()
  }

  return (
    <form
      className="order-filter"
      onSubmit={handleSubmit}
    >
      <div className="order-filter-head">
        <h4>Bộ lọc tìm kiếm</h4>
      </div>

      <div className="order-filter-grid">
        <div className="filter-field">
          <label>Tìm kiếm</label>
          <div className="search-input">
            <input
              type="text"
              placeholder="Nhập mã đơn hàng, tên hoặc SĐT..."
              value={filters.search}
              onChange={(e) => onChange("search", e.target.value)}
            />
            <i className="fa-solid fa-magnifying-glass"></i>
          </div>
        </div>

        <div className="filter-field">
          <label>Trạng thái</label>
          <select
            value={filters.status}
            onChange={(e) => onChange("status", e.target.value)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option
                key={s.value}
                value={s.value}
              >
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label>Phương thức thanh toán</label>
          <select
            value={filters.payment}
            onChange={(e) => onChange("payment", e.target.value)}
          >
            {PAYMENT_OPTIONS.map((p) => (
              <option
                key={p.value}
                value={p.value}
              >
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label>Từ ngày</label>
          <div className="date-input">
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => onChange("fromDate", e.target.value)}
            />
            <i className="fa-regular fa-calendar"></i>
          </div>
        </div>

        <div className="filter-field">
          <label>Đến ngày</label>
          <div className="date-input">
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => onChange("toDate", e.target.value)}
            />
            <i className="fa-regular fa-calendar"></i>
          </div>
        </div>

        <div className="filter-actions">
          <button
            type="submit"
            className="search-btn"
          >
            <i className="fa-solid fa-magnifying-glass"></i> Tìm kiếm
          </button>
          <button
            type="button"
            className="reset-btn"
            onClick={onReset}
          >
            <i className="fa-solid fa-rotate-left"></i> Đặt lại
          </button>
        </div>
      </div>
    </form>
  )
}

export default OrderFilter
