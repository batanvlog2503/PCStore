import React, { useState, useEffect, useRef, useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import axiosInstance from "../../utils/axiosInstance"
import "./Payment.scss"

const POLL_INTERVAL_MS = 3000 // fe hỏi be sau 3 s đã thanh toán chưa
const PAYMENT_WINDOW_MS = 15 * 60 * 1000 // 15 phút để hoàn tất chuyển khoản

/// format minute/seconds
const formatCountdown = (ms) => {
  const total = Math.max(0, Math.floor(ms / 1000))
  const minutes = String(Math.floor(total / 60)).padStart(2, "0")
  const seconds = String(total % 60).padStart(2, "0")
  return `${minutes}:${seconds}`
}

const Payment = () => {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [remainingMs, setRemainingMs] = useState(PAYMENT_WINDOW_MS)

  const location = useLocation()
  const navigate = useNavigate()

  const params = new URLSearchParams(location.search)
  const orderId = params.get("id")

  const pollRef = useRef(null)
  const countdownRef = useRef(null)
  const deadlineRef = useRef(null)

  const getDetailOrder = useCallback(
    async ({ silent } = {}) => {
      // silent khong hiện loading khi gọi 3 s polling
      try {
        if (!silent) setLoading(true)

        const response = await axiosInstance.get(
          `${import.meta.env.VITE_APP_URL}/order/${orderId}`,
        )

        const fetchedOrder = response.data.order
        setOrder(fetchedOrder)
        setError(null)

        if (fetchedOrder.payment_status === "paid") {
          if (pollRef.current) clearInterval(pollRef.current)
          if (countdownRef.current) clearInterval(countdownRef.current)
          navigate(`/order-success/${fetchedOrder._id}`)
        }
      } catch (err) {
        console.log("Error:", err)
        setError(
          err.response?.data?.message || "Không thể tải thông tin đơn hàng",
        )
      } finally {
        if (!silent) setLoading(false)
      }
    },
    [orderId, navigate],
  )

  // Fetch ban đầu
  useEffect(() => {
    if (!orderId) return
    getDetailOrder()
  }, [orderId, getDetailOrder])

  // Poll trạng thái thanh toán mỗi 3 giây
  useEffect(() => {
    if (!orderId) return

    pollRef.current = setInterval(() => {
      getDetailOrder({ silent: true })
    }, POLL_INTERVAL_MS)

    return () => clearInterval(pollRef.current)
  }, [orderId, getDetailOrder])

  // Đếm ngược thời gian còn lại để thanh toán, tính từ thời điểm tạo đơn
  useEffect(() => {
    if (!order || order.payment_status === "paid") return

    const createdAt = order.created_at
      ? new Date(order.created_at).getTime()
      : Date.now()
    deadlineRef.current = createdAt + PAYMENT_WINDOW_MS
    setRemainingMs(deadlineRef.current - Date.now()) // thời gian cho tới đó

    countdownRef.current = setInterval(() => {
      setRemainingMs(deadlineRef.current - Date.now())
    }, 1000)

    return () => clearInterval(countdownRef.current)
  }, [order])

  if (loading) {
    return (
      <div className="payment-page">
        <div className="receipt">
          <div className="spinner" />
          <p className="status-text">Đang tải thông tin thanh toán...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="payment-page">
        <div className="receipt receipt--error">
          <h2>Không tải được đơn hàng</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="payment-page">
        <div className="receipt receipt--error">
          <h2>Không tìm thấy đơn hàng</h2>
          <p>Kiểm tra lại đường dẫn hoặc mã đơn hàng của bạn.</p>
        </div>
      </div>
    )
  }

  const isExpired = remainingMs <= 0
  const isUrgent = remainingMs <= 60 * 1000

  const qrCodeImage =
    `https://vietqr.app/img?acc=VQRQALVLN4492` +
    `&bank=MBBank` +
    `&amount=${order.total_amount}` +
    `&des=${order.order_code}`

  return (
    <div className="payment-page">
      <div className="receipt">
        <div className="receipt__header">
          <h1>Thanh toán đơn hàng</h1>
          <span className="status-pill">Đang chờ thanh toán</span>
        </div>

        {isExpired ? (
          <div className="expired-block">
            <p>Đơn hàng đã hết hạn thanh toán.</p>
            <p className="expired-block__sub">
              Vui lòng đặt lại đơn hàng để tiếp tục.
            </p>
          </div>
        ) : (
          <>
            <div className="qr-section">
              <div className="qr-frame">
                <img
                  src={qrCodeImage}
                  alt="Mã QR thanh toán"
                />
              </div>

              <div className="qr-details">
                <div className="detail-row">
                  <span className="detail-row__label">Ngân hàng</span>
                  <span className="detail-row__value">MB Bank</span>
                </div>
                <div className="detail-row">
                  <span className="detail-row__label">Số tài khoản</span>
                  <span className="detail-row__value detail-row__value--mono">
                    VQRQALVLN4492
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-row__label">Số tiền</span>
                  <span className="detail-row__value detail-row__value--amount">
                    {Number(order.total_amount).toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-row__label">Nội dung CK</span>
                  <button
                    type="button"
                    className="copy-btn"
                  >
                    <span className="detail-row__value detail-row__value--mono">
                      {order.order_code}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <p className="hint-text">
              Quét mã QR bằng app ngân hàng hoặc chuyển khoản thủ công đúng nội
              dung ở trên.
            </p>

            <div className="countdown">
              <span>Thời gian còn lại</span>
              <strong
                className={
                  isUrgent
                    ? "countdown__time countdown__time--urgent"
                    : "countdown__time"
                }
              >
                {formatCountdown(remainingMs)}
              </strong>
            </div>

            <div className="checking-row">
              <span className="checking-row__dot" />
              Đang tự động kiểm tra giao dịch...
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Payment
