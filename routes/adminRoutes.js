import express from 'express'
import { AdminLogin } from '../controllers/adminController/authController.js'
import { verifyAdminToken } from '../utils/authMiddleware.js'
import {
  BlockUnblockUser,
  getAllUsers,
} from '../controllers/adminController/userController.js'
import {
  DeleteCategory,
  EditCategory,
  addBaseProduct,
  addCategory,
  addProductVariant,
  deleteBaseProducts,
  deleteVariant,
  editBaseProduct,
  editProductVariant,
  getAllCategories,
  getBaseProductById,
  getBaseProducts,
  getProductVarientDetails,
  getProductVarients,
  topTenProductVariants,
} from '../controllers/adminController/productController.js'
import {
  editPaymentStatus,
  getAllOrders,
  getOrderDetails,
} from '../controllers/adminController/orderController.js'
import {
  addOffer,
  applyCategoryOffer,
  applyOffer,
  createOffer,
  deleteAddedOffer,
  deleteAppliedCategoryOffer,
  deleteOffer,
  getAddedOffers,
  getAllOffers,
  getCatoryAppliedOffer,
} from '../controllers/adminController/offerController.js'
import {
  createCupon,
  deleteCupon,
  getCupons,
  updateCupon,
} from '../controllers/adminController/cuponController.js'
import { getSales } from '../controllers/adminController/saleReportController.js'

const router = express.Router()

router.post('/adminlogin', AdminLogin)
router.get('/getUsers', verifyAdminToken, getAllUsers)
router.get('/blockUnblock', verifyAdminToken, BlockUnblockUser)
router.post('/addBaseProduct', verifyAdminToken, addBaseProduct)
router.get('/getBaseProducts', verifyAdminToken, getBaseProducts)
router.post('/addProductVarient', verifyAdminToken, addProductVariant)
router.get('/productVarients', verifyAdminToken, getProductVarients)
router.post('/add-category', verifyAdminToken, addCategory)
router.get('/categories', verifyAdminToken, getAllCategories)
router.get('/deleteCategory', verifyAdminToken, DeleteCategory)
router.put('/editCategory/:id', verifyAdminToken, EditCategory)
router.get('/deleteBaseProduct', verifyAdminToken, deleteBaseProducts)
router.post('/editBaseProduct', verifyAdminToken, editBaseProduct)
router.get('/deleteVarient', verifyAdminToken, deleteVariant)
router.post('/editProductVarient', verifyAdminToken, editProductVariant)
router.get('/orders', verifyAdminToken, getAllOrders)
router.put('/editPaymentStatus/:orderId', verifyAdminToken, editPaymentStatus)
router.post('/createOffer', verifyAdminToken, createOffer)
router.get('/getAllOffers', verifyAdminToken, getAllOffers)
router.delete('/deleteOffer', verifyAdminToken, deleteOffer)
router.post('/addOffer', verifyAdminToken, addOffer)
router.get('/getAllAddedOffers', verifyAdminToken, getAddedOffers)
router.delete('/deleteAddedOffer', verifyAdminToken, deleteAddedOffer)
router.post('/applyOffer', verifyAdminToken, applyOffer)
router.post('/createCupon', verifyAdminToken, createCupon)
router.get('/getCupons', verifyAdminToken, getCupons)
router.delete('/deleteCupons', verifyAdminToken, deleteCupon)
router.post('/updateCupon', verifyAdminToken, updateCupon)
router.get('/getSales',getSales)
router.post('/applyCategoryOffer', verifyAdminToken, applyCategoryOffer)
router.get('/getAppliedOffer', verifyAdminToken, getCatoryAppliedOffer)
router.delete('/deleteAppliedCategoryOffer',verifyAdminToken,deleteAppliedCategoryOffer)
router.get('/topTenProducts',verifyAdminToken,topTenProductVariants)
router.get('/getBaseProduct',verifyAdminToken,getBaseProductById)
router.get('/getOrderDetails',verifyAdminToken,getOrderDetails)
router.get('/productVarientDetails',verifyAdminToken,getProductVarientDetails)


export default router
