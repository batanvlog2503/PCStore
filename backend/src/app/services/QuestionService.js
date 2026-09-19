const QuestionRepo = require("../repositories/QuestionRepository")
const AppError = require("../utils/AppError")

class QuestionService {
  // Khách gửi câu hỏi
  async createQuestion(userId, content) {
    if (!userId) {
      throw new AppError(401, "Vui lòng đăng nhập")
    }

    if (!content || !content.trim()) {
      throw new AppError(400, "Nội dung câu hỏi không được để trống")
    }

    if (content.trim().length > 1000) {
      throw new AppError(400, "Câu hỏi không được vượt quá 1000 ký tự")
    }

    const question = await QuestionRepo.create({
      user_id: userId,
      content: content.trim(),
      status: "pending",
    })

    return question
  }

  // Lấy các câu hỏi đã được duyệt để hiển thị public
  async getPublicQuestions(page = 1, limit = 5) {
    page = Number(page)
    limit = Number(limit)

    if (page < 1) page = 1
    if (limit < 1) limit = 5

    // Giới hạn để tránh client truyền limit quá lớn
    if (limit > 50) limit = 50

    const skip = (page - 1) * limit

    const [questions, total] = await Promise.all([
      QuestionRepo.findPublicQuestions(skip, limit),
      QuestionRepo.countPublicQuestions(),
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
      questions,
    }
  }

  async getAllQuestions(req) {
    let page = Number(req.query.page) || 1
    let limit = Number(req.query.limit) || 5

    if (page < 1) {
      page = 1
    }

    if (limit < 1) {
      limit = 5
    }

    if (limit > 50) {
      limit = 50
    }

    const skip = (page - 1) * limit

    const { questions, total } = await QuestionRepo.findAll(req, skip, limit)

    const totalPages = Math.ceil(total / limit)

    return {
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
      questions,
    }
  }

  // Lấy chi tiết
  async getQuestionById(id) {
    const question = await QuestionRepo.findById(id)

    if (!question) {
      throw new AppError(404, "Không tìm thấy câu hỏi")
    }

    return question
  }

  // Admin trả lời câu hỏi
  async replyQuestion(id, adminReply) {
    if (!adminReply || !adminReply.trim()) {
      throw new AppError(400, "Nội dung phản hồi không được để trống")
    }

    if (adminReply.trim().length > 1000) {
      throw new AppError(400, "Phản hồi không được vượt quá 1000 ký tự")
    }

    const question = await QuestionRepo.findById(id)

    if (!question) {
      throw new AppError(404, "Không tìm thấy câu hỏi")
    }

    // // Không cho admin trả lời lần 2
    // if (question.admin_reply) {
    //   throw new AppError(400, "Câu hỏi này đã được admin trả lời")
    // }

    const updatedQuestion = await QuestionRepo.updateById(id, {
      admin_reply: adminReply.trim(),
      status: "approved",
      replied_at: new Date(),
    })

    return updatedQuestion
  }

  // Admin ẩn câu hỏi
  async hideQuestion(id) {
    const question = await QuestionRepo.findById(id)

    if (!question) {
      throw new AppError(404, "Không tìm thấy câu hỏi")
    }

    return await QuestionRepo.updateById(id, {
      status: "hidden",
    })
  }

  // Xóa câu hỏi
  async deleteQuestion(id) {
    const question = await QuestionRepo.findById(id)

    if (!question) {
      throw new AppError(404, "Không tìm thấy câu hỏi")
    }

    await QuestionRepo.deleteById(id)

    return {
      message: "Xóa câu hỏi thành công",
    }
  }
}

module.exports = new QuestionService()
