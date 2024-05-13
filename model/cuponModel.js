import mongoose from 'mongoose'

const CuponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountType: {
    type: String,
    enum: ['Percentage', 'FixedAmount'],
    required: true,
  },
  discountValue: { type: Number, required: true },
  validFrom: { type: Date, required: true },
  validUntil: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  cuponName: { type: String, required: true },
  description: { type: String, required: true },
  createdDate: { type: Date, default: Date.now },
  modifiedDate: { type: Date, default: Date.now },
  usageLimit: { type: Number, default: null },
})

const CuponModel = mongoose.model('CUPON', CuponSchema)
async function removeExpiredDocuments() {
  try {
    const currentDate = new Date()
    await CuponModel.deleteMany({ validUntil: { $lt: currentDate } })
    console.log('Expired documents removed successfully')
  } catch (error) {
    console.error('Error removing expired documents:', error)
  }
}

setInterval(removeExpiredDocuments, 60 * 60 * 1000)
export default CuponModel
