import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
 
  balance: {
    type: Number,
    default: 0,
  },
  
  orders: [{
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrderModel',
    },
    amount: {
      type: Number,
    },
    transaction: {
      type: String,
    },
    createdAt:{
      type:Date,
      default:Date.now()
    }
  }],
  createdAt:{
      type:Date,
      default:Date.now()
    }
});

const Wallet = mongoose.model('Wallet', walletSchema);
export default Wallet;
