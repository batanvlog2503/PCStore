// AddProduct.jsx
import React, { useEffect, useRef, useState } from "react"
import "./AddProduct.scss"
import axiosInstance from "../../../utils/axiosInstance"
import { useNavigate } from "react-router-dom"
const emptyVariant = () => ({
  _key: crypto.randomUUID(),
  sku: "",
  config_name: "",
  specs: {
    cpu: "",
    ram: "",
    storage_capacity: "",
    storage_type: "SSD",
    gpu: "",
    screen_size: "",
    screen_resolution: "",
  },
  price: "",
  discount_price: "",
  stock: "",
  status: "active",
})

const AddProduct = () => {
  const navigate = useNavigate()
  const resetForm = () => {
    setForm({
      name: "",
      category_id: "",
      brand_id: "",
      description: "",
      status: "active",
    })

    // giải phóng preview URL cũ
    images.forEach((img) => {
      if (img.preview) {
        URL.revokeObjectURL(img.preview)
      }
    })

    setImages([])

    setVariants([emptyVariant()])

    setActiveVariant(0)

    setErrors({})

    setSubmitting(false)
  }
  // categories and brands
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])

  const [form, setForm] = useState({
    name: "",
    category_id: "",
    brand_id: "",
    description: "",
    status: "active",
  })

  //  ẢNH: chỉ còn 1 danh sách duy nhất, mỗi ảnh có is_main
  const [images, setImages] = useState([]) // [{_key, file, preview, is_main}]
  const [variants, setVariants] = useState([emptyVariant()])
  const [activeVariant, setActiveVariant] = useState(0)

  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const albumInputRef = useRef(null)

  useEffect(() => {
    getAllCategoriesAndBrands()
  }, [])

  const getAllCategoriesAndBrands = async () => {
    try {
      const [categoryResponse, brandResponse] = await Promise.all([
        axiosInstance.get(
          `${import.meta.env.VITE_APP_URL}/admin/categories/all`,
        ),
        axiosInstance.get(`${import.meta.env.VITE_APP_URL}/admin/brands/all`),
      ])
      setCategories(categoryResponse.data.categories || [])
      setBrands(brandResponse.data.brands || [])
    } catch (err) {
      console.error("Lỗi lấy danh mục / thương hiệu:", err)
    }
  }

  const handleFormChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))

    setErrors((prev) => ({
      ...prev,
      [e.target.name]: null,
    }))
  }

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setImages((prev) => {
      const mapped = files.map((file) => ({
        _key: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        is_main: false,
      }))
      const next = [...prev, ...mapped]
      // nếu chưa có ảnh nào được đặt làm chính -> tự động lấy ảnh đầu tiên
      if (!next.some((img) => img.is_main) && next.length > 0) {
        next[0].is_main = true
      }
      return next
    })
    e.target.value = ""
    setErrors((prev) => ({ ...prev, images: null }))
  }

  const setMainImage = (key) => {
    setImages((prev) =>
      prev.map((img) => ({ ...img, is_main: img._key === key })),
    )
  }

  const removeImage = (key) => {
    setImages((prev) => {
      const removed = prev.find((img) => img._key === key)
      const next = prev.filter((img) => img._key !== key)
      // nếu xoá đúng ảnh đang là ảnh chính -> gán ảnh đầu tiên còn lại làm chính
      if (removed?.is_main && next.length > 0) {
        next[0].is_main = true
      }
      return next
    })
  }

  // phiên bản variants

  // thêm phiên bản
  const addVariant = () => {
    setVariants((prev) => [...prev, emptyVariant()])
    setActiveVariant(variants.length)
  }

  // cái active variant là trỏ vào variant vừa tạo thêm
  // xóa variant
  const removeVariant = (idx) => {
    if (variants.length === 1) return
    setVariants((prev) => prev.filter((_, i) => i !== idx))
    setActiveVariant((prev) => Math.max(0, prev - (idx <= prev ? 1 : 0)))
  }
  // thay đổi giá trị variants
  const handleVariantChange = (idx, field, value) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === idx ? { ...v, [field]: value } : v)),
    )
  }
  // cũng giống trên nhưng sẽ có khớn
  const handleSpecChange = (idx, field, value) => {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === idx ? { ...v, specs: { ...v.specs, [field]: value } } : v,
      ),
    )
  }

  // validate để dữ liệu không bị thiếu
  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = "Vui lòng nhập tên sản phẩm"
    if (!form.category_id) next.category_id = "Vui lòng chọn danh mục"
    if (!form.brand_id) next.brand_id = "Vui lòng chọn thương hiệu"
    if (images.length === 0)
      next.images = "Vui lòng chọn ít nhất 1 ảnh sản phẩm"

    variants.forEach((v, i) => {
      if (!v.sku.trim()) next[`variant_${i}_sku`] = true
      if (!v.config_name.trim()) next[`variant_${i}_config`] = true
      if (!v.specs.cpu.trim()) next[`variant_${i}_cpu`] = true
      if (!v.specs.ram) next[`variant_${i}_ram`] = true
      if (!v.specs.storage_capacity) next[`variant_${i}_storage`] = true
      if (!v.specs.gpu.trim()) next[`variant_${i}_gpu`] = true
      if (!v.specs.screen_size) next[`variant_${i}_screen`] = true
      if (!v.price) next[`variant_${i}_price`] = true
    })

    setErrors(next)
    return Object.keys(next).length === 0
  }

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    try {
      setSubmitting(true)

      const fd = new FormData()
      fd.append("name", form.name)
      fd.append("category_id", form.category_id)
      fd.append("brand_id", form.brand_id)
      fd.append("description", form.description)
      fd.append("status", form.status)
      // fd.append(mainImageIndex)
      // fd.append(variantsPayload)
      // gửi toàn bộ ảnh theo đúng thứ tự trong mảng images
      images.forEach((img) => fd.append("images", img.file))

      // báo cho BE biết ảnh nào (theo index trong mảng "images" ở trên) là ảnh chính
      const mainImageIndex = images.findIndex((img) => img.is_main)
      fd.append("mainImageIndex", mainImageIndex)

      const variantsPayload = variants.map((v) => ({
        sku: v.sku,
        config_name: v.config_name,
        specs: {
          cpu: v.specs.cpu,
          ram: Number(v.specs.ram),
          storage_capacity: Number(v.specs.storage_capacity),
          storage_type: v.specs.storage_type,
          gpu: v.specs.gpu,
          screen_size: Number(v.specs.screen_size),
          screen_resolution: v.specs.screen_resolution,
        },
        price: Number(v.price),
        discount_price: v.discount_price ? Number(v.discount_price) : null,
        stock: Number(v.stock) || 0,
        status: v.status,
      }))
      // formData không biết array hay object như JSON
      fd.append("variants", JSON.stringify(variantsPayload))

      const response = await axiosInstance.post(
        `${import.meta.env.VITE_APP_URL}/admin/products/add`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } },
      )

      alert("Tạo sản phẩm thành công!")

      navigate("/admin/products")
    } catch (err) {
      console.error("Lỗi tạo sản phẩm:", err)
      alert(err.response?.data?.message || "Tạo sản phẩm thất bại")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      className="add-product is-mounted"
      onSubmit={handleSubmit}
    >
      {/* ===== HEADER ===== */}
      <div className="ap-breadcrumb">Sản phẩm &gt; Thêm mới</div>
      <div className="ap-header">
        <h1>Thêm sản phẩm</h1>
        <p>Tạo sản phẩm mới trong cửa hàng của bạn</p>
        <button
          type="button"
          className="ap-reset-btn"
          onClick={resetForm}
        >
          <i className="fa-solid fa-rotate-right"></i>
          Làm mới
        </button>
      </div>

      {/* ===== SECTION 1: THÔNG TIN CƠ BẢN ===== */}
      <section
        className="ap-card"
        style={{ transitionDelay: "0ms" }}
      >
        <div className="ap-card-title">
          <span className="ap-badge">1</span>
          <h3>Thông tin cơ bản</h3>
        </div>

        <div className="ap-grid-2">
          <div className="ap-field-col">
            <div className="ap-field">
              <label>
                Tên sản phẩm <span className="req">*</span>
              </label>
              <input
                type="text"
                placeholder="Nhập tên sản phẩm..."
                name="name"
                value={form.name}
                onChange={handleFormChange}
                className={errors.name ? "is-error" : ""}
              />
              {errors.name && <span className="ap-error">{errors.name}</span>}
            </div>

            <div className="ap-field">
              <label>
                Danh mục <span className="req">*</span>
              </label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleFormChange}
                className={errors.category_id ? "is-error" : ""}
              >
                <option value="">Chọn danh mục</option>
                {categories.map((c) => (
                  <option
                    key={c._id}
                    value={c._id}
                  >
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <span className="ap-error">{errors.category_id}</span>
              )}
            </div>

            <div className="ap-field">
              <label>Thương hiệu</label>
              <select
                name="brand_id"
                value={form.brand_id}
                onChange={handleFormChange}
                className={errors.brand_id ? "is-error" : ""}
              >
                <option value="">Chọn thương hiệu</option>
                {brands.map((b) => (
                  <option
                    key={b._id}
                    value={b._id}
                  >
                    {b.name}
                  </option>
                ))}
              </select>
              {errors.brand_id && (
                <span className="ap-error">{errors.brand_id}</span>
              )}
            </div>

            <label className="ap-switch-row">
              <span
                className={`ap-switch ${
                  form.status === "active" ? "is-on" : ""
                }`}
                onClick={handleFormChange}
              >
                <span className="ap-switch-dot"></span>
              </span>
              <span className="ap-switch-label">
                Trạng thái
                <small>
                  {form.status === "active" ? "Đang hoạt động" : "Tạm ẩn"}
                </small>
              </span>
            </label>
          </div>

          <div className="ap-field">
            <label>Mô tả sản phẩm</label>
            <textarea
              name="description"
              placeholder="Nhập mô tả sản phẩm..."
              maxLength={2000}
              value={form.description}
              onChange={handleFormChange}
            />
            <span className="ap-char-count">
              {form.description.length}/2000
            </span>
          </div>
        </div>
      </section>

      {/* image */}
      <section
        className="ap-card"
        style={{ transitionDelay: "80ms" }}
      >
        <div className="ap-card-title">
          <span className="ap-badge">2</span>
          <h3>Hình ảnh sản phẩm</h3>
        </div>

        <div className="ap-field">
          <label>
            Ảnh sản phẩm <span className="req">*</span>
            <span className="ap-hint">
              {" "}
              — nhấn vào ngôi sao để chọn ảnh đại diện
            </span>
          </label>

          <div className="ap-album-grid">
            <button
              type="button"
              className="ap-album-add"
              onClick={() => albumInputRef.current?.click()}
            >
              <i className="fa-solid fa-plus"></i>
              <span>Thêm ảnh</span>
            </button>
            <input
              ref={albumInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp"
              multiple
              hidden
              onChange={handleImagesChange}
            />

            {images.map((img) => (
              <div
                className={`ap-album-item ${img.is_main ? "is-main" : ""}`}
                key={img._key}
              >
                <img
                  src={img.preview}
                  alt="product"
                />

                {img.is_main && (
                  <span className="ap-main-badge">Ảnh chính</span>
                )}

                <button
                  type="button"
                  className="star-btn"
                  title="Đặt làm ảnh chính"
                  onClick={() => setMainImage(img._key)}
                >
                  <i
                    className={
                      img.is_main ? "fa-solid fa-star" : "fa-regular fa-star"
                    }
                  ></i>
                </button>

                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => removeImage(img._key)}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            ))}
          </div>

          {errors.images && <span className="ap-error">{errors.images}</span>}
        </div>
      </section>

      {/* ===== SECTION 3: PHIÊN BẢN (giữ nguyên) ===== */}
      <section
        className="ap-card"
        style={{ transitionDelay: "140ms" }}
      >
        <div className="ap-card-title with-action">
          <div className="ap-card-title-left">
            <span className="ap-badge">3</span>
            <h3>Phiên bản sản phẩm</h3>
          </div>
          <button
            type="button"
            className="ap-add-variant"
            onClick={addVariant}
          >
            <i className="fa-solid fa-plus"></i> Thêm phiên bản
          </button>
        </div>

        <div className="ap-variant-tabs">
          {variants.map((v, i) => (
            <button
              type="button"
              key={v._key}
              className={`ap-variant-tab ${
                activeVariant === i ? "is-active" : ""
              }`}
              onClick={() => setActiveVariant(i)}
            >
              <i className="fa-solid fa-grip-vertical"></i>
              Phiên bản {i + 1}
              {variants.length > 1 && (
                <span
                  className="tab-remove"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeVariant(i)
                  }}
                >
                  <i className="fa-regular fa-trash-can"></i>
                </span>
              )}
            </button>
          ))}
        </div>

        {variants.map((v, i) => (
          <div
            className={`ap-variant-panel ${
              activeVariant === i ? "is-active" : ""
            }`}
            key={v._key}
          >
            <div className="ap-grid-3">
              <div className="ap-field">
                <label>
                  SKU <span className="req">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nhập mã SKU..."
                  value={v.sku}
                  onChange={(e) =>
                    handleVariantChange(i, "sku", e.target.value)
                  }
                  className={errors[`variant_${i}_sku`] ? "is-error" : ""}
                />
              </div>

              <div className="ap-field">
                <label>
                  Tên cấu hình <span className="req">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Vd: i5 / 16GB / 512GB"
                  value={v.config_name}
                  onChange={(e) =>
                    handleVariantChange(i, "config_name", e.target.value)
                  }
                  className={errors[`variant_${i}_config`] ? "is-error" : ""}
                />
              </div>

              <div className="ap-field">
                <label>Tồn kho</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Số lượng tồn kho..."
                  value={v.stock}
                  onChange={(e) =>
                    handleVariantChange(i, "stock", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="ap-subtitle">Thông số kỹ thuật</div>

            <div className="ap-grid-3">
              <div className="ap-field">
                <label>
                  CPU <span className="req">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Vd: Intel Core i5-13420H"
                  value={v.specs.cpu}
                  onChange={(e) => handleSpecChange(i, "cpu", e.target.value)}
                  className={errors[`variant_${i}_cpu`] ? "is-error" : ""}
                />
              </div>

              <div className="ap-field">
                <label>
                  RAM (GB) <span className="req">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Vd: 16"
                  value={v.specs.ram}
                  onChange={(e) => handleSpecChange(i, "ram", e.target.value)}
                  className={errors[`variant_${i}_ram`] ? "is-error" : ""}
                />
              </div>

              <div className="ap-field">
                <label>
                  GPU <span className="req">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Vd: RTX 4050"
                  value={v.specs.gpu}
                  onChange={(e) => handleSpecChange(i, "gpu", e.target.value)}
                  className={errors[`variant_${i}_gpu`] ? "is-error" : ""}
                />
              </div>

              <div className="ap-field">
                <label>
                  Dung lượng lưu trữ (GB) <span className="req">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Vd: 512"
                  value={v.specs.storage_capacity}
                  onChange={(e) =>
                    handleSpecChange(i, "storage_capacity", e.target.value)
                  }
                  className={errors[`variant_${i}_storage`] ? "is-error" : ""}
                />
              </div>

              <div className="ap-field">
                <label>Loại ổ cứng</label>
                <select
                  value={v.specs.storage_type}
                  onChange={(e) =>
                    handleSpecChange(i, "storage_type", e.target.value)
                  }
                >
                  <option value="SSD">SSD</option>
                  <option value="HDD">HDD</option>
                </select>
              </div>

              <div className="ap-field">
                <label>
                  Kích thước màn hình (inch) <span className="req">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="Vd: 15.6"
                  value={v.specs.screen_size}
                  onChange={(e) =>
                    handleSpecChange(i, "screen_size", e.target.value)
                  }
                  className={errors[`variant_${i}_screen`] ? "is-error" : ""}
                />
              </div>

              <div className="ap-field">
                <label>Độ phân giải màn hình</label>
                <input
                  type="text"
                  placeholder="Vd: Full HD, 2.5K..."
                  value={v.specs.screen_resolution}
                  onChange={(e) =>
                    handleSpecChange(i, "screen_resolution", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="ap-subtitle">Giá bán</div>

            <div className="ap-grid-3">
              <div className="ap-field">
                <label>
                  Giá gốc (VNĐ) <span className="req">*</span>
                </label>
                <div className="ap-input-suffix">
                  <input
                    type="number"
                    min="0"
                    placeholder="Nhập giá gốc..."
                    value={v.price}
                    onChange={(e) =>
                      handleVariantChange(i, "price", e.target.value)
                    }
                    className={errors[`variant_${i}_price`] ? "is-error" : ""}
                  />
                  <span>đ</span>
                </div>
              </div>

              <div className="ap-field">
                <label>Giá khuyến mãi (VNĐ)</label>
                <div className="ap-input-suffix">
                  <input
                    type="number"
                    min="0"
                    placeholder="Nhập giá khuyến mãi..."
                    value={v.discount_price}
                    onChange={(e) =>
                      handleVariantChange(i, "discount_price", e.target.value)
                    }
                  />
                  <span>đ</span>
                </div>
              </div>

              <div className="ap-field">
                <label>Trạng thái phiên bản</label>
                <select
                  value={v.status}
                  onChange={(e) =>
                    handleVariantChange(i, "status", e.target.value)
                  }
                >
                  <option value="active">Đang bán</option>
                  <option value="out_of_stock">Hết hàng</option>
                  <option value="discontinued">Ngừng kinh doanh</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ===== FOOTER ===== */}
      <div className="ap-footer">
        <button
          type="button"
          className="ap-cancel-btn"
        >
          Hủy
        </button>
        <button
          type="submit"
          className="ap-submit-btn"
          disabled={submitting}
        >
          {submitting ? (
            <i className="fa-solid fa-spinner fa-spin"></i>
          ) : (
            <i className="fa-regular fa-floppy-disk"></i>
          )}
          {submitting ? "Đang lưu..." : "Lưu sản phẩm"}
        </button>
      </div>
    </form>
  )
}

export default AddProduct
