import { Schema, model } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';
let customerAddresses = Schema({
    userId: { type: Schema.Types.ObjectId, trim: true },
    fullName: { type: String, trim: true },
    phoneNumber: { type: Number, trim: true },    
    alternetNumber: { type: Number, trim: true }, 
    landmark: { type: String, trim: true },
    addressOne: { type: String, trim: true },
    addressTwo: { type: String, trim: true },
    countryId: { type: Number, trim: true },
    stateId: { type: Number, trim: true },
    cityId: { type: Number, trim: true },
    zipcode: { type: String, trim: true },
    softDelete: { type: Boolean, default: false },
}, { timestamps: true })
//User.plugin(mongoosePaginate);
export default model('customerAddresses', customerAddresses, 'customerAddresses');
