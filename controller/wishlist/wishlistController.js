import customerModel from '../../model/customer/customer'/* To Create user */
import { __esModule } from '@babel/register/lib/node';
import { responseHandler } from '../../common/response'
import { bcrypt, bcryptVerify, createJwt, sendMail, verifyJwtToken, tenMinutesJwt} from '../../common/function';
import wishlistModel from '../../model/customer/wishlist'
import productModel from '../../model/product/product'


/************************* Add Wishlist ************************/
const addWishlist = async (req, res) => {
    const {productId}= req.params
    if(!productId)
     return responseHandler(res, 400, "Bad Request.")
    try {
        let info = await verifyJwtToken(req, res)
        let user = await customerModel.findById({ _id: info }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
        if(user == null)
        return responseHandler(res, 400, "Bad Request.")
        let product = await productModel.findById({ _id: productId }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
        if(!product)
        return responseHandler(res, 404, "Product does't exist")
        let wishlist = await wishlistModel.findOne({ productId: productId }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
        if(wishlist)
        return responseHandler(res, 406, "Product already added in your wishlist")
        else
        {
            req.body.productId= productId
            req.body.userId=info
             await wishlistModel.create(req.body) 
             return responseHandler(res, 200, "Product add successfully in wishlist")
        }
    }
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
}

/************************* Remove Wishlist ************************/
const removeWishlist = async (req, res) => {
    const {productId}= req.params
    if(!productId)
     return responseHandler(res, 400, "Bad Request.")
    try {
        let info = await verifyJwtToken(req, res)
        let user = await customerModel.findById({ _id: info }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
        if(user == null)
        return responseHandler(res, 400, "Bad Request.")
        let wishlist = await wishlistModel.findOne({ productId: productId }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
        if(!wishlist)
        return responseHandler(res, 406, "Product not in your wishlist")
        else
        {
             await wishlistModel.deleteOne({ productId: productId, userId:info }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
             return responseHandler(res, 200, "Product removed from your wishlist")
        }
    }
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
}

/*************************  Wishlist product list ************************/

const wishlistProduct = async (req, res) => {
    try {
        let info = await verifyJwtToken(req, res)
        let user = await customerModel.findById({ _id: info }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
        if(user == null)
        return responseHandler(res, 400, "Bad Request.")
        let wishlist = await wishlistModel.find({ userId: info }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
        if(!wishlist)
        return responseHandler(res, 200, "No wishlist product !")
        else{
            let product =  await productModel.find({softDelete:0}).sort({ createdAt: -1 })
            let productList =[];
            wishlist.forEach(async result => {               
                product.forEach(async ele => {
                    if(ele._id.toString()==result.productId.toString()) {                       
                        productList.push(ele)                        
                    }                   
                })               
             })
              return responseHandler(res, 200, "Success", productList)  
        }
    }
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
}


module.exports = {
    addWishlist: addWishlist,
    removeWishlist:removeWishlist,
    wishlistProduct:wishlistProduct
};