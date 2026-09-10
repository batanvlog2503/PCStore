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
  auth,
  authorize("user"),
  VoucherController.getIntroVouchers,
)
router.get(
  "/my",
  auth,
  authorize("user", "admin"),
  VoucherController.getMyVouchers,
)
router.post("/apply", auth, authorize("user"), VoucherController.applyVoucher)
router.get(
  "/claimed-ids",
  auth,
  authorize("user"),
  VoucherController.getClaimedIds,
)
router.get("/all", auth, authorize("user"), VoucherController.getAll)
router.get(
  "/active",
  auth,
  authorize("user"),
  VoucherController.getActiveVouchers,
)
router.get(
  "/code/:code",
  auth,
  authorize("user"),
  VoucherController.getVoucherByCode,
)

router.get("/:id", auth, authorize("user"), VoucherController.getVoucherById)

router.post(
  "/add",
  auth,
  authorize("user"),
  addVoucherValidator,
  VoucherController.createVoucher,
)
// Nhận voucher
router.post("/claim", auth, authorize("user"), VoucherController.claimVoucher)
router.put(
  "/update/:id",
  auth,
  authorize("user"),
  updateVoucherValidator,
  VoucherController.updateVoucher,
)

router.delete(
  "/delete/:id",
  auth,
  authorize("user"),
  VoucherController.deleteVoucher,
)

router.post(
  "/validate",
  auth,
  authorize("user"),
  VoucherController.validateVoucher,
)

module.exports = router
