import React from "react"
import "./Login.scss"
const gioiThieu = ["/gioithieu.png"]
import { useState, useEffect } from "react"

export const Login = () => {
  return (
    <div className="container-fluid login p-0">
      <div className="privacy">
        <img
          src={gioiThieu[0]}
          alt=""
        />
      </div>
      <div className="form-login">
        <h2>Đăng nhập PC Store</h2>
        <form action="">
          <label htmlFor="">Số điện thoại</label>
          <br />
          <input
            type="text"
            value="phone"
            name="phone"
            className="phone input"
            placeholder="Nhập số điện thoại của bạn"
            required
          />

          <label htmlFor="">Mật khẩu</label>
          <br />
          <input
            type="password"
            value="password"
            name="password"
            className="password input"
            placeholder="Vui lòng nhập mật khẩu"
            required
          />
          <button type="submit">Đăng nhập</button>
        </form>
        <a href="">Quên mật khẩu</a>

        <p>
          Bạn chưa có tài khoản? <a href="">Đăng kí ngay</a>
        </p>
        <p>
          Mua sắm và sửa chữa tại <b>PC Store</b>
        </p>
      </div>
    </div>
  )
}
