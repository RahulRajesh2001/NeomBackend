import mongoose from 'mongoose'


const reviewSchema = new mongoose.Schema({
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      enum: [1, 2, 3, 4, 5]
    },
    review: {
      type: String,
      required: true
    },
    createdDate: {
      type: Date,
      default: Date.now
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  });

const reviewModel=mongoose.model("Review",reviewSchema)
export default reviewModel