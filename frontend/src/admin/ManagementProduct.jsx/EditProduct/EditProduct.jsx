import React, { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import "./EditProduct.scss"
import axiosInstance from "../../../utils/axiosInstance"

// ================= CONST =================
const PRODUCT_STATUS_OPTIONS = [
  { value: "active", label: "Hiển thị" },
  { value: "hidden", label: "Ẩn" },
]

const VARIANT_STATUS_OPTIONS = [
  { value: "active", label: "Đang bán" },
  { value: "out_of_stock", label: "Hết hàng" },
  { value: "discontinued", label: "Ngừng kinh doanh" },
]

const USE_CASE_OPTIONS = [
  { value: "gaming", label: "Gaming" },
  { value: "office", label: "Văn phòng" },
  { value: "design", label: "Thiết kế" },
  { value: "student", label: "Học sinh / Sinh viên" },
  { value: "macbook", label: "MacBook" },
  { value: "ultrabook", label: "Ultrabook" },
]
const STORAGE_TYPE_OPTIONS = ["SSD", "HDD"]

const EMPTY_VARIANT = {
  _id: null,
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
}

const EditProduct = () => {
  const { productId } = useParams()
  const navigate = useNavigate()
  const variantFormRef = useRef(null)

  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])

  const [product, setProduct] = useState(null)
  const [images, setImages] = useState([])
  const [variants, setVariants] = useState([])

  const [variantForm, setVariantForm] = useState(null) // null = đóng panel; object = đang thêm/sửa
  const [variantErrors, setVariantErrors] = useState({})
  const [savingVariant, setSavingVariant] = useState(false)
  const [copied, setCopied] = useState(false)

  const [deletedImageIds, setDeletedImageIds] = useState([])
  const getData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [productRes, categoryRes, brandRes] = await Promise.all([
        axiosInstance.get(
          `${import.meta.env.VITE_APP_URL}/product/${productId}`,
        ),

        axiosInstance.get(`${import.meta.env.VITE_APP_URL}/category`),

        axiosInstance.get(`${import.meta.env.VITE_APP_URL}/brand/all`),
      ])

      const productData = productRes.data

      setProduct(productData.product)
      setVariants(productData.variants || [])
      setImages(productData.images || [])

      setCategories(categoryRes.data.categories || [])
      setBrands(brandRes.data.brands || [])
    } catch (error) {
      console.error("Lỗi lấy dữ liệu sản phẩm:", error.response?.data || error)

      setError(
        error.response?.data?.message || "Không thể tải thông tin sản phẩm",
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getData()
  }, [productId])

  // ==========================================================================
  // Product fields
  // ==========================================================================
  const handleProductChange = (field, value) => {
    setProduct((prev) => ({ ...prev, [field]: value }))
  }

  const descriptionLength = product?.description?.length || 0

  // Product images (khớp ProductImage: product_id, image_url, is_main)
  // chuyển ảnh thành is_main
  const handleSetMainImage = (imgId) => {
    setImages((prev) =>
      prev.map((img) => ({ ...img, is_main: img._id === imgId })),
    )
  }

  const handleRemoveImage = (imgId) => {
    setImages((prev) => {
      const image = prev.find((img) => img._id === imgId)

      // Nếu là ảnh đã tồn tại trong database
      if (image && !image.file) {
        setDeletedImageIds((prevDeleted) => [...prevDeleted, imgId])
      }

      const removingMain = image?.is_main

      const next = prev.filter((img) => img._id !== imgId)

      // Nếu xóa ảnh chính thì gán ảnh đầu tiên còn lại làm ảnh chính
      if (removingMain && next.length > 0) {
        return next.map((img, index) => ({
          ...img,
          is_main: index === 0,
        }))
      }

      return next
    })
  }

  const handleAddImage = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const newImages = files.map((file, i) => ({
      _id: `local-${Date.now()}-${i}`,
      image_url: URL.createObjectURL(file),
      is_main: images.length === 0 && i === 0,
      file, // giữ lại file gốc để upload thật lên server khi lưu
    }))

    setImages((prev) => [...prev, ...newImages])
    e.target.value = "" // reset input để chọn lại cùng 1 file vẫn bắn onChange
  }

  // ==========================================================================
  // Variant form (khớp ProductVariant: sku, config_name, specs{...}, price, discount_price, stock, status)
  // ==========================================================================
  const openAddVariant = () => {
    setVariantForm({ ...EMPTY_VARIANT, specs: { ...EMPTY_VARIANT.specs } })
    setVariantErrors({})
    setTimeout(
      () =>
        variantFormRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        }),
      50,
    )
  }

  const openEditVariant = (variant) => {
    setVariantForm({
      _id: variant._id,
      sku: variant.sku,
      config_name: variant.config_name,
      specs: { ...variant.specs },
      price: variant.price,
      discount_price: variant.discount_price ?? "",
      stock: variant.stock,
      status: variant.status,
    })
    setVariantErrors({})
    setTimeout(
      () =>
        variantFormRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        }),
      50,
    )
  }

  const handleVariantField = (field, value) => {
    setVariantForm((prev) => ({ ...prev, [field]: value }))
    setVariantErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleSpecField = (field, value) => {
    setVariantForm((prev) => ({
      ...prev,
      specs: { ...prev.specs, [field]: value },
    }))
    setVariantErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validateVariant = () => {
    const e = {}
    if (!variantForm.config_name.trim()) e.config_name = "Bắt buộc"
    if (!variantForm.sku.trim()) e.sku = "Bắt buộc"
    if (!variantForm.specs.cpu.trim()) e.cpu = "Bắt buộc"
    if (variantForm.specs.ram === "" || Number(variantForm.specs.ram) <= 0)
      e.ram = "Bắt buộc"
    if (
      variantForm.specs.storage_capacity === "" ||
      Number(variantForm.specs.storage_capacity) <= 0
    )
      e.storage_capacity = "Bắt buộc"
    if (!variantForm.specs.gpu.trim()) e.gpu = "Bắt buộc"
    if (
      variantForm.specs.screen_size === "" ||
      Number(variantForm.specs.screen_size) <= 0
    )
      e.screen_size = "Bắt buộc"
    if (!variantForm.price || Number(variantForm.price) <= 0)
      e.price = "Giá bán phải > 0"
    if (
      variantForm.discount_price !== "" &&
      Number(variantForm.discount_price) > Number(variantForm.price)
    )
      e.discount_price = "Phải ≤ giá bán"
    if (variantForm.stock === "" || Number(variantForm.stock) < 0)
      e.stock = "Không hợp lệ"

    setVariantErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSaveVariant = async () => {
    if (!validateVariant()) return

    try {
      setSavingVariant(true)

      const payload = {
        ...variantForm,
        price: Number(variantForm.price),
        discount_price:
          variantForm.discount_price === ""
            ? null
            : Number(variantForm.discount_price),
        stock: Number(variantForm.stock),

        specs: {
          ...variantForm.specs,
          ram: Number(variantForm.specs.ram),
          storage_capacity: Number(variantForm.specs.storage_capacity),
          screen_size: Number(variantForm.specs.screen_size),
        },
      }

      let response
      // SỬA VARIANT
      if (payload._id) {
        response = await axiosInstance.put(
          `${import.meta.env.VITE_APP_URL}/admin/variants/${payload._id}`,
          payload,
        )

        // Cập nhật lại variant trên giao diện
        const updatedVariant = response.data.variant

        setVariants((prev) =>
          prev.map((v) => (v._id === payload._id ? updatedVariant : v)),
        )

        alert("Cập nhật phiên bản thành công!")
      }

      // ===============================
      // THÊM VARIANT
      // ===============================
      else {
        response = await axiosInstance.post(
          `${import.meta.env.VITE_APP_URL}/admin/products/${productId}/variants`,
          payload,
        )

        const newVariant = response.data.variant

        setVariants((prev) => [...prev, newVariant])

        alert("Thêm phiên bản mới thành công!")
      }

      setVariantForm(null)
    } catch (error) {
      console.error("Lỗi lưu variant:", error)

      alert(error.response?.data?.message || "❌ Lưu phiên bản thất bại")
    } finally {
      setSavingVariant(false)
    }
  }

  const handleDeleteVariant = (variant) => {
    if (!window.confirm(`Xoá phiên bản "${variant.config_name}"?`)) return
    // await axiosInstance.delete(`.../admin/variants/${variant._id}`)
    setVariants((prev) => prev.filter((v) => v._id !== variant._id))
  }

  const handleSaveProduct = async () => {
    try {
      setSaving(true)

      await axiosInstance.put(
        `${import.meta.env.VITE_APP_URL}/admin/products/update/${productId}`,
        product,
      )

      for (const imageId of deletedImageIds) {
        await axiosInstance.delete(
          `${import.meta.env.VITE_APP_URL}/admin/products/images/${imageId}`,
        )
      }

      const newImages = images.filter((img) => img.file)

      if (newImages.length > 0) {
        const formData = new FormData()

        newImages.forEach((img) => {
          formData.append("images", img.file)
        })

        await axiosInstance.post(
          `${import.meta.env.VITE_APP_URL}/admin/products/${productId}/images`,
          formData,
        )
      }

      const mainImage = images.find((img) => img.is_main)

      if (mainImage && !mainImage.file) {
        await axiosInstance.put(
          `${import.meta.env.VITE_APP_URL}/admin/products/${productId}/images/main`,
          {
            imageId: mainImage._id,
          },
        )
      }

      setDeletedImageIds([])

      alert("Cập nhật sản phẩm thành công!")

      await getData()
    } catch (error) {
      console.error(error)

      alert(error.response?.data?.message || "Lưu sản phẩm thất bại")
    } finally {
      setSaving(false)
    }
  }

  const formatPrice = (price) => {
    if (price == null || price === "") return "—"
    return Number(price).toLocaleString("vi-VN") + "đ"
  }

  const mainImage = useMemo(() => images.find((i) => i.is_main), [images])

  if (loading) {
    return (
      <div className="edit-product-loading">
        <div className="spinner"></div>
        <p>Đang tải thông tin sản phẩm...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="edit-product-error">
        <i className="fa-solid fa-circle-exclamation"></i>
        <p>{error}</p>

        <button onClick={() => getData()}>Thử lại</button>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="edit-product-error">
        <p>Không tìm thấy sản phẩm</p>
      </div>
    )
  }

  return (
    <div className={`edit-product ${mounted ? "is-mounted" : ""}`}>
      {/* ===== BREADCRUMB ===== */}
      <p className="ep-breadcrumb">
        <Link to="/admin/products">Sản phẩm</Link>
        <i className="fa-solid fa-chevron-right"></i>
        <Link to="/admin/products">Danh sách sản phẩm</Link>
        <i className="fa-solid fa-chevron-right"></i>
        <span>Chỉnh sửa sản phẩm</span>
      </p>

      {/* ===== HEADER ===== */}
      <div className="ep-header">
        <div className="ep-header-title">
          <button
            className="ep-back-btn"
            onClick={() => navigate(-1)}
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <h1>Chỉnh sửa sản phẩm</h1>
        </div>

        <div className="ep-header-actions">
          <button
            className="ep-save-btn"
            onClick={handleSaveProduct}
            disabled={saving}
          >
            {saving ? (
              <i className="fa-solid fa-spinner fa-spin"></i>
            ) : (
              <>
                <i className="fa-solid fa-check"></i> Lưu thay đổi
              </>
            )}
          </button>
          <button
            className="ep-cancel-btn"
            onClick={() => navigate(-1)}
          >
            Huỷ
          </button>
        </div>
      </div>

      {/* ===== THÔNG TIN SẢN PHẨM + HÌNH ẢNH ===== */}
      <div className="ep-top-grid">
        {/* ----- Thông tin sản phẩm ----- */}
        <div className="ep-card">
          <div className="ep-card-head">
            <div className="ep-card-icon">
              <i className="fa-solid fa-box"></i>
            </div>
            <h3>Thông tin sản phẩm</h3>
          </div>

          <div className="ep-form">
            <div className="ep-field full">
              <label>
                Tên sản phẩm <span className="required">*</span>
              </label>
              <input
                type="text"
                value={product.name}
                onChange={(e) => handleProductChange("name", e.target.value)}
              />
            </div>

            <div className="ep-field">
              <label>
                Danh mục <span className="required">*</span>
              </label>
              <select
                value={product.category_id?._id || product.category_id || ""}
                onChange={(e) =>
                  handleProductChange("category_id", e.target.value)
                }
              >
                {categories.map((c) => (
                  <option
                    key={c._id}
                    value={c._id}
                  >
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="ep-field">
              <label>
                Thương hiệu <span className="required">*</span>
              </label>
              <select
                value={product.brand_id?._id || product.brand_id || ""}
                onChange={(e) =>
                  handleProductChange("brand_id", e.target.value)
                }
              >
                {brands.map((b) => (
                  <option
                    key={b._id}
                    value={b._id}
                  >
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="ep-field">
              <label>Slug</label>
              <div className="ep-slug-input">
                <input
                  type="text"
                  value={product.slug}
                  onChange={(e) => handleProductChange("slug", e.target.value)}
                />
                <button
                  type="button"
                  title="Sao chép slug"
                >
                  <i
                    className={`fa-regular ${copied ? "fa-circle-check" : "fa-copy"}`}
                  ></i>
                </button>
              </div>
            </div>

            <div className="ep-field">
              <label>
                Trạng thái <span className="required">*</span>
              </label>
              <select
                value={product.status}
                onChange={(e) => handleProductChange("status", e.target.value)}
              >
                {PRODUCT_STATUS_OPTIONS.map((s) => (
                  <option
                    key={s.value}
                    value={s.value}
                  >
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="ep-field">
              <label>
                Mục đích sử dụng <span className="required">*</span>
              </label>

              <select
                value={product.use_case || ""}
                onChange={(e) =>
                  handleProductChange("use_case", e.target.value)
                }
              >
                <option value="">Chọn mục đích sử dụng</option>

                {USE_CASE_OPTIONS.map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="ep-field full">
              <label>
                Mô tả sản phẩm <span className="required">*</span>
              </label>
              <textarea
                rows={5}
                maxLength={1000}
                value={product.description}
                onChange={(e) =>
                  handleProductChange("description", e.target.value)
                }
              />
              <span className="ep-char-count">{descriptionLength}/1000</span>
            </div>
          </div>
        </div>

        {/* ----- Hình ảnh sản phẩm ----- */}
        <div className="ep-card">
          <div className="ep-card-head">
            <div className="ep-card-icon">
              <i className="fa-regular fa-images"></i>
            </div>
            <div>
              <h3>Hình ảnh sản phẩm</h3>
              <p className="ep-card-sub">
                Quản lý hình ảnh sản phẩm. Ảnh chính sẽ được hiển thị ở trang
                danh sách.
              </p>
            </div>
          </div>

          <div className="ep-image-grid">
            {images.map((img) => (
              <div
                className={`ep-image-tile ${img.is_main ? "is-main" : ""}`}
                key={img._id}
                onClick={() => !img.is_main && handleSetMainImage(img._id)}
              >
                {img.is_main && <span className="main-badge">Ảnh chính</span>}
                <button
                  className="remove-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveImage(img._id)
                  }}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
                {img.image_url ? (
                  <img
                    src={`${import.meta.env.VITE_APP_URL}${img.image_url}`}
                    alt="product"
                  />
                ) : (
                  <i className="fa-regular fa-image placeholder-icon"></i>
                )}
              </div>
            ))}

            <label className="ep-image-tile add-tile">
              <i className="fa-solid fa-plus"></i>
              <span>Thêm ảnh</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                multiple
                hidden
                onChange={handleAddImage}
              />
            </label>
          </div>

          <div className="ep-note-box">
            <div className="note-title">
              <i className="fa-solid fa-lightbulb"></i> Lưu ý:
            </div>
            <ul>
              <li>
                Ảnh chính sẽ hiển thị ở danh sách sản phẩm và trang chi tiết.
              </li>
              <li>
                Hỗ trợ định dạng: JPG, PNG, JPEG. Kích thước tối đa: 5MB/ảnh.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ===== VARIANTS ===== */}
      <div className="ep-card ep-variants-card">
        <div className="ep-card-head with-action">
          <div className="ep-card-head-left">
            <div className="ep-card-icon">
              <i className="fa-solid fa-layer-group"></i>
            </div>
            <div>
              <h3>Phiên bản sản phẩm (Variants)</h3>
              <p className="ep-card-sub">
                Quản lý các phiên bản cấu hình của sản phẩm. Mỗi phiên bản có
                giá, tồn kho và thông số kỹ thuật riêng.
              </p>
            </div>
          </div>
          <button
            className="ep-add-variant-btn"
            onClick={openAddVariant}
          >
            <i className="fa-solid fa-plus"></i> Thêm phiên bản
          </button>
        </div>

        <div className="ep-variant-table-scroll">
          <table>
            <thead>
              <tr>
                <th>Tên phiên bản</th>
                <th>SKU</th>
                <th>Thông số kỹ thuật</th>
                <th>Giá bán</th>
                <th>Giá khuyến mãi</th>
                <th>Tồn kho</th>
                <th>Trạng thái</th>
                <th className="col-actions">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {variants.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="ep-variant-empty"
                  >
                    Chưa có phiên bản nào — bấm "Thêm phiên bản" để tạo mới.
                  </td>
                </tr>
              ) : (
                variants.map((v) => (
                  <tr key={v._id}>
                    <td className="variant-name-cell">
                      <p className="name">{v.config_name}</p>
                      {v.tag && <span className="tag">{v.tag}</span>}
                    </td>
                    <td className="sku-cell">{v.sku}</td>
                    <td className="specs-cell">
                      <ul>
                        <li>
                          <strong>CPU:</strong> {v.specs.cpu}
                        </li>
                        <li>
                          <strong>RAM:</strong> {v.specs.ram}GB
                        </li>
                        <li>
                          <strong>Storage:</strong> {v.specs.storage_capacity}GB{" "}
                          {v.specs.storage_type}
                        </li>
                        <li>
                          <strong>GPU:</strong> {v.specs.gpu}
                        </li>
                        <li>
                          <strong>Screen:</strong> {v.specs.screen_size}"{" "}
                          {v.specs.screen_resolution}
                        </li>
                      </ul>
                    </td>
                    <td className="price-cell">{formatPrice(v.price)}</td>
                    <td className="discount-cell">
                      {formatPrice(v.discount_price)}
                    </td>
                    <td>{v.stock}</td>
                    <td>
                      <span className={`ep-variant-status status-${v.status}`}>
                        {VARIANT_STATUS_OPTIONS.find(
                          (s) => s.value === v.status,
                        )?.label || v.status}
                      </span>
                    </td>
                    <td>
                      <div className="ep-variant-actions">
                        <button
                          className="ep-icon-btn"
                          title="Chỉnh sửa"
                          onClick={() => openEditVariant(v)}
                        >
                          <i className="fa-regular fa-pen-to-square"></i>
                        </button>
                        <button
                          className="ep-icon-btn is-danger"
                          title="Xoá"
                          onClick={() => handleDeleteVariant(v)}
                        >
                          <i className="fa-regular fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== FORM THÊM / SỬA PHIÊN BẢN ===== */}
      {variantForm && (
        <div
          className="ep-card ep-variant-form-card"
          ref={variantFormRef}
        >
          <div className="ep-card-head">
            <div className="ep-card-icon">
              <i className="fa-solid fa-sliders"></i>
            </div>
            <h3>{variantForm._id ? "Sửa phiên bản" : "Thêm phiên bản mới"}</h3>
          </div>

          <div className="ep-variant-form">
            <div className="ep-field">
              <label>
                Tên phiên bản <span className="required">*</span>
              </label>
              <input
                type="text"
                placeholder="Vd: i5 / 8GB / 512GB"
                value={variantForm.config_name}
                onChange={(e) =>
                  handleVariantField("config_name", e.target.value)
                }
              />
              {variantErrors.config_name && (
                <span className="ep-error">{variantErrors.config_name}</span>
              )}
            </div>

            <div className="ep-field">
              <label>
                SKU <span className="required">*</span>
              </label>
              <input
                type="text"
                placeholder="Vd: NTV15-i5-8-512"
                value={variantForm.sku}
                onChange={(e) => handleVariantField("sku", e.target.value)}
              />
              {variantErrors.sku && (
                <span className="ep-error">{variantErrors.sku}</span>
              )}
            </div>

            <div className="ep-field full">
              <label className="section-label">Thông số kỹ thuật</label>
            </div>

            <div className="ep-field">
              <label>
                CPU <span className="required">*</span>
              </label>
              <input
                type="text"
                placeholder="Vd: Intel Core i5"
                value={variantForm.specs.cpu}
                onChange={(e) => handleSpecField("cpu", e.target.value)}
              />
              {variantErrors.cpu && (
                <span className="ep-error">{variantErrors.cpu}</span>
              )}
            </div>

            <div className="ep-field">
              <label>
                RAM (GB) <span className="required">*</span>
              </label>
              <input
                type="number"
                min="0"
                placeholder="Vd: 8"
                value={variantForm.specs.ram}
                onChange={(e) => handleSpecField("ram", e.target.value)}
              />
              {variantErrors.ram && (
                <span className="ep-error">{variantErrors.ram}</span>
              )}
            </div>

            <div className="ep-field">
              <label>
                Storage Capacity (GB) <span className="required">*</span>
              </label>
              <input
                type="number"
                min="0"
                placeholder="Vd: 512"
                value={variantForm.specs.storage_capacity}
                onChange={(e) =>
                  handleSpecField("storage_capacity", e.target.value)
                }
              />
              {variantErrors.storage_capacity && (
                <span className="ep-error">
                  {variantErrors.storage_capacity}
                </span>
              )}
            </div>

            <div className="ep-field">
              <label>Storage Type</label>
              <select
                value={variantForm.specs.storage_type}
                onChange={(e) =>
                  handleSpecField("storage_type", e.target.value)
                }
              >
                {STORAGE_TYPE_OPTIONS.map((t) => (
                  <option
                    key={t}
                    value={t}
                  >
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="ep-field">
              <label>
                GPU <span className="required">*</span>
              </label>
              <input
                type="text"
                placeholder="Vd: RTX 3050"
                value={variantForm.specs.gpu}
                onChange={(e) => handleSpecField("gpu", e.target.value)}
              />
              {variantErrors.gpu && (
                <span className="ep-error">{variantErrors.gpu}</span>
              )}
            </div>

            <div className="ep-field">
              <label>
                Screen Size (inch) <span className="required">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                placeholder="Vd: 15.6"
                value={variantForm.specs.screen_size}
                onChange={(e) => handleSpecField("screen_size", e.target.value)}
              />
              {variantErrors.screen_size && (
                <span className="ep-error">{variantErrors.screen_size}</span>
              )}
            </div>

            <div className="ep-field">
              <label>Screen Resolution</label>
              <input
                type="text"
                placeholder="Vd: Full HD (1920x1080)"
                value={variantForm.specs.screen_resolution}
                onChange={(e) =>
                  handleSpecField("screen_resolution", e.target.value)
                }
              />
            </div>

            <div className="ep-field full">
              <label className="section-label">Giá &amp; kho</label>
            </div>

            <div className="ep-field">
              <label>
                Giá bán (VNĐ) <span className="required">*</span>
              </label>
              <input
                type="number"
                min="0"
                placeholder="Vd: 18990000"
                value={variantForm.price}
                onChange={(e) => handleVariantField("price", e.target.value)}
              />
              {variantErrors.price && (
                <span className="ep-error">{variantErrors.price}</span>
              )}
            </div>

            <div className="ep-field">
              <label>Giá khuyến mãi (VNĐ)</label>
              <input
                type="number"
                min="0"
                placeholder="Vd: 16990000"
                value={variantForm.discount_price}
                onChange={(e) =>
                  handleVariantField("discount_price", e.target.value)
                }
              />
              {variantErrors.discount_price && (
                <span className="ep-error">{variantErrors.discount_price}</span>
              )}
            </div>

            <div className="ep-field">
              <label>
                Tồn kho <span className="required">*</span>
              </label>
              <input
                type="number"
                min="0"
                placeholder="Vd: 10"
                value={variantForm.stock}
                onChange={(e) => handleVariantField("stock", e.target.value)}
              />
              {variantErrors.stock && (
                <span className="ep-error">{variantErrors.stock}</span>
              )}
            </div>

            <div className="ep-field">
              <label>Trạng thái</label>
              <select
                value={variantForm.status}
                onChange={(e) => handleVariantField("status", e.target.value)}
              >
                {VARIANT_STATUS_OPTIONS.map((s) => (
                  <option
                    key={s.value}
                    value={s.value}
                  >
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="ep-variant-form-actions">
              <button
                type="button"
                className="ep-variant-cancel-btn"
                onClick={() => setVariantForm(null)}
                disabled={savingVariant}
              >
                Huỷ
              </button>
              <button
                type="button"
                className="ep-variant-save-btn"
                onClick={handleSaveVariant}
                disabled={savingVariant}
              >
                {savingVariant ? (
                  <i className="fa-solid fa-spinner fa-spin"></i>
                ) : (
                  <>
                    <i className="fa-solid fa-check"></i> Lưu phiên bản
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EditProduct
