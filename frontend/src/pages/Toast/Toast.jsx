/**
 * Toast store - singleton pub/sub, KHÔNG phải React Context.
 *
 * Lý do không dùng Context: axiosInstance.js (interceptor) và các hàm
 * util khác nằm ngoài cây component React, không thể gọi useContext().
 * Với pub/sub, import `toast` ở bất cứ đâu — component, interceptor,
 * hàm util — đều gọi được ngay.
 *
 * Cách dùng cơ bản:
 *   import { toast } from "../../utils/toast"
 *   toast.success("Thêm vào giỏ hàng thành công")
 *   toast.error(error.response?.data?.message || "Có lỗi xảy ra")
 *
 * Cách dùng nâng cao - tự cập nhật loading -> success/error:
 *   const id = toast.loading("Đang xử lý...")
 *   try {
 *     await doSomething()
 *     toast.update(id, { type: "success", message: "Xong rồi" })
 *   } catch (e) {
 *     toast.update(id, { type: "error", message: "Thất bại" })
 *   }
 *
 * Hoặc gọn hơn với toast.promise (xem cuối file).
 */

let idCounter = 0
let toasts = []
const listeners = new Set()

const DEFAULT_DURATION = 4000

function notify() {
  listeners.forEach((listener) => listener(toasts))
}

function addToast({ type, message, duration }) {
  const id = ++idCounter
  const nextToast = {
    id,
    type,
    message,
    duration:
      duration !== undefined
        ? duration
        : type === "loading"
          ? null
          : DEFAULT_DURATION,
    createdAt: Date.now(),
  }
  toasts = [...toasts, nextToast]
  notify()
  return id
}

function updateToast(id, patch = {}) {
  toasts = toasts.map((t) => {
    if (t.id !== id) return t

    const typeChangedFromLoading =
      t.type === "loading" && patch.type && patch.type !== "loading"
    const nextDuration =
      patch.duration !== undefined
        ? patch.duration
        : typeChangedFromLoading
          ? DEFAULT_DURATION
          : t.duration

    return {
      ...t,
      ...patch,
      duration: nextDuration,
      createdAt: Date.now(), // reset thanh progress
    }
  })
  notify()
}

function dismissToast(id) {
  toasts = toasts.filter((t) => t.id !== id)
  notify()
}

function clearAll() {
  toasts = []
  notify()
}

function subscribe(listener) {
  listeners.add(listener)
  listener(toasts)
  return () => listeners.delete(listener)
}

/**
 * toast.promise: gộp loading -> success/error thành một lệnh, thay cho
 * pattern try/catch + alert lặp lại ở handleAddCartItem, handleBuyNow,
 * handleToggleWishlist...
 *
 *   toast.promise(
 *     axiosInstance.post("/cart-item/add", { variant_id, quantity }),
 *     {
 *       loading: "Đang thêm vào giỏ hàng...",
 *       success: "Thêm vào giỏ hàng thành công",
 *       error: (err) => err.response?.data?.message || "Thêm vào giỏ hàng thất bại",
 *     }
 *   )
 */
async function promiseToast(promise, messages, opts) {
  const id = addToast({
    type: "loading",
    message: messages.loading,
    duration: null,
    ...opts,
  })

  try {
    const result = await promise
    const successMessage =
      typeof messages.success === "function"
        ? messages.success(result)
        : messages.success
    updateToast(id, { type: "success", message: successMessage })
    return result
  } catch (error) {
    const errorMessage =
      typeof messages.error === "function"
        ? messages.error(error)
        : messages.error
    updateToast(id, { type: "error", message: errorMessage })
    throw error
  }
}

export const toast = {
  success: (message, opts) => addToast({ type: "success", message, ...opts }),
  error: (message, opts) => addToast({ type: "error", message, ...opts }),
  warning: (message, opts) => addToast({ type: "warning", message, ...opts }),
  info: (message, opts) => addToast({ type: "info", message, ...opts }),
  loading: (message, opts) => addToast({ type: "loading", message, ...opts }),
  promise: promiseToast,
  update: updateToast,
  dismiss: dismissToast,
  clear: clearAll,
}

// Dành riêng cho ToastContainer subscribe, không dùng trực tiếp ở nơi khác
export const toastStore = { subscribe }
