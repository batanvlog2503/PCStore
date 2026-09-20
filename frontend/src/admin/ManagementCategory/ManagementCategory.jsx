import React, { useCallback, useEffect, useMemo, useState } from "react"
import axiosInstance from "../../utils/axiosInstance.js"
import { toast } from "../../pages/Toast/Toast.jsx"
import CategoryList from "./CategoryList.jsx"
import CategoryFormPanel from "./CategoryFormPanel.jsx"
import "./ManagementCategory.scss"

function flattenTree(nodes, ancestors = []) {
  let result = []
  for (const node of nodes) {
    const parent = ancestors[ancestors.length - 1] || null
    result.push({
      _id: node._id,
      name: node.name,
      slug: node.slug,
      depth: ancestors.length,
      parentId: parent?._id || null,
      parentName: parent?.name || null,
      ancestorIds: ancestors.map((a) => a._id),
      hasChildren: !!(node.children && node.children.length > 0),
    })
    if (node.children && node.children.length > 0) {
      result = result.concat(flattenTree(node.children, [...ancestors, node]))
    }
  }
  return result
}

const ManagementCategory = () => {
  const [stats, setStats] = useState({ total: 0, parents: 0, children: 0 })
  const [tree, setTree] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getTree = useCallback(async (keyword = "") => {
    try {
      setIsLoading(true)

      const response = await axiosInstance.get(
        `${import.meta.env.VITE_APP_URL}/admin/category/all/tree`,
      )

      setTree(response.data.categories || [])
      setStats(response.data.stats || { total: 0, parents: 0, children: 0 })
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không tải được danh sách danh mục",
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  // load lần đầu
  useEffect(() => {
    getTree()
  }, [getTree])

  useEffect(() => {
    getTree()
  }, [])

  const flatRows = useMemo(() => flattenTree(tree), [tree])

  // Danh mục gốc, dùng cho dropdown "danh mục cha" trong form thêm/sửa
  const parentOptions = useMemo(
    () => tree.map((c) => ({ _id: c._id, name: c.name })),
    [tree],
  )

  // ================= CRUD =================

  const handleOpenCreate = () => {
    setEditingCategory(null)
    setIsPanelOpen(true)
  }

  const handleOpenEdit = (row) => {
    setEditingCategory(row)
    setIsPanelOpen(true)
  }

  const handleClosePanel = () => {
    if (isSubmitting) return
    setIsPanelOpen(false)
    setEditingCategory(null)
  }

  const handleSubmitCategory = async (payload) => {
    try {
      setIsSubmitting(true)

      if (editingCategory) {
        await axiosInstance.put(
          `${import.meta.env.VITE_APP_URL}/admin/category/update/${editingCategory._id}`,
          payload,
        )
        toast.success("Cập nhật danh mục thành công")
      } else {
        await axiosInstance.post(
          `${import.meta.env.VITE_APP_URL}/admin/category/add`,
          payload,
        )
        toast.success("Thêm danh mục thành công")
      }

      setIsPanelOpen(false)
      setEditingCategory(null)
      await getTree()
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          (editingCategory
            ? "Cập nhật danh mục thất bại"
            : "Thêm danh mục thất bại"),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (row) => {
    if (
      !window.confirm(
        `Xoá danh mục "${row.name}"? Hành động này không thể hoàn tác.`,
      )
    ) {
      return
    }

    try {
      await axiosInstance.delete(
        `${import.meta.env.VITE_APP_URL}/admin/category/delete/${row._id}`,
      )
      toast.success("Đã xoá danh mục")
      await getTree()
    } catch (error) {
      toast.error(error.response?.data?.message || "Xoá danh mục thất bại")
    }
  }

  return (
    <div className="management-category">
      <div className={`mc-main ${isPanelOpen ? "mc-main--with-panel" : ""}`}>
        <CategoryList
          rows={flatRows}
          stats={stats}
          isLoading={isLoading}
          onAddNew={handleOpenCreate}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />
      </div>

      {isPanelOpen && (
        <CategoryFormPanel
          onClose={handleClosePanel}
          onSubmit={handleSubmitCategory}
          initialData={editingCategory}
          parentOptions={parentOptions}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  )
}

export default ManagementCategory
