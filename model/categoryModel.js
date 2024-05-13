    import mongoose, { Schema } from "mongoose";

    const categorySchema = new Schema({
        title:{
            type:String,
            required:true
        },
        description:{
            type:String,
            required:true
        },
        isDeleted:{
            type:Boolean,
            default:false
        },
        appliedOffers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Offer'
        }]

    })

    const CATEGORY=mongoose.model('CATEGORY',categorySchema);

    export default CATEGORY