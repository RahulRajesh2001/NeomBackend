import mongoose from 'mongoose'

const shippingAddressSchema=new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
    name: {
        type: String,
        required: true
      },
      address: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
      pincode: {
        type: String,
        required: true
      },
      phone1: {
        type: String,
        required: true
      },
      phone2: {
        type: String
      },
      street: {
        type: String,
        required: true
      },
      landmark: {
        type: String,
        required: true
      },
      region: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: {
        type: Date,
        default: Date.now
      }
})


const ShippingAddressModel = mongoose.model('ShippingAddress', shippingAddressSchema);

export default ShippingAddressModel;