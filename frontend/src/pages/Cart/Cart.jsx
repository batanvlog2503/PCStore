import React, { useState, useMemo, useCallback, useEffect } from "react"
import { MdDelete, MdCheckCircle, MdError } from "react-icons/md"
import "./Cart.scss"
import axiosInstance from "../../utils/axiosInstance"
import { Link } from "react-router-dom"
const formatVND = (value) => value.toLocaleString("vi-VN") + "đ"

const TrustItem = ({ icon, title, subtitle }) => (
  <div className="trust-item">
    <span
      className="trust-item__icon"
      aria-hidden="true"
    >
      {icon}
    </span>
    <div className="trust-item__text">
      <p className="trust-item__title">{title}</p>
      <p className="trust-item__subtitle">{subtitle}</p>
    </div>
  </div>
)

export default function Cart() {
  const [items, setItems] = useState([])
  const [couponInput, setCouponInput] = useState("")
  const [couponMessage, setCouponMessage] = useState(null)

  const [itemToDelete, setItemToDelete] = useState(null) // item đang chờ xác nhận xoá
  const [deletingId, setDeletingId] = useState(null) // _id đang gọi API xoá (để hiện spinner)
  const [isLoading, setIsLoading] = useState(true)

  // Toast đơn giản, tự viết — không cần cài thêm thư viện ngoài
  const [toast, setToast] = useState(null) // { type: "success" | "error", message: string }

  const showToast = (type, message) => {
    setToast({ type, message })
  }

  // Toast tự ẩn sau 2.5s
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(timer)
  }, [toast])

  const getMyCart = async () => {
    try {
      setIsLoading(true)
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_APP_URL}/cart/my-cart/all`,
      )

      if (response.data.success) {
        const formatItems = response?.data?.items.map((item) => ({
          ...item,
          checked: false,
        }))
        setItems(formatItems)
      }
    } catch (error) {
      alert(error?.response?.data?.message || "Get My Cart failed ")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getMyCart()
  }, [])

  const allChecked = items.length > 0 && items.every((it) => it.checked)

  const handleToggleAll = useCallback(() => {
    setItems((prev) => prev.map((it) => ({ ...it, checked: !allChecked })))
  }, [allChecked])

  const handleToggleItem = useCallback((id) => {
    setItems((prev) =>
      prev.map((it) => (it._id === id ? { ...it, checked: !it.checked } : it)),
    )
  }, [])

  const handleQuantityChange = useCallback((id, delta) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it._id !== id) return it
        const next = Math.min(Math.max(it.quantity + delta, 1), it.stock)
        return { ...it, quantity: next }
      }),
    )
  }, [])

  const selectedItems = useMemo(() => items.filter((it) => it.checked), [items])

  const subtotal = useMemo(
    () =>
      selectedItems.reduce(
        (sum, it) => sum + it.discount_price * it.quantity,
        0,
      ),
    [selectedItems],
  )

  const productDiscount = useMemo(
    () =>
      selectedItems.reduce((sum, it) => {
        if (!it.price) return sum
        return sum + (it.price - it.discount_price) * it.quantity
      }, 0),
    [selectedItems],
  )

  const discountPercent = (item) =>
    item?.price && item?.discount_price
      ? Math.round(((item.price - item.discount_price) / item.price) * 100)
      : 0

  const shippingFee = 0
  const total = subtotal

  const handleApplyCoupon = (e) => {
    e.preventDefault()
    // TODO: gọi API POST /vouchers/apply với couponInput + subtotal - productDiscount
  }

  const handleOpenDeleteConfirm = (item) => {
    setItemToDelete(item)
  }

  const handleCloseDeleteConfirm = () => {
    setItemToDelete(null)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    const id = itemToDelete._id
    const name = itemToDelete.product_name

    setDeletingId(id) // bật spinner + làm mờ đúng dòng này
    setItemToDelete(null) // đóng modal ngay, không đợi API

    try {
      await axiosInstance.delete(
        `${import.meta.env.VITE_APP_URL}/cart-item/delete/${id}`,
      )
      setItems((prev) => prev.filter((it) => it._id !== id))
      showToast("success", `Đã xoá "${name}" khỏi giỏ hàng`)
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Xoá sản phẩm thất bại",
      )
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="cart-loading">
        <div className="spinner"></div>
        <p>Đang tải giỏ hàng...</p>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="cart-page__container">
        <h1 className="cart-title">
          Giỏ hàng của bạn{" "}
          <span className="cart-title__count">({items.length} sản phẩm)</span>
        </h1>

        {items.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty__icon">🛒</div>
            <p className="cart-empty__title">Giỏ hàng của bạn đang trống</p>
            <p className="cart-empty__subtitle">
              Hãy khám phá thêm sản phẩm và quay lại đây nhé
            </p>
            <p className="btn btn--primary">
              <Link to="/">Tiếp tục mua hàng</Link>
            </p>
          </div>
        ) : (
          <div className="cart-layout">
            <section
              className="cart-panel"
              aria-label="Danh sách sản phẩm"
            >
              <div className="cart-table">
                <div className="cart-table__head">
                  <label className="cart-checkbox cart-table__head-select">
                    <input
                      type="checkbox"
                      checked={allChecked}
                      onChange={handleToggleAll}
                      aria-label="Chọn tất cả sản phẩm"
                    />
                    <span className="cart-checkbox__box" />
                    <span className="cart-table__head-label">Sản phẩm</span>
                  </label>
                  <span className="cart-table__head-price">Đơn giá</span>
                  <span className="cart-table__head-qty">Số lượng</span>
                  <span className="cart-table__head-total">Thành tiền</span>
                  <span className="cart-table__head-action">Thao tác</span>
                </div>

                <ul className="cart-table__body">
                  {items.map((item) => {
                    const isDeletingRow = deletingId === item._id

                    return (
                      <li
                        key={item._id}
                        className={`cart-row${isDeletingRow ? " cart-row--removing" : ""}`}
                      >
                        <label className="cart-checkbox cart-row__select">
                          <input
                            type="checkbox"
                            checked={item?.checked}
                            onChange={() => handleToggleItem(item._id)}
                            aria-label={`Chọn ${item?.product_name}`}
                            disabled={isDeletingRow}
                          />
                          <span className="cart-checkbox__box" />
                        </label>

                        <div className="cart-row__product">
                          <div className="cart-row__thumb">
                            <img
                              src={`${import.meta.env.VITE_APP_URL}${item.image_url}`}
                              alt={item?.product_name}
                              loading="lazy"
                            />
                          </div>
                          <div className="cart-row__info">
                            <p className="cart-row__name">
                              {item?.product_name}
                            </p>
                            {item?.config_name && (
                              <p className="cart-row__config">
                                {item?.config_name}
                              </p>
                            )}
                            <p
                              className={`cart-row__stock${
                                item?.stock ? "" : " cart-row__stock--out"
                              }`}
                            >
                              <span
                                className="cart-row__stock-dot"
                                aria-hidden="true"
                              />
                              {item?.stock ? "Còn hàng" : "Hết hàng"}
                            </p>
                          </div>
                        </div>

                        <div
                          className="cart-row__price"
                          data-label="Đơn giá"
                        >
                          <span className="cart-row__price-current">
                            {formatVND(item?.discount_price)}
                          </span>
                          {item.price && (
                            <>
                              <span className="cart-row__price-old">
                                {formatVND(item.price)}
                              </span>
                              {item?.discount_price != null &&
                                item?.discount_price < item?.price && (
                                  <span className="cart-row__price-badge">
                                    -{discountPercent(item)}%
                                  </span>
                                )}
                            </>
                          )}
                        </div>

                        <div
                          className="cart-row__qty"
                          data-label="Số lượng"
                        >
                          <div className="qty-stepper">
                            <button
                              type="button"
                              className="qty-stepper__btn"
                              onClick={() => handleQuantityChange(item._id, -1)}
                              disabled={item.quantity <= 1 || isDeletingRow}
                              aria-label={`Giảm số lượng ${item?.name}`}
                            >
                              −
                            </button>
                            <span className="qty-stepper__value">
                              {item?.quantity}
                            </span>
                            <button
                              type="button"
                              className="qty-stepper__btn"
                              onClick={() => handleQuantityChange(item._id, 1)}
                              disabled={
                                item.quantity >= item?.stock || isDeletingRow
                              }
                              aria-label={`Tăng số lượng ${item?.product_name}`}
                            >
                              +
                            </button>
                          </div>
                          <p className="cart-row__stock-left">
                            Còn {item.stock} sản phẩm
                          </p>
                        </div>

                        <div
                          className="cart-row__total"
                          data-label="Thành tiền"
                        >
                          {formatVND(item?.discount_price * item.quantity)}
                        </div>

                        <div className="cart-row__action">
                          <button
                            type="button"
                            className="icon-btn icon-btn--danger"
                            aria-label={`Xóa ${item.product_name}`}
                            title="Xóa sản phẩm"
                            onClick={() => handleOpenDeleteConfirm(item)}
                            disabled={isDeletingRow}
                          >
                            {isDeletingRow ? (
                              <span className="btn-spinner"></span>
                            ) : (
                              <MdDelete />
                            )}
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>

              <div className="cart-panel__footer">
                <label className="cart-checkbox">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={handleToggleAll}
                  />
                  <span className="cart-checkbox__box" />
                  <span>Chọn tất cả</span>
                </label>

                <Link
                  to="/"
                  className="btn btn--outline cart-panel__continue"
                >
                  Tiếp tục mua hàng
                </Link>
              </div>
            </section>

            <aside
              className="order-summary"
              aria-label="Tổng đơn hàng"
            >
              <div className="order-summary__card">
                <h2 className="order-summary__title">Tổng đơn hàng</h2>

                <div className="order-summary__row">
                  <span>Tạm tính ({selectedItems.length} sản phẩm)</span>
                  <span>{formatVND(subtotal)}</span>
                </div>

                {productDiscount > 0 && (
                  <div className="order-summary__row order-summary__row--discount">
                    <span>Giảm giá sản phẩm</span>
                    <span>-{formatVND(productDiscount)}</span>
                  </div>
                )}

                <form
                  className="coupon-form"
                  onSubmit={handleApplyCoupon}
                >
                  <input
                    type="text"
                    className="coupon-form__input"
                    placeholder="Nhập mã giảm giá"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value)
                      if (couponMessage) setCouponMessage(null)
                    }}
                  />
                  <button
                    type="submit"
                    className="coupon-form__btn"
                  >
                    Áp dụng
                  </button>
                </form>
                {couponMessage && (
                  <p className="coupon-form__message">{couponMessage}</p>
                )}

                <div className="order-summary__row">
                  <span className="order-summary__ship-label">
                    <b>Phí vận chuyển: </b>
                  </span>
                  <span className="order-summary__free">Miễn phí</span>
                </div>
                <hr />

                <div className="order-summary__row order-summary__row--total">
                  <span>Tổng thanh toán</span>
                  <div className="order-summary__total-value">
                    <strong>{formatVND(Math.max(total, 0))}</strong>
                    <small>(Đã bao gồm VAT)</small>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn--checkout"
                  disabled={selectedItems.length === 0}
                >
                  Tiến hành đặt hàng
                </button>

                <ul className="order-summary__perks">
                  <li>
                    <div>
                      <p>Miễn phí giao hàng</p>
                      <small>Cho đơn hàng từ 2.000.000đ</small>
                    </div>
                  </li>
                  <li>
                    <div>
                      <p>Đổi trả dễ dàng</p>
                      <small>Trong 7 ngày nếu lỗi từ nhà sản xuất</small>
                    </div>
                  </li>
                  <li>
                    <div>
                      <p>Thanh toán an toàn</p>
                      <small>Bảo mật thông tin tuyệt đối</small>
                    </div>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        )}

        <section
          className="trust-bar"
          aria-label="Cam kết dịch vụ"
        >
          <TrustItem
            icon="🚚"
            title="Miễn phí giao hàng"
            subtitle="Cho đơn hàng từ 2.000.000đ"
          />
          <TrustItem
            icon="↻"
            title="Đổi trả dễ dàng"
            subtitle="Trong 7 ngày nếu lỗi từ nhà sản xuất"
          />
          <TrustItem
            icon="🛡️"
            title="Thanh toán an toàn"
            subtitle="Bảo mật thông tin tuyệt đối"
          />
          <TrustItem
            icon="🎧"
            title="Hỗ trợ 24/7"
            subtitle="Hotline: 0947.584.056"
          />
        </section>
      </div>

      {/* ================= MODAL XÁC NHẬN XOÁ ================= */}
      {itemToDelete && (
        <div
          className="confirm-modal-backdrop"
          onClick={handleCloseDeleteConfirm}
        >
          <div
            className="confirm-modal-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-modal-icon">
              <MdDelete />
            </div>

            <h3>Xoá sản phẩm khỏi giỏ hàng?</h3>
            <p>
              Bạn có chắc muốn xoá <strong>{itemToDelete?.product_name}</strong>{" "}
              khỏi giỏ hàng không? Hành động này không thể hoàn tác.
            </p>

            <div className="confirm-modal-actions">
              <button
                className="cancel-btn"
                onClick={handleCloseDeleteConfirm}
              >
                Huỷ
              </button>
              <button
                className="delete-btn"
                onClick={handleConfirmDelete}
              >
                Xoá sản phẩm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TOAST ================= */}
      {toast && (
        <div className={`toast toast--${toast.type}`}>
          {toast.type === "success" ? <MdCheckCircle /> : <MdError />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  )
}
