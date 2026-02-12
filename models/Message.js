import mongoose from "mongoose";

const messageSchema=new mongoose.Schema({
    customerName:{
        type:String,
        required:true
    },
    customerEmail:{
        type:String,
        required:true
     },
    subject:{
        type:String,
        required:true
        },
    message:{
        type:String,
        required:true
        },
}
,{timestamps:true}
)

export default mongoose.model("Message", messageSchema);