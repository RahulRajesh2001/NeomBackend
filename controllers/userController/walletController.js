import Wallet from "../../model/walletModel.js";
import jwt from 'jsonwebtoken'

export const getWalletHistory = async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: 'You are unauthorized. Please login to continue.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const wallet = await Wallet.findOne({ user: userId });


    if (!wallet ) {
      return res.status(404).json({ message: 'Wallet not found for the user' });
    }
    res.status(200).json({ message: "Successfully fetched wallet information", wallet });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Some error occurred. Please try again!' });
  }
};

