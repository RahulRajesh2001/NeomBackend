import CuponModel from '../../model/cuponModel.js'

export const ApplyCupons = async (req, res) => {

  try {
    const { cupon,total } = req.body;
    const couponExisting = await CuponModel.findOne({ code: cupon });

    if (!couponExisting) {
      return res.status(400).json({ message: "No coupon exists!" });
    }

    if (couponExisting.usageLimit <= 0) {
      return res.status(400).json({ message: "Coupon limit is exceeded!" });
    }
    await CuponModel.findOneAndUpdate({ code: cupon }, { $inc: { usageLimit: -1 } });

    let CuponAmount = 0;
    if (couponExisting.discountType === 'FixedAmount') {
      CuponAmount = couponExisting.discountValue;
    } else {
      const discountAmount = (total * couponExisting.discountValue) / 100;
      CuponAmount = discountAmount;
    }
    
    res.status(200).json({ message: "Coupon applied successfully!",CuponAmount,cupon:couponExisting.cuponName});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Some Error occurred. Try again!' });
  }
};



export const getCupons= async (req, res) => {
    try {
      const cupons=await CuponModel.find()
      if(cupons.length===0){
        return res.status(404).json({message:"Coupon not found"})
      }
      res.status(200).json({message:"Cupons",cupons})
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Some Error occurred. Try again!' });
    }
  };


// GET
// api/v1/getCuponDetails
// --- users
// export const getCuponDetails= async (req, res) => {
//   try {
    
//     const {cupon}=req.query;
//     console.log(cupon)
   
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Some Error occurred. Try again!' });
//   }
// };