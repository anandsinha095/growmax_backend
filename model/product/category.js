import { Schema, model } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';
let category = Schema({    
    countId:{ type: String, trim: true },  
    category:{ type: String, trim: true },
    categoryImage:{ type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, trim: true },
    updatedBy: { type: Schema.Types.ObjectId, trim: true },
    status: { type: Boolean, default: true },
    softDelete: { type: Boolean, default: false },
}, { timestamps: true })
//User.plugin(mongoosePaginate);
export default model('category', category, 'category');
