import React, { useEffect, useMemo, useState } from "react"
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom"
import axiosInstance from "../../utils/axiosInstance"
import AddressSelectModal from "./AddressSelectModal.jsx"
import "./Checkout.scss"
import { PAYMENT_METHODS } from "./PaymentMethod.js"

const Checkout = () => {
  const savedUser = localStorage.getItem("user")
  const location = useLocation()
  const navigate = useNavigate()
  const cartItemIds = location.state?.cartItemIds

  // items đã được chọn từ cart sang phần chekcout
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const [form, setForm] = useState({
    receiver_name: "",
    phone: "",
    email: "",
    detail: "",
    province: "",
    district: "",
    ward: "",
    detail: "",
    note: "",
  })
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [voucherCode, setVoucherCode] = useState("")
  const [appliedVoucher, setAppliedVoucher] = useState(null)
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formatPrice = (price) => {
    if (price == null) return ""
    return price.toLocaleString("vi-VN") + "đ"
  }

  // Lấy lại TOÀN BỘ giỏ hàng từ server, rồi chỉ giữ đúng những item có _id
  // nằm trong cartItemIds (mảng id đã chọn, gửi qua từ Cart.jsx).
  // Không dùng data cũ truyền qua state -> luôn có giá/tồn kho mới nhất.
  const getCheckoutItems = async () => {
    try {
      setIsLoading(true)
      setLoadError(null)

      const response = await axiosInstance.get(
        `${import.meta.env.VITE_APP_URL}/cart/my-cart/all`,
      )

      if (!response.data.success) {
        throw new Error("Không lấy được giỏ hàng")
      }

      // selected là những items được chọn
      const selected = response.data.items.filter((item) =>
        cartItemIds.includes(item._id),
      )

      if (selected.length === 0) {
        // Có thể sản phẩm đã bị xoá khỏi giỏ / hết hàng giữa lúc chuyển trang
        setLoadError(
          "Không tìm thấy sản phẩm đã chọn (có thể đã bị xoá khỏi giỏ hàng). Vui lòng quay lại giỏ hàng và chọn lại.",
        )
      }

      setItems(selected)
    } catch (error) {
      setLoadError(
        error.response?.data?.message || "Không tải được thông tin đơn hàng",
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (cartItemIds && cartItemIds.length > 0) {
      getCheckoutItems()
    }
  }, []) // chỉ chạy 1 lần khi vào trang

  useEffect(() => {
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        setForm((prev) => ({
          ...prev,
          receiver_name: user.receiver_name || prev.receiver_name,
          phone: user.phone || prev.phone,
          email: user.email || prev.email,
        }))
      } catch {
        // bỏ qua nếu localStorage lỗi format
      }
    }
  }, [])
  const getDefaultAddress = async () => {
    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_APP_URL}/address/my-address`,
      )
      const addresses = response.data.addresses || []
      const defaultAddress = addresses.find((a) => a.is_default)

      if (defaultAddress) {
        handleSelectAddress(defaultAddress) // ← tái dùng lại đúng hàm đã có, không viết code trùng lặp
      }
    } catch (error) {
      console.error(error) // im lặng bỏ qua, không chặn cả trang nếu lỗi
    }
  }
  useEffect(() => {
    getDefaultAddress()
  }, [])
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSelectAddress = (address) => {
    setSelectedAddressId(address._id)
    setForm((prev) => ({
      ...prev,
      receiver_name: address.receiver_name,
      phone: address.phone,
      detail: address.detail,
      province: address.province,
      district: address.district,
      ward: address.ward,
      detail: address.detail,
    }))
  }

  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + it.discount_price * it.quantity, 0),
    [items],
  )

  const productDiscount = useMemo(
    () =>
      items.reduce((sum, it) => {
        if (!it.price) return sum
        return sum + (it.price - it.discount_price) * it.quantity
      }, 0),
    [items],
  )

  const voucherDiscount = appliedVoucher?.discount_amount || 0
  const total = Math.max(0, subtotal - productDiscount - voucherDiscount)

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return
    setIsApplyingVoucher(true)
    try {
      const response = await axiosInstance.post(
        `${import.meta.env.VITE_APP_URL}/vouchers/apply`,
        { code: voucherCode.trim(), order_total: subtotal - productDiscount },
      )
      setAppliedVoucher(response.data.data)
    } catch (error) {
      setAppliedVoucher(null)
      alert(error.response?.data?.message || "Mã giảm giá không hợp lệ")
    } finally {
      setIsApplyingVoucher(false)
    }
  }

  const isFormValid =
    form.receiver_name.trim() &&
    form.phone.trim() &&
    form.detail.trim() &&
    form.province.trim() &&
    form.district.trim() &&
    form.ward.trim()

  const handlePlaceOrder = async () => {
    if (!isFormValid || isSubmitting || items.length === 0) return

    setIsSubmitting(true)
    try {
      const response = await axiosInstance.post(
        `${import.meta.env.VITE_APP_URL}/order/add`,
        {
          cart_item_ids: cartItemIds,
          address_id: selectedAddressId,
          payment_method: paymentMethod,

          note: form.note,
        },
      )

      if (response.data.success) {
        const order = response.data.order

        navigate(`/order-success/${order._id}`, { state: { order } })
      }
    } catch (error) {
      alert(
        error.response?.data?.message || "Đặt hàng thất bại, vui lòng thử lại",
      )
    } finally {
      setIsSubmitting(false)
    }
  }
  const calculateOrderAmount = (items) => {
    const subtotal = items.reduce((total, item) => {
      return total + item.price * item.quantity
    }, 0)
    const product_discount = items.reduce((total, item) => {
      const discount = item.price - item.discount_price
      return total + Math.max(discount, 0) * quantity
    }, 0)

    const voucher_discount = 0

    const shipping_fee = 0

    const total_amount =
      subtotal - product_discount - voucher_discount + shipping_fee

    return {
      subtotal,
      product_discount,
      voucher_discount,
      shipping_fee,
      total_amount,
    }
  }
  // frontend gửi khi tạo order
  // const {
  //   cart_item_ids,
  //   address_id,
  //   payment_method,
  //   note,
  // } = data
  // Không có cartItemIds (vào thẳng URL /checkout, hoặc F5 mất state) -> đá về giỏ hàng
  if (!cartItemIds || cartItemIds.length === 0) {
    return (
      <Navigate
        to="/cart"
        replace
      />
    )
  }

  if (isLoading) {
    return (
      <div className="checkout-loading">
        <div className="spinner"></div>
        <p>Đang tải thông tin đơn hàng...</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="checkout-error">
        <i className="fa-solid fa-circle-exclamation"></i>
        <p>{loadError}</p>
        <Link
          to="/cart"
          className="back-to-cart-btn"
        >
          Quay lại giỏ hàng
        </Link>
      </div>
    )
  }

  return (
    <div className="container p-0 order-page">
      <div className="breadcrumb">
        <Link to="/cart">Giỏ hàng</Link>
        <span>›</span>
        <span className="current">Thanh toán</span>
        <span>›</span>
        <span>Hoàn tất</span>
      </div>

      <div className="order-header">
        <div>
          <Link
            to="/cart"
            className="back-link"
          >
            <i className="fa-solid fa-arrow-left"></i> Quay lại giỏ hàng
          </Link>
          <h2>Thanh toán</h2>
          <p>Vui lòng kiểm tra thông tin và xác nhận đơn hàng</p>
        </div>

        <div className="stepper">
          <div className="step active">
            <span className="step-num">1</span>
            <span className="step-label">Thông tin</span>
          </div>
          <div className="step-line"></div>
          <div className="step">
            <span className="step-num">2</span>
            <span className="step-label">Thanh toán</span>
          </div>
          <div className="step-line"></div>
          <div className="step">
            <span className="step-num">3</span>
            <span className="step-label">Hoàn tất</span>
          </div>
        </div>
      </div>

      <div className="order-layout">
        {/* ================= CỘT TRÁI: FORM ================= */}
        <div className="order-form">
          <div className="form-section">
            <div className="section-title">
              <h3>
                <span className="bar"></span> 1. Thông tin nhận hàng
              </h3>
              <button
                type="button"
                className="select-address-btn"
                onClick={() => setIsAddressModalOpen(true)}
              >
                <i className="fa-solid fa-location-dot"></i> Chọn địa chỉ có sẵn
              </button>
            </div>

            <div className="form-grid-2">
              <div className="form-row">
                <label>
                  Họ và tên <span className="required">*</span>
                </label>
                <div className="input-with-icon">
                  <i className="fa-regular fa-user"></i>
                  <input
                    type="text"
                    name="receiver_name"
                    value={form.receiver_name}
                    onChange={handleChange}
                    placeholder="Nhập họ và tên"
                    disabled
                  />
                </div>
              </div>

              <div className="form-row">
                <label>
                  Số điện thoại <span className="required">*</span>
                </label>
                <div className="input-with-icon">
                  <i className="fa-solid fa-phone"></i>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại"
                    disabled
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <label>Email (không bắt buộc)</label>
              <div className="input-with-icon">
                <i className="fa-regular fa-envelope"></i>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Nhập email"
                  disabled
                />
              </div>
            </div>

            <div className="form-row">
              <label>
                Địa chỉ cụ thể <span className="required">*</span>
              </label>
              <div className="input-with-icon">
                <i className="fa-solid fa-location-dot"></i>
                <input
                  type="text"
                  name="detail"
                  value={form.detail}
                  onChange={handleChange}
                  placeholder="Số nhà, tên đường..."
                  disabled
                />
              </div>
            </div>

            <div className="form-grid-3">
              <div className="form-row">
                <label>
                  Tỉnh / Thành phố <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="province"
                  value={form.province}
                  onChange={handleChange}
                  disabled
                  placeholder="VD: Hà Nội"
                />
              </div>
              <div className="form-row">
                <label>
                  Quận / Huyện <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  placeholder="VD: Cầu Giấy"
                  disabled
                />
              </div>
              <div className="form-row">
                <label>
                  Phường / Xã <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="ward"
                  value={form.ward}
                  onChange={handleChange}
                  placeholder="VD: Trung Hòa"
                  disabled
                />
              </div>
            </div>

            <div className="form-row">
              <label>Ghi chú đơn hàng (không bắt buộc)</label>
              <textarea
                name="note"
                maxLength={200}
                value={form.note}
                onChange={handleChange}
                placeholder="Ví dụ: Giao hàng giờ hành chính, gọi trước khi giao..."
              ></textarea>
              <span className="char-count">{form.note.length}/200</span>
            </div>
          </div>

          <div className="form-section">
            <h3>
              <span className="bar"></span> 2. Phương thức thanh toán
            </h3>

            <div className="payment-methods">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.id}
                  className={`payment-option ${
                    paymentMethod === method.id ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                  />
                  <span className="radio-dot"></span>
                  <div className="payment-text">
                    <p>{method.title}</p>
                    <span>{method.subtitle}</span>
                  </div>
                  <i className={method.icon}></i>
                </label>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h3>
              <span className="bar"></span> 3. Mã giảm giá
            </h3>
            <div className="voucher-input">
              <input
                type="text"
                placeholder="Nhập mã giảm giá của bạn"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
              />
              <button
                onClick={handleApplyVoucher}
                disabled={isApplyingVoucher}
              >
                {isApplyingVoucher ? "..." : "Áp dụng"}
              </button>
            </div>
          </div>
        </div>

        {/* ================= CỘT PHẢI: TÓM TẮT ĐƠN HÀNG ================= */}
        <div className="order-summary">
          <h3>Đơn hàng của bạn ({items.length} sản phẩm)</h3>

          <div className="summary-items">
            {items.map((item) => (
              <div
                className="summary-item"
                key={item._id}
              >
                <img
                  src={`${import.meta.env.VITE_APP_URL}${item.image_url}`}
                  alt={item.product_name}
                />
                <div className="item-text">
                  <p className="name">{item.product_name}</p>
                  {item.config_name && (
                    <p className="config">{item.config_name}</p>
                  )}
                  <span className="qty">x{item.quantity}</span>
                </div>
                <div className="item-price">
                  <span className="price-new">
                    {formatPrice(item.discount_price)}
                  </span>
                  {item.price != null && item.price > item.discount_price && (
                    <span className="price-old">{formatPrice(item.price)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="summary-row">
            <span>Tạm tính</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          {productDiscount > 0 && (
            <div className="summary-row discount">
              <span>Giảm giá sản phẩm</span>
              <span>-{formatPrice(productDiscount)}</span>
            </div>
          )}

          {voucherDiscount > 0 && (
            <div className="summary-row discount">
              <span>Mã giảm giá ({appliedVoucher.code})</span>
              <span>-{formatPrice(voucherDiscount)}</span>
            </div>
          )}

          <div className="summary-row">
            <span>Phí vận chuyển</span>
            <span className="free-ship">Miễn phí</span>
          </div>

          <div className="summary-total">
            <span>Tổng thanh toán</span>
            <span className="total-price">{formatPrice(total)}</span>
          </div>
          <p className="vat-note">(Đã bao gồm VAT)</p>

          <div className="secure-note">
            <i className="fa-solid fa-shield-halved"></i> Thông tin của bạn được
            bảo mật tuyệt đối
          </div>

          <button
            className="place-order-btn"
            onClick={handlePlaceOrder}
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? (
              <i className="fa-solid fa-spinner fa-spin"></i>
            ) : (
              <>
                <i className="fa-solid fa-lock"></i> Đặt hàng
              </>
            )}
          </button>

          <p className="terms-note">
            Bằng việc đặt hàng, bạn đồng ý với{" "}
            <Link to="/terms">Điều khoản sử dụng</Link> của chúng tôi
          </p>
        </div>
      </div>

      <AddressSelectModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onConfirm={handleSelectAddress}
      />
    </div>
  )
}

export default Checkout
