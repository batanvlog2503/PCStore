import React, { useMemo, useState } from "react"

const CategoryList = ({
  rows,
  stats,
  isLoading,

  onAddNew,
  onEdit,
  onDelete,
}) => {
  // id đang bị thu gọn -- ẩn mọi hậu duệ của nó (kiểm qua ancestorIds)
  const [collapsedIds, setCollapsedIds] = useState(() => new Set())

  const visibleRows = useMemo(
    () =>
      rows.filter(
        (row) => !row.ancestorIds.some((id) => collapsedIds.has(String(id))),
      ),
    [rows, collapsedIds],
  )

  const toggleCollapse = (id) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const STAT_CARDS = [
    {
      key: "total",
      label: "Tổng danh mục",
      value: stats.total,
      icon: "fa-solid fa-folder-tree",
      tone: "blue",
    },
    {
      key: "parents",
      label: "Danh mục cha",
      value: stats.parents,
      icon: "fa-solid fa-table-cells",
      tone: "green",
    },
    {
      key: "children",
      label: "Danh mục con",
      value: stats.children,
      icon: "fa-solid fa-code-branch",
      tone: "purple",
    },
  ]

  return (
    <div className="mc-list">
      {/* ================= HEADER ================= */}
      <div className="mc-header">
        <div className="mc-header__icon">
          <i className="fa-solid fa-table-cells"></i>
        </div>
        <div className="mc-header__text">
          <h1>Quản lý danh mục</h1>
          <p>Quản lý danh mục sản phẩm của cửa hàng</p>
        </div>
        <button
          type="button"
          className="mc-add-btn"
          onClick={onAddNew}
        >
          <i className="fa-solid fa-plus"></i> Thêm danh mục
        </button>
      </div>

      <div className="mc-stats">
        {STAT_CARDS.map((s) => (
          <div
            key={s.key}
            className="mc-stat"
          >
            <span className={`mc-stat__icon tone-${s.tone}`}>
              <i className={s.icon}></i>
            </span>
            <div>
              <p className="mc-stat__label">{s.label}</p>
              <p className="mc-stat__value">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mc-table-wrap">
        <table className="mc-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên danh mục</th>
              <th>Slug</th>
              <th>Danh mục cha</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td
                  colSpan={5}
                  className="mc-empty"
                >
                  Đang tải danh mục...
                </td>
              </tr>
            )}

            {!isLoading && visibleRows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="mc-empty"
                >
                  Không có danh mục nào khớp với bộ lọc.
                </td>
              </tr>
            )}

            {!isLoading &&
              visibleRows.map((row, index) => {
                const isChild = row.depth > 0
                const isCollapsed = collapsedIds.has(String(row._id))

                return (
                  <tr
                    key={row._id}
                    className={isChild ? "mc-row--child" : ""}
                  >
                    <td>{index + 1}</td>
                    <td>
                      <div
                        className="mc-name-cell"
                        style={{ paddingLeft: row.depth * 20 }}
                      >
                        {isChild && <span className="mc-connector" />}

                        {row.hasChildren ? (
                          <button
                            type="button"
                            className="mc-toggle"
                            onClick={() => toggleCollapse(String(row._id))}
                            aria-label={isCollapsed ? "Mở rộng" : "Thu gọn"}
                          >
                            <i
                              className={`fa-solid fa-chevron-${isCollapsed ? "right" : "down"}`}
                            ></i>
                          </button>
                        ) : (
                          <span className="mc-toggle mc-toggle--placeholder" />
                        )}

                        <i
                          className={`fa-solid fa-folder mc-folder-icon ${
                            isChild ? "is-child" : "is-parent"
                          }`}
                        ></i>
                        <span className={isChild ? "" : "mc-name--parent"}>
                          {row.name}
                        </span>
                      </div>
                    </td>
                    <td className="mc-slug">{row.slug}</td>
                    <td>{row.parentName || "-"}</td>
                    <td>
                      <div className="mc-actions">
                        <button
                          type="button"
                          className="mc-icon-btn mc-icon-btn--edit"
                          onClick={() => onEdit(row)}
                          aria-label={`Sửa ${row.name}`}
                        >
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button
                          type="button"
                          className="mc-icon-btn mc-icon-btn--delete"
                          onClick={() => onDelete(row)}
                          aria-label={`Xoá ${row.name}`}
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CategoryList
