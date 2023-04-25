import userModel from '../../model/user/user'/* for  user */
import vendorModel from '../../model/vendor/vendor'
import categoryModel from '../../model/product/category'/* inventory */
import productModel from '../../model/product/product'
import { __esModule } from '@babel/register/lib/node';
import { responseHandler } from '../../common/response'
import { bcrypt, bcryptVerify, createJwt, sendMail, verifyJwtToken} from '../../common/function';
import { host, angular_port } from '../../envirnoment/config'
import tokenModel from '../../model/commonModel/token';
import multiparty from 'multiparty';
var fs = require('fs');
/****   Add sub category *****/
const addCategory = async (req, res) => {
    var form = new multiparty.Form();
    form.parse(req, async function (err, fields, files) {
        const { category, categoryImage} = req.body; // destructuring 
        if (!category ) {
            return responseHandler(res, 400, "Bad request")
        }
        try {
            let info = await verifyJwtToken(req, res)
            req.body.createdBy = info
            let check_product_exist = await categoryModel.findOne({category: category }, { createdAt: 0, updatedAt: 0, __v: 0 })
            if (check_product_exist) return responseHandler(res, 403, "Item already exist")            
            else{
                if(req.file != undefined){
                    let imagePath = req.file.path+'.'+req.file.originalname.split('.')[1];              
                    fs.rename( req.file.path , req.file.path + '.'+req.file.originalname.split('.')[1], function(err) {
                        if ( err ) console.log('ERROR: ' + err);
                    });
                    req.body.categoryImage = imagePath.replace("public/","");
                }   
                let lastCategory=  await categoryModel.find({}).sort({_id:-1}).limit(1)      
                req.body.countId =  lastCategory[0] !=undefined  ? parseFloat(lastCategory[0].countId) + 1 : 1001; 
                await categoryModel.create(req.body) /* create user object */    
                return responseHandler(res, 200, "Category added successfully")
            }
        }
        catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
    })
}
/****************** category List with size details ************************/

