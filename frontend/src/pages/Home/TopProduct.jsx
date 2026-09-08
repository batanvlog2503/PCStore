import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axiosInstance from "../../utils/axiosInstance"
import "./TopProduct.scss"

const TopProduct = () => {
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [cardsPerView, setCardsPerView] = useState(5)

  const formatPrice = (price) => {
    if (price == null) return ""
    return price.toLocaleString("vi-VN") + "đ"
  }

  // Top 10 sản phẩm bán chạy nhất — sort theo Product.sold_count giảm dần
  const getTopProducts = async () => {
    try {
      setIsLoading(true)
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_APP_URL}/product-variant/top-selling`,
        { params: { limit: 10 } },
      )
      setProducts(response.data.data.variants || [])
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getTopProducts()
  }, [])

  // Số card hiện cùng lúc — 5 desktop, 3 tablet, 2 mobile ngang, 1 mobile dọc
  useEffect(() => {
    const updateCardsPerView = () => {
      const width = window.innerWidth
      if (width <= 480) setCardsPerView(1)
      else if (width <= 768) setCardsPerView(2)
      else if (width <= 1200) setCardsPerView(3)
      else setCardsPerView(5)
    }
    updateCardsPerView()
    window.addEventListener("resize", updateCardsPerView)
    return () => window.removeEventListener("resize", updateCardsPerView)
  }, [])

  useEffect(() => {
    const maxIndex = Math.max(0, products.length - cardsPerView)
    setCurrentIndex((prev) => Math.min(prev, maxIndex))
  }, [cardsPerView, products.length])

  const maxIndex = Math.max(0, products.length - cardsPerView)
  const handlePrev = () => setCurrentIndex((prev) => Math.max(0, prev - 1))
  const handleNext = () =>
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1))

  if (!isLoading && products.length === 0) return null

  return (
    <div className="top-product">
      <div className="top-product-banner">
        <span className="flame-icon">
          <i className="fa-solid fa-fire"></i>
        </span>
        <h2>
          SẢN PHẨM <span className="highlight">NỔI BẬT</span>
        </h2>
        <span className="flame-icon flip">
          <i className="fa-solid fa-fire"></i>
        </span>
      </div>

      <div className="top-product-body">
        {isLoading ? (
          <div className="top-product-loading">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="top-product-slider">
            <button
              className="slider-arrow prev"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              aria-label="Sản phẩm trước"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>

            <div className="slider-viewport">
              <div
                className="slider-track"
                style={{
                  transform: `translateX(-${currentIndex * (100 / cardsPerView)}%)`,
                }}
              >
                {products.map((variant, index) => {
                  const hasDiscount =
                    variant.discount_price != null &&
                    variant.discount_price < variant.price
                  const discountPercent = hasDiscount
                    ? Math.round(
                        100 - (variant.discount_price / variant.price) * 100,
                      )
                    : 0

                  return (
                    <div
                      className="top-product-slide"
                      key={variant._id}
                      style={{ "--rank": index + 1 }}
                    >
                      <div
                        className="top-product-card"
                        onClick={() =>
                          navigate(`/product/${variant.product_id}`)
                        }
                      >
                        {hasDiscount && (
                          <span className="discount-badge">
                            -{discountPercent}%
                          </span>
                        )}

                        <div className="card-image">
                          <img
                            src={
                              variant.image_url
                                ? `${import.meta.env.VITE_APP_URL}${variant.image_url}`
                                : "/no-image.png"
                            }
                            alt={variant.product_name}
                          />
                        </div>

                        {(variant.specs?.cpu || variant.specs?.gpu) && (
                          <div className="spec-tags">
                            {variant.specs?.cpu && (
                              <span>{variant.specs.cpu}</span>
                            )}
                            {variant.specs?.gpu && (
                              <span>{variant.specs.gpu}</span>
                            )}
                          </div>
                        )}

                        <p className="spec-line">
                          {variant.specs?.ram && `${variant.specs.ram}GB`}
                          {variant.specs?.storage_capacity &&
                            ` | ${variant.specs.storage_capacity}GB`}
                          {variant.specs?.screen_size &&
                            ` | ${variant.specs.screen_size}"`}
                          {variant.specs?.screen_resolution &&
                            ` ${variant.specs.screen_resolution}`}
                        </p>

                        <h5 className="product-name">{variant.product_name}</h5>
                        <p
                          className="config-name"
                          style={{ color: "grey", fontSize: "10px" }}
                        >
                          {variant.config_name}
                        </p>
                        <div className="price-row">
                          {hasDiscount ? (
                            <>
                              <span className="price-new">
                                {formatPrice(variant.discount_price)}
                              </span>
                              <span className="price-old">
                                {formatPrice(variant.price)}
                              </span>
                            </>
                          ) : (
                            <span className="price-new">
                              {formatPrice(variant.price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <button
              className="slider-arrow next"
              onClick={handleNext}
              disabled={currentIndex >= maxIndex}
              aria-label="Sản phẩm tiếp theo"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TopProduct
