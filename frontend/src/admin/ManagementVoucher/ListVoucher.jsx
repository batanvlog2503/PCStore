import React, { useMemo } from "react"

function pad2(n) {
  return String(n).padStart(2, "0")
}

function formatDate(dateStr) {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`
}

function formatVND(value) {
  if (!value) return "0đ"
  return value.toLocaleString("vi-VN") + "đ"
}

function formatDiscountValue(voucher) {
  return voucher.discount_type === "percent"
    ? `${voucher.discount_value}%`
    : formatVND(voucher.discount_value)
}

function getDisplayStatus(voucher) {
  const now = new Date()
  const start = new Date(voucher.start_date)
  const end = new Date(voucher.end_date)

  if (voucher.status === "inactive") {
    return { key: "hidden", label: "Đã ẩn" }
  }
  if (voucher.status === "expired" || now > end) {
    return { key: "expired", label: "Đã hết hạn" }
  }
  if (now < start) {
    return { key: "not-started", label: "Chưa bắt đầu" }
  }
  return { key: "active", label: "Đang hoạt động" }
}

// Sinh danh sách số trang có dấu "..." khi quá nhiều trang
function getPageNumbers(current, total) {
  const delta = 1
  const range = []
  const withDots = []
  let last

  for (let i = 1; i <= total; i++) {
    if (
      i === 1 ||
      i === total ||
      (i >= current - delta && i <= current + delta)
    ) {
      range.push(i)
    }
  }
  for (const i of range) {
    if (last !== undefined) {
      if (i - last === 2) withDots.push(last + 1)
      else if (i - last > 2) withDots.push("...")
    }
    withDots.push(i)
    last = i
  }
  return withDots
}

const ListVoucher = ({
  vouchers,
  stats,
  isLoading,
  search,
  onSearchChange,
  voucherType,
  onVoucherTypeChange,
  statusFilter,
  onStatusFilterChange,
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onAddNew,
  onEdit,
  onDelete,
}) => {
  const pageNumbers = useMemo(
    () => getPageNumbers(page, totalPages),
    [page, totalPages],
  )

  const STAT_CARDS = [
    {
      key: "total",
      label: "Tổng voucher",
      value: stats.total,
      icon: "fa-solid fa-tags",
      tone: "blue",
    },
    {
      key: "active",
      label: "Đang hoạt động",
      value: stats.active,
      icon: "fa-solid fa-circle",
      tone: "green",
    },
    {
      key: "expired",
      label: "Đã hết hạn",
      value: stats.expired,
      icon: "fa-solid fa-circle",
      tone: "gray",
    },
    {
      key: "hidden",
      label: "Đã ẩn",
      value: stats.hidden,
      icon: "fa-solid fa-circle",
      tone: "red",
    },
  ]

  return (
    <div className="mv-list">
      {/* ================= HEADER ================= */}
      <div className="mv-header">
        <div className="mv-header__icon">
          <i className="fa-solid fa-tag"></i>
        </div>
        <div className="mv-header__text">
          <h1>Quản lý voucher</h1>
          <p>Quản lý mã giảm giá của cửa hàng</p>
        </div>
        <button
          type="button"
          className="mv-add-btn"
          onClick={onAddNew}
        >
          <i className="fa-solid fa-plus"></i> Thêm voucher
        </button>
      </div>

      {/* ================= FILTER + STATS ================= */}
      <div className="mv-toolbar">
        <div className="mv-filters">
          <div className="mv-search">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              placeholder="Tìm theo mã voucher..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <select
            value={voucherType}
            onChange={(e) => onVoucherTypeChange(e.target.value)}
          >
            <option value="all">Tất cả loại</option>
            <option value="product">Sản phẩm</option>
            <option value="shipping">Vận chuyển</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="not-started">Chưa bắt đầu</option>
            <option value="expired">Đã hết hạn</option>
            <option value="hidden">Đã ẩn</option>
          </select>
        </div>

        <div className="mv-stats">
          {STAT_CARDS.map((s) => (
            <div
              key={s.key}
              className="mv-stat"
            >
              <span className={`mv-stat__icon tone-${s.tone}`}>
                <i className={s.icon}></i>
              </span>
              <div>
                <p className="mv-stat__label">{s.label}</p>
                <p className="mv-stat__value">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mv-table-wrap">
        <table className="mv-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã voucher</th>
              <th>Loại</th>
              <th>Giá trị</th>
              <th>Đơn tối thiểu</th>
              <th>Còn</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td
                  colSpan={9}
                  className="mv-empty"
                >
                  Đang tải danh sách voucher...
                </td>
              </tr>
            )}

            {!isLoading && vouchers.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="mv-empty"
                >
                  Không có voucher nào khớp với bộ lọc.
                </td>
              </tr>
            )}

            {!isLoading &&
              vouchers.map((v, index) => {
                const displayStatus = getDisplayStatus(v)

                return (
                  <tr key={v._id}>
                    <td>{(page - 1) * limit + index + 1}</td>
                    <td>
                      <p className="mv-code">{v.code}</p>
                    </td>
                    <td>
                      <span
                        className={`mv-badge ${
                          v.voucher_type === "product"
                            ? "tone-pink"
                            : "tone-blue"
                        }`}
                      >
                        {v.voucher_type === "product"
                          ? "Sản phẩm"
                          : "Vận chuyển"}
                      </span>
                    </td>
                    <td>{formatDiscountValue(v)}</td>
                    <td>{formatVND(v.min_order_value)}</td>
                    <td>{v.quantity}</td>
                    <td>
                      {formatDate(v.start_date)} - {formatDate(v.end_date)}
                    </td>
                    <td>
                      <span className={`mv-status tone-${displayStatus.key}`}>
                        {displayStatus.label}
                      </span>
                    </td>
                    <td>
                      <div className="mv-actions">
                        <button
                          type="button"
                          className="mv-icon-btn mv-icon-btn--edit"
                          onClick={() => onEdit(v)}
                          aria-label={`Sửa ${v.code}`}
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button
                          type="button"
                          className="mv-icon-btn mv-icon-btn--delete"
                          onClick={() => onDelete(v)}
                          aria-label={`Xoá ${v.code}`}
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>

      {/* ================= PHÂN TRANG ================= */}
      {!isLoading && total > 0 && (
        <div className="mv-pagination">
          <div className="mv-pagination__controls">
            <button
              type="button"
              className="mv-page-btn mv-page-btn--nav"
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
              aria-label="Trang trước"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>

            {pageNumbers.map((n, idx) =>
              n === "..." ? (
                <span
                  key={`dots-${idx}`}
                  className="mv-page-dots"
                >
                  ...
                </span>
              ) : (
                <button
                  key={n}
                  type="button"
                  className={`mv-page-btn ${n === page ? "is-active" : ""}`}
                  onClick={() => onPageChange(n)}
                >
                  {n}
                </button>
              ),
            )}

            <button
              type="button"
              className="mv-page-btn mv-page-btn--nav"
              disabled={page === totalPages}
              onClick={() => onPageChange(page + 1)}
              aria-label="Trang sau"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ListVoucher
