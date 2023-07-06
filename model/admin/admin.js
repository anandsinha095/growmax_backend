import { Schema, model } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';
let admin = Schema({
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true, unique: true, required: 'Email address is required'},
    password: { type: String, required: 'Password is required.', trim: true },
    status: { type: Boolean, default: true },
}, { timestamps: true })
//User.plugin(mongoosePaginate); 
export default model('admin', admin, 'admin');

