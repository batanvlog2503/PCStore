import { useState } from "react"

import "./App.css"
import {
  Route,
  Router,
  RouterProvider,
  BrowserRouter,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom"
import { Home } from "./pages/Home/Home"
import { MainLayout } from "./layouts/MainLayout/MainLayout"
import { Login } from "./pages/Login/Login"
import { Register } from "./pages/Register/Register"
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Các trang dùng chung Header/Footer -> nằm trong MainLayout */}
      <Route
        path="/"
        element={<MainLayout />}
      >
        <Route
          index
          element={<Home />}
        />
      </Route>

      {/* Login đứng riêng, KHÔNG bọc MainLayout */}
      <Route
        path="/login"
        element={<Login />}
      />
      <Route
        path="/register"
        element={<Register />}
      />
    </>,
  ),
)
function App() {
  return <RouterProvider router={router} />
}

export default App
