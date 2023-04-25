notes = {
    "entity_id": entity_id,
    "entity_type": entity_type,
    "comment": ele,
    'user_id': userId,
    'leadHandler': handler,
    "createdAt": today,
    "updatedAt": today
}
import { Schema, model } from 'mongoose';
let comment = Schema({
    comment: { type: String, required: "comment is Required." },
    orderId: { type: String,  unique: true },
    timeStamp: { type: Number, default: Date.now() },
    /** Check Link Accoring to status
    * case 1 - EMAILV  - for verify Your Email Link
    * case 2 - IPV     - for verify Your IP Link
    * case 3 - PASSV   - for Verify Password Link
    */
}, { timeStamp: true })
// token.index({ "createdAt": 1 }, { expireAfterSeconds: 10 })
export default model('comment', comment, 'comment');
