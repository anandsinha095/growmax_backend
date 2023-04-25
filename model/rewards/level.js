import { Schema, model } from 'mongoose';
let level = Schema({ 
    direct: { type: Number, trim: true},
    level: { type: Number, trim: true },
    rewardPersentage: { type: Number, trim: true },
    rankRequied: { type: Boolean, default: false },
    status: { type: Boolean, default: true },
    isActive:{ type: Boolean, default: true }
}, { timestamps: true })
//User.plugin(mongoosePaginate);
export default model('level', level, 'level');