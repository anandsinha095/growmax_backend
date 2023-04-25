import { Schema, model } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';
let vendor = Schema({
    userId: { type: String, trim: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true, unique: true, required: 'Email address is required'},
    password: { type: String, required: 'Password is required.', trim: true },
    phoneNumber: { type: Number, trim: true },
    storeName:{type: String, trim:true},
    addressOne: { type: String, trim: true },
    addressTwo: { type: String, trim: true },
    countryId: { type: Number, trim: true },
    stateId: { type: Number, trim: true },
    cityId: { type: Number, trim: true },
    zipcode: { type: String, trim: true },
   validateToken: { type: String, trim: true },
   status: { type: Boolean, default: true },
   softDelete: { type: Boolean, default: false },
   emailVerified: { type: Boolean, default: false },
   profilePicture:{type: String, trim:true},
   createdBy:{type: Schema.Types.ObjectId, trim:true},
}, { timestamps: true })
//User.plugin(mongoosePaginate);
export default model('vendor', vendor, 'vendor');

