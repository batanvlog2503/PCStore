const express = require("express")

const auth = require("../app/middlewares/auth")
const ProductController = require("../app/controllers/ProductController")
const router = express.Router()
const authorize = require("../app/middlewares/authorize")
const {
  addProductValidator,
  updateProductValidator,
} = require("../helpers/validationProduct")

router.get("/name/all", ProductController.getIdAndNameProduct)
router.get("/slug/:slug", ProductController.getProductBySlug)
router.get("/all", ProductController.getAllProducts)
router.post(
  "/add",
  auth,
  authorize("admin"),
  addProductValidator,
  ProductController.createProduct,
)
router.put(
  "/update/:id",
  auth,
  authorize("admin"),
  updateProductValidator,
  ProductController.updateProduct,
)
router.get("/bestseller", auth, ProductController.getBestSeller)

//===============GUEST=============
router.get("/:productId", ProductController.getProductDetail)
module.exports = router
