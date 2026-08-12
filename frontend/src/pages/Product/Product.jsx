import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import axiosInstance from "../../utils/axiosInstance"
import "./Product.scss"

const Product = () => {
  const { id } = useParams()

  const [product, setProduct] = useState(null)
  const [variants, setVariants] = useState([])
  const [images, setImages] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const [selectedVariantId, setSelectedVariantId] = useState(null)
  const [activeImageUrl, setActiveImageUrl] = useState(null)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("description") // "description" | "specs"
  const [quantity, setQuantity] = useState(1)

  const getProduct = async () => {
    try {
      setIsLoading(true)
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_APP_URL}/product/${id}`,
      )
      const productData = response.data.product
      const variantsData = response.data.variants || []
      const imagesData = response.data.images || []

      setProduct(productData)
      setVariants(variantsData)
      setImages(imagesData)

      // Mặc định chọn variant đầu tiên còn hàng, nếu hết hàng hết cả thì lấy variant đầu tiên
      const firstAvailable =
        variantsData.find((v) => v.stock > 0) || variantsData[0]
      setSelectedVariantId(firstAvailable?._id || null)

      // Mặc định hiện ảnh chính (is_main), không có thì lấy ảnh đầu tiên
      const mainImage = imagesData.find((img) => img.is_main) || imagesData[0]
      setActiveImageUrl(mainImage?.image_url || null)
    } catch (error) {
      alert(error.response?.data?.message || "Không tải được sản phẩm")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getProduct()
  }, [id])

  const selectedVariant = variants.find((v) => v._id === selectedVariantId)

  const hasDiscount =
    selectedVariant?.discount_price != null &&
    selectedVariant.discount_price < selectedVariant.price
  // giảm giá bao nhiêu phần trăm so với giá gốc
  const discountPercent = hasDiscount
    ? Math.round(
        100 - (selectedVariant.discount_price / selectedVariant.price) * 100,
      )
    : 0

  const formatPrice = (price) => {
    if (price == null) return ""
    return price.toLocaleString("vi-VN") + "đ"
  }

  const handleSelectVariant = (variantId) => {
    // chọn variant khác
    setSelectedVariantId(variantId)
    setQuantity(1)
  }

  const handleChangeQuantity = (delta) => {
    // check nút bấm
    setQuantity((prev) => {
      const next = prev + delta
      if (next < 1) return 1
      if (selectedVariant && next > selectedVariant.stock)
        return selectedVariant.stock
      return next
    })
  }

  const handleOpenLightbox = () => {
    if (activeImageUrl) setIsLightboxOpen(true)
  }

  // --- Loading: spinner quay, có animation + responsive ---
  if (isLoading) {
    return (
      <div className="product-loading">
        <div className="spinner"></div>
        <p>Đang tải sản phẩm...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="product-loading">
        <p>Không tìm thấy sản phẩm.</p>
      </div>
    )
  }

  const handleAddCartItem = async (e) => {
    e.preventDefault()

    if (!selectedVariant) {
      alert("Vui lòng chọn cấu hình sản phẩm")
      return
    }

    if (selectedVariant.stock <= 0) {
      alert("Sản phẩm đã hết hàng")
      return
    }

    try {
      const response = await axiosInstance.post(
        `${import.meta.env.VITE_APP_URL}/cart-item/add`,
        {
          variant_id: selectedVariant._id,
          quantity: quantity,
        },
      )

      if (response.data.success) {
        alert("Thêm vào giỏ hàng thành công")
      }
      console.log(response.data.item)
    } catch (error) {
      alert(
        error.response?.data?.message || "Thêm vào giỏ hàng không thành công",
      )
    }
  }
  return (
    <div className="container p-0 product">
      <div className="product-variant">
        {/* ================= ẢNH SẢN PHẨM ================= */}
        <div className="product-image left">
          <div className="image column image-4">
            {images.map((img) => (
              <div
                key={img._id}
                className={`thumb ${
                  activeImageUrl === img.image_url ? "active" : ""
                }`}
                onClick={() => setActiveImageUrl(img.image_url)}
              >
                <img
                  src={`${import.meta.env.VITE_APP_URL}${img.image_url}`}
                  alt={product.name}
                />
              </div>
            ))}
          </div>

          <div
            className="display-image"
            onClick={handleOpenLightbox}
          >
            {activeImageUrl ? (
              <img
                src={`${import.meta.env.VITE_APP_URL}${activeImageUrl}`}
                alt={product.name}
              />
            ) : (
              <div className="no-image">Chưa có ảnh</div>
            )}
            <span className="zoom-hint">
              <i className="fa-solid fa-magnifying-glass-plus"></i>
            </span>
          </div>
        </div>

        {/* ================= THÔNG TIN + VARIANT ================= */}
        <div className="variant">
          <div className="title">
            {hasDiscount && (
              <p className="discount-tag">Giảm {discountPercent}%</p>
            )}

            <h3>{product.name}</h3>

            <div className="star-judge judge sold-out">
              <p className="star">
                {"★".repeat(Math.round(product.rating_avg || 0))}
                {"☆".repeat(5 - Math.round(product.rating_avg || 0))}
              </p>
              <span>
                {product.rating_avg?.toFixed(1) || 0} | Đã bán{" "}
                {product.sold_count || 0}
              </span>
            </div>

            <div className="price price-discount">
              {selectedVariant ? (
                hasDiscount ? (
                  <>
                    <span className="price-new">
                      {formatPrice(selectedVariant.discount_price)}
                    </span>
                    <span className="price-old">
                      {formatPrice(selectedVariant.price)}
                    </span>
                  </>
                ) : (
                  <span className="price-new">
                    {formatPrice(selectedVariant.price)}
                  </span>
                )
              ) : (
                <span className="price-new">Liên hệ</span>
              )}
            </div>
          </div>

          <div className="variants">
            <h4>Cấu hình</h4>
            <ul className="list-variants">
              {variants.map((v) => (
                <li
                  key={v._id}
                  className={`${v._id === selectedVariantId ? "active" : ""} ${
                    v.stock === 0 ? "disabled" : ""
                  }`}
                  onClick={() => v.stock > 0 && handleSelectVariant(v._id)}
                >
                  <p>{v.config_name}</p>
                  <span>{formatPrice(v.discount_price ?? v.price)}</span>
                  {v.stock === 0 && <span className="out-tag">Hết hàng</span>}
                </li>
              ))}
            </ul>
          </div>

          <div className="amount cart-item buy">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="number">
                <button
                  type="button"
                  onClick={() => handleChangeQuantity(-1)}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <input
                  type="text"
                  value={quantity}
                  readOnly
                />
                <button
                  type="button"
                  onClick={() => handleChangeQuantity(1)}
                  disabled={
                    !selectedVariant || quantity >= selectedVariant.stock
                  }
                >
                  +
                </button>
              </div>

              <span className="stock-hint">
                {selectedVariant
                  ? selectedVariant.stock > 0
                    ? `Còn ${selectedVariant.stock} sản phẩm`
                    : "Hết hàng"
                  : ""}
              </span>

              <div className="add-cart buy-product">
                <button
                  type="button"
                  className="add-to-cart"
                  disabled={!selectedVariant || selectedVariant.stock === 0}
                  onClick={handleAddCartItem}
                >
                  Thêm vào giỏ hàng
                </button>
                <button
                  type="button"
                  className="buy-now"
                  disabled={!selectedVariant || selectedVariant.stock === 0}
                >
                  Mua ngay <br />
                  <span className="tips">
                    Giao hàng tận nơi hoặc nhận tại cửa hàng
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ================= MÔ TẢ / THÔNG SỐ KỸ THUẬT ================= */}
      <div className="product-tabs">
        <div className="tab-header">
          <button
            className={activeTab === "description" ? "active" : ""}
            onClick={() => setActiveTab("description")}
          >
            Mô tả
          </button>
          <button
            className={activeTab === "specs" ? "active" : ""}
            onClick={() => setActiveTab("specs")}
          >
            Thông số kỹ thuật
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "description" && (
            <div className="tab-description">
              <p>{product.description || "Chưa có mô tả cho sản phẩm này."}</p>
            </div>
          )}

          {activeTab === "specs" && selectedVariant && (
            <table className="tab-specs">
              <tbody>
                <tr>
                  <td>CPU</td>
                  <td>{selectedVariant.specs?.cpu}</td>
                </tr>
                <tr>
                  <td>RAM</td>
                  <td>{selectedVariant.specs?.ram} GB</td>
                </tr>
                <tr>
                  <td>Ổ cứng</td>
                  <td>
                    {selectedVariant.specs?.storage_capacity} GB{" "}
                    {selectedVariant.specs?.storage_type}
                  </td>
                </tr>
                <tr>
                  <td>Card đồ họa</td>
                  <td>{selectedVariant.specs?.gpu}</td>
                </tr>
                <tr>
                  <td>Kích thước màn hình</td>
                  <td>{selectedVariant.specs?.screen_size}"</td>
                </tr>
                <tr>
                  <td>Độ phân giải</td>
                  <td>{selectedVariant.specs?.screen_resolution}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ================= LIGHTBOX XEM ẢNH TO ================= */}
      {isLightboxOpen && (
        <div
          className="lightbox-overlay"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            className="lightbox-close"
            onClick={() => setIsLightboxOpen(false)}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
          <img
            src={`${import.meta.env.VITE_APP_URL}${activeImageUrl}`}
            alt={product.name}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}

export default Product
