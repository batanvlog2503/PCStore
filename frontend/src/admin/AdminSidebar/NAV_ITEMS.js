export const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: "fa-solid fa-gauge", end: true },
  {
    label: "Sản phẩm",
    icon: "fa-solid fa-box",
    children: [
      { to: "/admin/products", label: "Danh sách" },
      { to: "/admin/products/new", label: "Thêm mới" },
      { to: "/admin/categories", label: "Danh mục" },
    ],
  },
  { to: "/admin/orders", label: "Đơn hàng", icon: "fa-solid fa-receipt" },
  { to: "/admin/manage-user", label: "Khách hàng", icon: "fa-solid fa-users" },
  { to: "/admin/vouchers", label: "Voucher", icon: "fa-solid fa-ticket" },
  { to: "/admin/reviews", label: "Đánh giá", icon: "fa-solid fa-star" },
  { to: "/admin/settings", label: "Thiết lập", icon: "fa-solid fa-gear" },
]
