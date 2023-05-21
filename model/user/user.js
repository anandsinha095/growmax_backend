import { Schema, model } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';
let users = Schema({
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true, unique: true, required: 'Email address is required'},
    password: { type: String, required: 'Password is required.', trim: true },
    username: { type: String, trim: true },
    paymentStatus: { type: Boolean, trim: true, default:false},
    minPayment: { type: String, trim: true },
    referralCode:{ type: String, trim: true, default:false},
    status: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
    profilePicture:{type: String, trim:true},
    twoFaStatus:{type: Boolean, trim:true, default:false},
}, { timestamps: true })
//User.plugin(mongoosePaginate); 
export default model('users', users, 'users');

