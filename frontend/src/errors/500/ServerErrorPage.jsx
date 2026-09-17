/**
 * Trang 500 - "Máy quét đang gặp sự cố" (lỗi server/API).
 *
 * Cùng hệ thống thiết kế với NotFoundPage (404), ForbiddenPage (403),
 * UnauthorizedPage (401): tấm ticket giấy kem, notch hai bên, barcode +
 * mã lỗi, đường đứt nét.
 *
 * Ngữ pháp hình ảnh trong cả bộ:
 *  - Dấu xoay nghiêng (403)  = lỗi do phía người dùng (vé sai hạng)
 *  - Dấu tròn ở mép trên (401, 500) = trạng thái hệ thống, không phải lỗi
 *    của người dùng — 401 dùng icon khoá, 500 dùng icon cờ lê.
 *
 * Props:
 *  - onRetry     : callback khi bấm "Thử lại" (mặc định window.location.reload())
 *  - homeHref    : đường dẫn về trang chủ (mặc định "/")
 *  - errorId     : mã sự cố để đối chiếu với log backend (tuỳ chọn, ví dụ req.id)
 *  - supportHref : đường dẫn/mailto liên hệ hỗ trợ (tuỳ chọn)
 */
export default function ServerErrorPage({
  onRetry,
  homeHref = "/",
  errorId,
  supportHref,
}) {
  const handleRetry = () => {
    if (onRetry) return onRetry()
    if (typeof window !== "undefined") window.location.reload()
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#EFE8D8] px-4 py-12">
      <div className="relative w-full max-w-md">
        {/* Tấm ticket */}
        <div className="relative bg-[#FFFDF7] rounded-2xl shadow-[0_1px_2px_rgba(30,39,64,0.06),0_12px_28px_-8px_rgba(30,39,64,0.18)] overflow-hidden">
          {/* Con dấu tròn hình cờ lê, đè lên mép trên */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-[#6B5642]/50 bg-[#EFE8D8]">
            <WrenchIcon className="h-4 w-4 text-[#6B5642]" />
          </div>

          {/* Notch trái/phải tạo cảm giác phiếu xé */}
          <span className="pointer-events-none absolute -left-3.5 top-[172px] h-7 w-7 rounded-full bg-[#EFE8D8]" />
          <span className="pointer-events-none absolute -right-3.5 top-[172px] h-7 w-7 rounded-full bg-[#EFE8D8]" />

          {/* ===== Phần mã: barcode + 500 ===== */}
          <div className="px-8 pt-11 pb-7 text-center">
            <Barcode className="mx-auto mb-5 h-10 w-40 text-[#6B5642]" />

            <div
              className="font-mono font-semibold tracking-tight text-[#1E2740] leading-none"
              style={{ fontSize: "72px" }}
            >
              500
            </div>

            <p className="mt-3 font-mono text-[11px] tracking-[0.14em] text-[#8A8168]">
              {errorId ? `MÃ SỰ CỐ: ${errorId}` : "MÁY QUÉT ĐANG GẶP SỰ CỐ"}
            </p>
          </div>

          {/* Đường đứt nét ngăn hai phần của ticket */}
          <div className="relative px-6">
            <div className="border-t-2 border-dashed border-[#D8CFB8]" />
          </div>

          {/* ===== Phần nội dung ===== */}
          <div className="px-8 pt-7 pb-8">
            <h1 className="font-serif text-[22px] leading-snug text-[#1E2740]">
              Có lỗi xảy ra ở máy chủ
            </h1>
            <p className="mt-2.5 text-[14.5px] leading-relaxed text-[#5B5646]">
              Đây không phải lỗi của bạn — hệ thống đang gặp sự cố. Thử lại sau
              ít phút, hoặc quay về trang chủ nếu lỗi vẫn còn tiếp diễn.
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

            {supportHref && (
              <a
                href={supportHref}
                className="mt-4 block text-center text-[13px] text-[#8A8168] underline decoration-[#D8CFB8] underline-offset-2 hover:text-[#1E2740]"
              >
                Lỗi vẫn tiếp diễn? Liên hệ hỗ trợ
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function WrenchIcon(props) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      {...props}
    >
      <path
        d="M12.7 4.3a3 3 0 0 0-3.98 3.55L4.3 12.3a1.4 1.4 0 0 0 1.98 1.98l4.45-4.42a3 3 0 0 0 3.55-3.98l-1.83 1.83a1.1 1.1 0 0 1-1.55 0l-.28-.28a1.1 1.1 0 0 1 0-1.55L12.7 4.3Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Barcode({ className }) {
  // Chiều rộng vạch cố định (không random) để không đổi giữa các lần render
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
