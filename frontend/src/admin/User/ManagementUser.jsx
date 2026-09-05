import React, { useEffect, useMemo, useState } from "react"
import axiosInstance from "../../utils/axiosInstance"
import ModalAddUser from "./ModalAddUser"
import ModalEditUser from "./ModalEditUser"
import "./ManagementUser.scss"

const ROLE_LABEL = {
  admin: "Admin",
  staff: "Nhân viên",
  user: "Khách hàng",
}

const STATUS_LABEL = {
  active: "Hoạt động",
  blocked: "Bị khóa",
  inactive: "Chưa kích hoạt",
}

const PAGE_SIZE_OPTIONS = [10, 20, 50]

const ManagementUser = () => {
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    blockedUsers: 0,
    newUsers: 0,
  })

  const [searchInput, setSearchInput] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [togglingId, setTogglingId] = useState(null)

  // ---- Modal: Thêm người dùng (state/logic form nằm trong ModalAddUser) ----
  const [showAddModal, setShowAddModal] = useState(false)

  // ---- Modal: Sửa người dùng (chỉ đổi username, phone) ----
  const [editingUser, setEditingUser] = useState(null)

  // ---- Modal: Xác nhận khoá / mở khoá ----
  const [confirmLockUser, setConfirmLockUser] = useState(null)
  const [isConfirmingLock, setIsConfirmingLock] = useState(false)

  const formatDateTime = (date) => {
    if (!date) return ""
    return new Date(date).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // ---- Lấy danh sách người dùng (backend tự lọc + phân trang) ----
  const getUsers = async () => {
    try {
      setIsLoading(true)
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_APP_URL}/admin/all-users`,
        {
          params: {
            search: searchTerm || undefined,
            role: roleFilter || undefined,
            status: statusFilter || undefined,
            page: currentPage,
            limit: pageSize,
          },
        },
      )
      setUsers(response.data.users || [])
      setTotal(response.data.total || 0)
      setTotalPages(response.data.totalPages || 1)
    } catch (error) {
      alert(
        error.response?.data?.message || "Không tải được danh sách người dùng",
      )
    } finally {
      setIsLoading(false)
    }
  }

  // ---- Lấy số liệu 4 thẻ thống kê — tách API riêng, không phụ thuộc filter ----
  const getStats = async () => {
    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_APP_URL}/admin/users/stats`,
      )
      setStats(response.data.data)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    getStats()
  }, [])

  useEffect(() => {
    getUsers()
  }, [searchTerm, roleFilter, statusFilter, currentPage, pageSize])

  // Đổi filter -> quay lại trang 1
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, roleFilter, statusFilter, pageSize])

  // Debounce ô tìm kiếm 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput.trim())
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Khoá scroll nền + đóng bằng Esc cho modal xác nhận khoá/mở khoá
  // (modal thêm người dùng tự quản lý việc này bên trong ModalAddUser)
  useEffect(() => {
    if (confirmLockUser) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    const handleEsc = (e) => {
      if (e.key === "Escape" && confirmLockUser) handleCloseConfirmLock()
    }
    document.addEventListener("keydown", handleEsc)
    return () => {
      document.removeEventListener("keydown", handleEsc)
      document.body.style.overflow = ""
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmLockUser])

  // ==========================================================================
  // ---- Thêm người dùng ----
  // ==========================================================================
  const handleOpenAddModal = () => setShowAddModal(true)
  const handleCloseAddModal = () => setShowAddModal(false)

  // ==========================================================================
  // ---- Khoá / Mở khoá tài khoản ----
  // ==========================================================================
  const handleOpenConfirmLock = (user) => {
    setConfirmLockUser(user)
  }

  const handleCloseConfirmLock = () => {
    if (isConfirmingLock) return
    setConfirmLockUser(null)
  }

  const handleConfirmToggleLock = async () => {
    if (!confirmLockUser) return
    const user = confirmLockUser
    const nextStatus = user.status === "blocked" ? "active" : "blocked"

    setIsConfirmingLock(true)
    setTogglingId(user._id)
    try {
      await axiosInstance.patch(
        `${import.meta.env.VITE_APP_URL}/admin/users/${user._id}/status`,
        { status: nextStatus },
      )
      setUsers((prev) =>
        prev.map((u) =>
          u._id === user._id ? { ...u, status: nextStatus } : u,
        ),
      )
      setConfirmLockUser(null)
      getStats()
    } catch (error) {
      alert(error.response?.data?.message || "Cập nhật trạng thái thất bại")
    } finally {
      setIsConfirmingLock(false)
      setTogglingId(null)
    }
  }

  // ---- Xuất Excel/CSV đơn giản từ dữ liệu trang hiện tại ----
  const handleExportCsv = () => {
    const header = [
      "Tên đăng nhập",
      "Email",
      "Vai trò",
      "SĐT",
      "Trạng thái",
      "Ngày tạo",
    ]
    const rows = users.map((u) => [
      u.username,
      u.email,
      ROLE_LABEL[u.role] || u.role,
      u.phone || "",
      STATUS_LABEL[u.status] || u.status,
      formatDateTime(u.created_at),
    ])
    const csvContent = [header, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n")

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `users-page-${currentPage}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }
  // vì có stats nên dùng use memoo
  const STAT_CARDS = useMemo(
    () => [
      {
        label: "Tổng người dùng",
        value: stats.totalUsers,
        icon: "fa-solid fa-users",
        color: "purple",
      },
      {
        label: "Người dùng hoạt động",
        value: stats.activeUsers,
        icon: "fa-solid fa-user-check",
        color: "green",
      },
      {
        label: "Tài khoản bị khóa",
        value: stats.blockedUsers,
        icon: "fa-solid fa-user-slash",
        color: "orange",
      },
      {
        label: "Người dùng mới",
        value: stats.newUsers,
        icon: "fa-solid fa-user-plus",
        color: "blue",
      },
    ],
    [stats],
  )

  const isUnlockAction = confirmLockUser?.status === "blocked"

  return (
    <div className="management-user">
      <div className="page-header">
        <h2>Quản lý người dùng</h2>
        <p>Quản lý tài khoản người dùng trong hệ thống</p>
      </div>

      {/* ================= 4 THẺ THỐNG KÊ ================= */}
      <div className="stat-grid">
        {STAT_CARDS.map((card, index) => (
          <div
            className={`stat-card card-${card.color}`}
            key={card.label}
            style={{ animationDelay: `${index * 0.06}s` }}
          >
            <div className="stat-icon">
              <i className={card.icon}></i>
            </div>
            <div className="stat-text">
              <span className="stat-label">{card.label}</span>
              <span className="stat-value">
                {card.value?.toLocaleString("vi-VN") ?? 0}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ================= BỘ LỌC ================= */}
      <div className="filter-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <i className="fa-solid fa-magnifying-glass"></i>
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">Tất cả vai trò</option>
          <option value="admin">Admin</option>

          <option value="user">Khách hàng</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="blocked">Bị khóa</option>
        </select>

        <button
          className="add-user-btn"
          onClick={handleOpenAddModal}
        >
          <i className="fa-solid fa-plus"></i> Thêm người dùng
        </button>

        <button
          className="export-btn"
          onClick={handleExportCsv}
        >
          <i className="fa-solid fa-download"></i> Xuất Excel
        </button>
      </div>

      {/* ================= BẢNG DANH SÁCH ================= */}
      <div className="user-table-wrap">
        <table className="user-table">
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Số điện thoại</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr className="empty-row">
                <td colSpan={8}>Đang tải...</td>
              </tr>
            )}

            {!isLoading && users.length === 0 && (
              <tr className="empty-row">
                <td colSpan={8}>Không tìm thấy người dùng nào</td>
              </tr>
            )}

            {!isLoading &&
              users.map((user, index) => {
                const isToggling = togglingId === user._id
                return (
                  <tr
                    key={user._id}
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    <td className="col-user">
                      <div className="user-info">
                        <div className="avatar">
                          {user.avatar_url ? (
                            <img
                              src={`${import.meta.env.VITE_APP_URL}${user.avatar_url}`}
                              alt={user.username}
                            />
                          ) : (
                            <span>
                              {user.username?.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="name">
                            {user.fullname || user.username}
                          </p>
                          <span className="username">@{user.username}</span>
                        </div>
                      </div>
                    </td>

                    <td>{user.email}</td>

                    <td>
                      <span className={`role-badge role-${user.role}`}>
                        {ROLE_LABEL[user.role] || user.role}
                      </span>
                    </td>

                    <td>{user.phone || "—"}</td>

                    <td>
                      <span className={`status-badge status-${user.status}`}>
                        <i className="fa-solid fa-circle"></i>
                        {STATUS_LABEL[user.status] || user.status}
                      </span>
                    </td>

                    <td className="col-date">
                      {formatDateTime(user.created_at)}
                    </td>

                    <td className="col-actions">
                      <button
                        className="icon-btn edit-btn"
                        title="Sửa"
                        onClick={() => setEditingUser(user)}
                      >
                        <i className="fa-solid fa-pen"></i>
                      </button>
                      <button
                        className={`icon-btn lock-btn ${
                          user.status === "blocked" ? "is-unlock" : ""
                        }`}
                        title={
                          user.status === "blocked"
                            ? "Mở khoá"
                            : "Khoá tài khoản"
                        }
                        onClick={() => handleOpenConfirmLock(user)}
                        disabled={isToggling}
                      >
                        {isToggling ? (
                          <i className="fa-solid fa-spinner fa-spin"></i>
                        ) : (
                          <i
                            className={`fa-solid ${
                              user.status === "blocked"
                                ? "fa-lock-open"
                                : "fa-lock"
                            }`}
                          ></i>
                        )}
                      </button>
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>

      {/* ================= PHÂN TRANG ================= */}
      {total > 0 && (
        <div className="table-pagination">
          <div className="page-size-select">
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option
                  key={size}
                  value={size}
                >
                  {size} / trang
                </option>
              ))}
            </select>
          </div>

          <span className="page-info">
            Hiển thị {(currentPage - 1) * pageSize + 1} đến{" "}
            {Math.min(currentPage * pageSize, total)} trong tổng số {total}{" "}
            người dùng
          </span>

          <div className="page-controls">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1,
              )
              .map((page, i, arr) => (
                <React.Fragment key={page}>
                  {i > 0 && page - arr[i - 1] > 1 && (
                    <span className="ellipsis">…</span>
                  )}
                  <button
                    className={page === currentPage ? "active" : ""}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                </React.Fragment>
              ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: THÊM NGƯỜI DÙNG ================= */}
      {showAddModal && (
        <ModalAddUser
          onClose={handleCloseAddModal}
          onSuccess={() => {
            getUsers()
            getStats()
          }}
        />
      )}

      {/* ================= MODAL: SỬA NGƯỜI DÙNG ================= */}
      {editingUser && (
        <ModalEditUser
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={(updatedUser) => {
            setUsers((prev) =>
              prev.map((u) =>
                u._id === editingUser._id
                  ? { ...u, ...(updatedUser || {}) }
                  : u,
              ),
            )
          }}
        />
      )}

      {/* ================= MODAL: XÁC NHẬN KHOÁ / MỞ KHOÁ ================= */}
      {confirmLockUser && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) handleCloseConfirmLock()
          }}
        >
          <div
            className="modal-box confirm-modal"
            role="alertdialog"
            aria-modal="true"
          >
            <div
              className={`confirm-icon ${isUnlockAction ? "is-unlock" : "is-lock"}`}
            >
              <i
                className={`fa-solid ${isUnlockAction ? "fa-lock-open" : "fa-lock"}`}
              ></i>
            </div>

            <h3>{isUnlockAction ? "Mở khoá tài khoản?" : "Khoá tài khoản?"}</h3>
            <p>
              {isUnlockAction ? "Người dùng " : "Người dùng "}
              <strong>@{confirmLockUser.username}</strong>
              {isUnlockAction
                ? " sẽ có thể đăng nhập và sử dụng hệ thống trở lại."
                : " sẽ không thể đăng nhập cho đến khi được mở khoá."}
            </p>

            <div className="modal-footer centered">
              <button
                type="button"
                className="btn-cancel"
                onClick={handleCloseConfirmLock}
                disabled={isConfirmingLock}
              >
                Huỷ
              </button>
              <button
                type="button"
                className={`btn-confirm ${isUnlockAction ? "is-unlock" : "is-lock"}`}
                onClick={handleConfirmToggleLock}
                disabled={isConfirmingLock}
              >
                {isConfirmingLock ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Đang xử
                    lý...
                  </>
                ) : isUnlockAction ? (
                  <>
                    <i className="fa-solid fa-lock-open"></i> Mở khoá
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-lock"></i> Khoá tài khoản
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManagementUser
