import userModel from '../../model/user/user'/* for  user */
import productModel from '../../model/admin/inventory'/* inventory */
import { __esModule } from '@babel/register/lib/node';
import { responseHandler } from '../../common/response'
import { bcrypt, bcryptVerify, createJwt, sendMail, verifyJwtToken} from '../../common/function';
import { angular_host, angular_port } from '../../envirnoment/config'
import tokenModel from '../../model/commonModel/token';

/****   Add sub category *****/
const addProduct = async (req, res) => {
    const { item, subItem, sizeDetails} = req.body; // destructuring 
    if (item ==1 &&  !sizeDetails ) {
        return responseHandler(res, 400, "Bad request")
    }
    if (item == 2 && !subItem || !sizeDetails) {
        return responseHandler(res, 400, "Bad request")
    }
    try {
        let info = await verifyJwtToken(req, res)
        req.body.createdBy = info
        let check_product_exist = await productModel.findOne({subItem: subItem }, { createdAt: 0, updatedAt: 0, __v: 0 })
        if (check_product_exist) return responseHandler(res, 403, "Item already exist")
        await productModel.create(req.body) /* create user object */
        return responseHandler(res, 200, "Product added successfully")
    }
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
}

/****   Add sub category *****/
const updateProduct = async (req, res) => {
    const { item, productId,sizeDetails, status, subItem} = req.body; // destructuring 
    if (!item ) {
        return responseHandler(res, 400, "Bad request")
    }
    let sizeData=[];
    sizeDetails.forEach(element => {
        sizeData.push(element.size)
    });
    let findDuplicates = arr => arr.filter((item, index) => arr.indexOf(item) != index)
    if (findDuplicates(sizeData)[0] != undefined) {
        return responseHandler(res, 403, "Only unique size allowed.")
    }
    try {
        let info = await verifyJwtToken(req, res)
        req.body.updatedBy = info
        let check_product_exist = await productModel.findById({_id: productId }, { createdAt: 0, updatedAt: 0, __v: 0 })
        if (!check_product_exist) return responseHandler(res, 403, "product doesn't Exist.")
       else{
            await productModel.updateOne({ _id: productId }, { $set: { sizeDetails : sizeDetails, subItem:subItem,  status: status , updatedBy: req.body.updatedBy} }) //update the password with new one
            return responseHandler(res, 200, "product updated successfully.")
        }
    }
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
}


/********************* Main Product  ****************************/
const product = async (req, res) => {
    try {
        let info = await verifyJwtToken(req, res)
        if(info == null)
        return responseHandler(res, 400, "Bad request")
        let result = [{"item": 'Scrap', "itemKey": 1} , {"item": 'ROD', "itemKey": 2}]
        let allSubProduct = await productModel.find().sort({ createdAt: -1 })
        let finalOutput= { product : result, subproduct: allSubProduct}
        return responseHandler(res, 200, finalOutput)
    }
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
}

/****************** Sub Product list with size details ************************/
const productList = async (req, res) => {
    const { itemKey, productId} = req.body; // destructuring 
    if(itemKey != 2 || !productId){
        return responseHandler(res, 400, "Bad request") 
        }
    try {
        let check_item_exist = await productModel.findById({_id:productId})
        if (!check_item_exist) return responseHandler(res, 404, "product doesn't Exist.")
        let info = await verifyJwtToken(req, res)
        if(info == null)
        return responseHandler(res, 400, "Bad request")
        else
        return responseHandler(res, 200, check_item_exist)
    }
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
}

// const addSizeOfProduct = async (req, res) => {
//     const { item, subItem} = req.body; // destructuring 
//   console.log
// }


module.exports = {
    product:product,
    addProduct: addProduct,
    productList:productList,
    updateProduct:updateProduct
   // addSizeOfProduct:addSizeOfProduct
};