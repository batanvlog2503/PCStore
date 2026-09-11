const express = require("express")
const auth = require("../app/middlewares/auth")
const router = express.Router()
const OrderController = require("../app/controllers/OrderController")
const DashboardController = require("../app/controllers/DashboardController")
const UserController = require("../app/controllers/UserController")
const authorize = require("../app/middlewares/authorize")
const OrderItemController = require("../app/controllers/OrderItemController")
const ProductController = require("../app/controllers/ProductController")
const BrandController = require("../app/controllers/BrandController")
const ProductVariantController = require("../app/controllers/ProductVariantController")
const CategoryController = require("../app/controllers/CategoryController")
const ProductImageController = require("../app/controllers/ProductImageController")
const multer = require("multer")
const path = require("path")
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/product"))
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname)

    const name = `product-${Date.now()}-${Math.round(
      Math.random() * 1e9,
    )}${ext}`

    cb(null, name)
  },
})

const fileFilter = (req, file, cb) => {
  const typeFile = ["image/jpeg", "image/png", "image/jpg"]
  if (typeFile.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error("Chỉ cho phép upload file ảnh"), false)
  }
}

const upload = multer({ storage: storage, fileFilter: fileFilter })
router.get(
  "/dashboard",
  auth,
  authorize("admin"),
  DashboardController.getDashboard,
)

router.get(
  "/revenue-chart",
  auth,
  authorize("admin"),
  DashboardController.getRevenueChart,
)
router.get(
  "/orders-chart",
  auth,
  authorize("admin"),
  DashboardController.getOrdersChart,
)
router.get(
  "/order-statistic",
  auth,
  authorize("admin"),
  DashboardController.getOrderStatusChart,
)

router.get(
  "/latest-products",
  auth,
  authorize("admin"),
  DashboardController.getLatestProducts,
)
router.get(
  "/top-products",
  auth,
  authorize("admin"),
  DashboardController.getTopProducts,
)

router.get("/all-users", auth, authorize("admin"), UserController.getAllUsers)
router.get(
  "/users/stats",
  auth,
  authorize("admin"),
  UserController.getUserStats,
)
router.post("/add/users", auth, authorize("admin"), UserController.adminAddUser)

router.patch(
  "/users/:id/status",
  auth,
  authorize("admin"),
  UserController.updateUserStatus,
)
router.patch(
  "/users/update/:id",
  auth,
  authorize("admin"),
  UserController.updateUser,
)
router.get(
  "/orders/:id/items",
  auth,
  authorize("admin"),
  OrderItemController.getOrderItems,
)
router.get("/orders", auth, authorize("admin"), OrderController.getAllOrders)
router.patch(
  "/orders/:id/status",
  auth,
  authorize("admin"),
  OrderController.updateOrderStatus,
)
router.put(
  "/products/update/:productId",
  auth,
  authorize("admin"),
  ProductController.updateProduct,
)
router.get(
  "/products/all",
  auth,
  authorize("admin"),
  ProductController.adminGetProducts,
)

// Upload ảnh mới
router.post(
  "/products/:productId/images",
  auth,
  authorize("admin"),
  upload.array("images", 10),
  ProductImageController.uploadImages,
)

// Cập nhật ảnh chính
router.put(
  "/products/:productId/images/main",
  auth,
  authorize("admin"),
  ProductImageController.updateMainImage,
)

// Xóa ảnh
router.delete(
  "/products/images/:imageId",
  auth,
  authorize("admin"),
  ProductImageController.deleteImage,
)
router.put(
  "/variants/:variantId",
  auth,
  authorize("admin"),
  ProductVariantController.updateVariantByVariantId,
)

router.get(
  "/products/all/stats",
  auth,
  authorize("admin"),
  ProductController.adminGetProductStats,
)

router.get(
  "/products/:productId",
  auth,
  authorize("admin"),
  ProductController.adminGetProductDetail,
)
router.post(
  "/products/add",
  auth,
  authorize("admin"),
  upload.array("images", 10), // lưu ý cái images phải giống với images ở fd.images fe
  ProductController.createProduct,
)
router.delete(
  "/products/:id/soft-delete",
  auth,
  authorize("admin"),
  ProductController.softDeleteProduct,
)

router.get(
  "/brands/all",
  auth,
  authorize("admin"),
  BrandController.getAllBrands,
)

router.get(
  "/categories/all",
  auth,
  authorize("admin"),
  CategoryController.getAllCategories,
)

module.exports = router
