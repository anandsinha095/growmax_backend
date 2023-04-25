import bodyParser from 'body-parser';
import { Schema, model } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';
let students = Schema({
    userId:{ type: String, trim: true },
    username:{ type: String, trim: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true},
    password: { type: String, required: 'Password is required.', trim: true },
    gender: { type: Boolean, trim: true },
    dob: { type: Date, trim: true },
    classId: { type: Schema.Types.ObjectId, trim: true },
    fatherFirstName: {type: String, trim: true},
    fatherLastName: {type: String, trim: true},
    montherFirstName: {type: String, trim: true},
    montherLastName: {type: String, trim: true},
    fatherOccupation: {type: String, trim: true},
    motherOccupation: {type: String, trim: true},
    phoneNumber: { type: Number, trim: true },
    alternetPhoneNumber: { type: Number, trim: true },
    religion:{type: String, trim: true},
    addressOne: { type: String, trim: true },
    addressTwo: { type: String, trim: true },
    country: { type: String, default: "India"},
    state: { type: String, default: "Bihar"},
    city: { type: String, trim: true },
    zipcode: { type: String, trim: true },
    validateToken: { type: String, trim: true },
    isActive:{type:Boolean, trim: false},
    status: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
    profilePicture:{type: String, trim:true},
    roleNumber:{ type: String, trim: true },
}, { timestamps: true })
//User.plugin(mongoosePaginate);
export default model('students', students, 'students');

