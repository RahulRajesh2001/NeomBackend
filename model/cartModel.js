import mongoose, { Schema } from 'mongoose'

const CartSchema=new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [{
        productVarientId: {
            type: Schema.Types.ObjectId,
            ref: 'ProductVariant',
            required: true
        },
        quantity: {
            type: Number,
            default: 1 
        }
    }]
})

const CartModel=mongoose.model("CART",CartSchema)
export default CartModel
