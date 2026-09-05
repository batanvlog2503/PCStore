import { Navigate, Outlet } from "react-router-dom"

const ProtectRoute = ({ allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem("user"))

  // Chưa đăng nhập
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  // Có giới hạn role nhưng role không được phép
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to="/"
        replace
      />
    )
  }

  return <Outlet />
}

export default ProtectRoute
