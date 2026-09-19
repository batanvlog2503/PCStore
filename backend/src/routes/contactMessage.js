const ContactMessageController = require("../app/controllers/ContactMessageController")
const express = require("express")
const auth = require("../app/middlewares/auth")

const router = express.Router()
const authorize = require("../app/middlewares/authorize")
router.get(
  "/contact-message/all",
  auth,
  authorize("admin", "user"),
  ContactMessageController.getAll,
)
router.post(
  "/contact-message/add",
  auth,
  authorize("user"),
  ContactMessageController.create,
)
router.get(
  "/contact-message/:id",
  auth,
  authorize("admin", "user"),
  ContactMessageController.getById,
)

router.patch(
  "/contact-message/:id/status",
  auth,
  authorize("admin", "user"),
  ContactMessageController.updateStatus,
)

router.delete(
  "/contact-message/:id",
  auth,
  authorize("admin", "user"),
  ContactMessageController.delete,
)

module.exports = router
