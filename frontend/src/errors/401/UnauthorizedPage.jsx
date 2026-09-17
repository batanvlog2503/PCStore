/**
 * Trang 401 - "Vé của bạn chưa được xác thực".
 *
 * Cùng hệ thống thiết kế với NotFoundPage (404) và ForbiddenPage (403):
 * tấm ticket giấy kem, notch hai bên, barcode + mã lỗi, đường đứt nét.
 * Khác biệt: một con dấu chì hình ổ khoá đè lên mép trên ticket (thay vì
 * dấu "TỪ CHỐI" nghiêng của 403), và CTA chính là "Đăng nhập" vì đây là
 * vấn đề xác thực chứ không phải phân quyền.
 *
 * Props:
 *  - loginHref   : đường dẫn trang đăng nhập (mặc định "/login")
 *  - homeHref    : đường dẫn về trang chủ (mặc định "/")
 *  - onGoBack    : callback khi bấm "Về trang chủ" thay vì <a> (tuỳ chọn)
 *  - redirectTo  : đường dẫn cần quay lại sau khi đăng nhập; mặc định lấy
 *                  từ window.location hiện tại. Truyền `null` để tắt.
 *
 * Nếu dùng react-router, thay thẻ <a href> bằng <Link to>.
 */
export default function UnauthorizedPage({
  loginHref = "/login",
  homeHref = "/",
  onGoBack,
  redirectTo,
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

  const handleGoBack = () => {
    if (onGoBack) return onGoBack()
    if (typeof window !== "undefined") window.history.back()
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#EFE8D8] px-4 py-12">
      <div className="relative w-full max-w-md">
        {/* Tấm ticket */}
        <div className="relative bg-[#FFFDF7] rounded-2xl shadow-[0_1px_2px_rgba(30,39,64,0.06),0_12px_28px_-8px_rgba(30,39,64,0.18)] overflow-hidden">
          {/* Con dấu chì hình ổ khoá, đè lên mép trên */}
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-[#2E5A76]/50 bg-[#EFE8D8]">
            <LockIcon className="h-4 w-4 text-[#2E5A76]" />
          </div>

          {/* Notch trái/phải tạo cảm giác phiếu xé */}
          <span className="pointer-events-none absolute -left-3.5 top-[172px] h-7 w-7 rounded-full bg-[#EFE8D8]" />
          <span className="pointer-events-none absolute -right-3.5 top-[172px] h-7 w-7 rounded-full bg-[#EFE8D8]" />

          {/* ===== Phần mã: barcode + 401 ===== */}
          <div className="px-8 pt-11 pb-7 text-center">
            <Barcode className="mx-auto mb-5 h-10 w-40 text-[#2E5A76]" />

            <div
              className="font-mono font-semibold tracking-tight text-[#1E2740] leading-none"
              style={{ fontSize: "72px" }}
            >
              401
            </div>

            <p className="mt-3 font-mono text-[11px] tracking-[0.14em] text-[#8A8168]">
              VÉ CHƯA ĐƯỢC XÁC THỰC
            </p>
          </div>

          {/* Đường đứt nét ngăn hai phần của ticket */}
          <div className="relative px-6">
            <div className="border-t-2 border-dashed border-[#D8CFB8]" />
          </div>

          {/* ===== Phần nội dung ===== */}
          <div className="px-8 pt-7 pb-8">
            <h1 className="font-serif text-[22px] leading-snug text-[#1E2740]">
              Bạn cần đăng nhập để xem trang này
            </h1>
            <p className="mt-2.5 text-[14.5px] leading-relaxed text-[#5B5646]">
              Trang này chỉ hiển thị cho tài khoản đã đăng nhập, hoặc phiên đăng
              nhập của bạn đã kết thúc. Đăng nhập lại để tiếp tục đúng nơi bạn
              đang xem.
            </p>

            <div className="mt-6 flex gap-3">
              <a
                href={loginUrl}
                className="flex-1 inline-flex items-center justify-center rounded-lg bg-[#1E2740] px-4 py-2.5 text-sm font-medium text-[#FFFDF7] transition-colors hover:bg-[#2A3654] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E2740]"
              >
                Đăng nhập
              </a>
              {onGoBack ? (
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="flex-1 inline-flex items-center justify-center rounded-lg border border-[#D8CFB8] bg-transparent px-4 py-2.5 text-sm font-medium text-[#1E2740] transition-colors hover:bg-[#F4EFE2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E2740]"
                >
                  Về trang chủ
                </button>
              ) : (
                <a
                  href={homeHref}
                  className="flex-1 inline-flex items-center justify-center rounded-lg border border-[#D8CFB8] bg-transparent px-4 py-2.5 text-sm font-medium text-[#1E2740] transition-colors hover:bg-[#F4EFE2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E2740]"
                >
                  Về trang chủ
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LockIcon(props) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      {...props}
    >
      <rect
        x="4.5"
        y="9"
        width="11"
        height="8"
        rx="1.6"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M6.75 9V6.5a3.25 3.25 0 0 1 6.5 0V9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle
        cx="10"
        cy="12.7"
        r="1"
        fill="currentColor"
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
