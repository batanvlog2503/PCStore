/**
 * Trang 503 - "Quầy vé tạm đóng để bảo trì".
 *
 * Cùng hệ thống thiết kế với các trang lỗi khác trong bộ, nhưng tông
 * giọng khác hẳn: đây là trạng thái CHỦ ĐÍCH (đội ngũ chủ động tắt để
 * nâng cấp), không phải sự cố. Vì vậy không dùng ngôn ngữ xin lỗi hay
 * khẩn cấp — icon bánh răng (đang được chăm sóc), màu xanh lá trầm.
 *
 * Props:
 *  - onRetry          : callback khi bấm "Làm mới trang"
 *                        (mặc định window.location.reload())
 *  - estimatedBackAt   : chuỗi thời điểm dự kiến hoạt động lại đã format
 *                        sẵn (tuỳ chọn), ví dụ "23:00 hôm nay"
 *  - statusHref        : đường dẫn trang trạng thái hệ thống (tuỳ chọn);
 *                        chỉ hiện nút này khi có giá trị
 */
export default function MaintenancePage({
  onRetry,
  estimatedBackAt,
  statusHref,
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
          {/* Con dấu tròn hình bánh răng, đè lên mép trên */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-[#3E6B5C]/50 bg-[#EFE8D8]">
            <GearIcon className="h-4 w-4 text-[#3E6B5C]" />
          </div>

          {/* Notch trái/phải tạo cảm giác phiếu xé */}
          <span className="pointer-events-none absolute -left-3.5 top-[172px] h-7 w-7 rounded-full bg-[#EFE8D8]" />
          <span className="pointer-events-none absolute -right-3.5 top-[172px] h-7 w-7 rounded-full bg-[#EFE8D8]" />

          {/* ===== Phần mã: barcode + 503 ===== */}
          <div className="px-8 pt-11 pb-7 text-center">
            <Barcode className="mx-auto mb-5 h-10 w-40 text-[#3E6B5C]" />

            <div
              className="font-mono font-semibold tracking-tight text-[#1E2740] leading-none"
              style={{ fontSize: "72px" }}
            >
              503
            </div>

            <p className="mt-3 font-mono text-[11px] tracking-[0.14em] text-[#8A8168]">
              QUẦY VÉ TẠM ĐÓNG ĐỂ BẢO TRÌ
            </p>
          </div>

          {/* Đường đứt nét ngăn hai phần của ticket */}
          <div className="relative px-6">
            <div className="border-t-2 border-dashed border-[#D8CFB8]" />
          </div>

          {/* ===== Phần nội dung ===== */}
          <div className="px-8 pt-7 pb-8">
            <h1 className="font-serif text-[22px] leading-snug text-[#1E2740]">
              Hệ thống đang được bảo trì
            </h1>
            <p className="mt-2.5 text-[14.5px] leading-relaxed text-[#5B5646]">
              Chúng tôi đang nâng cấp để phục vụ bạn tốt hơn.
              {estimatedBackAt
                ? ` Dự kiến hoạt động lại: ${estimatedBackAt}.`
                : " Vui lòng quay lại sau ít phút."}
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleRetry}
                className="flex-1 inline-flex items-center justify-center rounded-lg bg-[#1E2740] px-4 py-2.5 text-sm font-medium text-[#FFFDF7] transition-colors hover:bg-[#2A3654] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E2740]"
              >
                Làm mới trang
              </button>
              {statusHref && (
                <a
                  href={statusHref}
                  className="flex-1 inline-flex items-center justify-center rounded-lg border border-[#D8CFB8] bg-transparent px-4 py-2.5 text-sm font-medium text-[#1E2740] transition-colors hover:bg-[#F4EFE2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E2740]"
                >
                  Xem trạng thái hệ thống
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function GearIcon(props) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      {...props}
    >
      <circle
        cx="10"
        cy="10"
        r="2.6"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M10 3.6v1.5M10 14.9v1.5M16.4 10h-1.5M5.1 10H3.6M14.5 5.5l-1.05 1.05M6.55 13.45 5.5 14.5M14.5 14.5l-1.05-1.05M6.55 6.55 5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.4"
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
