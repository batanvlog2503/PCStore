import React from "react"
import "./Home.scss"
import { useState, useEffect } from "react"
import axiosInstance from "../../utils/axiosInstance"

const ADS_SET_A = ["/quangcao1.png", "/quangcao2.png"]
const ADS_SET_B = ["/quangcao3.png", "/quangcao4.png"]

export const Home = () => {
  const formatDateTime = (date) => {
    if (!date) return ""
    return new Date(date).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const formatPrice = (price) => {
    if (price == null) return ""
    return price.toLocaleString("vi-VN") + "đ"
  }

  const [isSetA, setIsSetA] = useState(true)
  const [vouchers, setVouchers] = useState([])
  const [brands, setBrands] = useState([])
  const [variants, setVariants] = useState([])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [cardsPerView, setCardsPerView] = useState(3)

  const getVouchers = async () => {
    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_APP_URL}/voucher/all`,
      )
      setVouchers(response.data.vouchers)
    } catch (error) {
      alert(error.response.data.message)
    }
  }

  const getBrands = async () => {
    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_APP_URL}/brand/all`,
      )
      setBrands(response.data.brands)
    } catch (error) {
      alert(error.response.data.message)
    }
  }

  const getProductVariants = async () => {
    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_APP_URL}/product-variant/image/all`,
      )
      // Backend giờ trả kèm sẵn image_url/product_name/product_slug
      // (join qua aggregation), không cần gọi thêm API ảnh riêng
      setVariants(response.data.variants)
    } catch (error) {
      alert(error.response.data.message)
    }
  }

  useEffect(() => {
    getBrands()
    getVouchers()
    getProductVariants()
    const timer = setInterval(() => {
      setIsSetA((prev) => !prev)
    }, 2500)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const updateCardsPerView = () => {
      const width = window.innerWidth
      if (width <= 576) setCardsPerView(1)
      else if (width <= 768) setCardsPerView(2)
      else setCardsPerView(3)
    }
    updateCardsPerView()
    window.addEventListener("resize", updateCardsPerView)
    return () => window.removeEventListener("resize", updateCardsPerView)
  }, [])

  useEffect(() => {
    const maxIndex = Math.max(0, vouchers.length - cardsPerView)
    setCurrentIndex((prev) => Math.min(prev, maxIndex))
  }, [cardsPerView, vouchers.length])

  const maxIndex = Math.max(0, vouchers.length - cardsPerView)
  const handlePrevVoucher = () =>
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  const handleNextVoucher = () =>
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1))

  const currentAds = isSetA ? ADS_SET_A : ADS_SET_B

  return (
    <div className="container home p-0">
      <p className="type">Thể loại / </p>
      <div className="home-list-type">
        <ul className="row">
          <li>
            <i className="fa-solid fa-laptop"></i> Laptop
          </li>
          <li>
            <i className="fa-solid fa-computer"></i> PC
          </li>
          <li>
            <i className="fa-solid fa-display"></i>Màn hình
          </li>
          <li>
            <i className="fa-solid fa-house-laptop"></i> Build PC
          </li>
          <li>
            <i className="fa-solid fa-wrench"></i> Linh kiện
          </li>
          <li>
            <i className="fa-solid fa-print"></i> Máy in
          </li>
        </ul>
      </div>

      <div className="home-advertisement">
        <div className="advertisement-1 slide">
          <img
            key={currentAds[0]}
            className="fade-img"
            src={currentAds[0]}
            alt="Quảng cáo 1"
          />
        </div>
        <div className="advertisement-2 slide">
          <img
            key={currentAds[1]}
            className="fade-img"
            src={currentAds[1]}
            alt="Quảng cáo 2"
          />
        </div>
      </div>

      <div className="home-brand-laptop">
        <h3>Máy tính Laptop</h3>
        <div className="list-brand">
          <ul className="row">
            {brands.map((b) => (
              <li key={b._id}>
                <img
                  src={`${import.meta.env.VITE_APP_URL}${b.logo_url}`}
                  alt={b.name}
                />
                <p>{b.name}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="home-voucher">
        <h3>Ưu đãi & Voucher</h3>

        <div className="voucher-slider">
          <button
            className="slider-arrow prev"
            onClick={handlePrevVoucher}
            disabled={currentIndex === 0}
            aria-label="Voucher trước"
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
              {vouchers.map((v) => (
                <div
                  className="voucher-slide"
                  key={v._id}
                >
                  <div className="card-voucher">
                    <div className="left-voucher">
                      {v?.discount_type === "percent" ? (
                        <span>Giảm {v?.discount_value}%</span>
                      ) : (
                        <span>Giảm {v?.discount_value}VNĐ</span>
                      )}
                    </div>
                    <div className="middle-voucher">
                      <span>{v?.code}</span>
                      <p>
                        Tối đa giảm giá {v?.max_discount}VNĐ áp dụng toàn bộ
                        laptop
                      </p>
                      <p>Thời hạn bắt đầu: </p>
                      <span>{formatDateTime(v?.start_date)}</span>
                      <button>Chi tiết</button>
                    </div>
                    <div className="right-voucher"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            className="slider-arrow next"
            onClick={handleNextVoucher}
            disabled={currentIndex >= maxIndex}
            aria-label="Voucher tiếp theo"
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <div className="home-criteria">
        <h3 className="title-criteria">Chọn theo tiêu chí</h3>
        <div className="list-criteria">
          <ul className="row">
            <li>Bộ lọc</li>
            <li>Sẵn hàng</li>
            <li>Hàng mới về </li>
            <li>Xem theo giá</li>
            <li>Hãng sản xuất</li>
            <li>Nhu cầu sử dụng</li>
            <li>CPU</li>
            <li>Dung lượng Ram</li>
            <li>Ổ cứng</li>
            <li>Độ phân giải</li>
            <li>Card đồ họa</li>
            <li>Kích thước màn hình</li>
          </ul>
        </div>
      </div>

      <div className="home-sort">
        <div className="title">
          <h3 className="left">Sắp xếp theo</h3>
          <ul className="filter">
            <li>
              <i className="fa-regular fa-star"></i> Phổ biến
            </li>
            <li>
              <i className="fa-solid fa-ticket"></i> Khuyến mại HOT
            </li>
            <li>
              <i className="fa-solid fa-arrow-up-short-wide"></i> Giá Thấp - Cao
            </li>
            <li>
              <i className="fa-solid fa-arrow-down-wide-short"></i> Giá Cao -
              Thấp
            </li>
          </ul>
        </div>

        <div className="list-computer">
          <ul className="row per-row">
            {variants.map((variant) => {
              const hasDiscount =
                variant.discount_price != null &&
                variant.discount_price < variant.price
              const discountPercent = hasDiscount
                ? Math.round(
                    100 - (variant.discount_price / variant.price) * 100,
                  )
                : 0

              return (
                <li key={variant._id}>
                  <div className="product-details">
                    {hasDiscount && (
                      <span className="discount-badge">
                        -{discountPercent}%
                      </span>
                    )}

                    <div className="product-image">
                      <img
                        src={`${import.meta.env.VITE_APP_URL}${variant?.image_url}`}
                        alt={variant?.product_name}
                      />
                    </div>

                    <div className="product-info">
                      <h5 className="product-name">{variant.product_name}</h5>
                      <p className="config-name">{variant.config_name}</p>

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

                      <span
                        className={`stock-tag ${
                          variant.stock === 0 ? "out" : ""
                        }`}
                      >
                        {variant.stock > 0
                          ? `Còn ${variant.stock} sản phẩm`
                          : "Hết hàng"}
                      </span>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
      <div className="question-and-answer">
        <div className="create-question">
          <img
            src={"/logo-store2.jpg"}
            alt=""
          />
          <form action="">
            <h3>Hãy đặt câu hỏi cho chúng tôi</h3>
            <span>
              PCStore sẽ phản hồi trong vòng 2 giờ. Nếu Quý khách gửi câu hỏi
              sau 22h, chúng tôi sẽ trả lời vào sáng hôm sau. Thông tin có thể
              thay đổi theo thời gian, vui lòng đặt câu hỏi để nhận được cập
              nhật mới nhất!
            </span>
            <input
              type="text"
              value="comment"
              name="comment"
              placeholder="Viết câu hỏi tại đây"
            />
            <button type="submit">
              Gửi câu hỏi <i class="fa-regular fa-paper-plane"></i>
            </button>
          </form>
          <div className=""></div>
        </div>
      </div>
    </div>
  )
}
