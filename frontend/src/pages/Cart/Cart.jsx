import React, { useState, useMemo, useCallback } from "react"
import "./Cart.scss"

const INITIAL_ITEMS = [
  {
    id: 1,
    name: "MSI Katana 15",
    config: "Cấu hình: Core i7 / RAM 16GB / SSD 1TB",
    image:
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=300&auto=format&fit=crop",
    price: 32990000,
    oldPrice: 34990000,
    discountPercent: 6,
    stock: 12,
    inStock: true,
    quantity: 1,
    checked: true,
  },
  {
    id: 2,
    name: "Chuột Gaming ASUS ROG Gladius III",
    config: null,
    image:
      "https://images.unsplash.com/photo-1527814050087-3793815479db?q=80&w=300&auto=format&fit=crop",
    price: 1290000,
    oldPrice: null,
    discountPercent: 0,
    stock: 25,
    inStock: true,
    quantity: 1,
    checked: true,
  },
]

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
  const [items, setItems] = useState(INITIAL_ITEMS)
  const [couponInput, setCouponInput] = useState("")

  const [removingIds, setRemovingIds] = useState([])

  const allChecked = items.length > 0 && items.every((it) => it.checked)
  const someChecked = items.some((it) => it.checked)

  const handleToggleAll = useCallback(() => {
    setItems((prev) => prev.map((it) => ({ ...it, checked: !allChecked })))
  }, [allChecked])

  const handleToggleItem = useCallback((id) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, checked: !it.checked } : it)),
    )
  }, [])

  const handleQuantityChange = useCallback((id, delta) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it
        const next = Math.min(Math.max(it.quantity + delta, 1), it.stock)
        return { ...it, quantity: next }
      }),
    )
  }, [])

  const selectedItems = useMemo(() => items.filter((it) => it.checked), [items])

  const subtotal = useMemo(
    () => selectedItems.reduce((sum, it) => sum + it.price * it.quantity, 0),
    [selectedItems],
  )

  const productDiscount = useMemo(
    () =>
      selectedItems.reduce((sum, it) => {
        if (!it.oldPrice) return sum
        return sum + (it.oldPrice - it.price) * it.quantity
      }, 0),
    [selectedItems],
  )

  const shippingFee = 0
  const total = subtotal - productDiscount + shippingFee

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
            <a
              href="#/"
              className="btn btn--primary"
            >
              Tiếp tục mua hàng
            </a>
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
                    const isRemoving = removingIds.includes(item.id)
                    return (
                      <li
                        key={item.id}
                        className={`cart-row${isRemoving ? " cart-row--removing" : ""}`}
                      >
                        <label className="cart-checkbox cart-row__select">
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={() => handleToggleItem(item.id)}
                            aria-label={`Chọn ${item.name}`}
                          />
                          <span className="cart-checkbox__box" />
                        </label>

                        <div className="cart-row__product">
                          <div className="cart-row__thumb">
                            <img
                              src={item.image}
                              alt={item.name}
                              loading="lazy"
                            />
                          </div>
                          <div className="cart-row__info">
                            <p className="cart-row__name">{item.name}</p>
                            {item.config && (
                              <p className="cart-row__config">{item.config}</p>
                            )}
                            <p
                              className={`cart-row__stock${
                                item.inStock ? "" : " cart-row__stock--out"
                              }`}
                            >
                              <span
                                className="cart-row__stock-dot"
                                aria-hidden="true"
                              />
                              {item.inStock ? "Còn hàng" : "Hết hàng"}
                            </p>
                          </div>
                        </div>

                        <div
                          className="cart-row__price"
                          data-label="Đơn giá"
                        >
                          <span className="cart-row__price-current">
                            {formatVND(item.price)}
                          </span>
                          {item.oldPrice && (
                            <>
                              <span className="cart-row__price-old">
                                {formatVND(item.oldPrice)}
                              </span>
                              <span className="cart-row__price-badge">
                                -{item.discountPercent}%
                              </span>
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
                              onClick={() => handleQuantityChange(item.id, -1)}
                              disabled={item.quantity <= 1}
                              aria-label={`Giảm số lượng ${item.name}`}
                            >
                              −
                            </button>
                            <span className="qty-stepper__value">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              className="qty-stepper__btn"
                              onClick={() => handleQuantityChange(item.id, 1)}
                              disabled={item.quantity >= item.stock}
                              aria-label={`Tăng số lượng ${item.name}`}
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
                          {formatVND(item.price * item.quantity)}
                        </div>

                        <div className="cart-row__action">
                          <button
                            type="button"
                            className="icon-btn icon-btn--danger"
                            aria-label={`Xóa ${item.name}`}
                            title="Xóa sản phẩm"
                          >
                            Xóa
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

                <button
                  type="button"
                  className="link-btn link-btn--danger"
                  disabled={!someChecked}
                >
                  Xóa đã chọn
                </button>

                <a className="btn btn--outline cart-panel__continue">
                  Tiếp tục mua hàng
                </a>
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

                <form className="coupon-form">
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
    </div>
  )
}
