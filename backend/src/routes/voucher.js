const express = require("express")
const auth = require("../app/middlewares/auth")

const VoucherController = require("../app/controllers/VoucherController")

const authorize = require("../app/middlewares/authorize")
const router = express.Router()

router.get(
  "/intro",

  VoucherController.getIntroVouchers,
)
router.get("/my", auth, authorize("user"), VoucherController.getMyVouchers)
router.post("/apply", auth, authorize("user"), VoucherController.applyVoucher)
router.get(
  "/claimed-ids",
  auth,
  authorize("user"),
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

// Nhận voucher
router.post("/claim", auth, authorize("admin"), VoucherController.claimVoucher)

router.post(
  "/validate",
  auth,
  authorize("user"),
  VoucherController.validateVoucher,
)

module.exports = router
