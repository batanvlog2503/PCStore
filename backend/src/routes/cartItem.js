const express = require("express")
const auth = require("../app/middlewares/auth")
const router = express.Router()
const CartItemController = require("../app/controllers/CartItemController")

router.get("/all", CartItemController.getAllCartItems)
router.get("/:cartId", CartItemController.getCartItems)
router.post("/add", CartItemController.addCartItem)
router.put("/update/:id", CartItemController.updateQuantity)
router.delete("/delete/:id", CartItemController.deleteCartItem)
router.delete("/clear/:cartId", CartItemController.clearCartItem)

//aggregation

router.get("/summary/:cartId", auth, CartItemController.getCartSummary)
module.exports = router
