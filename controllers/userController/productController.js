import CATEGORY from '../../model/categoryModel.js'
import Product from '../../model/productModel.js'
import ProductVariant from '../../model/productVarientModel.js'
import reviewModel from '../../model/reviewModel.js'
import WishListModel from '../../model/wishlistModel.js'
import jwt from 'jsonwebtoken'
import ErrorHandler from '../../utils/errorHandler.js'
import catchAsyncErrors from '../../middlewares/catchAsyncErrors.js'

// GET
// api/v1/getProducts
export const getProducts = catchAsyncErrors(async (req, res, next) => {
  try {
    const products = await Product.aggregate([
      {
        $lookup: {
          from: 'productvariants',
          localField: '_id',
          foreignField: 'productId',
          as: 'variants',
        },
      },
    ])

    if (products.length == 0) {
      return next(new ErrorHandler('Products not found', 404))
    }
    res.status(200).json({ message: 'Products fetched successfully', products })
  } catch (err) {
    console.error('Error in getProducts:', err)
    next(err)
  }
})

//------------------------------------------------------------------------------------------------------------------------------------------

// GET
// api/v1/getProductDetails/:id
export const getProductDetails = catchAsyncErrors(async (req, res, next) => {
  try {
    let id = req.query.id
    const products = await Product.aggregate([
      {
        $lookup: {
          from: 'productvariants',
          localField: '_id',
          foreignField: 'productId',
          as: 'variants',
        },
      },
    ])

    const foundProduct = products.find((product) => product._id == id)

    if (foundProduct) {
      res.status(200).json({
        message: 'Product founded Successfully',
        product: foundProduct,
      })
    } else {
      return next(new ErrorHandler('Products not found', 404))
    }
  } catch (err) {
    console.error('Error in getProduct Details:', err)
    next(err)
  }
})

//---------------------------------------------------------------------------------------------------------------------------------------

// GET
// api/v1/productVarientDetails
export const getProductVarientDetails = catchAsyncErrors(
  async (req, res, next) => {
    try {
      const { id } = req.query
      if (!id) {
        return next(new ErrorHandler('Missing Id Parameter', 404))
      }
      const product = await ProductVariant.findOne({ _id: id })
      if (!product) {
        return next(new ErrorHandler('Products not found', 404))
      }
      res.status(200).json({ message: 'Successfull', product })
    } catch (err) {
      console.error('Error in getProduct Varient Detials:', err)
      next(err)
    }
  }
)

//-------------------------------------------------------------------------------------------------------------------------------------------

// POST
// api/v1/add-review
export const addReview = catchAsyncErrors(async (req, res, next) => {
  try {
    const { review, starCount, varientId } = req.body
    const token = req.headers.authorization
    if (!token) {
      return next(new ErrorHandler('User not autherized !', 401))
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.id

    const newReview = new reviewModel({
      productId: varientId,
      rating: starCount,
      review,
      userId,
    })

    await newReview.save()

    res.status(200).json({ message: 'Review & Rating Saved Successfully' })
  } catch (err) {
    console.error('Error in add review:', err)
    next(err)
  }
})

//--------------------------------------------------------------------------------------------------------------------------------------------

// GET
// api/v1/getReview
export const getReview = catchAsyncErrors(async (req, res,next) => {
  try {
    const id = req.query.id
    const review = await reviewModel.find({ productId: id })
    if (review.length==0) {
      return next(new ErrorHandler('Review not fount ', 404))
    }
    res.status(200).json({ message: 'Review fetched successfully', review })
  } catch (err) {
    console.error('Error in get Review:', err)
    next(err)
  }
})

//---------------------------------------------------------------------------------------------------------------------------------------------

// get
// api/v1/featured-products

export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $lookup: {
          from: 'productvariants',
          localField: '_id',
          foreignField: 'productId',
          as: 'variants',
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $limit: 8,
      },
    ])
    if (products.length === 0) {
      return res.status(404).json({ message: 'No Products Found!' })
    }
    res.status(200).json({ message: 'Successfully fetched products', products })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'An error occurred. Please try again.' })
    throw err
  }
}

// get
// api/v1/getCategies
// --- user
export const getCategories = async (req, res) => {
  try {
    const categories = await CATEGORY.find().sort({ createdAt: -1 }).limit(6)
    res
      .status(200)
      .json({ message: 'categories fetched successfully', categories })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Some Error occurred. Try again!' })
  }
}

// get
// api/v1/category
// --- user
export const categorySort = async (req, res) => {
  try {
    const { check } = req.query
    const products = await Product.aggregate([
      {
        $match: { category: check },
      },
      {
        $lookup: {
          from: 'productvariants',
          localField: '_id',
          foreignField: 'productId',
          as: 'variants',
        },
      },
    ])
    res.status(200).json({ message: 'Category Successfull', products })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Some Error occurred. Try again!' })
  }
}

// get
// api/v1/price-range
// --- user

export const priceSort = async (req, res) => {
  try {
    const { min, max } = req.query
    const minPrice = Number(min) * 1000
    const maxPrice = Number(max) * 1000

    const products = await ProductVariant.find({
      salePrice: { $gt: minPrice, $lt: maxPrice },
    })

    res.status(200).json({ message: 'Successful', products })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Some error occurred. Try again!' })
  }
}

// get
// api/v1/category
// --- user
export const tagSort = async (req, res) => {
  try {
    const { tag } = req.query
    const products = await Product.aggregate([
      {
        $match: { brand: tag },
      },
      {
        $lookup: {
          from: 'productvariants',
          localField: '_id',
          foreignField: 'productId',
          as: 'variants',
        },
      },
    ])
    res.status(200).json({ message: 'Category Successfull', products })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Some Error occurred. Try again!' })
  }
}

// get
// api/v1/category
// --- user
export const alphaSort = async (req, res) => {
  try {
    const { alpha } = req.query
    const sortValue = parseInt(alpha)

    if (sortValue !== 1 && sortValue !== -1) {
      return res.status(400).json({
        message:
          'Invalid sorting order. Must be 1 (ascending) or -1 (descending).',
      })
    }

    const products = await Product.aggregate([
      {
        $sort: { name: sortValue },
      },
      {
        $lookup: {
          from: 'productvariants',
          localField: '_id',
          foreignField: 'productId',
          as: 'variants',
        },
      },
    ])
    res.status(200).json({ message: 'Category Successfull', products })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Some Error occurred. Try again!' })
  }
}

// get
// api/v1/category
// --- user
export const searchProducts = async (req, res) => {
  const { searchQuery } = req.query
  console.log('this is my query', searchQuery)

  try {
    const regex = new RegExp(searchQuery, 'i')
    console.log('this is my regex', regex)

    const products = await Product.aggregate([
      {
        $match: {
          $or: [{ name: { $regex: regex } }, { brand: { $regex: regex } }],
        },
      },
      {
        $lookup: {
          from: 'productvariants',
          localField: '_id',
          foreignField: 'productId',
          as: 'variants',
        },
      },
    ])

    console.log('this is product', products)
    res.json(products)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Some error occurred. Try again!' })
  }
}

// get
// api/v1/addToWishlist
// --- user
export const addToWishlist = async (req, res) => {
  try {
    const { id } = req.query
    const existingProduct = await WishListModel.findOneAndDelete({
      productId: id,
    })
    if (existingProduct !== null) {
      return res
        .status(200)
        .json({ message: 'Product removed from wishlist !' })
    }
    const token = req.headers.authorization

    if (!token) {
      return res
        .status(401)
        .json({ message: 'You are unauthorized. Please login to continue.' })
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.id

    const product = new WishListModel({
      userId,
      productId: id,
    })

    await product.save()

    res.status(201).json({ message: 'Product added in wishlist !' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Some error occurred. Try again!' })
  }
}

// get
// api/v1/getAllProducts
// --- user
export const wishlistProducts = async (req, res) => {
  try {
    const products = await WishListModel.find()
    if (!products) {
      return res.status(404).json({ message: 'Wishlist is empty!' })
    }
    res.status(201).json({ message: 'Successfull', products })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Some error occurred. Try again!' })
  }
}

// get
// api/v1/getWishlistProduct
// --- user
//getting full products
export const getWishlistProducts = async (req, res) => {
  try {
    const token = req.headers.authorization
    if (!token) {
      return res
        .status(401)
        .json({ message: 'You are unauthorized. Please login to continue.' })
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.id

    const wishlistProducts = await WishListModel.find({ userId })
    if (!wishlistProducts || wishlistProducts.length === 0) {
      return res.status(404).json({ message: 'Wishlist is empty!' })
    }

    // Extract productIds from wishlist
    const productIds = wishlistProducts.map(
      (wishlistItem) => wishlistItem.productId
    )

    // Fetch products matching the productIds from wishlist
    const products = await ProductVariant.aggregate([
      {
        $match: {
          _id: { $in: productIds },
        },
      },
      {
        $lookup: {
          from: 'productvariants',
          localField: '_id',
          foreignField: 'productId',
          as: 'variants',
        },
      },
    ])

    res
      .status(200)
      .json({ message: 'Successfully fetched wishlist products', products })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Some error occurred. Try again!' })
  }
}

// get
// api/v1/getWishlistProduct
// --- user
//getting full products
export const removeFromWishlist = async (req, res) => {
  try {
    const { id } = req.query
    console.log('product id', id)
    if (!id) {
      return res.status(400).json({ message: "Missing parameter 'id'!" })
    }
    const result = await WishListModel.deleteOne({ productId: id })
    console.log('Delete product result', result)

    // Check if the item was successfully removed
    if (result.deletedCount === 1) {
      return res
        .status(200)
        .json({ message: 'Item removed from wishlist successfully.' })
    } else {
      return res.status(404).json({
        message:
          'Item not found in the wishlist. It might have already been removed.',
      })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Some error occurred. Try again!' })
  }
}
