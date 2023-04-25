import { Schema, model } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';
let permission = Schema({
    userId: { type: Schema.Types.ObjectId, trim: true },
    roleName: {type: String, trim: true},
    dashboard: {view : Boolean},
    product:{view: Boolean, approve: Boolean},
    order: {view: Boolean, status: Boolean},
    role: {create: Boolean ,view: Boolean, edit: Boolean},
    transaction: {view: Boolean},
    customer: {create: Boolean, edit: Boolean, view: Boolean, delete: Boolean},
    vendor: {create: Boolean, edit: Boolean, view: Boolean, delete: Boolean},
    user: {create: Boolean, edit: Boolean, view: Boolean, delete: Boolean},
    feedback: { edit: Boolean, create: Boolean, view: Boolean, report: Boolean},
    emailCampaign: {view : Boolean},
    smsCampaign: {view : Boolean},
    createdBy:{type: Schema.Types.ObjectId, trim:true},
    status: { type: Boolean, default: true },
    softDelete: { type: Boolean, default: true },
}, { timestamps: true })
export default model('permission', permission, 'permission');
