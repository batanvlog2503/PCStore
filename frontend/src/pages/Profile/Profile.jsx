import React from "react"

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
  const [activeTab, setActiveTab] = useState(OPTIONS.INFO) // default

  const renderContent = () => {
    switch (activeTab) {
      case OPTIONS.INFO:
        return <MyInfor />
      case OPTIONS.ORDER:
        return <MyOrder />
      case OPTIONS.WISHLIST:
        return <MyWishList />
      case OPTIONS.ADDRESS:
        return <MyAddress></MyAddress>
      case OPTIONS.LOG:
        return <MyLog />
      default:
        return null
    }
  }
  return (
    <div className="container-fluid profile p-0">
      <div className="sidebar left">
        <Sidebar
          activeTab={activeTab}
          onSelect={setActiveTab}
        ></Sidebar>
        {/* activeTab là lưu cái option.info = "info" */}
      </div>
      <div className="information right">
        <div
          className="content-inner"
          key={activeTab}
        >
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

export default Profile
