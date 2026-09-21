import "./ForbiddenPage.scss"
import { useNavigate } from "react-router-dom"
export default function ForbiddenPage({ homeHref = "/" }) {
  const navigate = useNavigate()

  return (
    <div className="forbidden-page">
      <div className="forbidden-card">
        <div className="forbidden-card__icon"></div>

        <div className="forbidden-card__code">403</div>
        <h2>Bạn không có quyền vào trang này</h2>
        <p>
          Khu vực này chỉ dành cho tài khoản có quyền cao hơn. Nếu bạn cho rằng
          đây là nhầm lẫn, hãy liên hệ quản trị viên để được cấp quyền.
        </p>

        <div className="forbidden-card__actions">
          <a
            href={homeHref}
            className="btn btn--primary"
          >
            Về trang chủ
          </a>
          {/* <button
            type="button"
            onClick={() => {
              navigate("/login")
            }}
            className="btn btn--secondary"
          >
            Quay lại
          </button> */}
        </div>
      </div>
    </div>
  )
}
