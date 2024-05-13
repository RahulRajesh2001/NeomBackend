import mongoose from 'mongoose';

const productSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    brand:{
        type:String,
        required:true
    },
    isDeleted:{
      type:Boolean,
      default:false
    },
    category:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    createdDate: {
        type: Date,
        default: Date.now
      },
      updatedDate: {
        type: Date,
        default: Date.now
      },
      productVarient:{
        type:mongoose.Schema.Types.ObjectId,ref:"ProductVariant"
      }
})

const Product=mongoose.model('Product',productSchema)
export default Product;