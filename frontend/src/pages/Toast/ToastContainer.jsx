import { useEffect, useState } from "react"
import { toast, toastStore } from "./Toast"
import "./Toast.scss"

const ICON_CLASS = {
  success: "fa-solid fa-circle-check",
  error: "fa-solid fa-circle-exclamation",
  warning: "fa-solid fa-triangle-exclamation",
  info: "fa-solid fa-circle-info",
  loading: "fa-solid fa-spinner fa-spin",
}

/**
 * Đặt <ToastContainer /> một lần duy nhất ở gốc app (App.jsx hoặc layout
 * chung), ngang hàng với <RouterProvider> / <Outlet>. Toàn bộ trang con
 * gọi toast.success(...) v.v. mà không cần import lại component này.
 */
export default function ToastContainer() {
  const [items, setItems] = useState([])

  useEffect(() => toastStore.subscribe(setItems), [])

  return (
    <div
      className="toast-container"
      role="region"
      aria-live="polite"
      aria-label="Thông báo"
    >
      {items.map((item) => (
        <ToastItem
          key={item.id}
          data={item}
        />
      ))}
    </div>
  )
}

function ToastItem({ data }) {
  const { id, type, message, duration, createdAt } = data
  const [isPaused, setIsPaused] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  const handleDismiss = () => {
    setIsLeaving(true)
    setTimeout(() => toast.dismiss(id), 180)
  }

  useEffect(() => {
    if (!duration || isPaused) return
    const timer = setTimeout(handleDismiss, duration)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, isPaused, createdAt])

  return (
    <div
      className={`toast-item toast-${type} ${isLeaving ? "leaving" : ""}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <span className="toast-icon">
        <i className={ICON_CLASS[type] || ICON_CLASS.info}></i>
      </span>

      <p className="toast-message">{message}</p>

      {type !== "loading" && (
        <button
          className="toast-close"
          onClick={handleDismiss}
          aria-label="Đóng thông báo"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      )}

      {duration ? (
        <span
          key={createdAt}
          className="toast-progress"
          style={{ animationDuration: `${duration}ms` }}
        />
      ) : null}
    </div>
  )
}
