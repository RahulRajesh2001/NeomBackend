import User from '../../model/userModel.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import otpGenerator from 'otp-generator'
import OTP from '../../model/otpModel.js'
import nodemailer from 'nodemailer'
import { baseUrl } from '../../baseUrl.js'
import catchAsyncErrors from '../../middlewares/catchAsyncErrors.js'
import ErrorHandler from '../../utils/errorHandler.js'

//POST
// api/v1/login
export const login = catchAsyncErrors(async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email) {
      return next(new ErrorHandler('Enter Email', 400))
    }
    if (!password) {
      return next(new ErrorHandler('Enter Password', 400))
    }
    // Find the user
    const user = await User.findOne({ email })
    if (!user) {
      return next(new ErrorHandler('User not found', 404))
    }
    // Compare the password
    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if (!isPasswordMatch) {
      return next(new ErrorHandler('Invalid password', 401))
    }
    // Token generation
    const id = user._id
    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_TOKEN_LIFE,
    })
    return res.status(200).json({ message: 'Login Successful', user, token })
  } catch (err) {
    console.error('Error in login:', err)
    next(err)
  }
})

//--------------------------------------------------------------------------------------------------------------------------------------------------------

//POST
// api/v1/register
export const register = catchAsyncErrors(async (req, res, next) => {
  try {
    const { email, password, confirmPassword, name } = req.body

    if (!email) {
      return next(new ErrorHandler('Enter Email', 400))
    }
    if (!password) {
      return next(new ErrorHandler('Enter Password', 400))
    }
    if (!name) {
      return next(new ErrorHandler('Enter Name', 400))
    }
    if (!confirmPassword) {
      return next(new ErrorHandler('Enter Confirm Password', 400))
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return next(new ErrorHandler('User already exists', 409))
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return next(new ErrorHandler('Passwords not matching', 400))
    }

    // Hash passwords
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create and save the user
    const user = new User({
      email,
      password: hashedPassword,
      name,
      confirmPassword: confirmPassword,
    })

    await user.save()

    return res.status(201).json({ message: 'Verify your email address!', user })
  } catch (err) {
    console.error('Error in register:', err)
    next(err)
  }
})

//----------------------------------------------------------------------------------------------------------------------------------------------

// POST
// api/v1/otp-generation
export const OTPGeneration = catchAsyncErrors(async (req, res, next) => {
  try {
    const { email } = req.body
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    })

    if (!otp) {
      return next(new ErrorHandler('OTP is missing', 400))
    }

    const newOtp = new OTP({
      email,
      otp,
    })
    await newOtp.save()

    await res.status(200).json({ message: 'otp saved', otp })

    //node mailer
    // transporter using SMTP transport
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'rahulrjev@gmail.com',
        pass: 'xgfs dmjo nggx olwa',
      },
    })

    // Email data
    const mailOptions = {
      from: 'rahulrjev@gmail.com',
      to: `${email}`,
      subject: 'Email Verification from Quilon !',
      text: `${otp}`,
    }

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return next(new ErrorHandler('Error occured', 500))
      } else {
        res
          .status(200)
          .json({ message: 'Verification email is sent to your gmail !' })
      }
    })
  } catch (err) {
    console.error('Error in otp generation:', err)
    next(err)
  }
})

//-------------------------------------------------------------------------------------------------------------------------------------------------

// POST
// api/v1/otp-regeneration
export const otpRegeneration = catchAsyncErrors(async (req, res, next) => {
  try {
    const { email } = req.body
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    })

    if (!otp) {
      return next(new ErrorHandler('OTP is missing', 400))
    }

    const newOtp = new OTP({
      email,
      otp,
    })
    await newOtp.save()

    await res.status(200).json({ message: 'Otp Sented', otp })

    // transporter using SMTP transport
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'rahulrjev@gmail.com',
        pass: 'xgfs dmjo nggx olwa',
      },
    })

    // Email data
    const mailOptions = {
      from: 'rahulrjev@gmail.com',
      to: `${email}`,
      subject: 'Email Verification from Quilon !',
      text: `${otp}`,
    }

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return next(new ErrorHandler('Error occured', 500))
      } else {
        res
          .status(200)
          .json({ message: 'Verification email is sent to your gmail !' })
      }
    })
  } catch (err) {
    console.error('Error in otp regeneration:', err)
    next(err)
  }
})

