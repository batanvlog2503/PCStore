import React, { useEffect, useState } from "react"
import axiosInstance from "../../utils/axiosInstance.js"
import { toast } from "../../utils/toast.js"
import "./AdminQuestion.scss"

const MAX_REPLY_LENGTH = 1000

function pad2(n) {
  return String(n).padStart(2, "0")
}

function formatDateTime(dateStr) {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()} ${pad2(
    d.getHours(),
  )}:${pad2(d.getMinutes())}`
}

const AdminQuestion = () => {
  const [questions, setQuestions] = useState([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const [search, setSearch] = useState("")
  const [answeredFilter, setAnsweredFilter] = useState("all") // "all" | "answered" | "unanswered"
  const [timeRange, setTimeRange] = useState("all") // "all" | "today" | "7d" | "30d"

  // nội dung đang gõ cho từng câu hỏi, key là question._id
  const [replyDrafts, setReplyDrafts] = useState({})
  // id câu hỏi đang bật form sửa lại câu trả lời đã có
  const [editingId, setEditingId] = useState(null)
  // id câu hỏi đang gửi request trả lời (disable đúng 1 nút, không phải tất cả)
  const [submittingId, setSubmittingId] = useState(null)

  const getQuestions = async () => {
    try {
      setIsLoading(true)
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_APP_URL}/admin/question/all`,
        {
          params: {
            search: search || undefined,
            answered: answeredFilter === "all" ? undefined : answeredFilter,
            range: timeRange === "all" ? undefined : timeRange,
          },
        },
      )
      setQuestions(response.data.questions || [])
      setTotal(response.data.total ?? response.data.questions?.length ?? 0)
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không tải được danh sách câu hỏi",
      )
    } finally {
      setIsLoading(false)
    }
  }

  // debounce ô tìm kiếm, các dropdown thì áp dụng ngay
  useEffect(() => {
    const t = setTimeout(getQuestions, 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, answeredFilter, timeRange])

  const handleReplyChange = (id, value) => {
    setReplyDrafts((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmitReply = async (question) => {
    const text = (replyDrafts[question._id] ?? "").trim()

    if (!text) {
      toast.warning("Vui lòng nhập nội dung trả lời")
      return
    }
    if (text.length > MAX_REPLY_LENGTH) {
      toast.warning(`Câu trả lời không được vượt quá ${MAX_REPLY_LENGTH} ký tự`)
      return
    }

    try {
      setSubmittingId(question._id)
      const response = await axiosInstance.patch(
        `${import.meta.env.VITE_APP_URL}/admin/question/${question._id}/reply`,
        { admin_reply: text },
      )

      const updated = response.data.question || {
        ...question,
        admin_reply: text,
        replied_at: new Date().toISOString(),
      }

      setQuestions((prev) =>
        prev.map((q) => (q._id === question._id ? updated : q)),
      )
      setReplyDrafts((prev) => ({ ...prev, [question._id]: "" }))
      setEditingId(null)
      toast.success("Đã gửi phản hồi cho khách hàng")
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Gửi phản hồi không thành công",
      )
    } finally {
      setSubmittingId(null)
    }
  }

  const handleStartEdit = (question) => {
    setEditingId(question._id)
    setReplyDrafts((prev) => ({
      ...prev,
      [question._id]: question.admin_reply,
    }))
  }

  return (
    <div className="admin-question">
      {/* ================= HEADER ================= */}
      <div className="aq-header">
        <div className="aq-header-text">
          <h1>Quản lý hỏi đáp</h1>
          <p>Xem và trả lời các câu hỏi từ khách hàng</p>
        </div>
        <span className="aq-total-badge">{total} câu hỏi</span>
      </div>

      {/* ================= FILTER ================= */}
      <div className="aq-filter">
        <div className="aq-search">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Tìm theo tên người dùng, nội dung..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={answeredFilter}
          onChange={(e) => setAnsweredFilter(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="unanswered">Chưa trả lời</option>
          <option value="answered">Đã trả lời</option>
        </select>

        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="all">Tất cả thời gian</option>
          <option value="today">Hôm nay</option>
          <option value="7d">7 ngày qua</option>
          <option value="30d">30 ngày qua</option>
        </select>

        <button
          type="button"
          className="aq-refresh-btn"
          onClick={getQuestions}
        >
          <i className="fa-solid fa-rotate-right"></i> Làm mới
        </button>
      </div>

      {/* ================= LIST ================= */}
      {isLoading && <p className="aq-empty">Đang tải câu hỏi...</p>}

      {!isLoading && questions.length === 0 && (
        <p className="aq-empty">Không có câu hỏi nào khớp với bộ lọc.</p>
      )}

      <div className="aq-list">
        {questions.map((q) => {
          const answered = !!q.admin_reply
          const isEditing = editingId === q._id
          const showForm = !answered || isEditing
          const isSubmitting = submittingId === q._id

          return (
            <div
              key={q._id}
              className="aq-card"
            >
              <div className="aq-card__top">
                <div className="aq-user">
                  <span className="aq-avatar">
                    <i className="fa-solid fa-circle-user"></i>
                  </span>
                  <div>
                    <strong>{q.user_id?.username || "Khách hàng"}</strong>
                    <p className="aq-email">{q.user_id?.email || ""}</p>
                    <p className="aq-time">
                      <i className="fa-regular fa-clock"></i>{" "}
                      {formatDateTime(q.created_at)}
                    </p>
                  </div>
                </div>

                <span
                  className={`aq-status ${answered ? "is-answered" : "is-pending"}`}
                >
                  <i
                    className={
                      answered
                        ? "fa-solid fa-circle-check"
                        : "fa-solid fa-circle-exclamation"
                    }
                  ></i>
                  {answered ? "Đã trả lời" : "Chưa trả lời"}
                </span>
              </div>

              <div className="aq-question">
                <span className="aq-label aq-label--customer">
                  <i className="fa-regular fa-comment"></i> Câu hỏi của khách
                </span>
                <p>{q.content}</p>
              </div>

              {answered && !isEditing && (
                <div className="aq-reply-box">
                  <div className="aq-reply-box__head">
                    <span className="aq-label aq-label--admin">
                      <i className="fa-solid fa-comment-dots"></i> Phản hồi của
                      Admin
                    </span>
                    <button
                      type="button"
                      className="aq-edit-btn"
                      onClick={() => handleStartEdit(q)}
                    >
                      <i className="fa-solid fa-pen"></i> Sửa
                    </button>
                  </div>
                  <p>{q.admin_reply}</p>
                  <span className="aq-reply-box__meta">
                    <i className="fa-solid fa-circle-user"></i> Admin •{" "}
                    {formatDateTime(q.replied_at)}
                  </span>
                </div>
              )}

              {showForm && (
                <div className="aq-reply-form">
                  <span className="aq-label aq-label--admin">
                    <i className="fa-solid fa-comment-dots"></i> Phản hồi của
                    Admin
                  </span>
                  <textarea
                    rows={3}
                    maxLength={MAX_REPLY_LENGTH}
                    placeholder="Nhập câu trả lời cho khách hàng..."
                    value={replyDrafts[q._id] ?? ""}
                    onChange={(e) => handleReplyChange(q._id, e.target.value)}
                  />
                  <div className="aq-reply-form__footer">
                    <span className="aq-char-count">
                      {(replyDrafts[q._id] ?? "").length}/{MAX_REPLY_LENGTH}
                    </span>

                    <div className="aq-reply-form__actions">
                      {isEditing && (
                        <button
                          type="button"
                          className="aq-cancel-btn"
                          onClick={() => setEditingId(null)}
                        >
                          Huỷ
                        </button>
                      )}
                      <button
                        type="button"
                        className="aq-submit-btn"
                        disabled={isSubmitting}
                        onClick={() => handleSubmitReply(q)}
                      >
                        <i className="fa-regular fa-paper-plane"></i>
                        {isSubmitting ? "Đang gửi..." : "Trả lời"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AdminQuestion
