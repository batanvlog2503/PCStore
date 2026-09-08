import React from "react"

const CommentPublic = () => {
  return (
    <div className="question-and-answer">
      <div className="create-question">
        <img
          src={"/logo-store2.jpg"}
          alt=""
        />
        <form action="">
          <h3>Hãy đặt câu hỏi cho chúng tôi</h3>
          <span>
            PCStore sẽ phản hồi trong vòng 2 giờ. Nếu Quý khách gửi câu hỏi sau
            22h, chúng tôi sẽ trả lời vào sáng hôm sau. Thông tin có thể thay
            đổi theo thời gian, vui lòng đặt câu hỏi để nhận được cập nhật mới
            nhất!
          </span>
          <input
            type="text"
            value="comment"
            name="comment"
            placeholder="Viết câu hỏi tại đây"
          />
          <button type="submit">
            Gửi câu hỏi <i className="fa-regular fa-paper-plane"></i>
          </button>
        </form>
        <div className=""></div>
      </div>
    </div>
  )
}

export default CommentPublic
