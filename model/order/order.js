import { Schema, model } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';
let order = Schema({
    orderId:{type: String, trim: true},
    item:{type: Number, trim: true},
    customerId: { type: Schema.Types.ObjectId, trim: true },
    price: { type: String, trim: true },
    rate:{type: Number, trim: true},
    expectedPrice:{type: Number, trim: true},
    orderhandler: { type: Schema.Types.ObjectId, trim: true },
    createdBy: { type: Schema.Types.ObjectId, trim: true },
    nameCreatedBy: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    status: { type: Number, default: null}
}, { timestamps: true })
//User.plugin(mongoosePaginate);
export default model('order', order, 'order');