//-------------------------------------------------------------------------------------------------------------------------------------------------------

// POST
// api/v1/otp-verification
export const otpVerification = catchAsyncErrors(async (req, res, next) => {
  try {
    const { userEmail, otp } = req.body

    if (!otp) {
      return next(new ErrorHandler('OTP is missing', 400))
    }

    const response = await OTP.find({ email: userEmail })
      .sort({ createdAt: -1 })
      .limit(1)

    if (!response || response.length === 0 || response[0].otp === '') {
      return next(new ErrorHandler('OTP is expired . Please regenerate', 404))
    }
    if (response[0].otp == otp) {
      return res
        .status(200)
        .json({ message: 'You are successfully registered' })
    } else {
      return next(new ErrorHandler('OTP is expired . Please regenerate', 400))
    }
  } catch (err) {
    console.error('Error in otp verification:', err)
    next(err)
  }
})

//------------------------------------------------------------------------------------------------------------------------------------------------------

// POST
// api/v1/forgetPassword
export const forgetPassword = catchAsyncErrors(async (req, res, next) => {
  try {
    const { email } = req.body
    // Find the user by email
    const user = await User.findOne({ email })
    if (!user) {
      return next(new ErrorHandler('User not found', 404))
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '10m',
    })

    // transporter using SMTP transport
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'rahulrjev@gmail.com',
        pass: 'xgfs dmjo nggx olwa',
      },
    })

    // Email configuration
    const mailOptions = {
      from: 'rahulrjev@gmail.com',
      to: email,
      subject: 'Reset Password',
      html: `<h1>Reset Your Password</h1>
    <p>Click on the following link to reset your password:</p>
    <a href="${baseUrl}/reset-password/${token}">${baseUrl}/reset-password/${token}</a>
    <p>The link will expire in 10 minutes.</p>
    <p>If you didn't request a password reset, please ignore this email.</p>`,
    }

    // Send the email
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        return res.status(500).send({ message: err.message })
      }
      res.status(200).send({ message: 'Email sent' })
    })
  } catch (err) {
    console.error('Error in forget password:', err)
    next(err)
  }
})

//---------------------------------------------------------------------------------------------------------------------------------------------------

//Post
//reset password
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  try {
    const token = req.params.token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)

    // If the token is invalid, return an error
    if (!decodedToken) {
      return next(new ErrorHandler('Invalid token', 401))
    }

    // find the user with the id from the token
    const user = await User.findOne({ _id: decodedToken.userId })
    if (!user) {
      return next(new ErrorHandler('User not found', 400))
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(12)
    const password = await bcrypt.hash(req.body.newPassword, salt)
    const confirmPassword = await bcrypt.hash(req.body.newPassword, salt)

    // Update user's password, clear reset token and expiration time
    user.password = password
    user.confirmPassword = confirmPassword
    await user.save()

    // Send success response
    res.status(200).send({ message: 'Password updated' })
  } catch (err) {
    console.error('Error in reset password', err)
    next(err)
  }
})

//------------------------------------------------------------------------------------------------------------------------------------------------------------------

// POST
// api/v1/otp-regeneration
export const renewPassword = catchAsyncErrors(async (req, res, next) => {
  try {
    const { oldPassword, newPassword, confirmNewPassword } = req.body
    // token decoded
    const token = req.headers.authorization
    if (!token) {
      return next(new ErrorHandler('Invalid token', 401))
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.id
    const user = await User.findOne({ _id: userId })

    if (!user) {
      return next(new ErrorHandler('User not found', 400))
    }

    // Compare the passwords
    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password)
    if (!isPasswordMatch) {
      return next(new ErrorHandler('Invalid password', 401))
    }

    if (newPassword !== confirmNewPassword) {
      return next(new ErrorHandler('Password not match', 401))
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    user.password = hashedPassword
    user.confirmPassword = hashedPassword
    await user.save()

    res.status(200).json({ message: 'Password changed successfully' })
  } catch (err) {
    console.error('Error in renew password', err)
    next(err)
  }
})


//-------------------------------------------------------------------------------------------------------------------------------------------------