import User from '../../model/userModel.js'
import jwt from 'jsonwebtoken'
import ShippingAddressModel from '../../model/shoppingAddress.js'

export const getUser = async (req, res) => {
  try {
    const token = req.query.token

    if (!token) {
      return res
        .status(404)
        .json({ message: 'User not found .. Please login !' })
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findOne({ _id: decoded.id })
    if (!user) {
      return res
        .status(404)
        .json({ message: 'User not found .. Please login !' })
    }


    res.status(200).json({ message: 'Successfull', user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Some Error occured .. Try again !' })
    throw err
  }
}

export const editUser = async (req, res) => {
  try {
    const { id, name, email } = req.body
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email },
      { new: true }
    )
    if (!updatedUser) {
      return res
        .status(404)
        .json({ message: 'There is no User .. Please login.!' })
    }

    res.status(200).json({ message: 'Updated Successfully !', updatedUser })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Some Error occured .. Try again !' })
    throw err
  }
}

// GET
// api/v1/add-address
// --- users

export const addShippingAddress = async (req, res) => {
  try {
    const {
      name,
      address,
      city,
      pincode,
      phone1,
      phone2,
      street,
      landmark,
      region,
    } = req.body;

    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: 'You are unauthorized. Please login to continue.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const shippingAddress = new ShippingAddressModel({
      userId,
      name,
      address,
      city,
      pincode,
      phone1,
      phone2,
      street,
      landmark,
      region,
    });

    const savedAddress = await shippingAddress.save();
    if (savedAddress) {
      const remainingAddresses = await ShippingAddressModel.find();
      return res.status(200).json({ message: 'Address saved successfully !', remainingAddresses });
    } else {
      return res.status(500).json({ message: 'Address adding failed !' });
    }
  } catch (err) {
    console.error(err);
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token. Please login again.' });
    }
    return res.status(500).json({ message: 'Some error occurred. Please try again later.' });
  }
};

// GET
// api/v1/getShippingAddress
// --- users

export const getShippingAddress = async (req, res) => {
  try {
    const token = req.headers.authorization
    if (!token) {
      return res
        .status(401)
        .json({ message: 'You are unauthorized. Please login to continue.' })
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const userId = decoded.id
    
    const shippingAddresses = await ShippingAddressModel.find({userId })
    if(!shippingAddresses){
      return res.status(404).json({message:"No addresses present ! Add address "})
    }


    res.status(200).json({message:"Successfull",shippingAddresses})
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Some Error occured .. Try again !' })
    throw err
  }
}

// DELETE
// api/v1/deleteAddress
// --- users

export const deleteShippingAddress = async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) {
      return res.status(400).json({ message: "Invalid address ID provided" });
    }

    const deleteResult = await ShippingAddressModel.deleteOne({ _id: id });

    if (deleteResult.acknowledged) {
      const existingAddresses = await ShippingAddressModel.find();
      return res.status(200).json({
        message: "Address deleted successfully",
        existingAddresses: existingAddresses,
      });
    } else {
      return res.status(500).json({ message: "Failed to delete address" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// PUT
// api/v1/deleteAddress
// --- users
export const editShippingAddress = async (req, res) => {
  try {
    const id=req.query.id
    const {
      name,
      address,
      city,
      pincode,
      phone1,
      phone2,
      street,
      landmark,
      region,
    } = req.body;
    const shippingAddress={
      name,
      address,
      city,
      pincode,
      phone1,
      phone2,
      street,
      landmark,
      region,
    };

    
    const existingAddress = await ShippingAddressModel.findByIdAndUpdate(
      id, 
      shippingAddress,
      { new: true } 
    );

    if(existingAddress){
      const remainingAddresses=await ShippingAddressModel.find()
      return res.status(200).json({ message: "Shipping address updated successfully", remainingAddresses })
    }else{
      return res.status(400).json({ message: "Shipping address not updated !"})
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const chooseShippingAddress = async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) {
      return res.status(400).json({ message: "Invalid address ID provided" });
    }
    const address = await ShippingAddressModel.findOne({ _id: id });
    if (!address) {
      return res.status(500).json({ message: "There is no id" });
    }
   res.status(200).json({ message: "Successfull",address});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}