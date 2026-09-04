import React from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar/Sidebar.jsx"
import MyInfor from "./MyInfor/MyInfor.jsx"
import MyOrder from "./MyOrder/MyOrder.jsx"
import MyLog from "./MyLog/MyLog.jsx"
import { useState, useEffect } from "react"
import "./Profile.scss"
import MyWishList from "./MyWishlist/MyWishlist.jsx"
import MyOrdered from "./MyOrdered/MyOrdered.jsx"
import MyAddress from "./MyAddress/MyAddress.jsx"
export const OPTIONS = {
  INFO: "info",
  ORDER: "order",
  WISHLIST: "wishlist",
  ADDRESS: "address",
  LOG: "log",
}
const Profile = () => {
  return (
    <div className="container-fluid profile p-0">
      <div className="sidebar left">
        <Sidebar />
      </div>
      <div className="information right">
        <div className="content-inner">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Profile
