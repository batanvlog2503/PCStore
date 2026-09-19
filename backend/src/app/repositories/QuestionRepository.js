const Question = require("../models/Question")
const filterAllQuestions = require("../../helpers/filterAllQuestions")
class QuestionRepository {
  async create(data) {
    return await Question.create(data)
  }

  async findAll(req, skip = 0, limit = 5) {
    const filter = filterAllQuestions(req)

    const [questions, total] = await Promise.all([
      Question.find(filter)
        .populate("user_id", "username email")
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Question.countDocuments(filter),
    ])

    return {
      questions,
      total,
    }
  }

  async findById(id) {
    return await Question.findById(id)
      .populate("user_id", "username email")
      .lean()
  }

  // Lấy câu hỏi public có phân trang
  async findPublicQuestions(skip, limit) {
    return await Question.find({
      status: "approved",
      admin_reply: {
        $ne: null,
      },
    })
      .populate("user_id", "username email")
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
  }

  async countPublicQuestions() {
    return await Question.countDocuments({
      status: "approved",
      admin_reply: {
        $ne: null,
      },
    })
  }

  async updateById(id, data) {
    return await Question.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })
      .populate("user_id", "username email")
      .lean()
  }

  async deleteById(id) {
    return await Question.findByIdAndDelete(id)
  }
}

module.exports = new QuestionRepository()
