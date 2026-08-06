const express = require("express")
const auth = require("../app/middlewares/auth")
const router = express.Router()
const CartController = require("../app/controllers/CartController")
router.get("/all", auth, CartController.getAllCarts)

router.get("/:id", auth, CartController.getCartById)

router.get("/user/:userId", auth, CartController.getCartByUserId)

router.post("/add", auth, CartController.createCart)

router.delete("/delete/:id", auth, CartController.deleteCart)
module.exports = router
