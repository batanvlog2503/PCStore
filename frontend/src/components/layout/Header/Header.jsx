import React from "react"
import "./Header.scss"

export const Header = () => {
  return (
    <div className="container-fluid p-0 header">
      <div className="header-top p-0">
        <div className="row">
          <div className="header-top-1">
            <div className="in-header-top hotline">
              <i class="fa-solid fa-phone"></i> Hotline: 0947.584.056
            </div>
            <div className="in-header-top email">
              <i class="fa-solid fa-at"></i> Email: tanden1367@gmail.com
            </div>
          </div>
          <div className="header-top-2">
            <div className="in-header-top freeship">
              <i class="fa-solid fa-cart-arrow-down"></i> Miễn phí giao hàng cho
              đơn hàng từ 2 củ.
            </div>
          </div>
          <div className="header-top-3">
            <div className="in-header-top map">
              <i class="fa-solid fa-location-crosshairs"></i> Hệ thống cửa hàng
            </div>
            <div className="in-header-top register">
              <i class="fa-solid fa-user"></i> Đăng nhập/Đăng kí
            </div>
          </div>
        </div>
      </div>
      <div className="header-middle p-0">
        <div className="header-middle-1 logo">
          <div className="image">
            <img
              width="50"
              height="auto"
              src="/logo1.jpg"
              alt="PC Store Logo"
            />
          </div>
          <div className="title">
            <h4>PC Store</h4>

            <p>Technology For Life</p>
          </div>
        </div>
        <div className="header-middle-2 search"></div>
        <div className="header-middle-3">
          <div className="love">
            <i class="fa-regular fa-heart"></i> Yêu thích
          </div>
          <div className="my-cart">
            <i class="fa-solid fa-cart-shopping"></i> Giỏ hàng
          </div>
        </div>
      </div>
      <div className="header-bottom p-0">
        <div className="dropdown">
          <ul className="list">
            <li>Trang chủ</li>
            <li>Sản phẩm</li>
            <li>PC Build</li>
            <li>Khuyến mãi</li>
            <li>Tin Tức</li>
            <li>Liên hệ</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
