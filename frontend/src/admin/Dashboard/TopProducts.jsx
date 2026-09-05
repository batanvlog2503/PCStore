import React, { useEffect, useState } from "react"
import axiosInstance from "../../utils/axiosInstance"

const TopProducts = () => {
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const getTopProducts = async () => {
    try {
      setLoading(true)

      const response = await axiosInstance.get(
        `${import.meta.env.VITE_APP_URL}/admin/top-products`,
      )

      if (response.data.success) {
        setTopProducts(response.data.products || [])
      }
    } catch (error) {
      console.error("Lỗi lấy top sản phẩm bán chạy:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getTopProducts()
  }, [])

  return (
    <>
      <div className="card-head">
        <h3>Top sản phẩm bán chạy</h3>
      </div>

      <ul className="top-products">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <li key={i}>
              <span className="rank skeleton-block skeleton-round"></span>
              <span className="thumb small skeleton-block"></span>
              <span className="skeleton-line w-60"></span>
              <span className="skeleton-line w-30"></span>
            </li>
          ))
        ) : topProducts.length === 0 ? (
          <li className="top-products-empty">Chưa có dữ liệu bán hàng</li>
        ) : (
          topProducts.map((p, i) => (
            <li key={p._id || p.rank}>
              <span className="rank">{i + 1}</span>
              {p.image_url ? (
                <img
                  className="thumb small"
                  src={`${import.meta.env.VITE_APP_URL}${p.image_url}`}
                  alt={p.name}
                />
              ) : (
                <span className="thumb small"></span>
              )}
              <span className="name">{p.name}</span>
              <span className="sold">Đã bán: {p.sold_count}</span>
            </li>
          ))
        )}
      </ul>
    </>
  )
}

export default TopProducts
