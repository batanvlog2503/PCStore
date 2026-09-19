const express = require("express")

const router = express.Router()

const auth = require("../app/middlewares/auth")
const authorize = require("../app/middlewares/authorize")
const QuestionController = require("../app/controllers/QuestionController")

// Khách đã đăng nhập gửi câu hỏi
router.post("/add", auth, authorize("user"), QuestionController.create)

// Public xem các câu hỏi đã được admin trả lời
router.get("/approved", QuestionController.getApproved)

// Xem chi tiết câu hỏi
router.get("/:id", auth, authorize("admin", "user"), QuestionController.getById)

router.get(
  "/admin/all",
  auth,
  authorize("admin", "user"),
  QuestionController.getAll,
)

// Admin xem chi tiết câu hỏi
router.get("/admin/:id", auth, authorize("admin"), QuestionController.getById)

// Admin trả lời câu hỏi
router.patch(
  "/admin/:id/reply",
  auth,
  authorize("admin"),
  QuestionController.reply,
)

// Admin ẩn câu hỏi
router.patch(
  "/admin/:id/hide",
  auth,
  authorize("admin"),
  QuestionController.hide,
)

// Admin xóa câu hỏi
router.delete("/admin/:id", auth, authorize("admin"), QuestionController.delete)

module.exports = router
