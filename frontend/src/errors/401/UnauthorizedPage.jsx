import "./UnauthorizedPage.scss"

/**
 * Trang 401 - bản đơn giản: 1 card căn giữa, không còn hoạ tiết ticket
 * hay mã vạch như bản trước.
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
    <div className="unauthorized-page">
      <div className="unauthorized-card">
        <div className="unauthorized-card__icon"></div>

        <div className="unauthorized-card__code">401</div>

        <h1>Bạn cần đăng nhập để xem trang này</h1>
        <p>
          Trang này chỉ hiển thị cho tài khoản đã đăng nhập, hoặc phiên đăng
          nhập của bạn đã kết thúc. Đăng nhập lại để tiếp tục đúng nơi bạn đang
          xem.
        </p>

        <div className="unauthorized-card__actions">
          <a
            href={loginUrl}
            className="btn btn--primary"
          >
            Đăng nhập
          </a>
          {onGoBack ? (
            <button
              type="button"
              onClick={handleGoBack}
              className="btn btn--secondary"
            >
              Về trang chủ
            </button>
          ) : (
            <a
              href={homeHref}
              className="btn btn--secondary"
            >
              Về trang chủ
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
