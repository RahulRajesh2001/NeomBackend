import OrderModel from '../../model/orderSchema.js'
import jwt from 'jsonwebtoken'

// GET
// api/v1/admin/allOrders
// --- admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await OrderModel.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
    ])

    if (!orders) {
      return res.status(400).json({ message: 'No orders !' })
    }
    res.status(200).json({ message: 'Order Successfull', orders })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Some Error occured .. Try again !' })
    throw err
  }
}


// patch
// api/v1/admin/editPaymentStatus
// --- admin
export const editPaymentStatus = async (req, res) => {
  try {
      const { orderId } = req.params;
      const { paymentStatus, varientId } = req.body;

      // Find the order
      const updatedOrder = await OrderModel.findOne({ _id: orderId });

      // Check if the order exists
      if (!updatedOrder) {
          return res.status(404).json({ message: "Order not found" });
      }

      // Update the order status for the specified variant
      updatedOrder.orderedItems.forEach((item) => {
          if (item._id == varientId) {
              item.orderStatus = paymentStatus;
          }
      });

      // Save the updated order
      await updatedOrder.save();

      // Aggregate orders with user details
      const orders = await OrderModel.aggregate([
          {
              $lookup: {
                  from: 'users',
                  localField: 'userId',
                  foreignField: '_id',
                  as: 'user',
              },
          },
          {
              $unwind: '$user',
          },
      ]);

      // Send the response
      res.status(200).json({ message: 'Payment status updated successfully', orders });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Some error occurred. Try again!' });
  }
}


// patch
// api/v1/admin/editPaymentStatus
// --- admin
export const getOrderDetails = async (req, res) => {
  try {
    const {id}=req.query;
    if(!id){
      return res.status(404).json({message:"Missing parameter id"})
    }
    const order=await OrderModel.findById(id)
    if(order.length==0){
      return res.status(404).json({message:"Order not found"})
    }
    return res.json({message:"Successfull",order})
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Some error occurred. Try again!' });
    }
}

