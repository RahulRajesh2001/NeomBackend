import jwt from 'jsonwebtoken'
import OrderModel from '../../model/orderSchema.js'
import ProductVariant from '../../model/productVarientModel.js'
import Wallet from '../../model/walletModel.js'

export const placeOrder = async (req, res) => {
  try {
    // Verify user authentication
    const token = req.headers.authorization
    if (!token) {
      return res
        .status(401)
        .json({ message: 'You are unauthorized. Please login to continue.' })
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.id

    // Extract order data from request body
    const {
      orderedItems,
      deliveryDate,
      payment,
      paymentMethod,
      shippingAddress,
      orderDate,
      coupons,
      totalAmount,
    } = req.body
    console.log('this is order body', req.body)

    if (paymentMethod == 'Cash On Delivery' && totalAmount <= 1000){
      return res
        .status(400)
        .json({ message: 'Cash on delevery is not allowed under ₹ 1000' })
    }

    if (paymentMethod == 'Wallet' && totalAmount >= 1000) {
      const existingWallet = await Wallet.findOne({ user: userId })
      if (!existingWallet) {
        return res
          .status(500)
          .json({ message: 'There is  no Wallet for you !' })
      }
      if (existingWallet.balance >= totalAmount) {
        existingWallet.balance -= totalAmount
        existingWallet.save()
      } else {
        return res.status(400).json({ message: 'Wallet balace is too low !' })
      }
    }

    let insufficientStock = false

    for (const item of orderedItems) {
      const productVariant = await ProductVariant.findOne({ _id: item.product })
      if (!productVariant || productVariant.stock < item.quantity) {
        insufficientStock = true
        break
      }
    }

    if (insufficientStock) {
      return res
        .status(400)
        .json({ message: 'Insufficient Stock to Purchase!' })
    }

    // Create new order document
    const newOrder = new OrderModel({
      userId,
      orderedItems,
      deliveryDate,
      payment,
      paymentMethod,
      shippingAddress,
      orderDate,
      coupons,
      totalAmount,
    })

    const savedOrder = await newOrder.save()

    for (const orderedItem of orderedItems) {
      const { product, quantity } = orderedItem

      const foundProduct = await ProductVariant.findById(product)

      if (foundProduct) {
        const newStockLevel = foundProduct.stock - quantity
        const productVariant = await ProductVariant.findByIdAndUpdate(
          product,
          { stock: newStockLevel },
          { new: true }
        )
      }
    }

    res
      .status(201)
      .json({ message: 'Order placed successfully', order: savedOrder })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Some Error occurred. Please try again!' })
    throw err
  }
}

// GET
// api/v1/getAllOrders
// --- users

export const getAllOrders = async (req, res) => {
  try {
    const token = req.headers.authorization

    if (!token) {
      return res
        .status(401)
        .json({ message: 'You are unauthorized. Please login to continue.' })
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.id

    const orders = await OrderModel.find({ userId })
    if (!orders) {
      return res.status(400).json({ message: 'No orders' })
    }
    res.status(200).json({ message: 'Successfull', orders })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Some Error occurred. Please try again!' })
    throw err
  }
}

// GET
// api/v1/orderDetails
// --- users

export const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.query
    const order = await OrderModel.findOne({ _id: id })
    if (!order) {
      return res.status(400).json({ message: 'No order details !' })
    }
    res.status(200).json({ message: 'Successfull', order })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Some Error occurred. Please try again!' })
    throw err
  }
}

// GET
// api/v1/orderDetails
// --- users

export const changeOrderStatus = async (req, res) => {
  try {
    const { id, orderStatus, OrderedItemId, method, quantity } = req.body
    if (!id) {
      return res.status(400).json({ message: 'Missing Parameter: id' })
    }
    if (!orderStatus) {
      return res.status(400).json({ message: 'Missing Parameter: orderStatus' })
    }
    const order = await OrderModel.findOne({ _id: id })
    if (!order) {
      return res.status(404).json({ message: 'Order not found!' })
    }
    const ItemToUpdate = order.orderedItems.find(
      (item) => item._id.toString() === OrderedItemId
    )

    if (!ItemToUpdate) {
      return res.status(404).json({ message: 'Item not found in the order!' })
    }

    // Taking user id
    const token = req.headers.authorization

    if (!token) {
      return res
        .status(401)
        .json({ message: 'You are unauthorized. Please login to continue.' })
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.id

    console.log("this si wallet",ItemToUpdate)


    if (
      (orderStatus === 'Cancelled' && method === 'RazorPay') ||
      (orderStatus === 'Cancelled' && method === 'Wallet')
    ) {
      const existingWallet = await Wallet.findOne({ user: userId })

      

      if (!existingWallet) {
        const wallet = new Wallet({
          user: userId,
          balance: ItemToUpdate.price,
          transaction: orderStatus,
          orders: [{ id: ItemToUpdate.product, transaction: orderStatus,createdAt:Date.now(), amount: ItemToUpdate.price}],
        })
        await wallet.save()
      } else {
        existingWallet.balance += ItemToUpdate.price
        existingWallet.orders.push({
          id: ItemToUpdate.product,
          amount: ItemToUpdate.price,
          transaction: orderStatus,
          createdAt:Date.now()
        })
        await existingWallet.save()
      }
    }

    if (orderStatus === 'Returned') {
      const existingWallet = await Wallet.findOne({ user: userId })

      if (!existingWallet) {
        const wallet = new Wallet({
          user: userId,
          balance: ItemToUpdate.price,
          transaction: orderStatus,
          orders: [{ id: ItemToUpdate.product, transaction: orderStatus,createdAt:Date.now(), amount: ItemToUpdate.price}],
        })
        await wallet.save()
      } else {
        existingWallet.balance += ItemToUpdate.price
        existingWallet.orders.push({
          id: ItemToUpdate.product,
          amount: ItemToUpdate.price,
          transaction: orderStatus,
          createdAt:Date.now()
        })
        await existingWallet.save()
      }
    }

    order.totalAmount -= ItemToUpdate.price
    await order.save()

    ItemToUpdate.orderStatus = orderStatus

    await order.save()
    res.status(200).json({ message: 'Order status updated successfully!' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Some Error occurred. Please try again!' })
    throw err
  }
}
