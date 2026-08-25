const Payment = require("../models/Payment")

class PaymentRepository {
  async create(data, session = null) {
    const options = session ? { session } : {}

    const [payment] = await Payment.create([data], options)

    return payment
  }

  async findById(id) {
    return await Payment.findById(id)
  }

  async findByOrderId(orderId) {
    return await Payment.findOne({
      order_id: orderId,
    })
  }

  async findByRequestId(requestId) {
    return await Payment.findOne({
      request_id: requestId,
    })
  }

  async findByTransactionId(transactionId) {
    return await Payment.findOne({
      transaction_id: transactionId,
    })
  }

  async updateById(id, data, session = null) {
    return await Payment.findByIdAndUpdate(id, data, {
      new: true,
      session,
    })
  }
}

module.exports = new PaymentRepository()
