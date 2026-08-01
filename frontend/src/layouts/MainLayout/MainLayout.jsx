import React from "react"
import { Header } from "../../components/layout/Header/Header"
import { Outlet } from "react-router-dom"
export const MainLayout = () => {
  return (
    <div className="container-fluid main-layout p-0">
      <div className="container-fluid header p-0">
        <Header></Header>
      </div>
      <div className="container main p-0">
        <Outlet></Outlet>
      </div>
      <div className="container-fluid footer p-0"></div>
    </div>
  )
}
