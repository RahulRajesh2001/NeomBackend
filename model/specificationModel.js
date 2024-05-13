import mongoose, { Schema } from "mongoose";

const specificationSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    value:{
        type:Object,
        required:true
    }
})

const SPEC =mongoose.model('SPEC',specificationSchema);
export default SPEC;