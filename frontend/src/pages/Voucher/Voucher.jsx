import React, { useEffect, useMemo, useState } from "react"
import "./Voucher.scss"
import axiosInstance from "../../utils/axiosInstance"

const FILTER_TABS = [
  { value: "all", label: "Tất cả voucher", icon: "fa-solid fa-ticket" },
  { value: "product", label: "Giảm giá sản phẩm", icon: "fa-solid fa-percent" },
  {
    value: "shipping",
    label: "Miễn phí vận chuyển",
    icon: "fa-solid fa-truck-fast",
  },
]

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "expiring", label: "Sắp hết hạn" },
  { value: "discount", label: "Giảm nhiều nhất" },
]

const formatPrice = (value) => {
  if (value == null) return ""
  return value.toLocaleString("vi-VN") + "đ"
}

const formatDate = (date) => {
  if (!date) return ""
  return new Date(date).toLocaleDateString("vi-VN")
}

// Nhãn to hiển thị giữa mảnh voucher — tách riêng logic cho 2 loại
// product (vàng) và shipping (xanh lá) theo đúng voucher_type trong schema
const getVoucherHeadline = (voucher) => {
  if (voucher.voucher_type === "shipping") {
    return { title: "MIỄN PHÍ", subtitle: "VẬN CHUYỂN" }
  }
  if (voucher.discount_type === "percent") {
    return { title: `GIẢM ${voucher.discount_value}%`, subtitle: "" }
  }
  return { title: `GIẢM`, subtitle: formatPrice(voucher.discount_value) }
}

const getVoucherStatusFlag = (voucher) => {
  const now = new Date()
  if (voucher.status === "expired" || new Date(voucher.end_date) < now) {
    return "expired"
  }
  if (voucher.quantity <= 0) return "out_of_stock"
  return "available"
}

