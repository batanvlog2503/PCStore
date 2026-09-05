const express = require("express")
const auth = require("../app/middlewares/auth")
const {
  addOrderValidator,
  updateOrderValidator,
} = require("../helpers/validationOrder")
const router = express.Router()
// Đến khi làm Checkout thì mới sửa lại:

// Không cho gửi user_id.
// Không cho gửi total_amount.
// Không cho gửi order_code.
// Không cho gửi status.
// Không cho gửi payment_status.

// Backend sẽ tự lấy và tự tính các giá trị đó
const OrderController = require("../app/controllers/OrderController")
router.get("/my-orders", auth, OrderController.getMyOrders)
router.get("/all", auth, OrderController.getAllOrders)
router.get("/code/:code", auth, OrderController.getOrderByOrderCode)
router.get("/:id", auth, OrderController.getOrderById)
router.patch("/:id/cancel", auth, OrderController.cancelOrder)
router.post("/add", auth, addOrderValidator, OrderController.createOrder)
router.patch("/update/:id/status", auth, OrderController.updateOrderStatus)
router.put(
  "/update/:id",
  auth,
  updateOrderValidator,
  OrderController.updateOrder,
)

router.delete("/delete/:id", auth, OrderController.deleteOrder)

router.patch("/status/:id", auth, OrderController.updateStatus)
router.patch("/cancel/:id", auth, OrderController.cancelOrder)

router.patch("/payment/:id", auth, OrderController.updatePaymentStatus)
module.exports = router
