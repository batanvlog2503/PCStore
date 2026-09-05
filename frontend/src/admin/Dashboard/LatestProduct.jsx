import React, { useEffect, useState } from "react"
import axiosInstance from "../../utils/axiosInstance"

const LIMIT = 6

const LatestProduct = () => {
  console.log("LatestProduct COMPONENT RENDER")
  const [products, setProducts] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const formatPrice = (price) => {
    if (price == null) return ""
    return price.toLocaleString("vi-VN") + "đ"
  }

  const getLatestProducts = async (pageNumber = 1) => {
    try {
      setLoading(true)

      const response = await axiosInstance.get(
        `${import.meta.env.VITE_APP_URL}/admin/latest-products`,
        { params: { page: pageNumber, limit: LIMIT } },
      )
      console.log("LATEST PRODUCTS RESPONSE:", response.data)
      if (response.data.success) {
        setProducts(response.data.data.products || [])
        setTotalPages(response.data.data.totalPages || 1)
        setPage(response.data.data.page || pageNumber)
      }
    } catch (error) {
      console.error("Lỗi lấy sản phẩm mới nhất:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getLatestProducts(1)
  }, [])

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return
    getLatestProducts(nextPage)
  }

  // Tính dải số trang hiển thị, có "..." khi nhiều trang — thay vì hard-code [1,2,3]
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 3

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
      return pages
    }

    pages.push(1)
    let start = Math.max(2, page - 1)
    let end = Math.min(totalPages - 1, page + 1)

    if (start > 2) pages.push("...")
    for (let i = start; i <= end; i++) pages.push(i)
    if (end < totalPages - 1) pages.push("...")

    pages.push(totalPages)
    return pages
  }

  return (
    <div className="card area-table">
      <div className="card-head">
        <h3>Sản phẩm mới nhất</h3>
        <div className="head-actions">
          <button className="btn-outline">Xem tất cả</button>
        </div>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Danh mục</th>
              <th>Thương hiệu</th>
              <th>Đã bán</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: LIMIT }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j}>
                      <span className="skeleton-line w-80"></span>
                    </td>
                  ))}
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="table-empty"
                >
                  Chưa có sản phẩm nào
                </td>
              </tr>
            ) : (
              products.map((p, i) => (
                <tr
                  key={p._id}
                  style={{ transitionDelay: `${i * 50}ms` }}
                >
                  <td className="product-cell">
                    {p.image_url ? (
                      <img
                        className="thumb"
                        src={`${import.meta.env.VITE_APP_URL}${p.image_url}`}
                        alt={p.product_name}
                      />
                    ) : (
                      <span className="thumb"></span>
                    )}
                    {p.name}
                  </td>
                  <td>{p.category_id?.name || "—"}</td>
                  <td>{p.brand_id?.name || "—"}</td>

                  <td>{p.sold_count || 0}</td>
                  <td>
                    <span
                      className={`badge ${p.status === "active" ? "success" : "muted"}`}
                    >
                      {p.status === "active" ? "Đang bán" : "Ngừng bán"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={page === 1}
            onClick={() => handlePageChange(page - 1)}
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>

          {getPageNumbers().map((n, i) =>
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
                onClick={() => handlePageChange(n)}
              >
                {n}
              </button>
            ),
          )}

          <button
            disabled={page === totalPages}
            onClick={() => handlePageChange(page + 1)}
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  )
}

export default LatestProduct
