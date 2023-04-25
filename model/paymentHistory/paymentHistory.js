import { Schema, model } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';
let paymentHistory = Schema({
    userId:{ type: String, trim: true },
    packageName:{type: String, trim: true},
    blockHash: { type: String, trim: true },
    blockNumber: { type: Number, trim: true },
    from:{type: String, trim: true},
    to: { type: String, trim: true },
    amount: { type: Number, trim: true},
    paymentType: { type: String, trim: true},
    paymentMethod: { type: String, trim: true},
    paymentCoin: { type: String, trim: true},
    status: { type: Boolean, default: true },
}, { timestamps: true })
//User.plugin(mongoosePaginate);
export default model('paymentHistory', paymentHistory, 'paymentHistory');
