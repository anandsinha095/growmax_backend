import { Schema, model } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';
let classes = Schema({
    classId:{ type: String, trim: true },
    name: { type: String, trim: true },
    seats: { type: Number,default:0, trim: true },
    steats: { type: Number, trim: true },
    subject: [{ subjectName:String, status:Boolean}],
    classFee:{
        registration: { type: Number, default:0, trim: true },
        security: { type: Number, default:0, trim: true },
        admission:{type: Number, default:0, trim: true},
        annual: { type: Number, default:0, trim: true },
        exam: { type: Number,default:0, trim: true},
        tuition: { type: Number,default:0, trim: true},
        computer: { type: Number, default:0, trim: true},
        transport: { type: Number, default:0, trim: true},
        dance: { type: Number, default:0, trim: true},
        miscellaneous: { type: Number, default:0, trim: true},
        extraActivityClasses: {type: Number, default:0, trim: true},
    },
    createdBy: { type: Schema.Types.ObjectId, trim: true },
    updatedBy: { type: Schema.Types.ObjectId, trim: true },
    status: { type: Boolean, default: true },
}, { timestamps: true })
//User.plugin(mongoosePaginate);
export default model('classes', classes, 'classes');

