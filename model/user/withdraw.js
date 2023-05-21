import { Schema, model } from 'mongoose';
let withdraw = Schema({ 
    userId: { type: String, required: "UserId is Required." },
    bnb:{type: String, trim: true, default:null},
    matic:{type: String, trim: true, default:null},
    eth:{type: String, trim: true, default:null},
    status: { type: Boolean, default: true },
    isActive:{ type: Boolean, default: true },
    feeStatus:{ type: Boolean, default: false }
}, { timestamps: true })
//User.plugin(mongoosePaginate);
export default model('withdraw', withdraw, 'withdraw');