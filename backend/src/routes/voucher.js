const express = require("express")
const auth = require("../app/middlewares/auth")

const VoucherController = require("../app/controllers/VoucherController")
const {
  addVoucherValidator,
  updateVoucherValidator,
} = require("../helpers/validationVoucher")

const router = express.Router()

router.get("/all", auth, VoucherController.getAllVouchers)
router.get("/active", auth, VoucherController.getActiveVouchers)
router.get("/code/:code", auth, VoucherController.getVoucherByCode)

router.get("/:id", auth, VoucherController.getVoucherById)

router.post("/add", auth, addVoucherValidator, VoucherController.createVoucher)

router.put(
  "/update/:id",
  auth,
  updateVoucherValidator,
  VoucherController.updateVoucher,
)

router.delete("/delete/:id", auth, VoucherController.deleteVoucher)

router.post("/validate", auth, VoucherController.validateVoucher)
module.exports = router
