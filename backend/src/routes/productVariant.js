const express = require("express")
const auth = require("../app/middlewares/auth")
const {
  addProductVariantValidator,
  updateProductVariantValidator,
} = require("../helpers/validationProductVariant")
const router = express.Router()
const authorize = require("../app/middlewares/authorize")
const ProductVariantController = require("../app/controllers/ProductVariantController")
router.get(
  "/image/all",

  ProductVariantController.getAllVariantsAndImage,
)
router.get(
  "/top-selling",

  ProductVariantController.getTopSelling,
)
router.get("/all/id", auth, ProductVariantController.getAllId)
router.get("/all", auth, ProductVariantController.getAllVariants)
router.get(
  "/product/:productId",
  auth,
  ProductVariantController.getVariantsByProduct,
)
// Lấy 1 variant theo ID
router.get("/:id", ProductVariantController.getVariantById)
router.post(
  "/add",
  auth,
  authorize("admin"),
  addProductVariantValidator,
  ProductVariantController.addVariant,
)
router.delete(
  "/delete/:id",
  auth,
  authorize("admin"),
  ProductVariantController.deleteVariant,
)
router.put(
  "/update/:id",
  auth,
  authorize("admin"),
  updateProductVariantValidator,
  ProductVariantController.updateVariant,
)
module.exports = router
