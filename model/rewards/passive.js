import { Schema, model } from 'mongoose';
let passiveReward = Schema({ 
    userId: { type: String, required: "UserId is Required." },
    package: { type: String, trim: true },
    packageId: { type: String, trim: true },
    price:{type: String, trim: true },
    roi:{type: Number, trim: true },
    reward: { type: Number, trim: true},
    pendingReward: { type: Number, trim: true},
    totalReward: { type: Number, trim: true},
}, { timestamps: true })
//User.plugin(mongoosePaginate);
export default model('passiveReward', passiveReward, 'passiveReward');
