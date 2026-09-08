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
  auth,
  authorize("user"),
  ProductVariantController.getAllVariantsAndImage,
)
router.get(
  "/top-selling",
  auth,
  authorize("user", "admin"),
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
router.get("/:id", auth, ProductVariantController.getVariantById)
router.post(
  "/add",
  auth,
  addProductVariantValidator,
  ProductVariantController.addVariant,
)
router.delete("/delete/:id", auth, ProductVariantController.deleteVariant)
router.put(
  "/update/:id",
  auth,
  updateProductVariantValidator,
  ProductVariantController.updateVariant,
)
module.exports = router
