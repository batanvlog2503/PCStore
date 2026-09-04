module.exports = (req, userId) => {
  const filter = { user_id: userId } // luôn giới hạn trong đơn hàng của đúng user này

  // Filter theo trạng thái — bỏ qua nếu là "all" hoặc không truyền gì
  if (req.query.status && req.query.status !== "all") {
    filter.status = req.query.status
  }

  // Search theo mã đơn hàng — dùng regex thay vì so khớp chính xác,
  // vì đây là ô tìm kiếm cho user gõ 1 phần mã (VD: "1234"), không phải
  // tra cứu bằng mã đầy đủ như voucher
  if (req.query.search) {
    filter.order_code = {
      $regex: escapeRegex(req.query.search),
      $options: "i", // không phân biệt hoa/thường
    }
  }

  return filter
}

// Tránh lỗi / lỗ hổng khi user gõ ký tự đặc biệt của regex (VD: gõ "(" hay "*")
// vào ô tìm kiếm -> nếu không escape, MongoDB sẽ hiểu nhầm thành cú pháp regex
// thay vì chuỗi văn bản thường, có thể gây lỗi hoặc bị lợi dụng (ReDoS)
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
