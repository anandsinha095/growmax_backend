import { Schema, model } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';
let inventory = Schema({
    item: { type: Number, required: true },
    subItem: { type: String, trim: true },
    sizeDetails: [
        {quantity:String,  size : String, status : Boolean}],
    updatedBy: { type: String, trim:true },
    createdBy: { type: String, trim:true },
    status: { type: Boolean, default: true },
}, { timestamps: true })
//User.plugin(mongoosePaginate);
export default model('inventory', inventory, 'inventory');
