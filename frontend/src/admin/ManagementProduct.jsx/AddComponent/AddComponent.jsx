import React, { useEffect, useRef, useState } from "react"
import "./AddProduct.scss" // dùng chung style layout/card/field
import "./AddComponent.scss" // style riêng cho bảng thông số động
import axiosInstance from "../../utils/axiosInstance"

const emptyAttribute = () => ({
  _key: crypto.randomUUID(),
  name: "",
  value: "",
})

const emptyVariant = () => ({
  _key: crypto.randomUUID(),
  sku: "",
  config_name: "",
  attributes: [emptyAttribute()],
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

const AddComponent = () => {
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

  const [thumbnail, setThumbnail] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState(null)

  const [images, setImages] = useState([])
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

  // ================= ẢNH =================
  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setThumbnail(file)
    setThumbnailPreview(URL.createObjectURL(file))
    setErrors((prev) => ({ ...prev, thumbnail: null }))
  }

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

  // ---- Thông số động ----
  const addAttribute = (variantIdx) => {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === variantIdx
          ? { ...v, attributes: [...v.attributes, emptyAttribute()] }
          : v,
      ),
    )
  }

  const removeAttribute = (variantIdx, attrKey) => {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === variantIdx
          ? {
              ...v,
              attributes:
                v.attributes.length === 1
                  ? v.attributes
                  : v.attributes.filter((a) => a._key !== attrKey),
            }
          : v,
      ),
    )
  }

  const handleAttributeChange = (variantIdx, attrKey, field, value) => {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === variantIdx
          ? {
              ...v,
              attributes: v.attributes.map((a) =>
                a._key === attrKey ? { ...a, [field]: value } : a,
              ),
            }
          : v,
      ),
    )
  }

  // ================= VALIDATE =================
  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = "Vui lòng nhập tên linh kiện"
    if (!form.category_id) next.category_id = "Vui lòng chọn danh mục"
    if (!form.brand_id) next.brand_id = "Vui lòng chọn thương hiệu"
    if (!thumbnail) next.thumbnail = "Vui lòng chọn ảnh đại diện"

    variants.forEach((v, i) => {
      if (!v.sku.trim()) next[`variant_${i}_sku`] = true
      if (!v.config_name.trim()) next[`variant_${i}_config`] = true
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
        // thông số tự do -> object { name: value }, dễ hiển thị lại ở FE
        specs: {
          attributes: v.attributes
            .filter((a) => a.name.trim())
            .map((a) => ({ name: a.name, value: a.value })),
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

      alert("Tạo linh kiện thành công!")
    } catch (err) {
      console.error("Lỗi tạo linh kiện:", err)
      alert(err.response?.data?.message || "Tạo linh kiện thất bại")
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
      <div className="ap-breadcrumb">Sản phẩm &gt; Thêm linh kiện</div>
      <div className="ap-header">
        <h1>Thêm linh kiện</h1>
        <p>Tạo linh kiện / phụ kiện mới trong cửa hàng của bạn</p>
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
                Tên linh kiện <span className="req">*</span>
              </label>
              <input
                type="text"
                placeholder="Vd: Chuột không dây Logitech M331..."
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
            <label>Mô tả linh kiện</label>
            <textarea
              placeholder="Nhập mô tả linh kiện..."
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
          <h3>Hình ảnh linh kiện</h3>
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
            <h3>Phiên bản linh kiện</h3>
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
                  Tên phiên bản <span className="req">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Vd: Màu đen, Bản 8GB..."
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

            {/* ---- Thông số kỹ thuật động ---- */}
            <div className="ac-attr-head">
              <span
                className="ap-subtitle"
                style={{ margin: 0, border: 0 }}
              >
                Thông số kỹ thuật
              </span>
              <button
                type="button"
                className="ac-attr-add"
                onClick={() => addAttribute(i)}
              >
                <i className="fa-solid fa-plus"></i> Thêm thông số
              </button>
            </div>

            <div className="ac-attr-list">
              {v.attributes.map((attr) => (
                <div
                  className="ac-attr-row"
                  key={attr._key}
                >
                  <input
                    type="text"
                    placeholder="Tên thông số (vd: Công suất)"
                    value={attr.name}
                    onChange={(e) =>
                      handleAttributeChange(
                        i,
                        attr._key,
                        "name",
                        e.target.value,
                      )
                    }
                  />
                  <input
                    type="text"
                    placeholder="Giá trị (vd: 650W)"
                    value={attr.value}
                    onChange={(e) =>
                      handleAttributeChange(
                        i,
                        attr._key,
                        "value",
                        e.target.value,
                      )
                    }
                  />
                  <button
                    type="button"
                    className="ac-attr-remove"
                    disabled={v.attributes.length === 1}
                    onClick={() => removeAttribute(i, attr._key)}
                  >
                    <i className="fa-regular fa-trash-can"></i>
                  </button>
                </div>
              ))}
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
          {submitting ? "Đang lưu..." : "Lưu linh kiện"}
        </button>
      </div>
    </form>
  )
}

export default AddComponent
