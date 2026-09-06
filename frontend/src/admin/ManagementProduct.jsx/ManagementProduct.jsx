import React, { useEffect, useMemo, useState } from "react"
import "./ManagementProduct.scss"
import axiosInstance from "../../utils/axiosInstance"

import ProductDetailModal from "./modals/ProductDetailModal.jsx"
import ProductEditModal from "./modals/ProductEditModal.jsx"
import ConfirmDeleteModal from "./modals/ConfirmDeleteModal.jsx"

const STATUS_LABEL = {
  active: "Đang hoạt động",
  hidden: "Tạm ẩn",
  deleted: "Đã xoá",
}

const CATEGORY_OPTIONS = [
  "Tất cả danh mục",
  "Máy tính để bàn",
  "Laptop",
  "Màn hình",
  "Linh kiện",
  "Phụ kiện",
  "Case",
]

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "active", label: "Đang hoạt động" },
  { value: "hidden", label: "Tạm ẩn" },
]

const WAREHOUSE_OPTIONS = ["Tất cả", "Kho Hà Nội", "Kho TP.HCM", "Kho Đà Nẵng"]

const PAGE_SIZE_OPTIONS = [10, 20, 50]

const INITIAL_FILTERS = {
  search: "",
  category: "Tất cả danh mục",
  status: "all",
  warehouse: "Tất cả",
  priceFrom: "",
  priceTo: "",
}

// ================= MOCK

