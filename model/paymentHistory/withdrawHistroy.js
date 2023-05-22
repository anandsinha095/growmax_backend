import { Schema, model } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';
let withdrawHistory = Schema({
    userId:{ type: String, trim: true },
    type:{type: String, trim: true},
    destination:{type: String, trim: true},
    pair: { type: String, trim: true },
    orderId: { type: String, trim: true},
    asset: {type: String, trim: true},
    gmtAmount: { type: Number, trim: true},
    orderStatus: { type: String, default: "PENDING", enum: ["PENDING", "CANCEL", "COMPLETED"] },
    fee: { type: Number, trim: true },
    slippage: {type: Number, trim: true},
    totalAmount: { type: Number, default: true },
    status: { type: Boolean, trim: true },
}, { timestamps: true })
//User.plugin(mongoosePaginate);
export default model('withdrawHistory', withdrawHistory, 'withdrawHistory');