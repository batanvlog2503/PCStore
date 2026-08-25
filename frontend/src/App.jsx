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
import Profile from "./pages/Profile/Profile"
import Product from "./pages/Product/Product"
import Cart from "./pages/Cart/Cart"
import Checkout from "./pages/Checkout/Checkout"
import OrderSuccess from "./pages/OrderSuccess/OrderSuccess"
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
        <Route
          path="product/:id"
          element={<Product></Product>}
        ></Route>
        <Route
          path="account"
          element={<Profile></Profile>}
        ></Route>
        <Route
          path="cart"
          element={<Cart></Cart>}
        ></Route>
        <Route
          path="checkout"
          element={<Checkout></Checkout>}
        ></Route>
        <Route
          path="order-success/:orderId"
          element={<OrderSuccess></OrderSuccess>}
        ></Route>
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
