import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axiosInstance from "../../utils/axiosInstance.js"
import { toast } from "../Toast/Toast.jsx"
import axios from "axios"
import "./Question.scss"
import LoginRequiredModal from "../LoginRequiredModal.jsx"
const LIMIT = 5
const MAX_LENGTH = 1000

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user"))
  } catch {
    return null
  }
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000)

  if (diffMin < 1) return "Vừa xong"
  if (diffMin < 60) return `${diffMin} phút trước`

  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour} giờ trước`

  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 30) return `${diffDay} ngày trước`

  return date.toLocaleDateString("vi-VN")
}

const Question = () => {
  const navigate = useNavigate()
  const user = getStoredUser()

  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [questions, setQuestions] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const getQuestions = async (targetPage, { append = false } = {}) => {
    try {
      append ? setIsLoadingMore(true) : setIsLoading(true)

      const response = await axios.get(
        `${import.meta.env.VITE_APP_URL}/question/approved`,
        {
          params: {
            page: targetPage,
            limit: LIMIT,
          },
        },
      )

      const data = response.data.data

      const items = data.questions || []

      setQuestions((prev) => (append ? [...prev, ...items] : items))

      setHasMore(data.pagination?.hasMore ?? false)
      setPage(targetPage)
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không tải được danh sách câu hỏi",
      )
    } finally {
      append ? setIsLoadingMore(false) : setIsLoading(false)
    }
  }

  useEffect(() => {
    getQuestions(1)
  }, [])

  const handleAsk = async (e) => {
    e.preventDefault()

    const user = localStorage.getItem("user")

    if (!user) {
      setIsLoginModalOpen(true)
      return
    }

    const trimmed = content.trim()
    if (!trimmed) {
      toast.warning("Vui lòng nhập nội dung câu hỏi")
      return
    }
    if (trimmed.length > MAX_LENGTH) {
      toast.warning(`Câu hỏi không được vượt quá ${MAX_LENGTH} ký tự`)
      return
    }

    try {
      setIsSubmitting(true)
      await axios.post(`${import.meta.env.VITE_APP_URL}/question/add`, {
        content: trimmed,
      })
      toast.success("Đã gửi câu hỏi, câu hỏi sẽ hiển thị sau khi được duyệt")
      setContent("")
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Gửi câu hỏi không thành công",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="question-and-answer">
      <div className="qa-header">
        <h2>Hỏi đáp cùng PC Store</h2>
        <p>Bạn có câu hỏi? Hãy để lại câu hỏi bên dưới</p>

        <form
          className="qa-ask-form"
          onSubmit={handleAsk}
        >
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Bạn muốn hỏi điều gì?"
            maxLength={MAX_LENGTH}
          />
          <button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang gửi..." : "Đặt câu hỏi"}
            <i className="fa-regular fa-paper-plane"></i>
          </button>
        </form>
      </div>

      {/* ================= DANH SÁCH HỎI ĐÁP ================= */}
      <div className="qa-list">
        {isLoading && <p className="qa-empty">Đang tải câu hỏi...</p>}

        {!isLoading && questions.length === 0 && (
          <p className="qa-empty">
            Chưa có câu hỏi nào. Hãy là người đầu tiên đặt câu hỏi!
          </p>
        )}

        {questions.map((q) => (
          <div
            key={q._id}
            className="qa-card"
          >
            <div className="qa-card__head">
              <span className="qa-avatar">
                <i className="fa-solid fa-circle-user"></i>
              </span>
              <div className="qa-card__meta">
                <strong>{q.user_id?.username || "Khách hàng"}</strong>
                <span className="qa-time">
                  {formatRelativeTime(q.created_at)}
                </span>
              </div>
            </div>

            <p className="qa-content">{q.content}</p>

            {q.admin_reply && (
              <div className="qa-reply">
                <span className="qa-reply__label">
                  <i className="fa-solid fa-comment-dots"></i> PC Store • Admin
                </span>
                <p>{q.admin_reply}</p>
              </div>
            )}
          </div>
        ))}

        {hasMore && !isLoading && (
          <div className="qa-load-more">
            <button
              type="button"
              onClick={() => getQuestions(page + 1, { append: true })}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? "Đang tải..." : "Xem thêm câu hỏi"}
            </button>
          </div>
        )}
      </div>

      <LoginRequiredModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  )
}

export default Question
