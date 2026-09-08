import React, { useState } from "react"
import "./Introduction.scss"

// Mục lục — mỗi item trỏ tới 1 id section bên dưới để cuộn mượt tới đó
const TOC_ITEMS = [
  {
    id: "dac-diem",
    label: "1. Laptop đồ họa có những đặc điểm nào?",
    children: [
      { id: "cpu", label: "1.1. CPU cấu hình mạnh mẽ" },
      { id: "ram", label: "1.2. Dung lượng RAM lớn" },
      { id: "gpu-roi", label: "1.3. Tích hợp card đồ họa rời" },
      { id: "luu-tru", label: "1.4. Phần không gian lưu trữ" },
    ],
  },
  {
    id: "cach-chon",
    label: "2. Cách chọn laptop thiết kế đồ họa chất lượng?",
  },
  {
    id: "thuong-hieu",
    label: "3. Thương hiệu laptop đồ họa uy tín đáng mua",
    children: [
      { id: "dell", label: "3.1. Thương hiệu Dell" },
      { id: "asus", label: "3.2. Laptop Asus" },
      { id: "acer", label: "3.3. Laptop Acer" },
      { id: "hp", label: "3.4. Laptop HP" },
    ],
  },
  {
    id: "gia-tien",
    label:
      "4. Laptop chuyên cho dân thiết kế đồ họa nào tốt, giá bao nhiêu tiền?",
  },
  {
    id: "mua-o-dau",
    label: "5. Mua laptop đồ họa giá rẻ, chính hãng ở đâu?",
  },
]

export const Introduction = () => {
  const [openToc, setOpenToc] = useState(true)

  // Cuộn mượt tới section tương ứng khi bấm vào 1 dòng trong mục lục
  const handleJumpTo = (id) => (e) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <div className="introduction">
      <p className="introduction-lead">
        <strong>Laptop đồ họa</strong> được xem là vật bất ly thân của dân thiết
        kế đồ họa. Tuỳ thuộc vào từng nhu cầu design 2D, 3D hay dựng phim kỹ xảo
        sẽ có các cách chọn lựa cấu hình laptop khác nhau. Dưới đây là tổng hợp
        những yếu tố, đặc điểm cơ bản, giúp bạn nhanh chóng chọn được laptop
        thiết kế đồ họa phù hợp.
      </p>

      <div className="introduction-body">
        {/* ================= NỘI DUNG BÊN TRÁI ================= */}
        <div className="introduction-content">
          <section id="dac-diem">
            <h2>Laptop đồ họa có những đặc điểm nào?</h2>
            <p>
              <em>Laptop đồ họa</em> là laptop chuyên về thiết kế đồ họa, kỹ
              thuật (IT code, xây dựng, vẽ 3D...). Dòng laptop này luôn phải đáp
              ứng được các yêu cầu như cấu hình mạnh mẽ, tích hợp card màn hình
              rời cùng với độ phân giải màn hình cao nhằm xử lý công việc mượt
              mà, nhanh chóng và chuẩn xác nhất.
            </p>

            <h3 id="cpu">CPU cấu hình mạnh mẽ</h3>
            <p>
              CPU được xem như là một trong những yếu tố tất yếu quan trọng nhất
              đối với bất kì chiếc laptop đồ họa nào. Nó đóng vai trò như "bộ
              não" của máy, đảm nhiệm việc xử lý dữ liệu được gửi về từ các
              thiết bị khác trên laptop. CPU xử lý càng nhanh, tốc độ làm việc
              tổng thể của máy càng mượt.
            </p>
            <p>
              Đa số các dòng <strong>laptop làm đồ họa</strong> đều được trang
              bị bộ vi xử lý mạnh mẽ, giúp người dùng xử lý các tác vụ 3D,
              render video nhanh chóng và mượt mà, đáp ứng đầy đủ tác vụ cần
              thiết cho công việc sáng tạo.
            </p>

            <h3 id="ram">Dung lượng RAM lớn</h3>
            <p>
              Bên cạnh CPU, RAM cũng là thành phần không thể thiếu khi xử lý các
              phần mềm đồ họa nặng. RAM càng lớn, máy càng xử lý mượt mà khi mở
              nhiều ứng dụng hoặc file dự án dung lượng lớn cùng lúc mà không bị
              giật, lag.
            </p>

            <h3 id="gpu-roi">Tích hợp card đồ họa rời</h3>
            <p>
              Card đồ họa rời (GPU rời) giúp giảm tải cho CPU khi xử lý hình
              ảnh, video, đồng thời tăng tốc độ render và dựng hình 3D. Đây là
              yếu tố gần như bắt buộc nếu bạn làm việc với các phần mềm thiết kế
              chuyên sâu.
            </p>

            <h3 id="luu-tru">Phần không gian lưu trữ</h3>
            <p>
              Các file thiết kế đồ họa, video dựng phim thường có dung lượng rất
              lớn. Vì vậy ổ cứng SSD dung lượng cao sẽ giúp việc lưu trữ, truy
              xuất dữ liệu diễn ra nhanh chóng, tránh tình trạng đầy bộ nhớ khi
              làm việc.
            </p>
          </section>

          <section id="cach-chon">
            <h2>Cách chọn laptop thiết kế đồ họa chất lượng?</h2>
            <p>
              Để chọn được một chiếc laptop thiết kế đồ họa phù hợp, bạn nên cân
              nhắc đồng thời cả 4 yếu tố CPU, RAM, GPU và ổ cứng ở trên, đồng
              thời ưu tiên thêm màn hình có độ phân giải cao, độ phủ màu chuẩn
              để đảm bảo màu sắc hiển thị chính xác khi thiết kế.
            </p>
          </section>

          <section id="thuong-hieu">
            <h2>Thương hiệu laptop đồ họa uy tín đáng mua</h2>
            <p>
              Hiện nay có khá nhiều thương hiệu sản xuất dòng laptop chuyên cho
              dân thiết kế đồ họa, dưới đây là một số cái tên nổi bật nhất.
            </p>

            <h3 id="dell">Thương hiệu Dell</h3>
            <p>
              Dell nổi tiếng với dòng laptop XPS và Precision, được đánh giá cao
              về độ bền, màn hình chuẩn màu và hiệu năng ổn định, rất phù hợp
              cho dân thiết kế chuyên nghiệp.
            </p>

            <h3 id="asus">Laptop Asus</h3>
            <p>
              Dòng ProArt và ZenBook của Asus được trang bị cấu hình mạnh, màn
              hình chuẩn màu, hướng đến đúng đối tượng người dùng làm đồ họa,
              dựng phim.
            </p>

            <h3 id="acer">Laptop Acer</h3>
            <p>
              Acer ConceptD là dòng máy được phát triển riêng cho dân sáng tạo
              nội dung, sở hữu cấu hình mạnh với mức giá dễ tiếp cận hơn so với
              một số đối thủ cùng phân khúc.
            </p>

            <h3 id="hp">Laptop HP</h3>
            <p>
              HP ZBook là lựa chọn quen thuộc trong giới thiết kế đồ họa chuyên
              nghiệp nhờ độ bền cao, khả năng tản nhiệt tốt và hiệu năng ổn định
              khi làm việc trong thời gian dài.
            </p>
          </section>

          <section id="gia-tien">
            <h2>
              Laptop chuyên cho dân thiết kế đồ họa nào tốt, giá bao nhiêu tiền?
            </h2>
            <p>
              Tuỳ vào ngân sách và nhu cầu công việc, mức giá cho laptop đồ họa
              dao động khá rộng, từ các cấu hình phổ thông cho tới các dòng máy
              trạm (workstation) chuyên dụng cấu hình cao.
            </p>
          </section>

          <section id="mua-o-dau">
            <h2>Mua laptop đồ họa giá rẻ, chính hãng ở đâu?</h2>
            <p>
              Bạn nên chọn mua tại các hệ thống bán lẻ uy tín, có chính sách bảo
              hành rõ ràng để đảm bảo mua được sản phẩm chính hãng với mức giá
              tốt nhất.
            </p>
          </section>

          <div className="introduction-image">
            <img
              src="/laptop-do-hoa-banner.jpg"
              alt="Laptop đồ họa"
            />
          </div>
        </div>

        {/* ================= MỤC LỤC BÊN PHẢI — STICKY ================= */}
        <aside className="introduction-toc">
          <div className="toc-box">
            <div
              className="toc-header"
              onClick={() => setOpenToc((prev) => !prev)}
            >
              <span>Nội dung chính</span>
              <i
                className={`fa-solid fa-chevron-up ${openToc ? "" : "rotate"}`}
              ></i>
            </div>

            {openToc && (
              <ul className="toc-list">
                {TOC_ITEMS.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={handleJumpTo(item.id)}
                    >
                      {item.label}
                    </a>
                    {item.children && (
                      <ul className="toc-sublist">
                        {item.children.map((child) => (
                          <li key={child.id}>
                            <a
                              href={`#${child.id}`}
                              onClick={handleJumpTo(child.id)}
                            >
                              {child.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
