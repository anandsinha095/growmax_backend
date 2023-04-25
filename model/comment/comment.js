import { Schema, model } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';
let comment = Schema({
    orderId:{ type: Schema.Types.ObjectId, trim: true },
    comment: {type: String, trim: true},
    name: {type: String, trim: true},
    userId: { type: Schema.Types.ObjectId, trim: true },
}, { timestamps: true })
//User.plugin(mongoosePaginate);
export default model('comment', comment, 'comment');
