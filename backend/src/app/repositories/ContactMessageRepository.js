const ContactMessage = require("../models/ContactMessage")
class ContactMessageRepository {
  // Tạo tin nhắn liên hệ
  async create(data, session = null) {
    const options = session ? { session } : {}

    const [contactMessage] = await ContactMessage.create([data], options)

    return contactMessage
  }

  // Lấy tất cả tin nhắn
  async findAll() {
    return ContactMessage.find()
      .populate("user_id", "name email phone")
      .sort({ created_at: -1 })
  }

  // Tìm theo ID
  async findById(id) {
    return ContactMessage.findById(id).populate("user_id", "name email phone")
  }

  // Cập nhật trạng thái
  async updateStatus(id, status, replied_at = null) {
    return ContactMessage.findByIdAndUpdate(
      id,
      {
        status,
        replied_at,
      },
      {
        new: true,
        runValidators: true,
      },
    )
  }

  // Xóa tin nhắn
  async deleteById(id) {
    return ContactMessage.findByIdAndDelete(id)
  }
}

module.exports = new ContactMessageRepository()
