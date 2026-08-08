const express = require("express")
const auth = require("../app/middlewares/auth")
const {
  addProductVariantValidator,
  updateProductVariantValidator,
} = require("../helpers/validationProductVariant")
const router = express.Router()

const ProductVariantController = require("../app/controllers/ProductVariantController")
router.get("/image/all", auth, ProductVariantController.getAllVariantsAndImage)
router.get("/all/id", auth, ProductVariantController.getAllId)
router.get("/all", auth, ProductVariantController.getAllVariants)
router.get(
  "/product/:productId",
  auth,
  ProductVariantController.getVariantsByProduct,
)
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
