import mongoose from 'mongoose'

const OfferSchema = new mongoose.Schema({
  offerName:{
    type:String,
    required:true
  },
  discountType: {
    type: String,
    enum: ['Percentage', 'FixedAmount'],
    required: true,
  },
  discountValue: {
    type: Number,
    required: true,
  },
  validFrom: {
    type: Date,
    required: true,
  },
  validUntil: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  description: {
    type: String,
    required: true,
  },
  offerType: {
    type: String,
    required: true,
    enum: ['Product', 'Category', 'Referral'],
  },
  creaetedAt: {
    type: Date,
    default: Date.now,
},
  productId: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
});

const OfferModel = mongoose.model('Offer', OfferSchema);
export default OfferModel;