import React, { useState } from "react"
import { Link } from "react-router-dom"
import axiosInstance from "../../utils/axiosInstance.js"
import { toast } from "../Toast/Toast.jsx"
import "./Contact.scss"
import { CONTACT_INFO } from "./ContactInfo.js"
import LoginRequiredModal from "../LoginRequiredModal.jsx"
const INITIAL_FORM = {
  name: "",
  phone: "",
  email: "",
  message: "",
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const Contact = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [form, setForm] = useState(INITIAL_FORM)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const validate = () => {
    if (!form.name.trim()) {
      toast.warning("Vui lòng nhập họ và tên")
      return false
    }
    if (!form.phone.trim()) {
      toast.warning("Vui lòng nhập số điện thoại")
      return false
    }
    if (!form.email.trim() || !EMAIL_REGEX.test(form.email.trim())) {
      toast.warning("Vui lòng nhập email hợp lệ")
      return false
    }
    if (!form.message.trim()) {
      toast.warning("Vui lòng nhập nội dung liên hệ")
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    const user = localStorage.getItem("user")

    if (!user) {
      setIsLoginModalOpen(true)
      return
    }
    const toastId = toast.loading("Đang gửi liên hệ...")
    try {
      setIsSubmitting(true)
      const response = await axiosInstance.post(
        `${import.meta.env.VITE_APP_URL}/contact/contact-message/add`,
        {
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
        },
      )

      toast.update(toastId, {
        type: "success",
        message: "Gửi liên hệ thành công, chúng tôi sẽ phản hồi sớm nhất",
      })
      setForm(INITIAL_FORM)
    } catch (error) {
      toast.update(toastId, {
        type: "error",
        message:
          error.response?.data?.message ||
          "Gửi liên hệ không thành công, vui lòng thử lại",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="contact-hero__text">
          <h1>Liên hệ với chúng tôi</h1>
          <p>Chúng tôi luôn sẵn sàng hỗ trợ và giải đáp mọi thắc mắc của bạn</p>
          <nav
            className="contact-breadcrumb"
            aria-label="Breadcrumb"
          ></nav>
        </div>

        <div
          className="contact-hero__art"
          aria-hidden="true"
        ></div>
      </div>

      <div className="contact-body">
        <section
          className="contact-info"
          aria-label="Thông tin liên hệ"
        >
          <h2>Thông tin liên hệ</h2>

          <ul className="contact-info__list">
            {CONTACT_INFO.map((item) => (
              <li
                key={item.label}
                className="contact-info__item"
              >
                <span className={`contact-info__icon tone-${item.tone}`}>
                  <i className={item.icon}></i>
                </span>
                <div className="contact-info__text">
                  <p className="contact-info__label">{item.label}</p>
                  {item.lines.map((line) => (
                    <p
                      key={line}
                      className="contact-info__line"
                    >
                      {line}
                    </p>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section
          className="contact-form-card"
          aria-label="Gửi tin nhắn liên hệ"
        >
          <h2>Gửi tin nhắn cho chúng tôi</h2>
          <p className="contact-form-card__hint">
            Điền thông tin bên dưới, chúng tôi sẽ liên hệ lại với bạn sớm nhất!
          </p>

          <form
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="contact-form-row">
              <label className="contact-field">
                <i className="fa-solid fa-user"></i>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Họ và tên *"
                />
              </label>

              <label className="contact-field">
                <i className="fa-solid fa-phone"></i>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Số điện thoại *"
                />
              </label>
            </div>

            <label className="contact-field">
              <i className="fa-solid fa-envelope"></i>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email *"
              />
            </label>

            <label className="contact-field contact-field--textarea">
              <i className="fa-solid fa-comment-dots"></i>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Nội dung liên hệ *"
                rows={5}
              />
            </label>

            <label className="contact-consent">
              <span>PCStore sẽ phản hồi sớm thông qua email</span>
            </label>

            <button
              type="submit"
              className="contact-submit"
              disabled={isSubmitting}
            >
              <i className="fa-solid fa-paper-plane"></i>
              {isSubmitting ? "Đang gửi..." : "Gửi liên hệ"}
            </button>
          </form>
        </section>
      </div>

      <LoginRequiredModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  )
}

export default Contact
