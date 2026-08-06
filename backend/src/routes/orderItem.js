const express = require("express")
const router = express.Router()

const auth = require("../app/middlewares/auth")
const OrderItemController = require("../app/controllers/OrderItemController")

router.get("/all", auth, OrderItemController.getAllOrderItems)

router.get("/order/:orderId", auth, OrderItemController.getOrderItemsByOrder)

router.get("/:id", auth, OrderItemController.getOrderItemById)

router.post("/add", auth, OrderItemController.createOrderItem)

router.put("/update/:id", auth, OrderItemController.updateOrderItem)

router.delete("/delete/:id", auth, OrderItemController.deleteOrderItem)

module.exports = router
