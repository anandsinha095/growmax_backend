import { Schema, model } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';
let packages = Schema({    
    name:{ type: String, trim: true },  
    price:{ type: String, trim: true },
    roi:{type: String, trim:true},
    maxPay:{type: String, trim:true},
    internalPackage:{type: Boolean, trim:true, default:false},
    status: { type: Boolean, default: true }
}, { timestamps: true })
//User.plugin(mongoosePaginate);
export default model('packages', packages, 'packages');
