const crypto = require("crypto") // tạo chữ ký
const axios = require("axios")
// là adapter giúp server nói chuyện với momo
class MomoGateway {
  async createPayment({ orderId, amount, orderInfo, requestId }) {
    // accessKey "đây là ứng dụng / merchant nào" là một phần thông tin đinh danh được momo cấp
    const accessKey = process.env.MOMO_ACCESS_KEY
    // secretKey dùng tạo signature cùng với xác minh chữ kí
    const secretKey = process.env.MOMO_SECRET_KEY
    // partnerCode đây là mã merchant/partner của bạn trong momo
    const partnerCode = process.env.MOMO_PARTNER_CODE
    //Đây là URL mà người dùng được redirect về sau quá trình thanh toán.
    const redirectUrl = process.env.MOMO_REDIRECT_URL
    //Đây là URL backend của bạn để MoMo gửi thông báo kết quả giao dịch.
    const ipnUrl = process.env.MOMO_IPN_URL

    const requestType = "payWithMethod"
    const extraData = ""
    // chuẩn bị dữ liệu đem đi ký
    const rawSignature =
      `accessKey=${accessKey}` +
      `&amount=${amount}` +
      `&extraData=${extraData}` +
      `&ipnUrl=${ipnUrl}` +
      `&orderId=${orderId}` +
      `&orderInfo=${orderInfo}` +
      `&partnerCode=${partnerCode}` +
      `&redirectUrl=${redirectUrl}` +
      `&requestId=${requestId}` +
      `&requestType=${requestType}`
    // tạo signature = secretKey + rawSignature + HMAC SHA256
    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex")

    //Đây là JSON body gửi sang MoMo.
    const body = {
      partnerCode,
      partnerName: "Your Store",
      storeId: "YourStore",

      requestId,
      amount,
      orderId,
      orderInfo,

      redirectUrl,
      ipnUrl,

      lang: "vi",
      requestType,
      autoCapture: true,

      extraData,
      orderGroupId: "",

      signature,
    }

    // gửi request sang momo
    //MOMO_CREATE_PAYMENT_URL=<production endpoint do MoMo cung cấp>
    const response = await axios.post(
      "https://test-payment.momo.vn/v2/gateway/api/create",
      body,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    return response.data
  }
}

module.exports = new MomoGateway()
