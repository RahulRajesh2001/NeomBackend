import catchAsyncErrors from '../../middlewares/catchAsyncErrors.js'
import CartModel from '../../model/cartModel.js'
import ProductVariant from '../../model/productVarientModel.js'
import jwt from 'jsonwebtoken'
import ErrorHandler from '../../utils/errorHandler.js'

// POST
// api/v1/addToCart
export const addToCart = catchAsyncErrors(async (req, res, next) => {
  try {
    const { productVarientId, quantity } = req.body
    const maxQuantityPerPerson = 5

    if (!productVarientId) {
      return next(new ErrorHandler('Product Id is required ', 400))
    }
    const productVariant = await ProductVariant.findById(productVarientId)

    if (!productVariant) {
      return next(new ErrorHandler('Product varient not found', 404))
    }

    if (productVariant.stock <= 0) {
      return next(
        new ErrorHandler('Product is outof stock , please try again later', 400)
      )
    }

    if (quantity > productVariant.stock) {
      return next(new ErrorHandler('Insufficient stock', 400))
    }

    const token = req.headers.authorization

    if (!token) {
      return next(new ErrorHandler('Unautherized user', 401))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.id

    let userCart = await CartModel.findOne({ userId })

    if (userCart) {
      const existingProductIndex = userCart.products.findIndex((item) =>
        item.productVarientId.equals(productVarientId)
      )

      if (existingProductIndex !== -1) {
        const totalQuantity =
          userCart.products[existingProductIndex].quantity + quantity

        if (totalQuantity > maxQuantityPerPerson) {
          return res
            .status(400)
            .json({
              message: `Maximum ${maxQuantityPerPerson} quantity allowed per person`,
            })
        }

        userCart.products[existingProductIndex].quantity += quantity || 1
      } else {
        userCart.products.push({
          productVarientId,
          quantity: quantity || 1,
        })
      }

      await userCart.save()
      return res
        .status(200)
        .json({ message: 'Successfully added to cart', cart: userCart })
    } else {
      const newUserCart = new CartModel({ userId })

      newUserCart.products.push({
        productVarientId,
        quantity: quantity || 1,
      })

      await newUserCart.save()
      return res
        .status(200)
        .json({ message: 'Successfully added to cart', cart: newUserCart })
    }
  } catch (err) {
    console.error('Error in cart:', err)
    next(err)
  }
})

//------------------------------------------------------------------------------------------------------------------------------------------------------------


// POST
// api/v1/getCartItems


export const getCartItems = async (req, res) => {
  try {
    const token = req.headers.authorization
    if (!token) {
      return res
        .status(401)
        .json({ message: 'You are unauthorized. Please login to continue.' })
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.id

    const cartItems = await CartModel.findOne({ userId })

    const cart = await CartModel.findOne({ userId }).populate({
      path: 'products.productVarientId',
      model: 'ProductVariant',
      select:
        'varientName images salePrice regularPrice productId stock offers cupon',
    })
    res.status(200).json({ message: 'Succesfull', cart })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Some Error occurred. Try again!' })
  }
}



// POST
// api/v1/deleteCartItem
// ---

export const deleteFromCart = async (req, res) => {
  try {
    const { productVarientId } = req.query
    const token = req.headers.authorization

    if (!token) {
      return res
        .status(401)
        .json({ message: 'You are unauthorized. Please login to continue.' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.id

    const cart = await CartModel.findOne({ userId })

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' })
    }

    const existingProductIndex = cart.products.findIndex((item) =>
      item.productVarientId.equals(productVarientId)
    )

    if (existingProductIndex === -1) {
      return res
        .status(404)
        .json({ message: 'Product variant not found in the cart' })
    }

    cart.products.splice(existingProductIndex, 1)
    await cart.save()

    console.log('this is cart', cart)

    res.status(200).json({ message: 'Successfully deleted from cart', cart })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Some Error occurred. Try again!' })
  }
}
