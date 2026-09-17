/**
 * Trang Session Expired - "Phiên làm việc đã kết thúc" (JWT hết hạn).
 *
 * Cùng hệ thống thiết kế với các trang lỗi khác trong bộ. Khác với 401
 * (UnauthorizedPage — chưa từng đăng nhập), trang này dùng khi người
 * dùng ĐÃ đăng nhập nhưng token hết hạn, nên tông giọng khác: không
 * nói "bạn cần đăng nhập" mà nói "phiên của bạn đã kết thúc".
 *
 * Props:
 *  - loginHref   : đường dẫn trang đăng nhập (mặc định "/login")
 *  - homeHref    : đường dẫn về trang chủ (mặc định "/")
 *  - redirectTo  : đường dẫn cần quay lại sau khi đăng nhập; mặc định lấy
 *                  từ window.location hiện tại. Truyền `null` để tắt.
 *  - expiredAt   : chuỗi thời điểm hết hạn đã format sẵn (tuỳ chọn),
 *                  ví dụ "14:32", hiển thị để người dùng biết mốc thời gian
 */
export default function SessionExpiredPage({
  loginHref = "/login",
  homeHref = "/",
  redirectTo,
  expiredAt,
}) {
  const resolvedRedirect =
    redirectTo === null
      ? null
      : (redirectTo ??
        (typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : null))

  const loginUrl = resolvedRedirect
    ? `${loginHref}?redirect=${encodeURIComponent(resolvedRedirect)}`
    : loginHref

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#EFE8D8] px-4 py-12">
      <div className="relative w-full max-w-md">
        {/* Tấm ticket */}
        <div className="relative bg-[#FFFDF7] rounded-2xl shadow-[0_1px_2px_rgba(30,39,64,0.06),0_12px_28px_-8px_rgba(30,39,64,0.18)] overflow-hidden">
          {/* Con dấu tròn hình đồng hồ cát, đè lên mép trên */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-[#6B4E71]/50 bg-[#EFE8D8]">
            <HourglassIcon className="h-4 w-4 text-[#6B4E71]" />
          </div>

          {/* Notch trái/phải tạo cảm giác phiếu xé */}
          <span className="pointer-events-none absolute -left-3.5 top-[172px] h-7 w-7 rounded-full bg-[#EFE8D8]" />
          <span className="pointer-events-none absolute -right-3.5 top-[172px] h-7 w-7 rounded-full bg-[#EFE8D8]" />

          {/* ===== Phần mã: barcode + SESSION_EXPIRED ===== */}
          <div className="px-8 pt-11 pb-7 text-center">
            <Barcode className="mx-auto mb-5 h-10 w-40 text-[#6B4E71]" />

            <div
              className="font-mono font-semibold tracking-tight text-[#1E2740] leading-none"
              style={{ fontSize: "28px" }}
            >
              SESSION_EXPIRED
            </div>

            <p className="mt-3 font-mono text-[11px] tracking-[0.14em] text-[#8A8168]">
              {expiredAt
                ? `HẾT HẠN LÚC ${expiredAt}`
                : "PHIÊN LÀM VIỆC ĐÃ KẾT THÚC"}
            </p>
          </div>

          {/* Đường đứt nét ngăn hai phần của ticket */}
          <div className="relative px-6">
            <div className="border-t-2 border-dashed border-[#D8CFB8]" />
          </div>

          {/* ===== Phần nội dung ===== */}
          <div className="px-8 pt-7 pb-8">
            <h1 className="font-serif text-[22px] leading-snug text-[#1E2740]">
              Phiên đăng nhập đã hết hạn
            </h1>
            <p className="mt-2.5 text-[14.5px] leading-relaxed text-[#5B5646]">
              Vì lý do bảo mật, phiên làm việc của bạn tự kết thúc sau một thời
              gian không hoạt động. Đăng nhập lại để tiếp tục đúng nơi bạn đang
              xem.
            </p>

            <div className="mt-6 flex gap-3">
              <a
                href={loginUrl}
                className="flex-1 inline-flex items-center justify-center rounded-lg bg-[#1E2740] px-4 py-2.5 text-sm font-medium text-[#FFFDF7] transition-colors hover:bg-[#2A3654] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E2740]"
              >
                Đăng nhập lại
              </a>
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

function HourglassIcon(props) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      {...props}
    >
      <path
        d="M6 4h8M6 16h8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M6.5 4c0 2.6 1.3 4.2 3.5 5.4C7.8 10.6 6.5 12.2 6.5 16"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 4c0 2.6-1.3 4.2-3.5 5.4 2.2 1.2 3.5 2.8 3.5 6.4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
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
