import React, { useState } from "react"
import { toast } from "../../../pages/Toast/Toast"
import "./Footer.scss"

const PRODUCT_CATEGORIES = [
  "Laptop",
  "PC - Máy tính để bàn",
  "Linh kiện máy tính",
  "Màn hình",
  "Phụ kiện",
  "Thiết bị mạng",
  "Gaming Gear",
  "Bàn ghế gaming",
]

const SUPPORT_LINKS = [
  "Hướng dẫn mua hàng",
  "Chính sách bảo hành",
  "Chính sách đổi trả",
  "Phương thức thanh toán",
  "Vận chuyển & giao hàng",
  "Câu hỏi thường gặp",
  "Liên hệ",
]

const SOCIAL_LINKS = [
  { icon: "fa-brands fa-facebook-f", label: "Facebook", href: "#" },
  { icon: "fa-brands fa-youtube", label: "Youtube", href: "#" },
  { icon: "fa-brands fa-tiktok", label: "TikTok", href: "#" },
  { icon: "fa-solid fa-comment-dots", label: "Zalo", href: "#" },
]

const COMMITMENTS = [
  {
    icon: "fa-solid fa-truck-fast",
    title: "Giao hàng nhanh",
    desc: "Toàn quốc, nhận hàng tận nơi",
  },
  {
    icon: "fa-solid fa-shield-halved",
    title: "Bảo hành chính hãng",
    desc: "Tận tâm, chuyên nghiệp",
  },
  {
    icon: "fa-solid fa-rotate",
    title: "Đổi trả dễ dàng",
    desc: "Trong 7 ngày",
  },
  {
    icon: "fa-solid fa-headset",
    title: "Hỗ trợ 24/7",
    desc: "Tư vấn miễn phí",
  },
]

const PAYMENT_BADGES = ["Visa", "Mastercard", "JCB", "ATM"]

const Footer = () => {
  const [email, setEmail] = useState("")

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.warning("Vui lòng nhập email")
      return
    }

    toast.success("Đăng ký nhận tin thành công")
    setEmail("")
  }

  return (
    <footer className="site-footer">
      <div className="site-footer__main">
        <div className="site-footer__grid">
          {/* ============ BRAND ============ */}
          <div className="footer-col footer-col--brand">
            <div className="footer-brand">
              <span className="footer-brand__icon">
                <i className="fa-solid fa-display"></i>
              </span>
              <div>
                <h2>
                  PC<span>Store</span>
                </h2>
                <p>Máy tính chính hãng - Giá tốt nhất</p>
              </div>
            </div>

            <p className="footer-desc">
              PCStore chuyên cung cấp máy tính, laptop, linh kiện và phụ kiện
              chính hãng từ các thương hiệu hàng đầu thế giới. Cam kết mang đến
              sản phẩm chất lượng, giá tốt và dịch vụ hậu mãi uy tín.
            </p>

            <ul className="footer-contact">
              <li>
                <i className="fa-solid fa-location-dot"></i>
                <div>
                  <strong>Địa chỉ</strong>
                  <span>Số 20 Ngõ 192 Lê Trọng Tấn, Hoàng Mai, Hà Nội</span>
                </div>
              </li>
              <li>
                <i className="fa-solid fa-phone"></i>
                <div>
                  <strong>Hotline</strong>
                  <span>0947584056</span>
                  <em>(8:00 - 22:00, tất cả các ngày)</em>
                </div>
              </li>
              <li>
                <i className="fa-solid fa-envelope"></i>
                <div>
                  <strong>Email</strong>
                  <span>tanden1357@gmail.com</span>
                </div>
              </li>
            </ul>
          </div>

          {/* ============ CATEGORIES ============ */}
          <div className="footer-col">
            <h3>Danh mục sản phẩm</h3>
            <ul className="footer-links">
              {PRODUCT_CATEGORIES.map((item) => (
                <li key={item}>
                  <a href="#">
                    <span>{item}</span>
                    <i className="fa-solid fa-chevron-right"></i>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ============ SUPPORT ============ */}
          <div className="footer-col">
            <h3>Hỗ trợ khách hàng</h3>
            <ul className="footer-links">
              {SUPPORT_LINKS.map((item) => (
                <li key={item}>
                  <a href="#">
                    <span>{item}</span>
                    <i className="fa-solid fa-chevron-right"></i>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ============ NEWSLETTER ============ */}
          <div className="footer-col footer-col--newsletter">
            <h3>Đăng ký nhận tin</h3>
            <p>
              Nhận thông tin khuyến mãi, sản phẩm mới và các tin tức công nghệ
              mới nhất từ PCStore.
            </p>

            <h4>Kết nối với chúng tôi</h4>
            <div className="footer-socials">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="footer-socials__item"
                >
                  <i className={s.icon}></i>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============ COMMITMENTS ============ */}
      <div className="site-footer__commitments">
        <div className="footer-commitments">
          {COMMITMENTS.map((c) => (
            <div
              className="footer-commitments__item"
              key={c.title}
            >
              <i className={c.icon}></i>
              <div>
                <strong>{c.title}</strong>
                <span>{c.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============ BOTTOM BAR ============ */}
      <div className="site-footer__bottom">
        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} <strong>PCStore</strong>. Tất cả quyền
            được bảo lưu.
            <a href="#">Chính sách bảo mật</a>
            <a href="#">Điều khoản sử dụng</a>
          </p>

          <div className="footer-payments">
            {PAYMENT_BADGES.map((p) => (
              <span
                key={p}
                className="footer-payments__badge"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
