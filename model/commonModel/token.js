import { Schema, model } from 'mongoose';
let token = Schema({
    userId: { type: String, required: "UserId is Required." },
    token: { type: String, required: "Token is Required.", unique: true },
    otp: { type: Number, unique: true },
    type: { type: String, enum: ["EMAILV", "PASSV"] },
    timeStamp: { type: Number, default: Date.now() },
    /** Check Link Accoring to status
    * case 1 - EMAILV  - for verify Your Email Link
    * case 2 - IPV     - for verify Your IP Link
    * case 3 - PASSV   - for Verify Password Link
    */
}, { timeStamp: true })
// token.index({ "createdAt": 1 }, { expireAfterSeconds: 10 })
export default model('token', token, 'token');
