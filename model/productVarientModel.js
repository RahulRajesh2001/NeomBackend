import mongoose from "mongoose";

const { Schema } = mongoose;

const productVariantSchema = new Schema({
    productId:{type: mongoose.Schema.Types.ObjectId,ref:'Product'},
    color: {
        type: String,
        required: true
    },
    images:{
        type:Array,
    },
    stock:{
        type:Number,
        default: 0,
        min: 0
    },
    regularPrice:{
        type:Number,
        default: 0,
        min: 0
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    varientName:{
        type:String,
    },
    salePrice:{
        type:Number,
        default: 0,
        min: 0
    },
    specification: {
        type:Array
    },
    offers: [{
        offerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
        offerAmount: Number,
        offerType: String
    }],
   cupon: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CUPON'
    }]
});

const ProductVariant = mongoose.model('ProductVariant', productVariantSchema);

export default ProductVariant;
