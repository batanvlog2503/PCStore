const QuestionService = require("../services/QuestionService")

class QuestionController {
  // Khách gửi câu hỏi
  async create(req, res, next) {
    try {
      const userId = req.user._id
      const { content } = req.body

      const data = await QuestionService.createQuestion(userId, content)

      return res.status(201).json({
        success: true,
        message: "Gửi câu hỏi thành công",
        data,
      })
    } catch (error) {
      next(error)
    }
  }

  async getApproved(req, res, next) {
    try {
      const { page = 1, limit = 5 } = req.query

      const data = await QuestionService.getPublicQuestions(page, limit)

      return res.status(200).json({
        success: true,
        data,
      })
    } catch (error) {
      next(error)
    }
  }

  // Admin: lấy tất cả câu hỏi
  async getAll(req, res, next) {
    try {
      const data = await QuestionService.getAllQuestions()

      return res.status(200).json({
        success: true,
        message: "Get All Questions successfully",
        data,
      })
    } catch (error) {
      next(error)
    }
  }

  // Admin hoặc user: lấy chi tiết
  async getById(req, res, next) {
    try {
      const { id } = req.params

      const data = await QuestionService.getQuestionById(id)

      return res.status(200).json({
        success: true,
        message: "lấy câu hỏi thành công !",
        data,
      })
    } catch (error) {
      next(error)
    }
  }

  // Admin trả lời
  async reply(req, res, next) {
    try {
      const { id } = req.params
      const { admin_reply } = req.body

      const data = await QuestionService.replyQuestion(id, admin_reply)

      return res.status(200).json({
        success: true,
        message: "Trả lời câu hỏi thành công",
        data,
      })
    } catch (error) {
      next(error)
    }
  }

  // Admin ẩn câu hỏi
  async hide(req, res, next) {
    try {
      const { id } = req.params

      const data = await QuestionService.hideQuestion(id)

      return res.status(200).json({
        success: true,
        message: "Ẩn câu hỏi thành công",
        data,
      })
    } catch (error) {
      next(error)
    }
  }

  // Admin xóa
  async delete(req, res, next) {
    try {
      const { id } = req.params

      const data = await QuestionService.deleteQuestion(id)

      return res.status(200).json({
        success: true,
        message: "Xóa câu hỏi thành công",
        ...data,
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new QuestionController()
