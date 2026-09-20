const express = require("express")
const auth = require("../app/middlewares/auth")

const VoucherController = require("../app/controllers/VoucherController")
const {
  addVoucherValidator,
  updateVoucherValidator,
} = require("../helpers/validationVoucher")
const authorize = require("../app/middlewares/authorize")
const router = express.Router()

router.get(
  "/intro",

  VoucherController.getIntroVouchers,
)
router.get(
  "/my",

  VoucherController.getMyVouchers,
)
router.post("/apply", VoucherController.applyVoucher)
router.get(
  "/claimed-ids",

  VoucherController.getClaimedIds,
)
router.get("/all", VoucherController.getAll)
router.get(
  "/active",

  VoucherController.getActiveVouchers,
)
router.get(
  "/code/:code",
  auth,
  authorize("admin", "user"),
  VoucherController.getVoucherByCode,
)

router.get(
  "/:id",
  auth,
  authorize("admin", "user"),
  VoucherController.getVoucherById,
)

router.post(
  "/add",
  auth,
  authorize("admin"),
  addVoucherValidator,
  VoucherController.createVoucher,
)
// Nhận voucher
router.post("/claim", auth, authorize("admin"), VoucherController.claimVoucher)
router.put(
  "/update/:id",
  auth,
  authorize("admin"),
  updateVoucherValidator,
  VoucherController.updateVoucher,
)

router.delete(
  "/delete/:id",
  auth,
  authorize("admin"),
  VoucherController.deleteVoucher,
)

router.post(
  "/validate",
  auth,
  authorize("user"),
  VoucherController.validateVoucher,
)

module.exports = router
