import jwt from 'jsonwebtoken'
import User from '../../model/userModel.js';

const signToken = (id) => {
    console.log("this is id",id)
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_TOKEN_LIFE,
    });
};

// Create and send Cookie ->
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user.id);
    const cookieOptions = {
        expires: new Date(Date.now() + +process.env.JWT_COOKIE_EXPIRES_IN),
        httpOnly: true,
        path: '/',
        secure: false,
    };
    if (process.env.NODE_ENV === 'production') {
        cookieOptions.secure = true;
        cookieOptions.sameSite = 'none';
    }

    user.password = undefined;

    res.cookie('jwt', token, cookieOptions);

    res.status(statusCode).json({
        message: 'success',
        token,
        data: {
            user,
        },
    });
};

/* GET Google Authentication API. */
const googleAuth = async (req, res) => {
    const {email,name}=req.body;
    if(!email){
        return res.status(400).json({message:"Email is missing !"})
    }
    if(!name){
        return res.status(400).json({message:"Name is missing !"})
    }

    const existingUser=await User.findOne({email})
    console.log(existingUser)
    if(!existingUser){
    return res.status(400).json({message:"User Not Registered !"})
    }
    const id = existingUser?._id
    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_TOKEN_LIFE,
    })
    res.status(200).json({message:"Login Successfull !",token})
    
    
};

export default googleAuth