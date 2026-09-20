import React, { useEffect, useRef, useState } from "react"
import { toast } from "../../pages/Toast/Toast"

const INITIAL_FORM = { name: "" }

// Backend trả logo_url dạng "/brand/xxx.png" -> cần ghép domain gốc (không có /api)
const STATIC_BASE_URL = (import.meta.env.VITE_APP_URL || "").replace(
  /\/api\/?$/,
  "",
)

const BrandFormPanel = ({ onClose, onSubmit, initialData, isSubmitting }) => {
  const [form, setForm] = useState(INITIAL_FORM)
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)
  const isEditing = !!initialData

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
      })
      setLogoPreview(`${STATIC_BASE_URL}${initialData.logo_url}`)
    } else {
      setForm(INITIAL_FORM)
      setLogoPreview("")
    }
    setLogoFile(null)
  }, [initialData])

  const applyFile = (file) => {
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleFileInput = (e) => applyFile(e.target.files?.[0])

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    applyFile(e.dataTransfer.files?.[0])
  }

  const handleRemoveLogo = (e) => {
    e.stopPropagation()
    setLogoFile(null)
    setLogoPreview("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const validate = () => {
    if (!form.name.trim()) {
      toast.warning("Vui lòng nhập tên thương hiệu")
      return false
    }
    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const formData = new FormData()
    formData.append("name", form.name.trim())

    if (logoFile) {
      formData.append("logo_url", logoFile)
    }

    onSubmit(formData)
  }

  return (
    <div className="mb-panel">
      <div className="mb-panel__header">
        <span className="mb-panel__icon">
          <i className="fa-solid fa-tag"></i>
        </span>
        <h3>{isEditing ? "Sửa thương hiệu" : "Thêm thương hiệu"}</h3>
        <button
          type="button"
          className="mb-panel__close"
          onClick={onClose}
          aria-label="Đóng"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-panel__form"
      >
        <label className="mb-field">
          <span>
            Tên thương hiệu <b>*</b>
          </span>
          <input
            type="text"
            placeholder="Nhập tên thương hiệu"
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        </label>

        <div className="mb-field">
          <span>Logo</span>
          <div
            className={`mb-dropzone ${isDragging ? "is-dragging" : ""} ${
              logoPreview ? "has-image" : ""
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="mb-dropzone__input"
              onChange={handleFileInput}
            />

            {logoPreview ? (
              <div className="mb-dropzone__preview">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                />
                <button
                  type="button"
                  className="mb-dropzone__remove"
                  onClick={handleRemoveLogo}
                  aria-label="Xoá logo"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            ) : (
              <div className="mb-dropzone__placeholder">
                <i className="fa-solid fa-cloud-arrow-up"></i>
                <p>Nhấn hoặc kéo thả để tải lên logo</p>
              </div>
            )}
          </div>
        </div>

        <div className="mb-panel__footer">
          <button
            type="button"
            className="mb-btn mb-btn--cancel"
            onClick={onClose}
          >
            Huỷ
          </button>
          <button
            type="submit"
            className="mb-btn mb-btn--submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang lưu..." : "Lưu thương hiệu"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default BrandFormPanel
