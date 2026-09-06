import React, { useEffect, useState } from "react"
import "./ProductDetailModal.scss"
import axiosInstance from "../../../utils/axiosInstance" // chỉnh lại đường dẫn cho đúng project của bạn

const STATUS_LABEL = {
  active: "Đang hoạt động",
  hidden: "Tạm ẩn",
  deleted: "Đã xoá",
}

const ProductDetailModal = ({ product, onClose, onEdit }) => {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [activeImage, setActiveImage] = useState(null)

  useEffect(() => {
    if (!product?._id) return

    const fetchDetail = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await axiosInstance.get(
          `${import.meta.env.VITE_APP_URL}/admin/products/${product._id}`,
        )

        const data = response.data.data

        setDetail(data)

        const mainImage =
          data.images?.find((image) => image.is_main)?.image_url ||
          data.images?.[0]?.image_url ||
          null

        setActiveImage(mainImage)
      } catch (err) {
        console.error("Lỗi lấy chi tiết sản phẩm:", err)
        setError(
          err.response?.data?.message || "Không thể tải chi tiết sản phẩm",
        )
      } finally {
        setLoading(false)
      }
    }

    fetchDetail()
  }, [product?._id])

  if (!product) return null

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

  // dữ liệu hiển thị: ưu tiên detail (đã fetch), fallback về product (dữ liệu tóm tắt từ bảng)
  const data = detail || product
  const images = detail?.images || []
  const variants = detail?.variants || []

  const getVariantName = (v) => {
    if (Array.isArray(v.attributes) && v.attributes.length > 0) {
      return v.attributes.map((a) => `${a.name}: ${a.value}`).join(" / ")
    }
    return v.name || v.sku || "—"
  }

  return (
    <div
      className="product-detail-backdrop"
      onClick={onClose}
    >
      <div
        className="product-detail-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pdm-header">
          <h3>Chi tiết sản phẩm</h3>
          <button
            className="pdm-close-btn"
            onClick={onClose}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="pdm-body">
          {loading && !detail ? (
            <div className="pdm-loading">
              <i className="fa-solid fa-spinner fa-spin"></i>
              <p>Đang tải chi tiết sản phẩm...</p>
            </div>
          ) : error ? (
            <div className="pdm-error">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <p>{error}</p>
            </div>
          ) : (
            <>
              <div className="pdm-top">
                {/* ===== GALLERY ẢNH ===== */}
                <div className="pdm-gallery">
                  <div className="pdm-image pdm-image-main">
                    {activeImage ? (
                      <img
                        src={`${import.meta.env.VITE_APP_URL}${activeImage}`}
                        alt={data.name}
                      />
                    ) : (
                      <i className="fa-solid fa-image"></i>
                    )}
                  </div>

                  {images.length > 1 && (
                    <div className="pdm-thumb-list">
                      {images.map((img) => (
                        <button
                          key={img._id}
                          type="button"
                          className={`pdm-thumb ${
                            activeImage === img.image_url ? "is-active" : ""
                          }`}
                          onClick={() => setActiveImage(img.image_url)}
                        >
                          <img
                            src={`${import.meta.env.VITE_APP_URL}${img.image_url}`}
                            alt={data.name}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pdm-top-info">
                  <span className={`pdm-status-badge status-${data.status}`}>
                    {STATUS_LABEL[data.status] || data.status}
                  </span>
                  <h4>{data.name}</h4>
                  <span className="pdm-sku">{variants.length} phiên bản</span>

                  <div className="pdm-price-row">
                    {data.discount_price != null &&
                    data.discount_price < data.price ? (
                      <>
                        <span className="price-new">
                          {formatPrice(data.discount_price)}
                        </span>
                        <span className="price-old">
                          {formatPrice(data.price)}
                        </span>
                      </>
                    ) : (
                      <span className="price-new">
                        {formatPrice(data.min_price ?? data.price)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pdm-info-grid">
                <div className="info-item">
                  <span className="label">Danh mục</span>
                  <span className="value">{data.category?.name || "—"}</span>
                </div>
                <div className="info-item">
                  <span className="label">Tồn kho</span>
                  <span className="value">{data.totalStock} sản phẩm</span>
                </div>
                <div className="info-item">
                  <span className="label">Kho hàng</span>
                  <span className="value">
                    {STATUS_LABEL[data.status] || "—"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">Ngày tạo</span>
                  <span className="value">
                    {formatDateTime(data.created_at)}
                  </span>
                </div>
              </div>

              {data.description && (
                <div className="pdm-description">
                  <h5>Mô tả sản phẩm</h5>
                  <p>{data.description}</p>
                </div>
              )}

              {/* ===== BẢNG BIẾN THỂ ===== */}
              <div className="pdm-variants">
                <h5>Danh sách phiên bản ({variants.length})</h5>

                {variants.length === 0 ? (
                  <p className="pdm-variants-empty">
                    Sản phẩm chưa có phiên bản nào.
                  </p>
                ) : (
                  <div className="pdm-variants-table-wrap">
                    <table className="pdm-variants-table">
                      <thead>
                        <tr>
                          <th>Phiên bản</th>
                          <th>Config</th>
                          <th>Giá</th>
                          <th>Giá KM</th>
                          <th>Tồn kho</th>
                        </tr>
                      </thead>
                      <tbody>
                        {variants.map((v) => (
                          <tr key={v._id}>
                            <td>{v.sku}</td>
                            <td>{v.config_name || "—"}</td>
                            <td>{formatPrice(v.price)}</td>
                            <td>
                              {v.discount_price != null &&
                              v.discount_price < v.price
                                ? formatPrice(v.discount_price)
                                : "—"}
                            </td>
                            <td>{v.stock ?? 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="pdm-footer">
          <button
            className="pdm-close-action"
            onClick={onClose}
          >
            Đóng
          </button>
          <button
            className="pdm-edit-action"
            onClick={() => onEdit(product)}
            disabled={loading}
          >
            <i className="fa-regular fa-pen-to-square"></i> Chỉnh sửa
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailModal
