import React, { useEffect, useState } from "react"
import { toast } from "../../pages/Toast/Toast"
import { VN_CHAR_MAP } from "./VN_CHAR_MAP"
const INITIAL_FORM = { name: "", parent_id: "" }

const CategoryFormPanel = ({
  onClose,
  onSubmit,
  initialData,
  parentOptions,
  isSubmitting,
}) => {
  const [form, setForm] = useState(INITIAL_FORM)
  const isEditing = !!initialData

  // Danh mục đang sửa mà đã có con -> không cho gán nó làm con của mục khác nữa
  const isParentLocked = isEditing && !!initialData?.hasChildren

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        parent_id: isParentLocked ? "" : initialData.parentId || "",
      })
    } else {
      setForm(INITIAL_FORM)
    }
  }, [initialData, isParentLocked])

  const handleNameChange = (value) => {
    setForm((prev) => ({ ...prev, name: value }))
  }

  const validate = () => {
    if (!form.name.trim()) {
      toast.warning("Vui lòng nhập tên danh mục")
      return false
    }
    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    onSubmit({
      name: form.name.trim(),

      parent_id: isParentLocked ? null : form.parent_id || null,
    })
  }

  // Không cho chọn chính nó làm cha của chính nó
  const availableParents = parentOptions.filter(
    (p) => !initialData || String(p._id) !== String(initialData._id),
  )

  return (
    <div className="mc-panel">
      <div className="mc-panel__header">
        <span className="mc-panel__icon">
          <i className="fa-solid fa-table-cells"></i>
        </span>
        <h3>{isEditing ? "Sửa danh mục" : "Thêm danh mục"}</h3>
        <button
          type="button"
          className="mc-panel__close"
          onClick={onClose}
          aria-label="Đóng"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mc-panel__form"
      >
        <label className="mc-field">
          <span>
            Tên danh mục <b>*</b>
          </span>
          <input
            type="text"
            placeholder="Nhập tên danh mục"
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
          />
        </label>

        <label className="mc-field">
          <span>Danh mục cha</span>
          <select
            value={isParentLocked ? "" : form.parent_id}
            disabled={isParentLocked}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, parent_id: e.target.value }))
            }
          >
            <option value="">Không có (Danh mục gốc)</option>
            {availableParents.map((p) => (
              <option
                key={p._id}
                value={p._id}
              >
                {p.name}
              </option>
            ))}
          </select>
          {isParentLocked && (
            <span className="mc-field__hint">
              Danh mục này đang có danh mục con nên không thể đặt làm con của
              danh mục khác.
            </span>
          )}
        </label>

        <div className="mc-info-box">
          <i className="fa-solid fa-circle-info"></i>
          <p>
            Nếu chọn danh mục cha, danh mục này sẽ là danh mục con của danh mục
            đó.
          </p>
        </div>

        <div className="mc-panel__footer">
          <button
            type="button"
            className="mc-btn mc-btn--cancel"
            onClick={onClose}
          >
            Huỷ
          </button>
          <button
            type="submit"
            className="mc-btn mc-btn--submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang lưu..." : "Lưu danh mục"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CategoryFormPanel
