import mongoose from 'mongoose';


const userSchema = new mongoose.Schema({
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    createdDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    image: {
      type: String
    },
    password: {
      type: String,
      required: true
    },
    confirmPassword: {
      type: String,
      required: true
    },
    updatedDate: {
      type: Date,
      default: Date.now
    },
    isBlocked: {
      type: Boolean,
      default: true
    }
  })
  

const User=mongoose.model('User',userSchema);
export default User;