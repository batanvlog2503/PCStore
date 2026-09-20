// components/LoginRequiredModal/LoginRequiredModal.jsx
import React from "react"
import { useNavigate} from "react-router-dom"
import "./LoginRequiredModal.css"

const LoginRequiredModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate()

  if (!isOpen) return null

  const handleLogin = () => {
    onClose()

    navigate(`/login`)
  }

  return (
    <div
      className="login-required-overlay"
      onClick={onClose}
    >
      <div
        className="login-required-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="login-required-close"
          onClick={onClose}
          aria-label="Đóng"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        <div className="login-required-icon">
          <i className="fa-solid fa-lock"></i>
        </div>

        <h2>Vui lòng đăng nhập</h2>

        <p>Bạn cần đăng nhập tài khoản để thực hiện chức năng này.</p>

        <div className="login-required-actions">
          <button
            type="button"
            className="login-required-cancel"
            onClick={onClose}
          >
            Để sau
          </button>

          <button
            type="button"
            className="login-required-login"
            onClick={handleLogin}
          >
            Đăng nhập
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginRequiredModal
