import CATEGORY from '../../model/categoryModel.js'
import OfferModel from '../../model/offerModel.js'
import Product from '../../model/productModel.js'
import ProductVariant from '../../model/productVarientModel.js'

// POST
// api/v1/admin/createOffer
// --- admin

export const createOffer = async (req, res) => {
  try {
    console.log(req.body)
    const {
      offerName,
      description,
      discountValue,
      validFrom,
      validUntil,
      offerType,
      discountType,
    } = req.body
    const existingOffer = await OfferModel.find({ offerName })
    if (!existingOffer.length == 0) {
      return res.status(500).json({ message: 'Offer existing !' })
    }

    const offer = new OfferModel({
      offerName,
      description,
      discountValue,
      validFrom,
      validUntil,
      offerType,
      discountType,
    })

    await offer.save()
    res.status(200).json({ message: 'Offer Created Successfully', offer })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Some Error occured .. Try again !' })
    throw err
  }
}

// get
// api/v1/admin/getAllOffers
// --- admin

export const getAllOffers = async (req, res) => {
  try {
    const offers = await OfferModel.find()
    if (offers.length == 0) {
      return res.status(500).json({ message: 'NO offers existing !' })
    }
    res.status(200).json({ message: 'Offer Fetched Successfully', offers })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Some Error occured .. Try again !' })
    throw err
  }
}

// delete
// api/v1/admin/deleteOffer
// --- admin
export const deleteOffer = async (req, res) => {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ message: 'There is no Id!' });
    }
    const products = await ProductVariant.find({ "offers.offerId": id });

    await Promise.all(products.map(async product => {
      product.offers = [];
      await product.save();
    }));

    const response = await OfferModel.deleteOne({ _id: id });

    if (!response.acknowledged) {
      return res.status(500).json({ message: 'Offer is not deleted!' });
    }

    const offers = await OfferModel.find(); 
    res.status(200).json({ message: 'Offer Deleted Successfully!', offers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Some Error occurred. Try again!' });
  }
};


// post
// api/v1/admin/addOffer
// --- admin

export const addOffer = async (req, res) => {
  try {
    const { id, varientId, type, amount } = req.body

    // Check if the offer already exists in any ProductVariant
    const existingOffer = await ProductVariant.findOne({ _id: varientId })

    if (existingOffer) {
      return res.status(200).json({ message: 'Offer already added' })
    }

    if (!id) {
      return res.status(400).json({ message: 'No offer selected!' })
    }
    const productVariant = await ProductVariant.findById(varientId)
    const data = { offerId: id, type, amount }
    productVariant.offers.push()

    await productVariant.save()
    const updatedProductVariant = await ProductVariant.findById(varientId)
    const offers = await OfferModel.find({
      _id: { $in: updatedProductVariant.offers },
    })
    return res
      .status(200)
      .json({ message: 'Offer added successfully!', offers })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Some error occurred. Try again!' })
  }
}

// get
// api/v1/admin/applyOffer
// --- admin

export const applyOffer = async (req, res) => {
  try {
    const { varientId, id, offertype, offeramount } = req.body
    const updatedProductVariant = await ProductVariant.findById(varientId)

    if (!updatedProductVariant) {
      return res.status(404).json({ message: 'Product variant not found!' })
    }

    let price
    if (offertype === 'Percentage') {
      price = (updatedProductVariant?.salePrice * offeramount) / 100
    } else {
      price = offeramount
    }

    if (updatedProductVariant.offers.length === 0) {
      updatedProductVariant.offers.push({
        offerId: id,
        offerAmount: price,
        offerType: offertype,
      })
    } else {
      if (updatedProductVariant.offers[0].offerAmount < price) {
        ;(updatedProductVariant.offers[0].offerId = id),
          (updatedProductVariant.offers[0].offerAmount = price),
          (updatedProductVariant.offers[0].offerType = offertype)
      }
    }
    await updatedProductVariant.save()
    if (updatedProductVariant.offers[0].offerAmount > price) {
      return res
        .status(200)
        .json({ message: 'Better offer is already applied' })
    }
    res.status(200).json({ message: 'Offer applied Successfully' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Some error occurred. Try again!' })
  }
}

// get
// api/v1/admin/getAllAddedOffer
// --- admin

export const getAddedOffers = async (req, res) => {
  try {
    const { varientId } = req.query
    if (!varientId) {
      return res.status(400).json({ message: 'Missing _id parameter' })
    }
    // Find the ProductVariant document by its _id
    const productVariant = await ProductVariant.findById({ _id: varientId })

    if (!productVariant) {
      return res.status(404).json({ message: 'ProductVariant not found' })
    }
    const offerIds = productVariant.offers.map((offer) => offer.offerId)
    const offers = await OfferModel.find({ _id: { $in: offerIds } })

    res.status(200).json({ offers })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Some error occurred. Try again!' })
  }
}

// delete
// api/v1/admin/deleteAddedOffer
// --- admin
export const deleteAddedOffer = async (req, res) => {
  try {
    const { id, varientId } = req.query
    if (!id) {
      return res.status(400).json({ message:'Missing _id parameter' })
    }

    const productVariant = await ProductVariant.findById(varientId)

    if (!productVariant) {
      return res.status(404).json({ message: 'ProductVariant not found' })
    }

    const offers = await OfferModel.find({ _id: id })

    if (!offers) {
      return res.status(404).json({ message: 'Offer not found' })
    }

    let currentDiscount = 0
    for (const offer of offers) {
      if (offer._id.toString() === id) {
        if (offer.discountType == 'FixedAmount') {
          currentDiscount = offer.discountValue
        } else {
          const discountAmount =
            (productVariant.salePrice * offer.discountValue) / 100
          currentDiscount = discountAmount
        }

        productVariant.salePrice += currentDiscount
        await productVariant.save()

        console.log(offer.productId)

        offer.productId.pull(varientId)
        await offer.save()
      }
    }
    productVariant.offers.pull(id)
    await productVariant.save()

    res.status(200).json({ message: 'Offer deleted successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Some error occurred. Try again!' })
  }
}

// POST
// api/v1/admin/applyCategoryOffer
// --- admin
export const applyCategoryOffer = async (req, res) => {
  try {
    const { id, categoryId, offertype, offervalue } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Missing _id parameter' });
    }
    if (!categoryId) {
      return res.status(400).json({ message: 'Missing categoryId parameter' });
    }

    const category = await CATEGORY.findById(categoryId);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    const products = await Product.find({ category: category.title });

    const productIds = products.map(product => product._id);

    const productVariants = await ProductVariant.find({ productId: { $in: productIds } });

    // Apply the offer to each product variant
    for (const productVariant of productVariants) {
      let price;
      if (offertype === 'Percentage') {
        price = (productVariant.salePrice * offervalue) / 100;
      } else {
        price = offervalue;
      }
  
      if (productVariant.offers.length === 0) {
        productVariant.offers.push({
          offerId: id,
          offerAmount: price,
          offerType: offertype,
        });
      } else {
        if (productVariant.offers[0].offerAmount < price) {
          productVariant.offers[0].offerId = id;
          productVariant.offers[0].offerAmount = price;
          productVariant.offers[0].offerType = offertype;
        }
      }

      await productVariant.save();
    }

    return res.status(200).json({ message: 'Category offer applied successfully!' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Some error occurred. Try again!' });
  }
};

// get
// api/v1/admin/getCatoryAppliedOffer
// --- admin

export const getCatoryAppliedOffer = async (req, res) => {
  try {
    const { categoryId } = req.query
    if (!categoryId) {
      return res.status(400).json({ message: 'Missing _Category id parameter' })
    }
    const existingCategory = await CATEGORY.findOne({ _id: categoryId })
    if (!existingCategory) {
      return res.status(500).json({ message: 'There is no category existing!' })
    }

    const categoryOfferId = existingCategory.appliedOffers[0]
    if (categoryOfferId) {
      const categoryOffer = await OfferModel.find({ _id: categoryOfferId })
      if (categoryOffer) {
        return res.status(200).json({ message: 'Successfull', categoryOffer })
      }
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Some error occurred. Try again!' })
  }
}

// Delete
// api/v1/admin/getCatoryAppliedOffer
// --- admin

export const deleteAppliedCategoryOffer = async (req, res) => {
  try {
    const { id, categoryid } = req.query

    const productVarients = await ProductVariant.find({ offers: id })

    if (!productVarients || productVarients.length == 0) {
      return res.status(404).json({
        message: 'No ProductVariants found with the specified offer ID.',
      })
    }
    //fetching the offer
    const offer = await OfferModel.findById(id)
    if (!offer) {
      return res.status(404).json({ message: 'Offer not found.' })
    }

    //iterating through each varient
    for (const productVariant of productVarients) {
      let discount = 0
      if (offer.discountType === 'FixedAmount') {
        discount = offer.discountValue
      } else {
        discount = (productVariant.salePrice * offer.discountValue) / 100
      }
      productVariant.salePrice += discount

      // Pull the offer ID from the offers array
      const index = productVariant.offers.indexOf(id)
      if (index !== -1) {
        productVariant.offers.splice(index, 1)
      }
      await productVariant.save()
    }

    console.log('this is id', id)
    await CATEGORY.findByIdAndUpdate(categoryid, {
      $pull: { appliedOffers: id },
    })
    res.status(200).json({ message: 'Offer deleted successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Some error occurred. Try again!' })
  }
}
