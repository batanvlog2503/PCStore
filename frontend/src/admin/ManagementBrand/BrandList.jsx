import React from "react"

const STATIC_BASE_URL = (import.meta.env.VITE_APP_URL || "").replace(
  /\/api\/?$/,
  "",
)

const BrandList = ({ rows, isLoading, onAddNew, onEdit, onDelete }) => {
  return (
    <div className="mb-list">
      <div className="mb-header">
        <div className="mb-header__icon">
          <i className="fa-solid fa-tag"></i>
        </div>
        <div className="mb-header__text">
          <h1>Quản lý thương hiệu</h1>
          <p>Quản lý các thương hiệu sản phẩm trong cửa hàng</p>
        </div>
        <button
          type="button"
          className="mb-add-btn"
          onClick={onAddNew}
        >
          <i className="fa-solid fa-plus"></i> Thêm thương hiệu
        </button>
      </div>

      <div className="mb-table-wrap">
        <table className="mb-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Logo</th>
              <th>Tên thương hiệu</th>
              <th>Slug</th>

              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td
                  colSpan={6}
                  className="mb-empty"
                >
                  <div className="mb-spinner" />
                  Đang tải thương hiệu...
                </td>
              </tr>
            )}

            {!isLoading && rows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="mb-empty"
                >
                  Chưa có thương hiệu nào.
                </td>
              </tr>
            )}

            {!isLoading &&
              rows.map((row, index) => (
                <tr
                  key={row._id}
                  className="mb-row"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <td>{index + 1}</td>
                  <td>
                    <div className="mb-logo">
                      {row.logo_url ? (
                        <img
                          src={`${STATIC_BASE_URL}${row.logo_url}`}
                          alt={row.name}
                        />
                      ) : (
                        <span className="mb-logo__placeholder">
                          <i className="fa-solid fa-image"></i>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="mb-name">{row.name}</td>
                  <td className="mb-slug">{row.slug || "—"}</td>

                  <td>
                    <div className="mb-actions">
                      <button
                        type="button"
                        className="mb-icon-btn mb-icon-btn--edit"
                        onClick={() => onEdit(row)}
                        aria-label={`Sửa ${row.name}`}
                      >
                        <i className="fa-solid fa-pen"></i>
                      </button>
                      <button
                        type="button"
                        className="mb-icon-btn mb-icon-btn--delete"
                        onClick={() => onDelete(row)}
                        aria-label={`Xoá ${row.name}`}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {!isLoading && rows.length > 0 && (
        <div className="mb-footer">
          <span>Tổng số {rows.length} thương hiệu</span>
        </div>
      )}
    </div>
  )
}

export default BrandList