const ManagementProduct = () => {
  const [mounted, setMounted] = useState(false)

  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    hidden: 0,
    deleted: 0,
  })

  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(INITIAL_FILTERS)

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const [selectedIds, setSelectedIds] = useState([])

  // modal state — mỗi modal chỉ cần biết đang thao tác với sản phẩm nào (null = đóng)
  const [detailProduct, setDetailProduct] = useState(null)
  const [editProduct, setEditProduct] = useState(null)
  const [deleteProduct, setDeleteProduct] = useState(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(t)
  }, [])

  const getProducts = async () => {
    try {
      setLoading(true)

      const response = await axiosInstance.get(
        `${import.meta.env.VITE_APP_URL}/admin/products/all`,
        {
          params: {
            page,
            limit,
            search: appliedFilters.search || undefined,
            category:
              appliedFilters.category === "Tất cả danh mục"
                ? undefined
                : appliedFilters.category,
            status:
              appliedFilters.status === "all"
                ? undefined
                : appliedFilters.status,

            priceFrom: appliedFilters.priceFrom || undefined,
            priceTo: appliedFilters.priceTo || undefined,
          },
        },
      )
      setProducts(response.data.data.products)
      setTotal(response.data.data.total)
    } catch (error) {
      console.error("Lỗi lấy danh sách sản phẩm:", error)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    getProductStats()
  }, [])
  const getProductStats = async () => {
    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_APP_URL}/admin/products/all/stats`,
      )

      setStats(response.data.data)
    } catch (error) {
      console.error("Lỗi lấy thống kê sản phẩm:", error)
    }
  }
  useEffect(() => {
    getProducts()
  }, [page, limit, appliedFilters])

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  const handleSearch = () => {
    setPage(1)
    setAppliedFilters(filters)
  }

  const handleReset = () => {
    setFilters(INITIAL_FILTERS)
    setAppliedFilters(INITIAL_FILTERS)
    setPage(1)
  }

  const handleExportExcel = () => {
    alert("Chức năng xuất Excel — nối API export khi backend sẵn sàng.")
  }

  // ===== Modal: xem chi tiết =====
  const handleView = (product) => setDetailProduct(product)

  // ===== Modal: chỉnh sửa (có thể mở trực tiếp từ bảng, hoặc từ nút "Chỉnh sửa" trong modal chi tiết) =====
  const handleEdit = (product) => {
    setDetailProduct(null)
    setEditProduct(product)
  }

  const handleSaveEdit = async (formData) => {
    try {
      setSavingEdit(true)

      // await axiosInstance.put(
      //   `${import.meta.env.VITE_APP_URL}/admin/products/${formData._id}`,
      //   formData,
      // )

      setProducts((prev) =>
        prev.map((p) => (p._id === formData._id ? { ...p, ...formData } : p)),
      )
      setEditProduct(null)
    } catch (error) {
      alert(error.response?.data?.message || "Cập nhật sản phẩm thất bại")
    } finally {
      setSavingEdit(false)
    }
  }

  // ===== Modal: xoá =====
  const handleDelete = (product) => setDeleteProduct(product)

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true)

      const response = await axiosInstance.delete(
        `${import.meta.env.VITE_APP_URL}/admin/products/${deleteProduct._id}/soft-delete`,
      )

      setProducts((prev) => prev.filter((p) => p._id !== deleteProduct._id))
      setTotal((prev) => prev - 1)
      setDeleteProduct(null)
    } catch (error) {
      alert(error.response?.data?.message || "Xoá sản phẩm thất bại")
    } finally {
      setDeleting(false)
    }
  }

  const formatPrice = (price) => {
    if (price == null) return ""
    return price.toLocaleString("vi-VN") + "đ"
  }

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

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1
  const rangeEnd = Math.min(page * limit, total)

  const pageNumbers = useMemo(() => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
      return pages
    }

    pages.push(1)
    let start = Math.max(2, page - 1)
    let end = Math.min(totalPages - 1, page + 3)

    if (page <= 3) {
      start = 2
      end = 5
    }

    if (start > 2) pages.push("...")
    for (let i = start; i <= end; i++) pages.push(i)
    if (end < totalPages - 1) pages.push("...")

    pages.push(totalPages)
    return pages
  }, [page, totalPages])

  const isAllSelected =
    products.length > 0 && products.every((p) => selectedIds.includes(p._id))

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !products.some((p) => p._id === id)),
      )
    } else {
      setSelectedIds((prev) => [
        ...prev,
        ...products.filter((p) => !prev.includes(p._id)).map((p) => p._id),
      ])
    }
  }

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const STATS = [
    {
      key: "total",
      label: "Tổng sản phẩm",
      sub: "Tất cả sản phẩm",
      value: stats.total,
      icon: "fa-solid fa-box",
      tone: "purple",
    },
    {
      key: "active",
      label: "Đang hoạt động",
      sub: "Sản phẩm hiển thị",
      value: stats.active,
      icon: "fa-solid fa-circle-check",
      tone: "green",
    },
    {
      key: "hidden",
      label: "Tạm ẩn",
      sub: "Đang ẩn",
      value: stats.hidden,
      icon: "fa-solid fa-eye-slash",
      tone: "orange",
    },
    {
      key: "deleted",
      label: "Đã xoá",
      sub: "Đã xoá mềm",
      value: stats.deleted,
      icon: "fa-regular fa-trash-can",
      tone: "red",
    },
  ]

  return (
    <div className={`management-product ${mounted ? "is-mounted" : ""}`}>
      {/* ===== HEADER ===== */}
      <div className="mp-header">
        <h1>Quản lý sản phẩm</h1>
        <p>Quản lý và theo dõi tất cả sản phẩm trong cửa hàng</p>
      </div>

      {/* ===== STAT CARDS ===== */}
      <div className="mp-stat-cards">
        {STATS.map((s, i) => (
          <div
            className="mp-stat-card"
            key={s.key}
            style={{ transitionDelay: `${i * 70}ms` }}
          >
            <div className={`mp-stat-icon tone-${s.tone}`}>
              <i className={s.icon}></i>
            </div>
            <div className="mp-stat-body">
              <span className="mp-stat-label">{s.label}</span>
              <span className="mp-stat-value">
                {s.value.toLocaleString("vi-VN")}
              </span>
              <span className="mp-stat-sub">{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ===== FILTER BAR ===== */}
      <form
        className="mp-filter-card"
        onSubmit={(e) => {
          e.preventDefault()
          handleSearch()
        }}
      >
        <h4>Bộ lọc tìm kiếm</h4>

        <div className="mp-filter-grid">
          <div className="filter-field search-field">
            <div className="search-input">
              <input
                type="text"
                placeholder="Nhập tên sản phẩm, mã SP..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
              <i className="fa-solid fa-magnifying-glass"></i>
            </div>
          </div>

          <div className="filter-field">
            <label>Danh mục</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option
                  key={c}
                  value={c}
                >
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>Trạng thái</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option
                  key={s.value}
                  value={s.value}
                >
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>Kho hàng</label>
            <select
              value={filters.warehouse}
              onChange={(e) => handleFilterChange("warehouse", e.target.value)}
            >
              {WAREHOUSE_OPTIONS.map((w) => (
                <option
                  key={w}
                  value={w}
                >
                  {w}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-field price-range-field">
            <label>Khoảng giá</label>
            <div className="price-range">
              <input
                type="number"
                min="0"
                placeholder="Từ giá"
                value={filters.priceFrom}
                onChange={(e) =>
                  handleFilterChange("priceFrom", e.target.value)
                }
              />
              <span className="dash">-</span>
              <input
                type="number"
                min="0"
                placeholder="Đến giá"
                value={filters.priceTo}
                onChange={(e) => handleFilterChange("priceTo", e.target.value)}
              />
            </div>
          </div>

          <div className="filter-actions">
            <button
              type="submit"
              className="search-btn"
            >
              <i className="fa-solid fa-magnifying-glass"></i> Tìm kiếm
            </button>
            <button
              type="button"
              className="reset-btn"
              onClick={handleReset}
            >
              <i className="fa-solid fa-rotate-left"></i> Đặt lại
            </button>
          </div>
        </div>
      </form>

      {/* ===== TABLE ===== */}
      <div className="mp-table-card">
        <div className="mp-table-head">
          <h4>Danh sách sản phẩm</h4>
          <button
            className="export-btn"
            onClick={handleExportExcel}
          >
            <i className="fa-solid fa-file-export"></i> Xuất Excel
          </button>
        </div>

        <div className="mp-table-scroll">
          <table>
            <thead>
              <tr>
                <th className="col-index">#</th>
                <th>Ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Danh mục</th>
                <th>Số phiên bản</th>
                <th>Giá từ</th>
                <th>Tổng kho</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th className="col-actions">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: limit > 6 ? 6 : limit }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 11 }).map((__, j) => (
                      <td key={j}>
                        <span className="mp-skeleton-line w-70"></span>
                      </td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="mp-empty"
                  >
                    <i className="fa-solid fa-box-open"></i>
                    <p>Không tìm thấy sản phẩm nào</p>
                  </td>
                </tr>
              ) : (
                products.map((p, i) => {
                  return (
                    <tr
                      key={p._id}
                      style={{ transitionDelay: `${i * 40}ms` }}
                    >
                      <td className="col-index">
                        {(page - 1) * limit + i + 1}
                      </td>
                      <td>
                        <div className="mp-thumb">
                          {p.image_url ? (
                            <img
                              src={`${import.meta.env.VITE_APP_URL}${p.image_url}`}
                              alt={p.name}
                            />
                          ) : (
                            <i className="fa-solid fa-image"></i>
                          )}
                        </div>
                      </td>
                      <td className="product-cell">
                        <p className="name">{p.name}</p>
                        <span className="sku">{p.sku}</span>
                      </td>
                      <td>{p.category.name || "-"}</td>
                      <td>{p.variants.length}</td>
                      <td className="discount-cell">
                        {formatPrice(p.min_price) || "-"}
                      </td>
                      <td>{p.totalStock}</td>
                      <td>
                        <span className={`mp-status-badge status-${p.status}`}>
                          {STATUS_LABEL[p.status] || p.status}
                        </span>
                      </td>
                      <td className="date-cell">
                        {formatDateTime(p.created_at)}
                      </td>
                      <td>
                        <div className="mp-row-actions">
                          <button
                            className="mp-icon-btn"
                            title="Xem chi tiết"
                            onClick={() => handleView(p)}
                          >
                            <i className="fa-regular fa-eye"></i>
                          </button>
                          <button
                            className="mp-icon-btn"
                            title="Chỉnh sửa"
                            onClick={() => handleEdit(p)}
                          >
                            <i className="fa-regular fa-pen-to-square"></i>
                          </button>
                          <button
                            className="mp-icon-btn is-danger"
                            title="Xoá sản phẩm"
                            onClick={() => handleDelete(p)}
                          >
                            <i className="fa-regular fa-trash-can"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mp-table-footer">
          <div className="page-size-wrap">
            <span>Hiển thị</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value))
                setPage(1)
              }}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option
                  key={n}
                  value={n}
                >
                  {n}
                </option>
              ))}
            </select>
            <span>/ trang</span>
          </div>

          <span className="range-info">
            Hiển thị {rangeStart} đến {rangeEnd} trong tổng số{" "}
            {total.toLocaleString("vi-VN")} sản phẩm
          </span>

          <div className="page-controls">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>

            {pageNumbers.map((n, i) =>
              n === "..." ? (
                <span
                  className="dots"
                  key={`dots-${i}`}
                >
                  ...
                </span>
              ) : (
                <button
                  key={n}
                  className={page === n ? "active" : ""}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ),
            )}

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      {/* ===== MODALS — tách riêng, chỉ import và điều khiển bằng state ở đây ===== */}
      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          onClose={() => setDetailProduct(null)}
          onEdit={handleEdit}
        />
      )}

      {editProduct && (
        <ProductEditModal
          product={editProduct}
          onClose={() => setEditProduct(null)}
          onSubmit={handleSaveEdit}
          submitting={savingEdit}
        />
      )}

      {deleteProduct && (
        <ConfirmDeleteModal
          product={deleteProduct}
          onClose={() => setDeleteProduct(null)}
          onConfirm={handleConfirmDelete}
          loading={deleting}
        />
      )}
    </div>
  )
}

export default ManagementProduct
