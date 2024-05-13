import { instance } from '../../index.js'
import crypto from 'crypto'
import PaymentModel from '../../model/paymentModel.js'
import { baseUrl } from '../../baseUrl.js'
import OrderModel from '../../model/orderSchema.js'

export const checkout = async (req, res) => {
  const { amount } = req.body

  const options = {
    amount: Number(amount * 100),
    currency: 'INR',
  }
  const order = await instance.orders.create(options)
  res.status(200).json({ success: true, order })
}

//payment verification

export const paymentVerification = async (req, res) => {

  
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body

  const body = razorpay_order_id + '|' + razorpay_payment_id

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_API_SECRET)
    .update(body.toString())
    .digest('hex')

  const isAuthentic = expectedSignature === razorpay_signature

  if (isAuthentic) {
    // Database comes here

    await PaymentModel.create({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    })

    res.redirect(`${baseUrl}/paymentsuccess`)
  } else {
    res.status(400).json({
      success: false,
    })
  }
}

export const Repayment = async (req, res) => {
  try {
    console.log(req.body)
    const { orderId, id } = req.body
    const order = await OrderModel.findById(id)
    if (order) {
      order.payment = orderId
      await order.save()
      res.redirect(`${baseUrl}/paymentsuccess`)
    } else {
      return res.status(404).json({ message: 'Order not found.' })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Some Error occurred. Please try again!' })
    throw err
  }
}