export const Voucher = () => {
  const [vouchers, setVouchers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterType, setFilterType] = useState("all")
  const [sort, setSort] = useState("newest")
  const [claimedIds, setClaimedIds] = useState([])
  const [claimingId, setClaimingId] = useState(null)
  const [detailVoucher, setDetailVoucher] = useState(null)
  const [cartTotal, setCartTotal] = useState(0)

  const getVouchers = async () => {
    try {
      setIsLoading(true)
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_APP_URL}/voucher/all`,
      )
      setVouchers(response.data.vouchers || [])
    } catch (error) {
      alert(error.response?.data?.message || "Không tải được danh sách voucher")
    } finally {
      setIsLoading(false)
    }
  }

  // Lấy tổng tiền giỏ hàng hiện tại để kiểm tra "có đủ điều kiện nhận không"
  // ở phần xem chi tiết — nếu chưa đăng nhập / lỗi thì coi như 0, chỉ ảnh
  // hưởng tới phần gợi ý, không chặn việc xem thông tin voucher
  const getCartTotal = async () => {
    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_APP_URL}/cart/total`,
      )
      setCartTotal(response.data.total || 0)
    } catch (error) {
      setCartTotal(0)
    }
  }

  // Danh sách _id voucher user đã nhận rồi, để disable nút + hiện "Đã nhận"
  const getClaimedIds = async () => {
    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_APP_URL}/voucher/claimed-ids`,
      )
      setClaimedIds(response.data.voucherIds || [])
    } catch (error) {
      setClaimedIds([])
    }
  }

  useEffect(() => {
    getVouchers()
    getClaimedIds()
    getCartTotal()
  }, [])

  const handleClaim = async (voucher) => {
    const flag = getVoucherStatusFlag(voucher)
    if (flag !== "available" || claimedIds.includes(voucher._id)) return

    setClaimingId(voucher._id)
    try {
      await axiosInstance.post(
        `${import.meta.env.VITE_APP_URL}/voucher/claim`,
        {
          voucherId: voucher._id,
        },
      )
      setClaimedIds((prev) => [...prev, voucher._id])
      setVouchers((prev) =>
        prev.map((v) =>
          v._id === voucher._id ? { ...v, quantity: v.quantity - 1 } : v,
        ),
      )
    } catch (error) {
      alert(error.response?.data?.message || "Không nhận được voucher")
    } finally {
      setTimeout(() => setClaimingId(null), 500)
    }
  }

  const visibleVouchers = useMemo(() => {
    let list = [...vouchers]

    if (filterType !== "all") {
      list = list.filter((v) => v.voucher_type === filterType)
    }

    switch (sort) {
      case "expiring":
        list.sort((a, b) => new Date(a.end_date) - new Date(b.end_date))
        break
      case "discount":
        list.sort((a, b) => (b.discount_value || 0) - (a.discount_value || 0))
        break
      case "newest":
      default:
        list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        break
    }

    return list
  }, [vouchers, filterType, sort])

  const isEligible = (voucher) => cartTotal >= (voucher.min_order_value || 0)

  return (
    <div className="voucher-page container">
      <div className="voucher-breadcrumb">Trang chủ &gt; Voucher</div>

      {/* ================= HERO ================= */}
      <div className="voucher-hero">
        <div className="hero-left">
          <div className="hero-icon">
            <i className="fa-solid fa-ticket"></i>
          </div>
          <div>
            <h1>KHO VOUCHER</h1>
            <p>Săn ngay ưu đãi - Tiết kiệm hơn mỗi đơn hàng!</p>
          </div>
        </div>

        <ul className="hero-features">
          <li>
            <i className="fa-solid fa-gift"></i> Voucher đa dạng
          </li>
          <li>
            <i className="fa-solid fa-shield-halved"></i> Dễ dàng sử dụng
          </li>
          <li>
            <i className="fa-solid fa-bolt"></i> Cập nhật liên tục
          </li>
        </ul>

        <div className="hero-art">
          <div className="floating-badge badge-percent">
            <i className="fa-solid fa-percent"></i>
          </div>
          <div className="floating-badge badge-ticket">-50%</div>
          <i className="fa-solid fa-laptop hero-laptop"></i>
          <span className="spark spark-1"></span>
          <span className="spark spark-2"></span>
          <span className="spark spark-3"></span>
        </div>
      </div>

      {/* ================= FILTER + SORT ================= */}
      <div className="voucher-toolbar">
        <div className="filter-tabs">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={filterType === tab.value ? "active" : ""}
              onClick={() => setFilterType(tab.value)}
            >
              <i className={tab.icon}></i> {tab.label}
            </button>
          ))}
        </div>

        <div className="sort-control">
          <label htmlFor="voucher-sort">Sắp xếp:</label>
          <select
            id="voucher-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
              >
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ================= DANH SÁCH VOUCHER ================= */}
      <div className="voucher-panel">
        <div className="voucher-panel-heading">
          <i className="fa-solid fa-ticket"></i>
          <div>
            <h2>Voucher đang có</h2>
            <p>
              Nhanh tay nhận voucher để tận hưởng những ưu đãi hấp dẫn nhất!
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="voucher-grid">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                className="voucher-card skeleton"
                key={n}
              >
                <div className="skeleton-block"></div>
                <div className="skeleton-lines">
                  <div className="skeleton-line w-60"></div>
                  <div className="skeleton-line w-90"></div>
                  <div className="skeleton-line w-40"></div>
                </div>
              </div>
            ))}
          </div>
        ) : visibleVouchers.length === 0 ? (
          <div className="voucher-empty">
            <i className="fa-solid fa-ticket"></i>
            <h3>Không có voucher nào phù hợp</h3>
            <p>Thử chọn bộ lọc khác hoặc quay lại sau nhé.</p>
          </div>
        ) : (
          <div className="voucher-grid">
            {visibleVouchers.map((voucher, index) => {
              const flag = getVoucherStatusFlag(voucher)
              const claimed = claimedIds.includes(voucher._id)
              const isClaiming = claimingId === voucher._id
              const headline = getVoucherHeadline(voucher)
              const typeClass =
                voucher.voucher_type === "shipping"
                  ? "type-shipping"
                  : "type-product"

              return (
                <div
                  className={`voucher-card ${typeClass} ${flag !== "available" ? "disabled" : ""}`}
                  key={voucher._id}
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="voucher-left">
                    <p className="headline-label">
                      {voucher.voucher_type === "shipping" ? "" : "GIẢM"}
                    </p>
                    <p className="headline-title">{headline.title}</p>
                    {headline.subtitle && (
                      <p className="headline-subtitle">{headline.subtitle}</p>
                    )}
                    {voucher.max_discount &&
                      voucher.discount_type === "percent" && (
                        <p className="headline-cap">
                          TỐI ĐA {formatPrice(voucher.max_discount)}
                        </p>
                      )}
                    <i className="fa-solid fa-tag left-icon"></i>
                  </div>

                  <div className="voucher-right">
                    <div className="voucher-right-top">
                      <div>
                        <span className="voucher-code">{voucher.code}</span>
                        <span className={`type-chip ${typeClass}`}>
                          {voucher.voucher_type === "shipping"
                            ? "Vận chuyển"
                            : "Giảm giá"}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="detail-btn"
                        onClick={() => setDetailVoucher(voucher)}
                        aria-label="Xem chi tiết voucher"
                      >
                        <i className="fa-solid fa-circle-info"></i>
                      </button>
                    </div>

                    <p className="voucher-condition">
                      <i className="fa-regular fa-gift"></i> Đơn tối thiểu{" "}
                      {formatPrice(voucher.min_order_value)}
                    </p>
                    <p className="voucher-hsd">
                      <i className="fa-regular fa-calendar"></i> HSD:{" "}
                      {formatDate(voucher.end_date)}
                    </p>

                    <button
                      type="button"
                      className={`claim-btn ${claimed ? "claimed" : ""} ${isClaiming ? "claiming" : ""}`}
                      disabled={flag !== "available" || claimed || isClaiming}
                      onClick={() => handleClaim(voucher)}
                    >
                      {flag === "expired" ? (
                        "Đã hết hạn"
                      ) : flag === "out_of_stock" ? (
                        "Đã hết lượt"
                      ) : claimed ? (
                        <>
                          <i className="fa-solid fa-check"></i> Đã nhận
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-gift"></i> Nhận voucher
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="voucher-note">
        <i className="fa-solid fa-circle-info"></i>
        <span>
          Lưu ý: Mỗi voucher chỉ có thể sử dụng 1 lần cho mỗi đơn hàng. Vui lòng
          kiểm tra điều kiện áp dụng trước khi nhận.
        </span>
      </div>

      {/* ================= MODAL XEM CHI TIẾT ================= */}
      {detailVoucher && (
        <div
          className="voucher-modal-overlay"
          onClick={() => setDetailVoucher(null)}
        >
          <div
            className="voucher-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setDetailVoucher(null)}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div
              className={`modal-headline ${
                detailVoucher.voucher_type === "shipping"
                  ? "type-shipping"
                  : "type-product"
              }`}
            >
              <p className="modal-title">
                {getVoucherHeadline(detailVoucher).title}
              </p>
              {getVoucherHeadline(detailVoucher).subtitle && (
                <p className="modal-subtitle">
                  {getVoucherHeadline(detailVoucher).subtitle}
                </p>
              )}
              <p className="modal-code">Mã: {detailVoucher.code}</p>
            </div>

            <ul className="modal-info-list">
              <li>
                <i className="fa-regular fa-gift"></i>
                Đơn hàng tối thiểu:{" "}
                <strong>{formatPrice(detailVoucher.min_order_value)}</strong>
              </li>
              {detailVoucher.max_discount && (
                <li>
                  <i className="fa-solid fa-scissors"></i>
                  Giảm tối đa:{" "}
                  <strong>{formatPrice(detailVoucher.max_discount)}</strong>
                </li>
              )}
              <li>
                <i className="fa-regular fa-calendar"></i>
                Thời hạn:{" "}
                <strong>
                  {formatDate(detailVoucher.start_date)} -{" "}
                  {formatDate(detailVoucher.end_date)}
                </strong>
              </li>
              <li>
                <i className="fa-solid fa-layer-group"></i>
                Số lượng còn lại: <strong>{detailVoucher.quantity}</strong>
              </li>
            </ul>

            {/* KIỂM TRA ĐIỀU KIỆN — so đơn hàng hiện tại của user với min_order_value */}
            <div
              className={`eligibility-box ${isEligible(detailVoucher) ? "eligible" : "not-eligible"}`}
            >
              {isEligible(detailVoucher) ? (
                <>
                  <i className="fa-solid fa-circle-check"></i>
                  <span>
                    Giỏ hàng của bạn ({formatPrice(cartTotal)}) đã đủ điều kiện
                    áp dụng voucher này!
                  </span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  <span>
                    Bạn cần mua thêm{" "}
                    <strong>
                      {formatPrice(
                        Math.max(
                          (detailVoucher.min_order_value || 0) - cartTotal,
                          0,
                        ),
                      )}
                    </strong>{" "}
                    nữa để đủ điều kiện áp dụng voucher này.
                  </span>
                </>
              )}
            </div>

            <button
              type="button"
              className={`claim-btn modal-claim-btn ${
                claimedIds.includes(detailVoucher._id) ? "claimed" : ""
              }`}
              disabled={
                getVoucherStatusFlag(detailVoucher) !== "available" ||
                claimedIds.includes(detailVoucher._id)
              }
              onClick={() => handleClaim(detailVoucher)}
            >
              {claimedIds.includes(detailVoucher._id) ? (
                <>
                  <i className="fa-solid fa-check"></i> Đã nhận voucher này
                </>
              ) : (
                <>
                  <i className="fa-solid fa-gift"></i> Nhận voucher ngay
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
