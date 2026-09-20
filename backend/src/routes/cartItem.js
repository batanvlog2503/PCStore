const express = require("express")
const auth = require("../app/middlewares/auth")
const router = express.Router()
const CartItemController = require("../app/controllers/CartItemController")

router.get("/all", auth, CartItemController.getAllCartItems)
router.get("/:cartId", auth, CartItemController.getCartItems)
router.post("/add", auth, CartItemController.addCartItem)
router.put("/update/:id", auth, CartItemController.updateQuantity)
router.delete("/delete/:id", auth, CartItemController.deleteCartItem)
router.delete("/clear/:cartId", auth, CartItemController.clearCartItem)

//aggregation

router.get("/summary/:cartId", auth, CartItemController.getCartSummary)
module.exports = router
