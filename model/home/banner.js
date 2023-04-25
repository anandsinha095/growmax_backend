import { Schema, model } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';
let homeBanner = Schema({    
    countId:{ type: String, trim: true },  
    banner:{ type: String, trim: true },
    bannerHeader:{ type: String, trim: true },
    bannerText:{ type: String, trim: true },
    bannerLinkId:{ type: Schema.Types.ObjectId, trim: true },
    createdBy: { type: Schema.Types.ObjectId, trim: true },
    updatedBy: { type: Schema.Types.ObjectId, trim: true },
    status: { type: Boolean, default: true },
}, { timestamps: true })
//User.plugin(mongoosePaginate);
export default model('homeBanner', homeBanner, 'homeBanner');
