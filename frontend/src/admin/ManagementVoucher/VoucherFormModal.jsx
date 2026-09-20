import React, { useEffect, useState } from "react"
import { toast } from "../../pages/Toast/Toast"
const INITIAL_FORM = {
  code: "",
  voucher_type: "product", // "product" | "shipping"
  discount_type: "percent", // "percent" | "fixed"
  discount_value: "",
  max_discount: "",
  min_order_value: "",
  quantity: "",
  start_date: "",
  end_date: "",
  status: "active", // "active" | "inactive" -- KHÔNG cho chọn "expired" ở đây
}

function toDateInputValue(dateStr) {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ""
  const pad = (n) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const VoucherFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
}) => {
  const [form, setForm] = useState(INITIAL_FORM)
  const isEditing = !!initialData

  useEffect(() => {
    if (!isOpen) return

    if (initialData) {
      setForm({
        code: initialData.code || "",
        voucher_type: initialData.voucher_type || "product",
        discount_type: initialData.discount_type || "percent",
        discount_value: initialData.discount_value ?? "",
        max_discount: initialData.max_discount ?? "",
        min_order_value: initialData.min_order_value ?? "",
        quantity: initialData.quantity ?? "",
        start_date: toDateInputValue(initialData.start_date),
        end_date: toDateInputValue(initialData.end_date),
        status:
          initialData.status === "expired"
            ? "inactive"
            : initialData.status || "active",
      })
    } else {
      setForm(INITIAL_FORM)
    }
  }, [isOpen, initialData])

  if (!isOpen) return null

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const validate = () => {
    if (!form.code.trim()) {
      toast.warning("Vui lòng nhập mã voucher")
      return false
    }
    if (form.code.trim().length > 50) {
      toast.warning("Mã voucher không được vượt quá 50 ký tự")
      return false
    }
    if (!form.discount_value || Number(form.discount_value) <= 0) {
      toast.warning("Vui lòng nhập giá trị giảm hợp lệ")
      return false
    }
    if (form.discount_type === "percent" && Number(form.discount_value) > 100) {
      toast.warning("Giảm theo % không được vượt quá 100")
      return false
    }
    if (!form.start_date || !form.end_date) {
      toast.warning("Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc")
      return false
    }
    if (new Date(form.end_date) <= new Date(form.start_date)) {
      toast.warning("Ngày kết thúc phải sau ngày bắt đầu")
      return false
    }
    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    onSubmit({
      code: form.code.trim().toUpperCase(),
      voucher_type: form.voucher_type,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      max_discount:
        form.discount_type === "percent" && form.max_discount !== ""
          ? Number(form.max_discount)
          : null,
      min_order_value:
        form.min_order_value === "" ? 0 : Number(form.min_order_value),
      // để trống -> null (không giới hạn). Backend cần xử lý quantity=null
      // là "không giới hạn" ở mọi nơi đang check quantity > 0.
      quantity: form.quantity === "" ? null : Number(form.quantity),
      start_date: form.start_date,
      end_date: form.end_date,
      status: form.status,
    })
  }

  return (
    <div
      className="mv-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="mv-modal-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mv-modal-header">
          <span className="mv-modal-header__icon">
            <i className="fa-solid fa-tag"></i>
          </span>
          <h3>{isEditing ? "Sửa voucher" : "Thêm voucher"}</h3>
          <button
            type="button"
            className="mv-modal-close"
            onClick={onClose}
            aria-label="Đóng"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mv-form-grid">
            {/* Hàng 1 */}
            <label className="mv-field">
              <span>
                Mã voucher <b>*</b>
              </span>
              <input
                type="text"
                placeholder="VD: SALE50"
                value={form.code}
                onChange={(e) => handleChange("code", e.target.value)}
                maxLength={50}
              />
            </label>

            <label className="mv-field">
              <span>Đơn tối thiểu</span>
              <input
                type="number"
                min={0}
                placeholder="Nhập giá trị (đơn hàng tối thiểu)"
                value={form.min_order_value}
                onChange={(e) =>
                  handleChange("min_order_value", e.target.value)
                }
              />
            </label>

            <label className="mv-field">
              <span>
                Ngày bắt đầu <b>*</b>
              </span>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => handleChange("start_date", e.target.value)}
              />
            </label>

            <label className="mv-field">
              <span>
                Trạng thái <b>*</b>
              </span>
              <select
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm ẩn</option>
              </select>
            </label>

            {/* Hàng 2 */}
            <label className="mv-field">
              <span>
                Loại voucher <b>*</b>
              </span>
              <select
                value={form.voucher_type}
                onChange={(e) => handleChange("voucher_type", e.target.value)}
              >
                <option value="product">Sản phẩm</option>
                <option value="shipping">Vận chuyển</option>
              </select>
            </label>

            <label className="mv-field">
              <span>
                Hình thức giảm giá <b>*</b>
              </span>
              <select
                value={form.discount_type}
                onChange={(e) => handleChange("discount_type", e.target.value)}
              >
                <option value="percent">Giảm theo %</option>
                <option value="fixed">Giảm tiền</option>
              </select>
            </label>

            <label className="mv-field">
              <span>
                Ngày kết thúc <b>*</b>
              </span>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => handleChange("end_date", e.target.value)}
              />
            </label>

            <div />

            {/* Hàng 3 */}
            <label className="mv-field">
              <span>
                Giá trị giảm <b>*</b>
              </span>
              <input
                type="number"
                min={0}
                max={form.discount_type === "percent" ? 100 : undefined}
                placeholder={
                  form.discount_type === "percent"
                    ? "VD: 10 (%)"
                    : "VD: 50000 (đ)"
                }
                value={form.discount_value}
                onChange={(e) => handleChange("discount_value", e.target.value)}
              />
            </label>

            <label className="mv-field">
              <span>Giảm tối đa (chỉ áp dụng khi giảm theo %)</span>
              <input
                type="number"
                min={0}
                placeholder="Nhập giá trị (ví dụ: 100000)"
                value={form.max_discount}
                onChange={(e) => handleChange("max_discount", e.target.value)}
                disabled={form.discount_type !== "percent"}
              />
            </label>

            <label className="mv-field">
              <span>Giới hạn lượt dùng</span>
              <input
                type="number"
                min={0}
                placeholder="Để trống nếu không giới hạn"
                value={form.quantity}
                onChange={(e) => handleChange("quantity", e.target.value)}
              />
            </label>
          </div>

          <div className="mv-modal-footer">
            <button
              type="button"
              className="mv-btn mv-btn--cancel"
              onClick={onClose}
            >
              Huỷ
            </button>
            <button
              type="submit"
              className="mv-btn mv-btn--submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang lưu..." : "Lưu voucher"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default VoucherFormModal
