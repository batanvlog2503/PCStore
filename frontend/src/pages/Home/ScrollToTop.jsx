import { useEffect } from "react"
import { useLocation } from "react-router-dom"

/**
 * React Router KHÔNG tự cuộn về đầu trang khi chuyển route -- nó giữ
 * nguyên vị trí scroll cũ (khác hành vi mặc định của website nhiều
 * trang truyền thống). Component này lắng nghe mỗi khi pathname đổi và
 * ép cuộn về (0, 0).
 *
 * Đặt <ScrollToTop /> MỘT LẦN bên trong layout dùng chung (MainLayout),
 * không cần đặt lại ở từng trang. Không render ra gì (return null).
 */
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" })
  }, [pathname])

  return null
}
