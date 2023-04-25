import { Schema, model } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';
let wishlist = Schema({
    countId:{ type: String, trim: true },
    userId:{ type: Schema.Types.ObjectId, trim: true },
    productId:{ type: Schema.Types.ObjectId, trim: true },
}, { timestamps: true })
//User.plugin(mongoosePaginate);
export default model('wishlist', wishlist, 'wishlist');
