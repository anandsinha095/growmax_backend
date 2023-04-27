import { Schema, model } from 'mongoose';
let wallet = Schema({ 
    userId: { type: String, required: "UserId is Required." },
    coreWallet:{type: Number, trim: true, default:0},
    ecoWallet:{type: Number, trim: true, default:0},
    tradeWallet:{type: Number, trim: true, default:0},
    status: { type: Boolean, default: true },
    isActive:{ type: Boolean, default: true }
}, { timestamps: true })
//User.plugin(mongoosePaginate);
export default model('wallet', wallet, 'wallet');