/**
 * Trang 403 - "Vé của bạn không vào được khu vực này".
 *
 * Cùng hệ thống thiết kế với NotFoundPage (404): tấm ticket giấy kem,
 * notch hai bên, barcode + mã lỗi, đường đứt nét. Điểm khác biệt: một
 * con dấu "TỪ CHỐI" xoay nghiêng (như dấu void trên vé thật), và phần
 * dưới so sánh "vé của bạn" với "khu vực yêu cầu" thay vì ô tìm kiếm.
 *
 * Props:
 *  - homeHref     : đường dẫn về trang chủ (mặc định "/")
 *  - onGoBack     : callback khi bấm "Quay lại" (mặc định history.back())
 *  - currentRole  : nhãn vai trò hiện tại của user (mặc định "Khách hàng")
 *  - requiredRole : nhãn vai trò yêu cầu để vào trang (mặc định "Quản trị viên")
 *
 * Nếu dùng react-router, thay thẻ <a href={homeHref}> bằng <Link to={homeHref}>.
 */
export default function ForbiddenPage({
  homeHref = "/",
  onGoBack,
  currentRole = "Khách hàng",
  requiredRole = "Quản trị viên",
}) {
  const handleGoBack = () => {
    if (onGoBack) return onGoBack()
    if (typeof window !== "undefined") window.history.back()
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#EFE8D8] px-4 py-12">
      <div className="relative w-full max-w-md">
        {/* Con dấu từ chối */}
        <div
          className="absolute -top-3 right-6 z-10 rounded border-[1.5px] border-[#A8452E]/70 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-[#A8452E]"
          style={{ transform: "rotate(-7deg)" }}
        >
          TỪ CHỐI
        </div>

        {/* Tấm ticket */}
        <div className="relative bg-[#FFFDF7] rounded-2xl shadow-[0_1px_2px_rgba(30,39,64,0.06),0_12px_28px_-8px_rgba(30,39,64,0.18)] overflow-hidden">
          {/* Notch trái/phải tạo cảm giác phiếu xé */}
          <span className="pointer-events-none absolute -left-3.5 top-[168px] h-7 w-7 rounded-full bg-[#EFE8D8]" />
          <span className="pointer-events-none absolute -right-3.5 top-[168px] h-7 w-7 rounded-full bg-[#EFE8D8]" />

          {/* ===== Phần mã: barcode + 403 ===== */}
          <div className="px-8 pt-9 pb-7 text-center">
            <Barcode className="mx-auto mb-5 h-10 w-40 text-[#A8452E]" />

            <div
              className="font-mono font-semibold tracking-tight text-[#1E2740] leading-none"
              style={{ fontSize: "72px" }}
            >
              403
            </div>

            <p className="mt-3 font-mono text-[11px] tracking-[0.14em] text-[#8A8168]">
              VÉ KHÔNG HỢP LỆ CHO KHU VỰC NÀY
            </p>
          </div>

          {/* Đường đứt nét ngăn hai phần của ticket */}
          <div className="relative px-6">
            <div className="border-t-2 border-dashed border-[#D8CFB8]" />
          </div>

          {/* ===== Phần nội dung ===== */}
          <div className="px-8 pt-7 pb-8">
            <h1 className="font-serif text-[22px] leading-snug text-[#1E2740]">
              Bạn không có quyền vào trang này
            </h1>
            <p className="mt-2.5 text-[14.5px] leading-relaxed text-[#5B5646]">
              Khu vực này chỉ dành cho tài khoản có quyền cao hơn. Nếu bạn cho
              rằng đây là nhầm lẫn, hãy liên hệ quản trị viên để được cấp quyền.
            </p>

            {/* Stub so sánh vé của bạn / khu vực yêu cầu */}
            <div className="mt-5 rounded-lg border border-[#D8CFB8] bg-[#FBF8F0] px-4 py-3">
              <RoleRow
                label="Vé của bạn"
                value={currentRole}
              />
              <div className="my-2 border-t border-dashed border-[#D8CFB8]" />
              <RoleRow
                label="Khu vực yêu cầu"
                value={requiredRole}
                accent
              />
            </div>

            <div className="mt-6 flex gap-3">
              <a
                href={homeHref}
                className="flex-1 inline-flex items-center justify-center rounded-lg bg-[#1E2740] px-4 py-2.5 text-sm font-medium text-[#FFFDF7] transition-colors hover:bg-[#2A3654] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E2740]"
              >
                Về trang chủ
              </a>
              <button
                type="button"
                onClick={handleGoBack}
                className="flex-1 inline-flex items-center justify-center rounded-lg border border-[#D8CFB8] bg-transparent px-4 py-2.5 text-sm font-medium text-[#1E2740] transition-colors hover:bg-[#F4EFE2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E2740]"
              >
                Quay lại
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RoleRow({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[13px] text-[#8A8168]">{label}</span>
      <span
        className={
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium " +
          (accent
            ? "bg-[#A8452E]/10 text-[#A8452E]"
            : "bg-[#1E2740]/[0.06] text-[#1E2740]")
        }
      >
        {value}
      </span>
    </div>
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
