import React from "react"
import "./ConfirmDeleteModal.scss"

const ConfirmDeleteModal = ({ product, onClose, onConfirm, loading }) => {
  if (!product) return null

  return (
    <div
      className="confirm-delete-backdrop"
      onClick={() => !loading && onClose()}
    >
      <div
        className="confirm-delete-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cdm-icon">
          <i className="fa-solid fa-triangle-exclamation"></i>
        </div>

        <h3>Xoá sản phẩm?</h3>
        <p>
          Bạn có chắc muốn xoá sản phẩm <strong>{product.name}</strong> (mã{" "}
          <strong>{product.sku}</strong>)? Sản phẩm sẽ được chuyển vào mục "Đã
          xoá", bạn có thể khôi phục lại sau nếu cần.
        </p>

        <div className="cdm-actions">
          <button
            className="cdm-cancel-btn"
            onClick={onClose}
            disabled={loading}
          >
            Huỷ
          </button>
          <button
            className="cdm-confirm-btn"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <i className="fa-solid fa-spinner fa-spin"></i>
            ) : (
              <>
                <i className="fa-regular fa-trash-can"></i> Xoá sản phẩm
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDeleteModal
