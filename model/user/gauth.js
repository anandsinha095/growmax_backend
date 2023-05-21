import { Schema, model } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';
let twoFA = Schema({
    userId: { type: Schema.Types.ObjectId },
    login: { type: Boolean },
    secretKeyForGAuth: {},
    enableDisbaleGAuth: { type: Boolean, default: false },
}, { timestamps: true })

twoFA.plugin(mongoosePaginate);
export default model('twofa', twoFA, 'twofa');