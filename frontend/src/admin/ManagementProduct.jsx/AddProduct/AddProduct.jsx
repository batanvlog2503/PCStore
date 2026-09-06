// AddProduct.jsx
import React, { useEffect, useRef, useState } from "react"
import "./AddProduct.scss"
import axiosInstance from "../../utils/axiosInstance"

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

const slugify = (str = "") =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

const AddProduct = () => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(t)
  }, [])

  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])

  const [form, setForm] = useState({
    name: "",
    slug: "",
    category_id: "",
    brand_id: "",
    description: "",
    status: "active",
  })

  const [thumbnail, setThumbnail] = useState(null) // File
  const [thumbnailPreview, setThumbnailPreview] = useState(null)

  const [images, setImages] = useState([]) // [{file, preview}]
  const [variants, setVariants] = useState([emptyVariant()])
  const [activeVariant, setActiveVariant] = useState(0)

  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const thumbInputRef = useRef(null)
  const albumInputRef = useRef(null)

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          axiosInstance.get(`${import.meta.env.VITE_APP_URL}/admin/categories`),
          axiosInstance.get(`${import.meta.env.VITE_APP_URL}/admin/brands`),
        ])
        setCategories(catRes.data.data || [])
        setBrands(brandRes.data.data || [])
      } catch (err) {
        console.error("Lỗi lấy danh mục / thương hiệu:", err)
      }
    }
    fetchOptions()
  }, [])

  // ================= FORM CƠ BẢN =================
  const handleFormChange = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === "name") next.slug = slugify(value)
      return next
    })
    setErrors((prev) => ({ ...prev, [field]: null }))
  }

  // ================= ẢNH ĐẠI DIỆN =================
  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setThumbnail(file)
    setThumbnailPreview(URL.createObjectURL(file))
    setErrors((prev) => ({ ...prev, thumbnail: null }))
  }

  // ================= ALBUM ẢNH =================
  const handleAlbumChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    const mapped = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    setImages((prev) => [...prev, ...mapped])
    e.target.value = ""
  }

  const removeAlbumImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx))
  }

  // ================= PHIÊN BẢN =================
  const addVariant = () => {
    setVariants((prev) => [...prev, emptyVariant()])
    setActiveVariant(variants.length)
  }

  const removeVariant = (idx) => {
    if (variants.length === 1) return
    setVariants((prev) => prev.filter((_, i) => i !== idx))
    setActiveVariant((prev) => Math.max(0, prev - (idx <= prev ? 1 : 0)))
  }

  const handleVariantChange = (idx, field, value) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === idx ? { ...v, [field]: value } : v)),
    )
  }

  const handleSpecChange = (idx, field, value) => {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === idx ? { ...v, specs: { ...v.specs, [field]: value } } : v,
      ),
    )
  }

  // ================= VALIDATE =================
  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = "Vui lòng nhập tên sản phẩm"
    if (!form.category_id) next.category_id = "Vui lòng chọn danh mục"
    if (!form.brand_id) next.brand_id = "Vui lòng chọn thương hiệu"
    if (!thumbnail) next.thumbnail = "Vui lòng chọn ảnh đại diện"

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
      fd.append("slug", form.slug)
      fd.append("category_id", form.category_id)
      fd.append("brand_id", form.brand_id)
      fd.append("description", form.description)
      fd.append("status", form.status)
      fd.append("thumbnail", thumbnail)

      images.forEach((img) => fd.append("images", img.file))

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
      fd.append("variants", JSON.stringify(variantsPayload))

      await axiosInstance.post(
        `${import.meta.env.VITE_APP_URL}/admin/products`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } },
      )

      alert("Tạo sản phẩm thành công!")
      // reset form nếu muốn
    } catch (err) {
      console.error("Lỗi tạo sản phẩm:", err)
      alert(err.response?.data?.message || "Tạo sản phẩm thất bại")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      className={`add-product ${mounted ? "is-mounted" : ""}`}
      onSubmit={handleSubmit}
    >
      {/* ===== HEADER ===== */}
      <div className="ap-breadcrumb">Sản phẩm &gt; Thêm mới</div>
      <div className="ap-header">
        <h1>Thêm sản phẩm</h1>
        <p>Tạo sản phẩm mới trong cửa hàng của bạn</p>
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
                value={form.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                className={errors.name ? "is-error" : ""}
              />
              {errors.name && <span className="ap-error">{errors.name}</span>}
            </div>

            <div className="ap-field">
              <label>
                Danh mục <span className="req">*</span>
              </label>
              <select
                value={form.category_id}
                onChange={(e) =>
                  handleFormChange("category_id", e.target.value)
                }
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
                value={form.brand_id}
                onChange={(e) => handleFormChange("brand_id", e.target.value)}
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
                onClick={() =>
                  handleFormChange(
                    "status",
                    form.status === "active" ? "hidden" : "active",
                  )
                }
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
              placeholder="Nhập mô tả sản phẩm..."
              maxLength={2000}
              value={form.description}
              onChange={(e) => handleFormChange("description", e.target.value)}
            />
            <span className="ap-char-count">
              {form.description.length}/2000
            </span>
          </div>
        </div>
      </section>

      {/* ===== SECTION 2: HÌNH ẢNH ===== */}
      <section
        className="ap-card"
        style={{ transitionDelay: "80ms" }}
      >
        <div className="ap-card-title">
          <span className="ap-badge">2</span>
          <h3>Hình ảnh sản phẩm</h3>
        </div>

        <div className="ap-image-grid">
          <div className="ap-thumb-col">
            <label>
              Ảnh đại diện <span className="req">*</span>
            </label>
            <div
              className={`ap-thumb-drop ${errors.thumbnail ? "is-error" : ""} ${
                thumbnailPreview ? "has-image" : ""
              }`}
              onClick={() => thumbInputRef.current?.click()}
            >
              {thumbnailPreview ? (
                <img
                  src={thumbnailPreview}
                  alt="thumbnail"
                />
              ) : (
                <>
                  <i className="fa-solid fa-cloud-arrow-up"></i>
                  <p>Nhấn để tải ảnh lên</p>
                  <span>Hoặc kéo thả ảnh vào đây</span>
                  <small>(JPG, PNG, WEBP - Tối đa 5MB)</small>
                </>
              )}
              <input
                ref={thumbInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                hidden
                onChange={handleThumbnailChange}
              />
            </div>
            {errors.thumbnail && (
              <span className="ap-error">{errors.thumbnail}</span>
            )}
          </div>

          <div className="ap-album-col">
            <label>Album ảnh</label>
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
                onChange={handleAlbumChange}
              />

              {images.map((img, idx) => (
                <div
                  className="ap-album-item"
                  key={idx}
                >
                  <img
                    src={img.preview}
                    alt={`album-${idx}`}
                  />
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeAlbumImage(idx)}
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 3: PHIÊN BẢN ===== */}
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
