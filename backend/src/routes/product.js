const express = require("express")

const auth = require("../app/middlewares/auth")
const ProductController = require("../app/controllers/ProductController")
const router = express.Router()

const {
  addProductValidator,
  updateProductValidator,
} = require("../helpers/validationProduct")
const Product = require("../app/models/Product")
router.get("/slug/:slug", auth, ProductController.getProductBySlug)
router.get("/all", auth, ProductController.getAllProducts)
router.post("/add", auth, addProductValidator, ProductController.createProduct)
router.put(
  "/update/:id",
  auth,
  updateProductValidator,
  ProductController.updateProduct,
)

module.exports = router
