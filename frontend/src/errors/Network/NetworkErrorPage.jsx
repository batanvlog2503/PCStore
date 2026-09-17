import { useEffect, useRef, useState } from "react"

/**
 * Trang Network Error - "Không thể xác minh vé lúc này".
 *
 * Cùng hệ thống thiết kế với các trang lỗi khác trong bộ. Vì đây là mã
 * lỗi do frontend tự định nghĩa (không thuộc chuẩn HTTP), phần "mã lớn"
 * hiển thị chuỗi NETWORK_ERROR thay vì con số, đúng như dạng error.code
 * bạn thường thấy từ axios hoặc backend.
 *
 * Tự động lắng nghe sự kiện online/offline của trình duyệt; khi có mạng
 * trở lại sẽ tự gọi onRetry (mặc định là reload trang) — không cần
 * người dùng bấm lại.
 *
 * Props:
 *  - onRetry               : callback khi có mạng lại hoặc bấm "Thử lại"
 *                             (mặc định window.location.reload())
 *  - homeHref               : đường dẫn về trang chủ (mặc định "/")
 *  - autoRetryOnReconnect   : tự gọi onRetry khi online trở lại (mặc định true)
 */
export default function NetworkErrorPage({
  onRetry,
  homeHref = "/",
  autoRetryOnReconnect = true,
}) {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  )
  const hasRetried = useRef(false)

  const handleRetry = () => {
    if (onRetry) return onRetry()
    if (typeof window !== "undefined") window.location.reload()
  }

  useEffect(() => {
    if (typeof window === "undefined") return

    const goOnline = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)

    window.addEventListener("online", goOnline)
    window.addEventListener("offline", goOffline)
    return () => {
      window.removeEventListener("online", goOnline)
      window.removeEventListener("offline", goOffline)
    }
  }, [])

  useEffect(() => {
    if (isOnline && autoRetryOnReconnect && !hasRetried.current) {
      hasRetried.current = true
      handleRetry()
    }
  }, [isOnline, autoRetryOnReconnect])

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#EFE8D8] px-4 py-12">
      <div className="relative w-full max-w-md">
        {/* Tấm ticket */}
        <div className="relative bg-[#FFFDF7] rounded-2xl shadow-[0_1px_2px_rgba(30,39,64,0.06),0_12px_28px_-8px_rgba(30,39,64,0.18)] overflow-hidden">
          {/* Con dấu tròn hình wifi-off, đè lên mép trên */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-[#55606B]/50 bg-[#EFE8D8]">
            <WifiOffIcon className="h-4 w-4 text-[#55606B]" />
          </div>

          {/* Notch trái/phải tạo cảm giác phiếu xé */}
          <span className="pointer-events-none absolute -left-3.5 top-[172px] h-7 w-7 rounded-full bg-[#EFE8D8]" />
          <span className="pointer-events-none absolute -right-3.5 top-[172px] h-7 w-7 rounded-full bg-[#EFE8D8]" />

          {/* ===== Phần mã: barcode + NETWORK_ERROR ===== */}
          <div className="px-8 pt-11 pb-7 text-center">
            <Barcode className="mx-auto mb-5 h-10 w-40 text-[#55606B]" />

            <div
              className="font-mono font-semibold tracking-tight text-[#1E2740] leading-none"
              style={{ fontSize: "32px" }}
            >
              NETWORK_ERROR
            </div>

            <div className="mt-3 flex items-center justify-center gap-1.5">
              <span
                className={
                  "h-1.5 w-1.5 rounded-full " +
                  (isOnline ? "bg-[#3E6B5C]" : "bg-[#A8452E] animate-pulse")
                }
              />
              <p className="font-mono text-[11px] tracking-[0.14em] text-[#8A8168]">
                {isOnline
                  ? "ĐÃ CÓ KẾT NỐI — ĐANG TẢI LẠI"
                  : "KHÔNG CÓ KẾT NỐI MẠNG"}
              </p>
            </div>
          </div>

          {/* Đường đứt nét ngăn hai phần của ticket */}
          <div className="relative px-6">
            <div className="border-t-2 border-dashed border-[#D8CFB8]" />
          </div>

          {/* ===== Phần nội dung ===== */}
          <div className="px-8 pt-7 pb-8">
            <h1 className="font-serif text-[22px] leading-snug text-[#1E2740]">
              Mất kết nối tới máy chủ
            </h1>
            <p className="mt-2.5 text-[14.5px] leading-relaxed text-[#5B5646]">
              Không thể tải dữ liệu do mất mạng hoặc máy chủ tạm ngưng phản hồi.
              Trang sẽ tự tải lại ngay khi có kết nối trở lại.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleRetry}
                className="flex-1 inline-flex items-center justify-center rounded-lg bg-[#1E2740] px-4 py-2.5 text-sm font-medium text-[#FFFDF7] transition-colors hover:bg-[#2A3654] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E2740]"
              >
                Thử lại
              </button>
              <a
                href={homeHref}
                className="flex-1 inline-flex items-center justify-center rounded-lg border border-[#D8CFB8] bg-transparent px-4 py-2.5 text-sm font-medium text-[#1E2740] transition-colors hover:bg-[#F4EFE2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E2740]"
              >
                Về trang chủ
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function WifiOffIcon(props) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      {...props}
    >
      <path
        d="M3 7.2c1.9-1.7 4.3-2.7 7-2.7s5.1 1 7 2.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M5.7 10.1c1.1-1 2.6-1.6 4.3-1.6s3.2.6 4.3 1.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M8.1 13c.5-.4 1.2-.7 1.9-.7s1.4.3 1.9.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle
        cx="10"
        cy="15.2"
        r="1"
        fill="currentColor"
      />
      <path
        d="M2.5 3.5l15 13"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function Barcode({ className }) {
  const widths = [
    2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 1, 3, 2, 1, 4, 1, 2, 1, 3, 1, 2, 1,
  ]
  let x = 0
  const bars = widths.map((w, i) => {
    const bar = (
      <rect
        key={i}
        x={x}
        y={0}
        width={w}
        height={28}
        fill="currentColor"
      />
    )
    x += w + 1.6
    return bar
  })

  return (
    <svg
      viewBox={`0 0 ${x} 28`}
      className={className}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {bars}
    </svg>
  )
}
