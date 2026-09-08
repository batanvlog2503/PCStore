import React, { useEffect, useRef, useState } from "react"
import "./Home.scss"
import axiosInstance from "../../utils/axiosInstance"
import { useNavigate } from "react-router-dom"
import CommentPublic from "./CommentPublic"
import {
  ADS_SET_A,
  ADS_SET_B,
  USE_CASE_TABS,
  SORT_OPTIONS,
  CRITERIA_TABS,
} from "./OPTIONS"

const INITIAL_FILTERS = {
  useCase: "",
  brand: "",
  inStock: false,
  price: "",
  cpu: "",
  ram: "",
  storageCapacity: "",
  resolution: "",
  gpu: "",
  screenSize: "",
  sort: "popular",
}

export const Home = () => {
  const navigate = useNavigate()
  const criteriaBarRef = useRef(null)

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

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isLoadingList, setIsLoadingList] = useState(true)
  const LIMIT = 40

  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [openCriteria, setOpenCriteria] = useState(null)

  const getVouchers = async () => {
    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_APP_URL}/voucher/all`,
      )
      setVouchers(response.data.vouchers)
    } catch (error) {
      alert(error.response?.data?.message)
    }
  }

  const getBrands = async () => {
    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_APP_URL}/brand/all`,
      )
      setBrands(response.data.brands)
    } catch (error) {
      alert(error.response?.data?.message)
    }
  }

  const buildParams = (pageNumber) => {
    const [minPrice, maxPrice] = filters.price ? filters.price.split("-") : []

    return {
      page: pageNumber,
      limit: LIMIT,
      useCase: filters.useCase || undefined,
      brand: filters.brand || undefined,
      inStock: filters.inStock ? "1" : undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      cpu: filters.cpu || undefined,
      ram: filters.ram || undefined,
      storageCapacity: filters.storageCapacity || undefined,
      resolution: filters.resolution || undefined,
      gpu: filters.gpu || undefined,
      screenSize: filters.screenSize || undefined,
      sort: filters.sort,
    }
  }

  const getProductVariants = async (pageNumber = 1) => {
    try {
      if (pageNumber > 1) setIsLoadingMore(true)
      else setIsLoadingList(true)

      const response = await axiosInstance.get(
        `${import.meta.env.VITE_APP_URL}/product-variant/image/all`,
        { params: buildParams(pageNumber) },
      )

      setVariants((prev) =>
        pageNumber === 1
          ? response.data.variants
          : [...prev, ...response.data.variants],
      )
      setTotalPages(response.data.totalPages)
      setPage(response.data.page)
    } catch (error) {
      alert(error.response?.data?.message || "Không tải được sản phẩm")
    } finally {
      setIsLoadingMore(false)
      setIsLoadingList(false)
    }
  }

  useEffect(() => {
    getBrands()
    getVouchers()
    const timer = setInterval(() => {
      setIsSetA((prev) => !prev)
    }, 2500)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    getProductVariants(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        criteriaBarRef.current &&
        !criteriaBarRef.current.contains(e.target)
      ) {
        setOpenCriteria(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const maxIndex = Math.max(0, vouchers.length - cardsPerView)
  const handlePrevVoucher = () =>
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  const handleNextVoucher = () =>
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1))

  const currentAds = isSetA ? ADS_SET_A : ADS_SET_B

  const handleLoadMore = () => {
    if (page < totalPages && !isLoadingMore) {
      getProductVariants(page + 1)
    }
  }

  const handleSelectUseCase = (value) => {
    setFilters((prev) => ({ ...prev, useCase: value }))
  }

  const handleSelectBrand = (brandId) => {
    setFilters((prev) => ({
      ...prev,
      brand: prev.brand === brandId ? "" : brandId,
    }))
  }

  const handleSelectSort = (value) => {
    setFilters((prev) => ({ ...prev, sort: value }))
  }

  const toggleCriteria = (key) => {
    setOpenCriteria((prev) => (prev === key ? null : key))
  }

  const handleSelectFilterValue = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: prev[key] === value ? "" : value }))
    setOpenCriteria(null)
  }

  const handleToggleInStock = () => {
    setFilters((prev) => ({ ...prev, inStock: !prev.inStock }))
  }

  const handleClearAllFilters = () => {
    setFilters(INITIAL_FILTERS)
    setOpenCriteria(null)
  }

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "sort") return false
    if (key === "inStock") return value === true
    return Boolean(value)
  }).length

  const getCriteriaValueLabel = (criteria) => {
    const value = filters[criteria.key]
    if (!value) return null
    if (criteria.type === "select") {
      return criteria.options.find((o) => o.value === value)?.label
    }
    return `${value}${criteria.suffix || ""}`
  }

  // Gom TẤT CẢ filter đang bật (ở mọi khu vực: Thể loại, Hãng, tiêu chí,
  // Sẵn hàng, Hàng mới về) thành 1 danh sách pill duy nhất, mỗi pill tự
  // biết cách bỏ đúng filter của mình (onRemove) khi bấm nút ✕
  const buildActiveFilterTags = () => {
    const tags = []

    if (filters.useCase) {
      const tab = USE_CASE_TABS.find((t) => t.value === filters.useCase)
      tags.push({
        key: "useCase",
        label: `Thể loại: ${tab?.label || filters.useCase}`,
        onRemove: () => setFilters((prev) => ({ ...prev, useCase: "" })),
      })
    }

    if (filters.brand) {
      const brand = brands.find((b) => b._id === filters.brand)
      tags.push({
        key: "brand",
        label: `Hãng: ${brand?.name || ""}`,
        onRemove: () => setFilters((prev) => ({ ...prev, brand: "" })),
      })
    }

    if (filters.inStock) {
      tags.push({
        key: "inStock",
        label: "Sẵn hàng",
        onRemove: () => setFilters((prev) => ({ ...prev, inStock: false })),
      })
    }

    if (filters.sort === "newest") {
      tags.push({
        key: "newest",
        label: "Hàng mới về",
        onRemove: () => setFilters((prev) => ({ ...prev, sort: "popular" })),
      })
    }

    CRITERIA_TABS.forEach((c) => {
      const valueLabel = getCriteriaValueLabel(c)
      if (valueLabel) {
        tags.push({
          key: c.key,
          label: `${c.label}: ${valueLabel}`,
          onRemove: () => setFilters((prev) => ({ ...prev, [c.key]: "" })),
        })
      }
    })

    return tags // tags là cái hiện ở phần đang lọc theo
  }

  const activeFilterTags = buildActiveFilterTags()

  return (
    <div className="container home p-0">
      <p className="type">Thể loại</p>

      <div className="home-list-type">
        <ul className="row">
          {USE_CASE_TABS.map((tab) => (
            <li
              key={tab.value || "all"}
              className={filters.useCase === tab.value ? "active" : ""}
              onClick={() => handleSelectUseCase(tab.value)}
            >
              <i className={tab.icon}></i> {tab.label}
            </li>
          ))}
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
              <li
                key={b._id}
                className={filters.brand === b._id ? "active" : ""}
                onClick={() => handleSelectBrand(b._id)}
              >
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

      <div
        className="home-criteria"
        ref={criteriaBarRef}
      >
        <div className="criteria-head">
          <h3 className="title-criteria">Chọn theo tiêu chí</h3>
          {activeFilterCount > 0 && (
            <button
              className="clear-filter-btn"
              onClick={handleClearAllFilters}
            >
              <i className="fa-solid fa-xmark"></i> Xoá lọc ({activeFilterCount}
              )
            </button>
          )}
        </div>

        <div className="list-criteria">
          <ul className="row">
            <li
              className={filters.inStock ? "active" : ""}
              onClick={handleToggleInStock}
            >
              <i className="fa-solid fa-check"></i> Sẵn hàng
            </li>

            <li
              className={filters.sort === "newest" ? "active" : ""}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  sort: prev.sort === "newest" ? "popular" : "newest",
                }))
              }
            >
              <i className="fa-solid fa-bolt"></i> Hàng mới về
            </li>

            {CRITERIA_TABS.map((c) => {
              const valueLabel = getCriteriaValueLabel(c)
              return (
                <li
                  key={c.key}
                  className={`has-dropdown ${valueLabel ? "active" : ""} ${
                    openCriteria === c.key ? "open" : ""
                  }`}
                  onClick={() => toggleCriteria(c.key)}
                >
                  {valueLabel || c.label}
                  <i className="fa-solid fa-chevron-down"></i>

                  {openCriteria === c.key && (
                    <div
                      className="criteria-dropdown"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {c.type === "select" &&
                        c.options.map((opt) => (
                          <div
                            key={opt.value}
                            className={`dropdown-item ${
                              filters[c.key] === opt.value ? "selected" : ""
                            }`}
                            onClick={() =>
                              handleSelectFilterValue(c.key, opt.value)
                            }
                          >
                            {opt.label}
                          </div>
                        ))}

                      {c.type === "list" &&
                        c.options.map((opt) => (
                          <div
                            key={opt}
                            className={`dropdown-item ${
                              filters[c.key] === opt ? "selected" : ""
                            }`}
                            onClick={() => handleSelectFilterValue(c.key, opt)}
                          >
                            {opt}
                            {c.suffix || ""}
                          </div>
                        ))}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {/* ================= ĐANG LỌC THEO — tổng hợp tất cả filter đang bật ================= */}
      {activeFilterTags.length > 0 && (
        <div className="active-filters">
          <span className="active-filters-label">
            <i className="fa-solid fa-filter"></i> Đang lọc theo:
          </span>

          <div className="active-filters-list">
            {activeFilterTags.map((tag) => (
              <span
                className="filter-tag"
                key={tag.key}
              >
                {tag.label}
                <button
                  onClick={tag.onRemove}
                  aria-label={`Bỏ lọc ${tag.label}`}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </span>
            ))}

            {activeFilterTags.length > 1 && (
              <button
                className="clear-all-tags-btn"
                onClick={handleClearAllFilters}
              >
                Xoá tất cả
              </button>
            )}
          </div>
        </div>
      )}

      <div className="home-sort">
        <div className="title">
          <h3 className="left">Sắp xếp theo</h3>
          <ul className="filter">
            {SORT_OPTIONS.map((s) => (
              <li
                key={s.value}
                className={filters.sort === s.value ? "active" : ""}
                onClick={() => handleSelectSort(s.value)}
              >
                <i className={s.icon}></i> {s.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="list-computer">
          {isLoadingList ? (
            <div className="list-loading">
              <div className="spinner"></div>
              <p>Đang tải sản phẩm...</p>
            </div>
          ) : variants.length === 0 ? (
            <div className="list-empty">
              <i className="fa-solid fa-box-open"></i>
              <p>Không tìm thấy sản phẩm phù hợp với bộ lọc</p>
              {activeFilterCount > 0 && (
                <button
                  className="clear-filter-btn"
                  onClick={handleClearAllFilters}
                >
                  Xoá bộ lọc
                </button>
              )}
            </div>
          ) : (
            <>
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
                    <li
                      key={variant._id}
                      onClick={() => navigate(`/product/${variant.product_id}`)}
                    >
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
                          <h5 className="product-name">
                            {variant.product_name} {variant.sku}
                          </h5>

                          <p className="config-name">
                            Cấu hình: {variant.config_name}
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
                    </li>
                  )
                })}
              </ul>

              {page < totalPages && (
                <div className="load-more-wrap">
                  <button
                    className="load-more-btn"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? (
                      <i className="fa-solid fa-spinner fa-spin"></i>
                    ) : (
                      <>
                        Xem thêm sản phẩm{" "}
                        <i className="fa-solid fa-chevron-down"></i>
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <CommentPublic></CommentPublic>
    </div>
  )
}
