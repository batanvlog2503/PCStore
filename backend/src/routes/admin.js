const express = require("express")
const auth = require("../app/middlewares/auth")
const router = express.Router()

const DashboardController = require("../app/controllers/DashboardController")

const authorize = require("../app/middlewares/authorize")

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
module.exports = router
