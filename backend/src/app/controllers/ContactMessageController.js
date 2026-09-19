const ContactMessageService = require("../services/ContactMessageService")

class ContactMessageController {
  // Khách gửi liên hệ
  async create(req, res, next) {
    try {
      const userId = req.user?._id || null

      const data = await ContactMessageService.createContactMessage(
        userId,
        req.body,
      )

      return res.status(201).json({
        success: true,
        message: "Gửi liên hệ thành công",
        data,
      })
    } catch (error) {
      next(error)
    }
  }

  // Admin lấy tất cả
  async getAll(req, res, next) {
    try {
      const data = await ContactMessageService.getAllContactMessages()

      return res.status(200).json({
        success: true,
        message: "Get data successfully",
        data,
      })
    } catch (error) {
      next(error)
    }
  }

  // Admin xem chi tiết
  async getById(req, res, next) {
    try {
      const data = await ContactMessageService.getContactMessageById(
        req.params.id,
      )

      return res.status(200).json({
        success: true,
        message: "Get data by id successfully",
        data,
      })
    } catch (error) {
      next(error)
    }
  }

  // Admin cập nhật trạng thái
  async updateStatus(req, res, next) {
    try {
      const { status } = req.body

      const data = await ContactMessageService.updateStatus(
        req.params.id,
        status,
      )

      return res.status(200).json({
        success: true,
        message: "Cập nhật trạng thái thành công",
        data,
      })
    } catch (error) {
      next(error)
    }
  }

  // Admin xóa
  async delete(req, res, next) {
    try {
      await ContactMessageService.deleteContactMessage(req.params.id)

      return res.status(200).json({
        success: true,
        message: "Xóa tin nhắn thành công",
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new ContactMessageController()
