import { useState } from "react"

/**
 * Trang 404 - "Mã này không tồn tại".
 *
 * Ý tưởng: trình bày lỗi 404 như một voucher bị từ chối quét mã,
 * bám sát bối cảnh website bán hàng có hệ thống voucher.
 *
 * Props:
 *  - homeHref   : đường dẫn về trang chủ (mặc định "/")
 *  - onGoBack   : callback khi bấm "Quay lại" (mặc định history.back())
 *  - onSearch   : callback(query) khi submit ô tìm sản phẩm (tuỳ chọn)
 *
 * Nếu dùng react-router, thay thẻ <a href={homeHref}> bằng <Link to={homeHref}>.
 */
export default function NotFoundPage({ homeHref = "/", onGoBack, onSearch }) {
  const [query, setQuery] = useState("")

  const handleGoBack = () => {
    if (onGoBack) return onGoBack()
    if (typeof window !== "undefined") window.history.back()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    if (onSearch) return onSearch(q)
    if (typeof window !== "undefined") {
      window.location.href = `/products?search=${encodeURIComponent(q)}`
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#EFE8D8] px-4 py-12">
      <div className="relative w-full max-w-md">
        {/* Tấm ticket */}
        <div className="relative bg-[#FFFDF7] rounded-2xl shadow-[0_1px_2px_rgba(30,39,64,0.06),0_12px_28px_-8px_rgba(30,39,64,0.18)] overflow-hidden">
          {/* Notch trái/phải tạo cảm giác phiếu xé */}
          <span className="pointer-events-none absolute -left-3.5 top-[168px] h-7 w-7 rounded-full bg-[#EFE8D8]" />
          <span className="pointer-events-none absolute -right-3.5 top-[168px] h-7 w-7 rounded-full bg-[#EFE8D8]" />

          {/* ===== Phần mã: barcode + 404 ===== */}
          <div className="px-8 pt-9 pb-7 text-center">
            <Barcode className="mx-auto mb-5 h-10 w-40 text-[#B8862B]" />

            <div
              className="font-mono font-semibold tracking-tight text-[#1E2740] leading-none"
              style={{ fontSize: "72px" }}
            >
              404
            </div>

            <p className="mt-3 font-mono text-[11px] tracking-[0.14em] text-[#8A8168]">
              MÃ VOUCHER KHÔNG HỢP LỆ
            </p>
          </div>

          {/* Đường đứt nét ngăn hai phần của ticket */}
          <div className="relative px-6">
            <div className="border-t-2 border-dashed border-[#D8CFB8]" />
          </div>

          {/* ===== Phần nội dung ===== */}
          <div className="px-8 pt-7 pb-8">
            <h1 className="font-serif text-[22px] leading-snug text-[#1E2740]">
              Không tìm thấy trang này
            </h1>
            <p className="mt-2.5 text-[14.5px] leading-relaxed text-[#5B5646]">
              Đường dẫn có thể đã bị đổi, bị xoá, hoặc sản phẩm này không còn
              tồn tại trong hệ thống. Kiểm tra lại địa chỉ, hoặc quay về nơi bạn
              có thể tin tưởng.
            </p>

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

            <form
              onSubmit={handleSubmit}
              className="mt-4"
            >
              <label
                htmlFor="nf-search"
                className="sr-only"
              >
                Tìm sản phẩm khác
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-[#D8CFB8] bg-[#FBF8F0] px-3 py-2 focus-within:border-[#B8862B] transition-colors">
                <SearchIcon className="h-4 w-4 shrink-0 text-[#8A8168]" />
                <input
                  id="nf-search"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Hoặc tìm sản phẩm khác…"
                  className="w-full bg-transparent text-sm text-[#1E2740] placeholder:text-[#A69C82] outline-none"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
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

function SearchIcon(props) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      {...props}
    >
      <circle
        cx="9"
        cy="9"
        r="6"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M14 14L18 18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}
