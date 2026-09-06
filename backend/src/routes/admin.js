const express = require("express")
const auth = require("../app/middlewares/auth")
const router = express.Router()
const OrderController = require("../app/controllers/OrderController")
const DashboardController = require("../app/controllers/DashboardController")
const UserController = require("../app/controllers/UserController")
const authorize = require("../app/middlewares/authorize")
const OrderItemController = require("../app/controllers/OrderItemController")
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
module.exports = router
