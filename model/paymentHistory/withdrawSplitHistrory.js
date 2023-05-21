import { Schema, model } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';
let withdrawSplitHistory = Schema({
    userId:{ type: String, trim: true },
    type:{type: String, trim: true},
    Asset: { type: String, trim: true },
    amount: { type: Number, trim: true },
    destination:{type: String, trim: true},
    txId: { type: String, trim: true },
    orderId: { type: String, trim: true},
    status: { type: Boolean, default: true },
}, { timestamps: true })
//User.plugin(mongoosePaginate);
export default model('withdrawSplitHistory', withdrawSplitHistory, 'withdrawSplitHistory');