const categoryList = async (req, res) => {
    try {
        let info = await verifyJwtToken(req, res)
        let user = await userModel.findById({ _id: info }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
        if(user == null)
        return responseHandler(res, 400, "Bad Request.")
        else{
            let allUserData =  await categoryModel.find().sort({createdAt: -1})
                return responseHandler(res, 200, "OK", allUserData)
        }       
    }
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
}

/* Get view details of a category  Info */    

const categoryDetail = async (req, res) => {
    if (!req.body.userId) return responseHandler(res, 400, "Bad Request")
    const  userId  = req.body.userId; // destructuring 
    var result =  await categoryModel.findById({ _id: userId }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
    if (!result) return responseHandler(res, 404, "Category doesn't Exist.")
    try {
        return responseHandler(res, 200, result)       
    }
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
  }

/************************Update category  **********************/

  const updateCategory = async (req, res) => {
    var form = new multiparty.Form();
    form.parse(req, async function (err, fields, files) {
        const { categoryId, category, status} = req.body; // destructuring 
        if (!category || !categoryId || !status) {
            return responseHandler(res, 400, "Bad request")
        }
        try {
            let info = await verifyJwtToken(req, res)
            req.body.updatedBy = info
            let check_category_exist = await categoryModel.findById({_id: categoryId }, { createdAt: 0, updatedAt: 0, __v: 0 })
            if (!check_category_exist) return responseHandler(res, 403, "Category doesn't Exist.")
            let check_category_name_exist = await categoryModel.find({category: category, _id: { $ne: categoryId }})
            if (check_category_name_exist.length != 0) return responseHandler(res, 403, "Category already Exist.")
            else{
                    if(req.file == undefined && check_category_name_exist.categoryImage !=undefined){
                        req.body.categoryImage = check_product_does_not_exist.categoryImage
                    }
                    else if(req.file != undefined){
                        let imagePath = req.file.path+'.'+req.file.originalname.split('.')[1];              
                        fs.rename( req.file.path , req.file.path + '.'+req.file.originalname.split('.')[1], function(err) {
                            if ( err ) console.log('ERROR: ' + err);
                        });
                        req.body.categoryImage = imagePath.replace("public/","");
                    }         
                    await categoryModel.updateOne({ _id: categoryId }, { $set: { category : category,  categoryImage: req.body.categoryImage, status: status , updatedBy: req.body.updatedBy} }) //update the password with new one
                    return responseHandler(res, 200, "Category updated successfully.")
                }
        }
        catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
    })
}
 /*************************************  Block/Unblock Product ****************/

 const categoryToggleStatus = async (req, res) => {
    const { categoryId } = req.body; // destructuring 
    if (!categoryId) {
        return responseHandler(res, 400, "Bad request")
    }
    var result =  await categoryModel.findOne({ countId: categoryId }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
    if (!result) return responseHandler(res, 404, "Category doesn't Exist.")
    try {
       
        let info = await verifyJwtToken(req, res)
         let user = await userModel.findById({ _id: info }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
        if(!user)
        return responseHandler(res, 400, "Bad request")
        let category = await categoryModel.findOneAndUpdate({ countId: categoryId }, {updatedBy:info, status: result.status==1? 0 : 1})
       
        if(category.status == 1){            
            let link = '<html> <body> <div bgcolor="#f3f3f3" style="background-color:#f3f3f3"> <table width="650" bgcolor="#ffffff" border="0" align="center" cellpadding="0" cellspacing="0" style="color:#000;font-family:Lato,Helvetica Neue,Helvetica,Arial,sans-serif;"> <tbody> <tr> <td height="30" bgcolor="#f3f3f3"></td></tr><tr> <td height="102" align="center" style="border-bottom:1px solid #eaeaea;"> <img src="http://'+host+'/global_assets/images/logo.png" style="width:65px" alt="Caremx" class="CToWUd"> </td></tr><tr> <td valign="top"> <table width="100%" border="0" cellpadding="30" cellspacing="0" style="font-size:14px"> <tbody> <tr> <td> <div> <p style="font-size:16px">Dear '+user.firstName+' '+ user.lastName+' ,</p><div style="color:#333;font-size:14px"> <p style="color:#333">'+category.category +' Category is Blocked ! Please contact to admin </p><p>Mail : info@caremx.com.</p><p>The Caremx Team </p></div></div></td></tr></tbody> </table> </td></tr><tr> <td height="40" align="center" valign="bottom" style="font-size:12px;color:#999"> © 2020 Caremx. All Rights Reserved. </td></tr><tr> <td height="30"></td></tr><tr> <td height="30" bgcolor="#f3f3f3"></td></tr></tbody> </table> </div></body></html>' 
            sendMail(user.email, "Your Category status updated", null, link)
        }
        else if(category.status == 0){
            let link = '<html> <body> <div bgcolor="#f3f3f3" style="background-color:#f3f3f3"> <table width="650" bgcolor="#ffffff" border="0" align="center" cellpadding="0" cellspacing="0" style="color:#000;font-family:Lato,Helvetica Neue,Helvetica,Arial,sans-serif;"> <tbody> <tr> <td height="30" bgcolor="#f3f3f3"></td></tr><tr> <td height="102" align="center" style="border-bottom:1px solid #eaeaea;"> <img src="http://'+host+'/global_assets/images/logo.png" style="width:65px" alt="Caremx" class="CToWUd"> </td></tr><tr> <td valign="top"> <table width="100%" border="0" cellpadding="30" cellspacing="0" style="font-size:14px"> <tbody> <tr> <td> <div> <p style="font-size:16px">Dear '+user.firstName+' '+ user.lastName+',</p><div style="color:#333;font-size:14px"> <p style="color:#333">'+category.category +' Category is Active ! </p><p>Mail : info@caremx.com.</p><p>The Caremx Team </p></div></div></td></tr></tbody> </table> </td></tr><tr> <td height="40" align="center" valign="bottom" style="font-size:12px;color:#999"> © 2020 Caremx. All Rights Reserved. </td></tr><tr> <td height="30"></td></tr><tr> <td height="30" bgcolor="#f3f3f3"></td></tr></tbody> </table> </div></body></html>'
            sendMail(user.email, "Your Category status updated", null, link)                
        }
        return responseHandler(res, 200, "OK")           
    }
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
  }

  /*************************** Delete Product ***************************/
  const deleteCategory = async (req, res) => {
    const { categoryId } = req.body; // destructuring 
    if (!categoryId) {
        return responseHandler(res, 400, "Bad request")
    }
    var result =  await categoryModel.findOne({ countId: categoryId }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
    if (!result) return responseHandler(res, 404, "product doesn't Exist.")
    try {
        let info = await verifyJwtToken(req, res)
        let user = await userModel.findById({ _id: info }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
        if(!user)
        return responseHandler(res, 400, "Bad request")
        else{
            let category = await categoryModel.findOneAndUpdate({ countId: categoryId }, {softDelete:1})
            let link = '<html> <body> <div bgcolor="#f3f3f3" style="background-color:#f3f3f3"> <table width="650" bgcolor="#ffffff" border="0" align="center" cellpadding="0" cellspacing="0" style="color:#000;font-family:Lato,Helvetica Neue,Helvetica,Arial,sans-serif;"> <tbody> <tr> <td height="30" bgcolor="#f3f3f3"></td></tr><tr> <td height="102" align="center" style="border-bottom:1px solid #eaeaea;"> <img src="http://'+host+'/global_assets/images/logo.png" style="width:65px" alt="Caremx" class="CToWUd"> </td></tr><tr> <td valign="top"> <table width="100%" border="0" cellpadding="30" cellspacing="0" style="font-size:14px"> <tbody> <tr> <td> <div> <p style="font-size:16px">Dear '+user.firstName+' '+ user.lastName+' ,</p><div style="color:#333;font-size:14px"> <p style="color:#333">Category is deleted succesfully </p><p>Mail : info@caremx.com.</p><p>The Caremx Team </p></div></div></td></tr></tbody> </table> </td></tr><tr> <td height="40" align="center" valign="bottom" style="font-size:12px;color:#999"> © 2020 Caremx. All Rights Reserved. </td></tr><tr> <td height="30"></td></tr><tr> <td height="30" bgcolor="#f3f3f3"></td></tr></tbody> </table> </div></body></html>'
            sendMail(user.email, "Your product is deleted", null, link)
            return responseHandler(res, 200, "OK")  
        }               
    }
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
  
  }


/***************   Add Product *************************/
const addProduct = async (req, res) => {
    var form = new multiparty.Form();
    form.parse(req, async function (err, fields, files) {
    const { categoryId, title, price, discount, discountStartDate, discountEndDate, availableStock, returnAllowed, cancelattionAllowed, planDelivery, productDescription} = req.body; // destructuring 
   if ( !categoryId || !title || !price || !availableStock || !returnAllowed || !cancelattionAllowed  || !productDescription ) {
        return responseHandler(res, 400, "Bad request")
    }
   else{
        try {
            let info= await verifyJwtToken(req, res)
            req.body.createdBy = info      
            let vendor = await vendorModel.findById({ _id: info }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0});  
            if(!vendor) return responseHandler(res, 404, "Vendor can add the product ! create vendor Account ")
            let check_category_exist = await categoryModel.findOne({_id: categoryId }, { createdAt: 0, updatedAt: 0, __v: 0 })
            if (!check_category_exist) return responseHandler(res, 403, "Category not available")
            let check_product_exist = await productModel.findOne({title: title }, { createdAt: 0, updatedAt: 0, __v: 0 })
            if (check_product_exist) return responseHandler(res, 403, "product already exist")
            if(req.file != undefined){
                let imagePath = req.file.path+'.'+req.file.originalname.split('.')[1];              
                fs.rename( req.file.path , req.file.path + '.'+req.file.originalname.split('.')[1], function(err) {
                    if ( err ) console.log('ERROR: ' + err);
                });
                req.body.productImage = imagePath.replace("public/","");
            }   
            let lastProduct=  await productModel.find({}).sort({_id:-1}).limit(1)   
            req.body.countId =  lastProduct[0] !=undefined ? parseFloat(lastProduct[0].countId) + 1 : 101;  
            await productModel.create(req.body) /* create user object */
            return responseHandler(res, 200, "Product added successfully ! Wait for admin approval")
        }
        catch (e) { 
            
            console.log(e)
            return responseHandler(res, 500, "Internal Server Error.", e) }
        }
    })
}

/******************   update Product  **********************/
const updateProduct = async (req, res) => {
    var form = new multiparty.Form();
    form.parse(req, async function (err, fields, files) {
    const { productId, categoryId, title, price, discount, discountStartDate, discountEndDate, availableStock, returnAllowed, cancelattionAllowed, planDelivery, productDescription} = req.body; // destructuring 
   if ( !productId || !categoryId || !title || !price || !availableStock || !returnAllowed || !cancelattionAllowed  || !productDescription ) {
        return responseHandler(res, 400, "Bad request")
    }
   else{
        try {
            let info = await verifyJwtToken(req, res)
            req.body.updatedBy = info
            let check_product_does_not_exist = await productModel.findOne({_id: productId }, { createdAt: 0, updatedAt: 0, __v: 0 })
            if (!check_product_does_not_exist) return responseHandler(res, 403, "product doesn't exist")
            let check_product_exist = await productModel.find({title: title, _id: { $ne: productId }},{ createdAt: 0, updatedAt: 0, __v: 0 })
             if (check_product_exist[0]) return responseHandler(res, 403, "Product is already exist")
       
            if(req.file == undefined && check_product_does_not_exist.productImage !=undefined){
                req.body.productImage = check_product_does_not_exist.productImage
            }
            else if(req.file != undefined){
                let imagePath = req.file.path+'.'+req.file.originalname.split('.')[1];              
                fs.rename( req.file.path , req.file.path + '.'+req.file.originalname.split('.')[1], function(err) {
                    if ( err ) console.log('ERROR: ' + err);
                });
                  req.body.productImage = imagePath.replace("public/","");
            }         
            await productModel.updateOne({ _id: productId }, { $set: { categoryId: categoryId, title:title, price: price, discount: discount, discountStartDate:discountStartDate, discountEndDate:discountEndDate, availableStock:availableStock, returnAllowed:returnAllowed, cancelattionAllowed:cancelattionAllowed, planDelivery:planDelivery, productDescription:productDescription,  productImage: req.body.productImage, updatedBy:req.body.updatedBy} }) //update the password with new one
            return responseHandler(res, 200, "Product updated successfully.")
         }
        catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
        }
    })
}

/************************ view Product ********************/
const viewProduct = async (req, res) => {
    if (!req.body.productId) return responseHandler(res, 400, "Bad Request")
    let info = await verifyJwtToken(req, res)
    if(info == null)
    return responseHandler(res, 400, "Bad request")
    const  productId  = req.body.productId; // destructuring 
    var result =  await productModel.findById({ _id: productId }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
    if (!result) return responseHandler(res, 404, "Product doesn't Exist.")
        try {
            let category = await categoryModel.findOne({ _id: result.categoryId}, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
            let finalData = {result: result , category: category.category}
              return responseHandler(res, 200, "Success", finalData)   
        }
        catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
}

/************************ Product approve********************/
const productIsActive = async (req, res) => {
    const { productId } = req.body; // destructuring 
    if (!productId) {
        return responseHandler(res, 400, "Bad request")
    }
    var result =  await productModel.findOne({ countId: productId }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
    if (!result) return responseHandler(res, 404, "Product doesn't Exist.")
    try {
       
        let info = await verifyJwtToken(req, res)
        let vendor = await vendorModel.findById({ _id: result.createdBy }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0});
        let user = await userModel.findById({ _id: info }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
        if(!user)
        return responseHandler(res, 404, "Only admin can approve the Product")
        let product = await productModel.findOneAndUpdate({ countId: productId }, {approvedBy:info, isActive: result.isActive==1? 0 : 1})
       
        if(product.isActive == 1){            
            let link = '<html> <body> <div bgcolor="#f3f3f3" style="background-color:#f3f3f3"> <table width="650" bgcolor="#ffffff" border="0" align="center" cellpadding="0" cellspacing="0" style="color:#000;font-family:Lato,Helvetica Neue,Helvetica,Arial,sans-serif;"> <tbody> <tr> <td height="30" bgcolor="#f3f3f3"></td></tr><tr> <td height="102" align="center" style="border-bottom:1px solid #eaeaea;"> <img src="http://'+host+'/global_assets/images/logo.png" style="width:65px" alt="Caremx" class="CToWUd"> </td></tr><tr> <td valign="top"> <table width="100%" border="0" cellpadding="30" cellspacing="0" style="font-size:14px"> <tbody> <tr> <td> <div> <p style="font-size:16px">Dear '+vendor.firstName+' '+ vendor.lastName+' ,</p><div style="color:#333;font-size:14px"> <p style="color:#333">'+result.title +' Product is disapproved ! Please contact to admin </p><p>Mail : info@caremx.com.</p><p>The Caremx Team </p></div></div></td></tr></tbody> </table> </td></tr><tr> <td height="40" align="center" valign="bottom" style="font-size:12px;color:#999"> © 2020 Caremx. All Rights Reserved. </td></tr><tr> <td height="30"></td></tr><tr> <td height="30" bgcolor="#f3f3f3"></td></tr></tbody> </table> </div></body></html>' 
            sendMail(vendor.email, "Your product status updated", null, link)
        }
        else if(product.isActive == 0){
            let link = '<html> <body> <div bgcolor="#f3f3f3" style="background-color:#f3f3f3"> <table width="650" bgcolor="#ffffff" border="0" align="center" cellpadding="0" cellspacing="0" style="color:#000;font-family:Lato,Helvetica Neue,Helvetica,Arial,sans-serif;"> <tbody> <tr> <td height="30" bgcolor="#f3f3f3"></td></tr><tr> <td height="102" align="center" style="border-bottom:1px solid #eaeaea;"> <img src="http://'+host+'/global_assets/images/logo.png" style="width:65px" alt="Caremx" class="CToWUd"> </td></tr><tr> <td valign="top"> <table width="100%" border="0" cellpadding="30" cellspacing="0" style="font-size:14px"> <tbody> <tr> <td> <div> <p style="font-size:16px">Dear '+vendor.firstName+' '+ vendor.lastName+',</p><div style="color:#333;font-size:14px"> <p style="color:#333">'+result.title +' product is Approve ! </p><p>Mail : info@caremx.com.</p><p>The Caremx Team </p></div></div></td></tr></tbody> </table> </td></tr><tr> <td height="40" align="center" valign="bottom" style="font-size:12px;color:#999"> © 2020 Caremx. All Rights Reserved. </td></tr><tr> <td height="30"></td></tr><tr> <td height="30" bgcolor="#f3f3f3"></td></tr></tbody> </table> </div></body></html>'
            sendMail(vendor.email, "Your product status updated", null, link)                
        }
        return responseHandler(res, 200, "OK")           
    }
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
  }

  /*************************************  Block/Unblock Product ****************/

  const productToggleStatus = async (req, res) => {
    const { productId } = req.body; // destructuring 
    if (!productId) {
        return responseHandler(res, 400, "Bad request")
    }
    var result =  await productModel.findOne({ countId: productId }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
    if (!result) return responseHandler(res, 404, "Product doesn't Exist.")
    try {
       
        let info = await verifyJwtToken(req, res)
        let vendor = await vendorModel.findById({ _id: result.createdBy }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0});
        let user = await userModel.findById({ _id: info }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
        if(!user)
        return responseHandler(res, 400, "Bad request")
        let product = await productModel.findOneAndUpdate({ countId: productId }, {approvedBy:info, status: result.status==1? 0 : 1})
       
        if(product.status == 1){            
            let link = '<html> <body> <div bgcolor="#f3f3f3" style="background-color:#f3f3f3"> <table width="650" bgcolor="#ffffff" border="0" align="center" cellpadding="0" cellspacing="0" style="color:#000;font-family:Lato,Helvetica Neue,Helvetica,Arial,sans-serif;"> <tbody> <tr> <td height="30" bgcolor="#f3f3f3"></td></tr><tr> <td height="102" align="center" style="border-bottom:1px solid #eaeaea;"> <img src="http://'+host+'/global_assets/images/logo.png" style="width:65px" alt="Caremx" class="CToWUd"> </td></tr><tr> <td valign="top"> <table width="100%" border="0" cellpadding="30" cellspacing="0" style="font-size:14px"> <tbody> <tr> <td> <div> <p style="font-size:16px">Dear '+vendor.firstName+' '+ vendor.lastName+' ,</p><div style="color:#333;font-size:14px"> <p style="color:#333">'+result.title +' Product is Blocked ! Please contact to admin </p><p>Mail : info@caremx.com.</p><p>The Caremx Team </p></div></div></td></tr></tbody> </table> </td></tr><tr> <td height="40" align="center" valign="bottom" style="font-size:12px;color:#999"> © 2020 Caremx. All Rights Reserved. </td></tr><tr> <td height="30"></td></tr><tr> <td height="30" bgcolor="#f3f3f3"></td></tr></tbody> </table> </div></body></html>' 
            sendMail(vendor.email, "Your product status updated", null, link)
        }
        else if(product.status == 0){
            let link = '<html> <body> <div bgcolor="#f3f3f3" style="background-color:#f3f3f3"> <table width="650" bgcolor="#ffffff" border="0" align="center" cellpadding="0" cellspacing="0" style="color:#000;font-family:Lato,Helvetica Neue,Helvetica,Arial,sans-serif;"> <tbody> <tr> <td height="30" bgcolor="#f3f3f3"></td></tr><tr> <td height="102" align="center" style="border-bottom:1px solid #eaeaea;"> <img src="http://'+host+'/global_assets/images/logo.png" style="width:65px" alt="Caremx" class="CToWUd"> </td></tr><tr> <td valign="top"> <table width="100%" border="0" cellpadding="30" cellspacing="0" style="font-size:14px"> <tbody> <tr> <td> <div> <p style="font-size:16px">Dear '+vendor.firstName+' '+ vendor.lastName+',</p><div style="color:#333;font-size:14px"> <p style="color:#333">'+result.title +' product is Active ! </p><p>Mail : info@caremx.com.</p><p>The Caremx Team </p></div></div></td></tr></tbody> </table> </td></tr><tr> <td height="40" align="center" valign="bottom" style="font-size:12px;color:#999"> © 2020 Caremx. All Rights Reserved. </td></tr><tr> <td height="30"></td></tr><tr> <td height="30" bgcolor="#f3f3f3"></td></tr></tbody> </table> </div></body></html>'
            sendMail(vendor.email, "Your product status updated", null, link)                
        }
        return responseHandler(res, 200, "OK")           
    }
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
  }

  /*************************** Delete Product ***************************/
  const deleteProduct = async (req, res) => {
    const { productId } = req.body; // destructuring 
    if (!productId) {
        return responseHandler(res, 400, "Bad request")
    }
    var result =  await productModel.findOne({ countId: productId }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
    if (!result) return responseHandler(res, 404, "product doesn't Exist.")
    try {
        let vendor = await vendorModel.findById({ _id: result.createdBy }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0});
        let info = await verifyJwtToken(req, res)
        let user = await userModel.findById({ _id: info }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
        if(!user)
        return responseHandler(res, 400, "Bad request")
        else{
            let product = await productModel.findOneAndUpdate({ countId: productId }, {softDelete:1})
            let link = '<html> <body> <div bgcolor="#f3f3f3" style="background-color:#f3f3f3"> <table width="650" bgcolor="#ffffff" border="0" align="center" cellpadding="0" cellspacing="0" style="color:#000;font-family:Lato,Helvetica Neue,Helvetica,Arial,sans-serif;"> <tbody> <tr> <td height="30" bgcolor="#f3f3f3"></td></tr><tr> <td height="102" align="center" style="border-bottom:1px solid #eaeaea;"> <img src="http://'+host+'/global_assets/images/logo.png" style="width:65px" alt="Caremx" class="CToWUd"> </td></tr><tr> <td valign="top"> <table width="100%" border="0" cellpadding="30" cellspacing="0" style="font-size:14px"> <tbody> <tr> <td> <div> <p style="font-size:16px">Dear '+vendor.firstName+' '+ vendor.lastName+' ,</p><div style="color:#333;font-size:14px"> <p style="color:#333">You Product is Suspended ! Please contact to admin </p><p>Mail : info@caremx.com.</p><p>The Caremx Team </p></div></div></td></tr></tbody> </table> </td></tr><tr> <td height="40" align="center" valign="bottom" style="font-size:12px;color:#999"> © 2020 Caremx. All Rights Reserved. </td></tr><tr> <td height="30"></td></tr><tr> <td height="30" bgcolor="#f3f3f3"></td></tr></tbody> </table> </div></body></html>'
            sendMail(vendor.email, "Your product is deleted", null, link)
            return responseHandler(res, 200, "OK")  
        }               
    }
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
  
  }


/******************  Product list  ************************/
const productList = async (req, res) => {
    try {
        let info = await verifyJwtToken(req, res)
        if(info == null)
        return responseHandler(res, 400, "Bad request")
        let categories = await categoryModel.find({softDelete:0}).sort({ createdAt: -1 })
        let product = await productModel.find({softDelete:0}).sort({ createdAt: -1 })
        let products =[];
        product.forEach(async result => {
            categories.forEach(async ele =>{
                if(ele._id.toString() == result.categoryId.toString()){
                    products.push({ result: result, category: ele.category })
                }
               
            })           
         })
          return responseHandler(res, 200, "Success", products)  
    }
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
}

/******************  featured Toggle Product  ************************/
const featuredToggleProduct = async (req, res) => {
    const { productId } = req.body; // destructuring 
    if (!productId) {
        return responseHandler(res, 400, "Bad request")
    }
    var result =  await productModel.findOne({ countId: productId }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
    if (!result) return responseHandler(res, 404, "product doesn't Exist.")
    try {
        let vendor = await vendorModel.findById({ _id: result.createdBy }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
        let info = await verifyJwtToken(req, res)
        let user = await userModel.findById({ _id: info }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
        if(!user)
        return responseHandler(res, 400, "Bad request")
        else{
            let product = await productModel.findOneAndUpdate({ countId: productId }, {featured:result.featured==1? 0 : 1})            
            // let link = '<html> <body> <div bgcolor="#f3f3f3" style="background-color:#f3f3f3"> <table width="650" bgcolor="#ffffff" border="0" align="center" cellpadding="0" cellspacing="0" style="color:#000;font-family:Lato,Helvetica Neue,Helvetica,Arial,sans-serif;"> <tbody> <tr> <td height="30" bgcolor="#f3f3f3"></td></tr><tr> <td height="102" align="center" style="border-bottom:1px solid #eaeaea;"> <img src="http://'+host+'/global_assets/images/logo.png" style="width:65px" alt="Caremx" class="CToWUd"> </td></tr><tr> <td valign="top"> <table width="100%" border="0" cellpadding="30" cellspacing="0" style="font-size:14px"> <tbody> <tr> <td> <div> <p style="font-size:16px">Dear '+vendor.firstName+' '+ vendor.lastName+' ,</p><div style="color:#333;font-size:14px"> <p style="color:#333">'+ product.title +' ' +(product.featured !=1 ? "not featured " : "featured" )+' Product</p><p>Mail : info@caremx.com.</p><p>The Caremx Team </p></div></div></td></tr></tbody> </table> </td></tr><tr> <td height="40" align="center" valign="bottom" style="font-size:12px;color:#999"> © 2020 Caremx. All Rights Reserved. </td></tr><tr> <td height="30"></td></tr><tr> <td height="30" bgcolor="#f3f3f3"></td></tr></tbody> </table> </div></body></html>'
            // sendMail(vendor.email, "Your product is deleted", null, link)
            return responseHandler(res, 200, "Product is set as featured product")  
        }               
    }
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
  
  }

/******************************* New Arrival Products *****************************/
const newArrivalProduct = async (req, res) => {
    const { productId } = req.body; // destructuring 
    if (!productId) {
        return responseHandler(res, 400, "Bad request")
    }
    var result =  await productModel.findOne({ countId: productId }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
    if (!result) return responseHandler(res, 404, "product doesn't Exist.")
    try {
        let vendor = await vendorModel.findById({ _id: result.createdBy }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
        let info = await verifyJwtToken(req, res)
        let user = await userModel.findById({ _id: info }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
        if(!user)
        return responseHandler(res, 400, "Bad request")
        else{
            let product = await productModel.findOneAndUpdate({ countId: productId }, {newArrival:result.newArrival == 1? 0 : 1})            
            return responseHandler(res, 200, "Product is set as new arrival product")  
        }               
    }
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }  
  }

module.exports = {
    addCategory: addCategory,
    categoryList:categoryList,
    categoryDetail:categoryDetail,
    updateCategory:updateCategory,
    productList:productList,
    updateProduct:updateProduct,
    addProduct: addProduct,
    viewProduct: viewProduct,
    deleteProduct:deleteProduct,
    productIsActive:productIsActive,
    productToggleStatus:productToggleStatus,
    deleteCategory:deleteCategory,
    categoryToggleStatus:categoryToggleStatus,
    featuredToggleProduct:featuredToggleProduct,
    newArrivalProduct:newArrivalProduct
};