import { Schema, model } from 'mongoose';
let communityReward = Schema({ 
    userId: { type: String, required: "UserId is Required." },
    username: { type: String, trim: true },
    senderId: { type: String, trim: true },
    senderUsername:{type: String, trim: true },
    roi:{type: String, trim: true },
    reward: { type: Number, trim: true, default:0},
    rewards:{ type: Number, trim: true, default:0},
    ratio: {type: String, trim: true},
    rewardId:{ type: String, trim: true },
    senderCreatedAt: {type: Date},
}, { timestamps: true })
//User.plugin(mongoosePaginate);
export default model('communityReward', communityReward, 'communityReward');
