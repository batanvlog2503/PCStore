import React, { useEffect, useState } from "react"
import "./WishList.scss"
import axiosInstance from "../../../utils/axiosInstance"
import { useNavigate } from "react-router-dom"

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "name", label: "Tên A - Z" },
]

// Sao đánh giá — API hiện tại chỉ có rating_avg (chưa có review_count riêng)
const RatingStars = ({ rating = 0 }) => {
  const rounded = Math.round(rating * 2) / 2
  return (
    <div className="rating">
      {[1, 2, 3, 4, 5].map((n) => {
        let icon = "fa-regular fa-star"
        if (rounded >= n) icon = "fa-solid fa-star"
        else if (rounded + 0.5 === n) icon = "fa-solid fa-star-half-stroke"
        return (
          <i
            key={n}
            className={icon}
          ></i>
        )
      })}
    </div>
  )
}

const WishList = () => {
  const navigate = useNavigate()

  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [sort, setSort] = useState("newest")
  const [removingIds, setRemovingIds] = useState([]) // đang chạy animation xoá

  const getWishlist = async () => {
    try {
      setIsLoading(true)
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_APP_URL}/wishlist/all`,
      )
      console.log("Account wishlist", response.data.wishlists)
      setItems(response.data.wishlists || [])
    } catch (error) {
      alert(
        error.response?.data?.message || "Không tải được danh sách yêu thích",
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getWishlist()
  }, [])

  // Backend hiện chưa hỗ trợ sort qua query nên tạm sort ở client
  // dựa trên dữ liệu đã có sẵn (createdAt / name)
  const sortedItems = [...items].sort((a, b) => {
    if (sort === "name") {
      return (a.product_id?.name || "").localeCompare(b.product_id?.name || "")
    }
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  const handleSortChange = (e) => setSort(e.target.value)

  // Bỏ thích: chạy animation fade-out trước rồi mới gọi API + xoá khỏi state
  const handleRemove = async (productId) => {
    setRemovingIds((prev) => [...prev, productId])

    try {
      await axiosInstance.delete(
        `${import.meta.env.VITE_APP_URL}/wishlist/remove/${productId}`,
      )
      setTimeout(() => {
        setItems((prev) =>
          prev.filter((it) => it.product_id?._id !== productId),
        )
        setRemovingIds((prev) => prev.filter((id) => id !== productId))
      }, 280) // khớp thời lượng animation fade-out trong SCSS
    } catch (error) {
      setRemovingIds((prev) => prev.filter((id) => id !== productId))
      alert(error.response?.data?.message || "Không bỏ thích được sản phẩm")
    }
  }

  const goToProduct = (productId) => {
    navigate(`/product/${productId}`)
  }

  return (
    <div className="wishlist-page container">
      <div className="wishlist-layout">
        <div className="wishlist-content">
          <div className="wishlist-heading">
            <h1>Sản phẩm yêu thích</h1>
            <p>Danh sách các sản phẩm bạn đã lưu yêu thích</p>
          </div>

          <div className="wishlist-panel">
            <div className="wishlist-panel-head">
              <p className="count">
                {isLoading
                  ? "Đang tải..."
                  : `Có ${sortedItems.length} sản phẩm yêu thích`}
              </p>

              <div className="sort-control">
                <label htmlFor="wishlist-sort">Sắp xếp theo:</label>
                <select
                  id="wishlist-sort"
                  value={sort}
                  onChange={handleSortChange}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option
                      key={opt.value}
                      value={opt.value}
                    >
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="wishlist-grid">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    className="wishlist-card skeleton"
                    key={n}
                  >
                    <div className="skeleton-image"></div>
                    <div className="skeleton-line w-70"></div>
                    <div className="skeleton-line w-90"></div>
                    <div className="skeleton-line w-40"></div>
                  </div>
                ))}
              </div>
            ) : sortedItems.length === 0 ? (
              <div className="wishlist-empty">
                <h3>Chưa có sản phẩm yêu thích nào</h3>
                <p>Lưu lại những sản phẩm bạn quan tâm để xem lại ở đây.</p>
                <button onClick={() => navigate("/")}>Khám phá sản phẩm</button>
              </div>
            ) : (
              <div className="wishlist-grid">
                {sortedItems.map((item, index) => {
                  const product = item.product_id

                  // Sản phẩm đã bị xoá khỏi hệ thống thì bỏ qua, không render card lỗi
                  if (!product) return null

                  const productId = product._id
                  const isRemoving = removingIds.includes(productId)

                  return (
                    <div
                      className={`wishlist-card ${isRemoving ? "removing" : ""}`}
                      key={item._id}
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      <div
                        className="card-image"
                        onClick={() => goToProduct(productId)}
                      >
                        {product.image_url ? (
                          <img
                            src={`${import.meta.env.VITE_APP_URL}${product.image_url}`}
                            alt={product.name}
                          />
                        ) : (
                          <div className="no-product-image">
                            <i className="fa-solid fa-image"></i>
                            <span>Chưa có ảnh</span>
                          </div>
                        )}

                        <span
                          className={`status-badge ${
                            product.status === "active" ? "active" : "inactive"
                          }`}
                        >
                          {product.status === "active"
                            ? "Đang bán"
                            : "Ngừng bán"}
                        </span>
                      </div>

                      <div className="card-info">
                        <h3
                          className="product-name"
                          onClick={() => goToProduct(productId)}
                        >
                          {product.name}
                        </h3>

                        <p className="product-description">
                          {product.description || "Chưa có mô tả"}
                        </p>

                        <div className="meta-row">
                          <RatingStars rating={product.rating_avg} />
                          <span className="sold-count">
                            Đã bán {product.sold_count || 0}
                          </span>
                        </div>
                      </div>

                      <div className="card-actions">
                        <button
                          type="button"
                          className="btn-view-detail"
                          onClick={() => goToProduct(productId)}
                        >
                          <i className="fa-regular fa-eye"></i> Xem chi tiết
                        </button>

                        <button
                          type="button"
                          className="btn-remove"
                          onClick={() => handleRemove(productId)}
                        >
                          <i className="fa-regular fa-trash-can"></i> Bỏ thích
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WishList
