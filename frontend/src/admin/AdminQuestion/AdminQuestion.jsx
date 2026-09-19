import React, { useEffect, useMemo, useState } from "react"
import axiosInstance from "../../utils/axiosInstance.js"
import { toast } from "../../pages/Toast/Toast.jsx"
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

// Sinh danh sách số trang có dấu "..." khi quá nhiều trang, kiểu 1 ... 4 5 [6] 7 8 ... 20
function getPageNumbers(current, total) {
  const delta = 1
  const range = []
  const withDots = []
  let last

  for (let i = 1; i <= total; i++) {
    if (
      i === 1 ||
      i === total ||
      (i >= current - delta && i <= current + delta)
    ) {
      range.push(i)
    }
  }

  for (const i of range) {
    if (last !== undefined) {
      if (i - last === 2) {
        withDots.push(last + 1)
      } else if (i - last > 2) {
        withDots.push("...")
      }
    }
    withDots.push(i)
    last = i
  }

  return withDots
}

const AdminQuestion = () => {
  const [questions, setQuestions] = useState([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const [search, setSearch] = useState("")
  const [answeredFilter, setAnsweredFilter] = useState("all") // "all" | "answered" | "unanswered"
  const [page, setPage] = useState(1)
  const [limit] = useState(5)
  const [totalPages, setTotalPages] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPrevPage, setHasPrevPage] = useState(false)

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
        `${import.meta.env.VITE_APP_URL}/question/admin/all`,
        {
          params: {
            page,
            limit,
            search: search.trim() || undefined,
            status: answeredFilter === "all" ? undefined : answeredFilter,
          },
        },
      )

      const data = response.data.data

      setQuestions(data.questions)
      setTotal(data.pagination?.total ?? 0)
      setTotalPages(data.pagination?.totalPages ?? 1)
      setHasNextPage(
        data.pagination?.hasNextPage ??
          page < (data.pagination?.totalPages ?? 1),
      )
      setHasPrevPage(data.pagination?.hasPrevPage ?? page > 1)
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không tải được danh sách câu hỏi",
      )
    } finally {
      setIsLoading(false)
    }
  }

  // debounce ô tìm kiếm 400ms, tránh gọi API mỗi lần gõ 1 ký tự
  useEffect(() => {
    const t = setTimeout(getQuestions, 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, answeredFilter])

  const pageNumbers = useMemo(
    () => getPageNumbers(page, totalPages),
    [page, totalPages],
  )

  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1
  const rangeEnd = Math.min(page * limit, total)

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
        `${import.meta.env.VITE_APP_URL}/question/admin/${question._id}/reply`,
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
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1) // đổi filter -> luôn quay về trang 1
            }}
          />
        </div>

        <select
          value={answeredFilter}
          onChange={(e) => {
            setAnsweredFilter(e.target.value)
            setPage(1)
          }}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chưa trả lời</option>
          <option value="approved">Đã trả lời</option>
          <option value="hidden">Đã ẩn</option>
        </select>

        <button
          type="button"
          className="aq-refresh-btn"
          onClick={getQuestions}
        >
          <i className="fa-solid fa-rotate-right"></i> Làm mới
        </button>
      </div>

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

      {/* ================= PHÂN TRANG ================= */}
      {!isLoading && total > 0 && (
        <div className="aq-pagination">
          <span className="aq-pagination__range">
            Hiển thị {rangeStart}–{rangeEnd} trong tổng số {total} câu hỏi
          </span>

          <div className="aq-pagination__controls">
            <button
              type="button"
              className="aq-page-btn aq-page-btn--nav"
              disabled={!hasPrevPage}
              onClick={() => setPage((p) => p - 1)}
              aria-label="Trang trước"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>

            {pageNumbers.map((n, idx) =>
              n === "..." ? (
                <span
                  key={`dots-${idx}`}
                  className="aq-page-dots"
                >
                  ...
                </span>
              ) : (
                <button
                  key={n}
                  type="button"
                  className={`aq-page-btn ${n === page ? "is-active" : ""}`}
                  onClick={() => setPage(n)}
                  aria-current={n === page ? "page" : undefined}
                >
                  {n}
                </button>
              ),
            )}

            <button
              type="button"
              className="aq-page-btn aq-page-btn--nav"
              disabled={!hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              aria-label="Trang sau"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminQuestion
