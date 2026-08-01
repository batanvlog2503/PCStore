import React from "react"
import "./Home.scss"
import { useState, useEffect } from "react"
const ADS_SET_A = ["/quangcao1.png", "/quangcao2.png"]
const ADS_SET_B = ["/quangcao3.png", "/quangcao4.png"]
export const Home = () => {
  const [isSetA, setIsSetA] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setIsSetA((prev) => !prev)
    }, 2500) // 2.5s đổi 1 lần, chỉnh số này nếu muốn nhanh/chậm hơn
    return () => clearInterval(timer)
  }, [])

  const currentAds = isSetA ? ADS_SET_A : ADS_SET_B
  return (
    <div className="container home p-0">
      <p className="type">Thể loại / </p>
      <div className="home-list-type">
        <ul className="row">
          <li>
            <i className="fa-solid fa-laptop"></i> Laptop
          </li>
          <li>
            <i class="fa-solid fa-computer"></i> PC
          </li>
          <li>
            <i class="fa-solid fa-display"></i>Màn hình
          </li>
          <li>
            <i class="fa-solid fa-house-laptop"></i> Build PC
          </li>
          <li>
            <i class="fa-solid fa-wrench"></i> Linh kiện
          </li>
          <li>
            <i class="fa-solid fa-print"></i> Máy in
          </li>
        </ul>
      </div>
      <div className="home-advertisement">
        <div className="advertisement-1 slide">
          <img
            key={currentAds[0]}
            className="fade-img"
            src={currentAds[0]}
            alt="Quảng cáo 1"
          />
        </div>
        <div className="advertisement-2 slide">
          <img
            key={currentAds[1]}
            className="fade-img"
            src={currentAds[1]}
            alt="Quảng cáo 2"
          />
        </div>
      </div>

      <div className="home-brand-laptop">
        <h3>Máy tính Laptop</h3>
        <div className="list-brand">
          <ul className="row">
            <li>Macbook</li>
            <li>Asus</li>
            <li>Lenovo</li>
            <li>MSI</li>
            <li>ACER</li>
            <li>HP</li>
            <li>DELL</li>
            <li>GIGABYTE</li>
            <li>LG</li>
            <li>MICROSOFT OFFICE</li>
            <li>SAMSUNG</li>
            <li>MASSTEL</li>
          </ul>
        </div>
      </div>
      <div className="home-voucher">
        <h3>Ưu đãi & Voucher</h3>
        <div className="list-voucher">
          <ul className="row">
            <li>
              <div className="card-voucher">
                <div className="left-voucher">
                  <span>Giảm 4%</span>
                </div>
                <div className="middle-voucher">
                  <span>Voucher laptop 4%</span>
                  <p>Tối đa 1 triệu áp dụng toàn bộ laptop</p>
                  <p>Thời hạn thu nhập: </p>
                  <span>22:30 31/07/2026</span>
                </div>
                <div className="right-voucher"></div>
                {/* tỉ lệ 3:7 */}
              </div>
            </li>
            <li>
              {" "}
              <div className="card-voucher">
                <div className="left-voucher">
                  <span>Giảm 4%</span>
                </div>
                <div className="middle-voucher">
                  <span>Voucher laptop 4%</span>
                  <p>Tối đa 1 triệu áp dụng toàn bộ laptop</p>
                  <p>Thời hạn thu nhập: </p>
                  <span>22:30 31/07/2026</span>
                </div>
                <div className="right-voucher">
                  <button>Nhận</button>
                  <a href="">Xem thể lệ</a>
                </div>
                {/* tỉ lệ 3:7 */}
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
