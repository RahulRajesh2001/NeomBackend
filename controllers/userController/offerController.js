import OfferModel from "../../model/offerModel.js";

// GET
// api/v1/getOfferDetails
// --- users


export const getOfferDetails = async (req, res) => {
    try {
      const {id}=req.query;
      if(!id){
        return res.status(500).json({message:"Missing ID Parameter !"})
      }
      const offer=await OfferModel.findOne({_id:id})
      res.status(200).json({message:"Successfull",offer})
  
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Some Error occurred. Try again!' })
    }
  }


  // GET
// api/v1/getOffers
// --- users
export const getOffers= async (req, res) => {
    try {
      const offers=await OfferModel.find()
      if(offers.length===0){
        return res.status(404).json({message:"Offer not found"})
      }
      res.status(200).json({message:"Successfull",offers})
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Some Error occurred. Try again!' })
    }
  }