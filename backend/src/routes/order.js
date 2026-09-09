const express = require("express")
const auth = require("../app/middlewares/auth")
const {
  addOrderValidator,
  updateOrderValidator,
} = require("../helpers/validationOrder")
const router = express.Router()
const authorize = require("../app/middlewares/authorize")
// Đến khi làm Checkout thì mới sửa lại:

// Không cho gửi user_id.
// Không cho gửi total_amount.
// Không cho gửi order_code.
// Không cho gửi status.
// Không cho gửi payment_status.

// Backend sẽ tự lấy và tự tính các giá trị đó
const OrderController = require("../app/controllers/OrderController")
router.get("/my-orders", auth, authorize("user"), OrderController.getMyOrders)
router.get("/all", auth, authorize("user"), OrderController.getAllOrders)
router.get(
  "/code/:code",
  auth,
  authorize("user"),
  OrderController.getOrderByOrderCode,
)
router.get("/:id", auth, authorize("user"), OrderController.getOrderById)
router.patch(
  "/:id/cancel",
  auth,
  authorize("user"),
  OrderController.cancelOrder,
)
router.post(
  "/add",
  auth,
  authorize("user"),
  addOrderValidator,
  OrderController.createOrder,
)
router.patch(
  "/update/:id/status",
  auth,
  authorize("user"),
  OrderController.updateOrderStatus,
)
router.put(
  "/update/:id",
  auth,
  authorize("user"),
  updateOrderValidator,
  OrderController.updateOrder,
)

router.delete(
  "/delete/:id",
  auth,
  authorize("user"),
  OrderController.deleteOrder,
)

router.patch(
  "/status/:id",
  auth,
  authorize("user"),
  OrderController.updateStatus,
)
router.patch(
  "/cancel/:id",
  auth,
  authorize("user"),
  OrderController.cancelOrder,
)

router.patch(
  "/payment/:id",
  auth,
  authorize("user"),
  OrderController.updatePaymentStatus,
)
module.exports = router
