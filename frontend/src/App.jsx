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
import ProtectRoute from "./utils/ProtectRoute"
import { Home } from "./pages/Home/Home"
import { MainLayout } from "./layouts/MainLayout/MainLayout"
import { Login } from "./pages/Login/Login"
import { Register } from "./pages/Register/Register"
import Profile from "./pages/Profile/Profile"
import Product from "./pages/Product/Product"
import Cart from "./pages/Cart/Cart"
import Checkout from "./pages/Checkout/Checkout"
import OrderSuccess from "./pages/OrderSuccess/OrderSuccess"
import OrderDetail from "./pages/Profile/MyOrder/OrderDetail"
import MyInfor from "./pages/Profile/MyInfor/MyInfor"
import MyOrder from "./pages/Profile/MyOrder/MyOrder"
import MyWishList from "./pages/Profile/MyWishlist/MyWishlist"
import MyAddress from "./pages/Profile/MyAddress/MyAddress"
import MyLog from "./pages/Profile/MyLog/MyLog"
import Payment from "./pages/Payment/Payment"
// Admin

import AdminLayout from "./layouts/AdminLayout/AdminLayout"
import Dashboard from "./admin/Dashboard/Dashboard"
import ManagementUser from "./admin/User/ManagementUser"
import ManagementOrder from "./admin/ManagementOrder/ManagementOrder"
import ManagementProduct from "./admin/ManagementProduct.jsx/ManagementProduct"
import AddProduct from "./admin/ManagementProduct.jsx/AddProduct/AddProduct"
import EditProduct from "./admin/ManagementProduct.jsx/EditProduct/EditProduct"
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* MainLayout */}
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
          element={<Product />}
        />

        <Route
          path="cart"
          element={<Cart />}
        />
        <Route
          path="order/payment"
          element={<Payment></Payment>}
        />
        <Route
          path="order-success/:orderId"
          element={<OrderSuccess />}
        />

        {/* Route yêu cầu đăng nhập */}
        <Route element={<ProtectRoute />}>
          <Route
            path="account"
            element={<Profile />}
          >
            <Route
              index
              element={<MyInfor />}
            />

            <Route
              path="order"
              element={<MyOrder />}
            />

            <Route
              path="wishlist"
              element={<MyWishList />}
            />

            <Route
              path="address"
              element={<MyAddress />}
            />

            <Route
              path="log"
              element={<MyLog />}
            />
          </Route>

          <Route
            path="checkout"
            element={<Checkout />}
          />

          <Route
            path="order/:orderId"
            element={<OrderDetail />}
          />
        </Route>
      </Route>

      {/* Auth */}
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />
      <Route element={<ProtectRoute allowedRoles={["admin"]} />}>
        <Route
          path="/admin"
          element={<AdminLayout />}
        >
          <Route
            index
            element={<Dashboard />}
          />
          <Route
            path="manage-user"
            element={<ManagementUser />}
          />
          <Route
            path="orders"
            element={<ManagementOrder />}
          />

          <Route
            path="products"
            element={<ManagementProduct />}
          />
          <Route
            path="products/new"
            element={<AddProduct />}
          />
          <Route
            path="products/edit/:productId"
            element={<EditProduct />}
          />
          {/* <Route
            path="products"
            element={<ProductList />}
          />
          <Route
            path="products/new"
            element={<ProductForm />}
          />
          <Route
            path="categories"
            element={<CategoryList />}
          />
         
          {/* customers, vouchers, reviews, settings làm tiếp sau */}
        </Route>
      </Route>
    </>,
  ),
)
function App() {
  return <RouterProvider router={router} />
}

export default App
// Admin
//     <Route element={<ProtectRoute allowedRoles={["admin"]} />}>
//       <Route
//         path="/admin"
//         element={<AdminLayout />}
//       >
//         {/* Admin routes */}
//       </Route>
//     </Route>
