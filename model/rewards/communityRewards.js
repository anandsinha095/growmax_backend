import { Schema, model } from 'mongoose';
let communityRewards = Schema({ 
        userId: { type: String, trim: true },
        username: {type: String, trim: true},
        parentsDetails:[
                         { userId:String, username: String}
                    ],
}, { timestamps: true })
//User.plugin(mongoosePaginate);
export default model('communityRewards', communityRewards, 'communityRewards');