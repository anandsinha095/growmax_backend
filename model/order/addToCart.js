import { Schema, model } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';
let addtocart = Schema({
    customerId: { type: Schema.Types.ObjectId, trim: true },
    productDetails:[
                     { categoryId:Schema.Types.ObjectId, productId: Schema.Types.ObjectId, price:String, productImage:String, size:String, quantity:Number , discount:Number, itemTotal: String}
                ],
}, { timestamps: true })
//User.plugin(mongoosePaginate);
export default model('addtocart', addtocart, 'addtocart');
