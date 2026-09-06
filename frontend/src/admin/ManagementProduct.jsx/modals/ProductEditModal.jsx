import React, { useEffect, useState } from "react"
import "./ProductEditModal.scss"

const CATEGORY_OPTIONS = [
  "Máy tính để bàn",
  "Laptop",
  "Màn hình",
  "Linh kiện",
  "Phụ kiện",
  "Case",
]

const STATUS_OPTIONS = [
  { value: "active", label: "Đang hoạt động" },
  { value: "hidden", label: "Tạm ẩn" },
]

const EMPTY_FORM = {
  name: "",
  sku: "",
  category: CATEGORY_OPTIONS[0],
  price: "",
  discount_price: "",
  stock: "",
  status: "active",
  description: "",
}

/**
 * Props:
 * - product: sản phẩm đang sửa (null nếu không mở modal)
 * - onClose(): đóng modal
 * - onSubmit(formData): lưu thay đổi
 * - submitting: boolean — đang gọi API lưu
 */
const ProductEditModal = ({ product, onClose, onSubmit, submitting }) => {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "",
        sku: product.sku || "",
        category: product.category || CATEGORY_OPTIONS[0],
        price: product.price ?? "",
        discount_price: product.discount_price ?? "",
        stock: product.stock ?? "",
        status: product.status || "active",
        description: product.description || "",
      })
      setErrors({})
    }
  }, [product])

  if (!product) return null

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = () => {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = "Vui lòng nhập tên sản phẩm"
    if (!form.price || Number(form.price) <= 0)
      nextErrors.price = "Giá bán phải lớn hơn 0"
    if (
      form.discount_price !== "" &&
      Number(form.discount_price) >= Number(form.price)
    )
      nextErrors.discount_price = "Giá khuyến mãi phải nhỏ hơn giá bán"
    if (form.stock === "" || Number(form.stock) < 0)
      nextErrors.stock = "Tồn kho không hợp lệ"

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    onSubmit({
      _id: product._id,
      ...form,
      price: Number(form.price),
      discount_price:
        form.discount_price === "" ? null : Number(form.discount_price),
      stock: Number(form.stock),
    })
  }

  return (
    <div
      className="product-edit-backdrop"
      onClick={() => !submitting && onClose()}
    >
      <div
        className="product-edit-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pem-header">
          <h3>Chỉnh sửa sản phẩm</h3>
          <button
            className="pem-close-btn"
            onClick={onClose}
            disabled={submitting}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form
          className="pem-body"
          onSubmit={handleSubmit}
        >
          <div className="pem-field full">
            <label>Tên sản phẩm</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Nhập tên sản phẩm"
            />
            {errors.name && <span className="pem-error">{errors.name}</span>}
          </div>

          <div className="pem-field">
            <label>Mã sản phẩm (SKU)</label>
            <input
              type="text"
              value={form.sku}
              disabled
              title="Mã sản phẩm không thể thay đổi"
            />
          </div>

          <div className="pem-field">
            <label>Danh mục</label>
            <select
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option
                  key={c}
                  value={c}
                >
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="pem-field">
            <label>Giá bán</label>
            <input
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => handleChange("price", e.target.value)}
              placeholder="0"
            />
            {errors.price && <span className="pem-error">{errors.price}</span>}
          </div>

          <div className="pem-field">
            <label>Giá khuyến mãi</label>
            <input
              type="number"
              min="0"
              value={form.discount_price}
              onChange={(e) => handleChange("discount_price", e.target.value)}
              placeholder="Để trống nếu không có"
            />
            {errors.discount_price && (
              <span className="pem-error">{errors.discount_price}</span>
            )}
          </div>

          <div className="pem-field">
            <label>Tồn kho</label>
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => handleChange("stock", e.target.value)}
              placeholder="0"
            />
            {errors.stock && <span className="pem-error">{errors.stock}</span>}
          </div>

          <div className="pem-field">
            <label>Trạng thái</label>
            <select
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option
                  key={s.value}
                  value={s.value}
                >
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="pem-field full">
            <label>Mô tả sản phẩm</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Nhập mô tả sản phẩm..."
            />
          </div>

          <div className="pem-actions">
            <button
              type="button"
              className="pem-cancel-btn"
              onClick={onClose}
              disabled={submitting}
            >
              Huỷ
            </button>
            <button
              type="submit"
              className="pem-save-btn"
              disabled={submitting}
            >
              {submitting ? (
                <i className="fa-solid fa-spinner fa-spin"></i>
              ) : (
                <>
                  <i className="fa-solid fa-check"></i> Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductEditModal
    