import express from 'express'
import { verifyToken } from '../utils/authMiddleware.js'
import {
  OTPGeneration,
  forgetPassword,
  login,
  otpRegeneration,
  otpVerification,
  register,
  renewPassword,
  resetPassword,
} from '../controllers/userController/authController.js'
import {
  addReview,
  addToWishlist,
  alphaSort,
  categorySort,
  getCategories,
  getFeaturedProducts,
  getProductDetails,
  getProductVarientDetails,
  getProducts,
  getReview,
  getWishlistProducts,
  priceSort,
  removeFromWishlist,
  searchProducts,
  tagSort,
  wishlistProducts,
} from '../controllers/userController/productController.js'
import {
  addShippingAddress,
  chooseShippingAddress,
  deleteShippingAddress,
  editShippingAddress,
  editUser,
  getShippingAddress,
  getUser,
} from '../controllers/userController/userController.js'
import {
  addToCart,
  deleteFromCart,
  getCartItems,
} from '../controllers/userController/cartController.js'
import {
  changeOrderStatus,
  getAllOrders,
  getOrderDetails,
  placeOrder,
} from '../controllers/userController/orderController.js'
import { getWalletHistory } from '../controllers/userController/walletController.js'
import { ApplyCupons } from '../controllers/userController/cuponController.js'
import { getOfferDetails, getOffers } from '../controllers/userController/offerController.js'
import { getCupons } from '../controllers/userController/cuponController.js'
import { Repayment } from '../controllers/userController/paymentController.js'

const router = express.Router()
router.get('/getProducts',verifyToken, getProducts)
router.get('/getProductDetails/:id', verifyToken, getProductDetails)
router.get('/productVarientDetails', verifyToken, getProductVarientDetails)
router.post('/login', login)
router.post('/register', register)
router.post('/otp-generation',OTPGeneration)
router.post('/otp-verify', otpVerification)
router.post('/otp-regeneration',otpRegeneration)
router.post('/add-review', verifyToken, addReview)
router.get('/get-review', verifyToken, getReview)
router.get('/getCurrentUser', verifyToken, getUser)
router.post('/editUser', verifyToken, editUser)
router.get('/featuredProducts', verifyToken, getFeaturedProducts)
router.post('/forgetPassword',forgetPassword)
router.post('/reset-password/:token', resetPassword)
router.get('/getCategories', getCategories)
router.post('/add-address', verifyToken, addShippingAddress)
router.get('/getShippingAddress', verifyToken, getShippingAddress)
router.delete('/deleteShippingAddress', verifyToken, deleteShippingAddress)
router.put('/editShippingAddress', verifyToken, editShippingAddress)
router.post('/addToCart', verifyToken, addToCart)
router.get('/getCartItems', verifyToken, getCartItems)
router.delete('/removeItem', verifyToken, deleteFromCart)
router.get('/category-sort', categorySort)
router.get('/price-range', priceSort)
router.get('/sort-tag', tagSort)
router.get('/alpha-sort', alphaSort)
router.get('/search', searchProducts)
router.get('/chooseAddress',verifyToken, chooseShippingAddress)
router.post('/placeOrder', verifyToken, placeOrder)
router.get('/orders', verifyToken, getAllOrders)
router.get('/orderDetails', verifyToken, getOrderDetails)
router.get('/addToWishlist', verifyToken, addToWishlist)
router.get('/getWishlistProducts',verifyToken, wishlistProducts)
router.get('/getWishlistFullProducts', verifyToken, getWishlistProducts)
router.delete('/removeFromWishlist', verifyToken, removeFromWishlist)
router.get('/getWalletHistory', verifyToken, getWalletHistory)
router.post('/applyCupon', verifyToken, ApplyCupons)
router.get('/getOffer', verifyToken, getOfferDetails)
router.get('/getOffers', getOffers)
router.post('/changeOrderStatus', verifyToken, changeOrderStatus)
router.get('/getCupons', getCupons)
router.post('/renewPassword', verifyToken, renewPassword)
router.post('/repayment', verifyToken, Repayment)
export default router
