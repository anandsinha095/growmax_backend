import { Schema, model } from 'mongoose';
let address = Schema({ 
    userId: { type: String, required: "UserId is Required." },
    chainCode: {type: String, trim: true},
    address: {type: String, trim: true},
    fingerprint:{type: String, trim: true},
    parentFingerprint: {type: String, trim: true},
    mnemonic: {type: Object, trim: true},
    publickey: {type: String, trim: true},
    privatekey: {type: String, trim: true},
    approveStatus: {type: Boolean, trim: true, default: false},
    approveAmount: {type: Number, trim: true, default: 0},
    approveExpend: {type: Number, trim: true, default: 0},
    status: { type: Boolean, default: true },
    isActive:{ type: Boolean, default: true }
}, { timestamps: true })
//User.plugin(mongoosePaginate);
export default model('address', address, 'address');