const express = require("express")
const auth = require("../app/middlewares/auth")
const router = express.Router()
const CartController = require("../app/controllers/CartController")
router.get("/all", CartController.getAllCarts)
router.get("/my-cart/all", CartController.getMyCartItems)
router.get("/:id", CartController.getCartById)

router.get("/user/:userId", CartController.getCartByUserId)

router.post("/add", CartController.createCart)

router.delete("/delete/:id", CartController.deleteCart)
module.exports = router
