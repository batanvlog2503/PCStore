const ContactMessageRepo = require("../repositories/ContactMessageRepository")
const AppError = require("../utils/AppError")

class ContactMessageService {
  // tạo contactMessage
  async createContactMessage(userId, data) {
    const { name, email, phone, message } = data

    if (!name || !name.trim()) {
      throw new AppError(400, "Họ và tên không được để trống")
    }

    if (!email || !email.trim()) {
      throw new AppError(400, "Email không được để trống")
    }

    if (!message || !message.trim()) {
      throw new AppError(400, "Nội dung liên hệ không được để trống")
    }

    // Kiểm tra email cơ bản
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(email)) {
      throw new AppError(400, "Email không hợp lệ")
    }

    const contactMessage = await ContactMessageRepo.create({
      user_id: userId || null,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      message: message.trim(),
    })

    return contactMessage
  }
  // lấy hết
  async getAllContactMessages() {
    return ContactMessageRepo.findAll()
  }

  async getContactMessageById(id) {
    if (!id) {
      throw new AppError(400, "Id not found")
    }
    const contactMessage = await ContactMessageRepo.findById(id)

    if (!contactMessage) {
      throw new AppError(404, "Không tìm thấy tin nhắn liên hệ")
    }

    return contactMessage
  }

  async updateStatus(id, status) {
    if (!id) {
      throw new AppError(400, "Id not found")
    }
    const allowedStatus = ["pending", "processing", "resolved"]

    if (!allowedStatus.includes(status)) {
      throw new AppError(400, "Trạng thái không hợp lệ")
    }

    const repliedAt = status === "resolved" ? new Date() : null

    const contactMessage = await ContactMessageRepo.updateStatus(
      id,
      status,
      repliedAt,
    )

    if (!contactMessage) {
      throw new AppError(404, "Không tìm thấy tin nhắn liên hệ")
    }

    return contactMessage
  }

  async deleteContactMessage(id) {
    if (!id) {
      throw new AppError(400, "Id not found")
    }
    const contactMessage = await ContactMessageRepo.deleteById(id)

    if (!contactMessage) {
      throw new AppError(404, "Không tìm thấy tin nhắn liên hệ")
    }

    return contactMessage
  }
}

module.exports = new ContactMessageService()
