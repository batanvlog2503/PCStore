import React, { useState, useEffect } from "react"
import { useParams, useLocation } from "react-router-dom"
import axiosInstance from "../../utils/axiosInstance"

const Payment = () => {
  const [order, setOrder] = useState({})
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  console.log("Location search;", location.search)
  console.log("Params: ", params.get("id")) // lấy parasm

  const orderId = params.get("id")
  console.log("Params: ", params.get("totalAmount")) // lấy parasm
  const getDetailOrder = async () => {
    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_APP_URL}/order/${orderId}`,
      )
      setOrder(response.data.order)
      console.log(order)
      console.log("Response order detail payment, ", response.data.order)
    } catch (error) {
      console.log("Error", error)
    }
  }
  useEffect(() => {
    getDetailOrder()
  }, [])
  return <div>Payment</div>
}

export default Payment
