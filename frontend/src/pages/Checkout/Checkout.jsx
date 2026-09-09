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

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ================= VOUCHER =================
  const [myVouchers, setMyVouchers] = useState([])
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(true)

  // Tách riêng voucher giảm giá sản phẩm và voucher giảm phí ship —
  // mỗi loại có state chọn + state đã áp dụng riêng, đảm bảo chỉ
  // được chọn tối đa 1 voucher mỗi loại (nhờ radio "name" khác nhau)
  const [selectedProductVoucherId, setSelectedProductVoucherId] = useState(null)
  const [selectedShippingVoucherId, setSelectedShippingVoucherId] =
    useState(null)
  const [appliedProductVoucher, setAppliedProductVoucher] = useState(null)
  const [appliedShippingVoucher, setAppliedShippingVoucher] = useState(null)
  // id voucher đang gọi API áp dụng (dùng để hiện spinner + khoá tạm các lựa chọn khác)
  const [applyingVoucherId, setApplyingVoucherId] = useState(null)

  // Lấy voucher user đã nhận (trạng thái "available" là chưa dùng),
  // dùng để render danh sách cho chọn thay vì gõ tay mã code
  const getMyVouchers = async () => {
    try {
      setIsLoadingVouchers(true)
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_APP_URL}/voucher/my`,
      )
      setMyVouchers(response.data.vouchers || [])
    } catch (error) {
      setMyVouchers([])
    } finally {
      setIsLoadingVouchers(false)
    }
  }

  useEffect(() => {
    getMyVouchers()
  }, [])

  const formatPrice = (price) => {
    if (price == null) return ""
    return price.toLocaleString("vi-VN") + "đ"
  }

  // Hiển thị mô tả ngắn gọn mức giảm ngay trên từng voucher
  const formatVoucherDiscount = (voucher) => {
    if (voucher.discount_type === "percent") {
      const cap = voucher.max_discount
        ? ` (tối đa ${formatPrice(voucher.max_discount)})`
        : ""
      return `Giảm ${voucher.discount_value}%${cap}`
    }
    return `Giảm ${formatPrice(voucher.discount_value)}`
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
    () =>
      items.reduce(
        (sum, item) => sum + Number(item.price || 0) * item.quantity,
        0,
      ),
    [items],
  )

  const productDiscount = useMemo(
    () =>
      items.reduce((sum, item) => {
        const price = Number(item.price || 0)
        const discountPrice = Number(item.discount_price || price)

        return sum + Math.max(price - discountPrice, 0) * item.quantity
      }, 0),
    [items],
  )
  const shippingFee = 0

  // Tổng giảm giá từ voucher = giảm sản phẩm + giảm ship (mỗi loại tối đa 1 voucher)
  const productVoucherDiscount = appliedProductVoucher?.discount_amount || 0
  const shippingVoucherDiscount = appliedShippingVoucher?.discount_amount || 0
  const voucherDiscount = productVoucherDiscount + shippingVoucherDiscount

  const total = Math.max(
    0,
    subtotal - productDiscount - voucherDiscount + shippingFee,
  )

  // order_total dùng để server kiểm tra min_order_value — tính giống hệt
  // logic hiển thị summary (đã trừ giảm giá sản phẩm)
  const orderTotalForVoucher = subtotal - productDiscount

  // Voucher chỉ dùng được khi còn hạn, đã bắt đầu, và đơn hàng đạt mức tối thiểu
  const isVoucherUsable = (voucher) => {
    const now = new Date()
    const notExpired = new Date(voucher.end_date) >= now
    const started = new Date(voucher.start_date) <= now
    const enoughOrder = orderTotalForVoucher >= (voucher.min_order_value || 0)
    return notExpired && started && enoughOrder
  }

  // Chia danh sách voucher user đang có thành 2 nhóm theo voucher_type
  const productVouchers = useMemo(
    () =>
      myVouchers.filter((entry) => entry.voucher.voucher_type !== "shipping"),
    [myVouchers],
  )
  const shippingVouchers = useMemo(
    () =>
      myVouchers.filter((entry) => entry.voucher.voucher_type === "shipping"),
    [myVouchers],
  )

  // Dùng chung cho cả 2 nhóm, phân biệt bằng "type" ('product' | 'shipping')
  // để cập nhật đúng state tương ứng, đảm bảo mỗi nhóm chỉ giữ 1 voucher đã chọn
  const handleApplyVoucher = async (entry, type) => {
    const isProduct = type === "product"
    // 1. xác định voucher đang chọn là sản phẩm hay phí shipping
    const currentSelectedId = isProduct
      ? selectedProductVoucherId
      : selectedShippingVoucherId

    // Bấm lại đúng voucher đang chọn -> bỏ áp dụng
    if (currentSelectedId === entry._id) {
      if (isProduct) {
        setSelectedProductVoucherId(null)
        setAppliedProductVoucher(null)
      } else {
        setSelectedShippingVoucherId(null)
        setAppliedShippingVoucher(null)
      }
      return
    }

    setApplyingVoucherId(entry._id)
    if (isProduct) {
      setSelectedProductVoucherId(entry._id)
    } else {
      setSelectedShippingVoucherId(entry._id)
    }

    // kiếm tra và tính số tiền giảm
    try {
      const response = await axiosInstance.post(
        `${import.meta.env.VITE_APP_URL}/voucher/apply`,
        { code: entry.voucher.code, order_total: orderTotalForVoucher },
      )
      console.log("CODE: ", entry.voucher.code)
      console.log("ORDER_TOTAL: ", orderTotalForVoucher)
      if (isProduct) {
        setAppliedProductVoucher(response.data.data)
      } else {
        setAppliedShippingVoucher(response.data.data)
      }
    } catch (error) {
      if (isProduct) {
        setAppliedProductVoucher(null)
        setSelectedProductVoucherId(null)
      } else {
        setAppliedShippingVoucher(null)
        setSelectedShippingVoucherId(null)
      }
      alert(error.response?.data?.message || "Không thể áp dụng voucher này")
    } finally {
      setApplyingVoucherId(null)
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

      const order = response.data.order

      // COD
      if (paymentMethod === "cod") {
        navigate(`/order-success/${order._id}`, {
          state: { order },
        })
        return
      }
      // BANK / SePay
      if (paymentMethod === "bank") {
        navigate(`/order/payment?id=${order._id}`)
        return
      }
    } catch (error) {
      alert(
        error.response?.data?.message || "Đặt hàng thất bại, vui lòng thử lại",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

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

  // Component con dùng chung để render 1 voucher trong danh sách,
  // tránh lặp lại JSX cho 2 nhóm (product / shipping)
  const renderVoucherItem = (entry, type) => {
    const voucher = entry.voucher
    const usable = isVoucherUsable(voucher)
    const isSelected =
      type === "product"
        ? selectedProductVoucherId === entry._id
        : selectedShippingVoucherId === entry._id
    const isThisApplying = applyingVoucherId === entry._id
    const radioGroupName =
      type === "product"
        ? "applied-product-voucher"
        : "applied-shipping-voucher"

    return (
      <label
        key={entry._id}
        className={`voucher-select-item ${isSelected ? "selected" : ""} ${
          !usable ? "disabled" : ""
        } ${type === "shipping" ? "type-shipping" : "type-product"}`}
      >
        <input
          type="radio"
          name={radioGroupName}
          checked={isSelected}
          disabled={!usable || Boolean(applyingVoucherId)}
          onChange={() => handleApplyVoucher(entry, type)}
        />

        <div className="voucher-select-icon">
          <i
            className={
              type === "shipping"
                ? "fa-solid fa-truck-fast"
                : "fa-solid fa-percent"
            }
          ></i>
        </div>

        <div className="voucher-select-info">
          <div className="voucher-select-top">
            <span className="voucher-select-code">{voucher.code}</span>
            {isThisApplying && (
              <i className="fa-solid fa-spinner voucher-select-spinner"></i>
            )}
          </div>
          <p className="voucher-select-desc">
            {formatVoucherDiscount(voucher)}
          </p>
          <p className="voucher-select-condition">
            Đơn tối thiểu {formatPrice(voucher.min_order_value)}
          </p>
          {!usable && (
            <p className="voucher-select-warning">
              {new Date(voucher.end_date) < new Date()
                ? "Voucher đã hết hạn"
                : `Cần mua thêm ${formatPrice(
                    Math.max(
                      (voucher.min_order_value || 0) - orderTotalForVoucher,
                      0,
                    ),
                  )} để dùng voucher này`}
            </p>
          )}
        </div>
      </label>
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

            {isLoadingVouchers ? (
              <p className="voucher-select-loading">
                Đang tải voucher của bạn...
              </p>
            ) : myVouchers.length === 0 ? (
              <p className="voucher-select-empty">
                Bạn chưa có voucher nào. Ghé{" "}
                <Link to="/voucher">Kho voucher</Link> để nhận thêm ưu đãi nhé.
              </p>
            ) : (
              <div className="voucher-select-groups">
                {/* ============= NHÓM GIẢM GIÁ SẢN PHẨM ============= */}
                <div className="voucher-select-group">
                  <p className="voucher-group-title">
                    <i className="fa-solid fa-percent"></i> Giảm giá sản phẩm
                    <span className="voucher-group-hint">(chọn tối đa 1)</span>
                  </p>

                  {productVouchers.length === 0 ? (
                    <p className="voucher-select-empty small">
                      Bạn không có voucher giảm giá sản phẩm nào.
                    </p>
                  ) : (
                    <div className="voucher-select-list">
                      {productVouchers.map((entry) =>
                        renderVoucherItem(entry, "product"),
                      )}
                    </div>
                  )}
                </div>

                {/* ============= NHÓM GIẢM PHÍ SHIP ============= */}
                <div className="voucher-select-group">
                  <p className="voucher-group-title">
                    <i className="fa-solid fa-truck-fast"></i> Miễn phí vận
                    chuyển
                    <span className="voucher-group-hint">(chọn tối đa 1)</span>
                  </p>

                  {shippingVouchers.length === 0 ? (
                    <p className="voucher-select-empty small">
                      Bạn không có voucher miễn phí vận chuyển nào.
                    </p>
                  ) : (
                    <div className="voucher-select-list">
                      {shippingVouchers.map((entry) =>
                        renderVoucherItem(entry, "shipping"),
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
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

          {productVoucherDiscount > 0 && (
            <div className="summary-row discount">
              <span>Voucher ({appliedProductVoucher.code})</span>
              <span>-{formatPrice(productVoucherDiscount)}</span>
            </div>
          )}

          {shippingVoucherDiscount > 0 && (
            <div className="summary-row discount">
              <span>Voucher ship ({appliedShippingVoucher.code})</span>
              <span>-{formatPrice(shippingVoucherDiscount)}</span>
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
