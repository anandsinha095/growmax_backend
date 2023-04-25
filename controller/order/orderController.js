import { responseHandler } from '../../common/response';
import { __esModule } from '@babel/register/lib/node';
import commentModel from '../../model/comment/comment';
import productModel from '../../model/admin/inventory'/* inventory */
import userModel from '../../model/user/user';
import orderModel from '../../model/order/order';
import { host, angular_port } from '../../envirnoment/config'
import { sendMail, tenMinutesJwt, verifyEmail, bcrypt, bcryptVerify, verifyJwtToken } from '../../common/function';
// import user from '../../model/User/user.js';
// import { angular_host, angular_port } from '../../enviornment/config';
/***************** Create Order by User ******************/
import mongoose from 'mongoose';
import csc from 'country-state-city'
const ObjectId = mongoose.Types.ObjectId;
const createOrder = async (req, res) => {
    let userId = await verifyJwtToken(req, res);
    const { item, productDetails, totalCost, rate } = req.body; // destructuring
    if (!item || !productDetails || !totalCost || !rate) {
        return responseHandler(res, 400, "Bad request")
    }
    try {
        let check_user_exist = await userModel.findOne({ _id: userId, roleId: 3 })
        if (!check_user_exist) return responseHandler(res, 407, "Customer doesn't exist")
        req.body.customerId = userId;
        let product= await productModel.find();
        let quantityStatus= false;
        if(req.body.item !=1){
                productDetails.forEach(item1 => {
                        product.forEach(async item2 => {
                            if(item1.subItem == item2.subItem){
                                item2.sizeDetails.forEach(element => {
                                    if(parseFloat(item1.size) == parseFloat(element.size)){
                                        parseFloat(element.quantity) < parseFloat(item1.quantity) ? (quantityStatus= true) : (quantityStatus= false)
                                    }
                                });
                            }
                        });
                });
        }
        if(quantityStatus)
        return responseHandler(res, 407, "Product out of stock ! Try again later") 
        let lastOrder=  await orderModel.find({}).sort({_id:-1}).limit(1)
        req.body.orderId = lastOrder[0] !=undefined ? parseFloat(lastOrder[0].orderId) + 1 : 1001;
        let result = await orderModel.create(req.body) /* create order object */
        if(req.body.item !=1){
            result.productDetails.forEach(item1 => {
                product.forEach(async item2 => {
                    if(item1.subItem == item2.subItem){
                        item2.sizeDetails.forEach(element => {
                            if(parseFloat(item1.size) == parseFloat(element.size)){
                                element.quantity = parseFloat(element.quantity) - parseFloat(item1.quantity) 
                                element.status = element.quantity==0 ? false : element.status
                            }
                        });
                        await productModel.updateOne({ _id: item2._id }, { $set: { sizeDetails :  item2.sizeDetails, subItem:item2.subItem,  status: item2.status} }) //inventory update
                    }
                });
            });
        }
        let allData={ result: result, user: check_user_exist }
        let link = await createOrderHtml(allData) 
        sendMail(check_user_exist.email, (req.body.item != 1 ? 'Your Magna Order:' : 'Scap Sell Request:')+ "ORD-"+req.body.orderId , null, link)
        return responseHandler(res, 200, "Your order created successfully ")
    }
    catch (e) {
        return responseHandler(res, 500, e)
    }
}
/***************** Create Order by Admin/employee ******************/
const createOrderByAdmin = async (req, res) => {
    let userId = await verifyJwtToken(req, res);
    const { productDetails, totalCost, rate, customerId } = req.body; // destructuring
        if (!productDetails || !totalCost || !rate || !customerId) {
            return responseHandler(res, 400, "Bad request")
        }
    try {
        let adminUser = await userModel.findById({ _id: userId })
        if (!adminUser) return responseHandler(res, 400, "Bad request")
        let check_user_exist = await userModel.findById({ _id: customerId })
        if (!check_user_exist) return responseHandler(res, 407, "Customer doesn't exist")
        req.body.createdBy = userId;
        req.body.nameCreatedBy = adminUser.firstName+" "+ adminUser.lastName
            let product= await productModel.find();
            let quantityStatus= false;
            if(req.body.item !=1){
                    productDetails.forEach(item1 => {
                            product.forEach(async item2 => {
                                if(item1.subItem == item2.subItem){
                                    item2.sizeDetails.forEach(element => { 
                                        if(parseFloat(item1.size) == parseFloat(element.size)){
                                            parseFloat(element.quantity) < parseFloat(item1.quantity) ? (quantityStatus= true) : (quantityStatus= false)
                                        }
                                    });
                                }
                            });
                    });
            }
        if(quantityStatus)
        return responseHandler(res, 407, "Product out of stock ! Try again later") 
        let lastOrder=  await orderModel.find({}).sort({_id:-1}).limit(1)
        req.body.orderId = lastOrder[0] !=undefined ? parseFloat(lastOrder[0].orderId) + 1 : 1001;
        let result = await orderModel.create(req.body) /* create order object */
        if(req.body.item !=1){
            result.productDetails.forEach(item1 => {
                product.forEach(async item2 => {
                    if(item1.subItem == item2.subItem){
                        item2.sizeDetails.forEach(element => {
                            if(parseFloat(item1.size) == parseFloat(element.size)){
                                element.quantity = parseFloat(element.quantity) - parseFloat(item1.quantity)
                                element.status = element.quantity==0 ? false : element.status
                            }
                        });
                        await productModel.updateOne({ _id: item2._id }, { $set: { sizeDetails :  item2.sizeDetails, subItem:item2.subItem,  status: item2.status} }) //inventory update
                    }
                });
            });
        }
        let allData={ result: result, user: check_user_exist }
        let link = await createOrderHtml(allData) 
        sendMail(check_user_exist.email, (req.body.item != 1 ? 'Your Magna Order:' : 'Scap Sell Request:')+ "ORD-"+req.body.orderId , null, link)
        return responseHandler(res, 200, "Your order created successfully ")
    }
    catch (e) {
        return responseHandler(res, 500, e)
    }
}

/***************** order accept and reject by admin ******************/
const orderStatusUpdate = async (req, res) => {
    let userId = await verifyJwtToken(req, res);
    const { orderId, status } = req.body; // destructuring
    if (!orderId || status== null) {
        return responseHandler(res, 400, "Bad request")
    }
    try {
        let adminUser = await userModel.findById({ _id: userId })
        if (!adminUser) return responseHandler(res, 400, "Bad request")
        req.body.orderhandler = userId;
        let result = await orderModel.findByIdAndUpdate({_id:orderId}, {status:status, orderhandler:  req.body.orderhandler}) /* create order object */
        let user = await userModel.findById({ _id: result.customerId })
        if(req.body.item !=1 && req.body.status==0){
            let product= await productModel.find();
            result.productDetails.forEach(item1 => {
                product.forEach(async item2 => {
                    if(item1.subItem == item2.subItem){
                        item2.sizeDetails.forEach(element => {
                            if(parseFloat(item1.size) == parseFloat(element.size)){
                                element.quantity = parseFloat(element.quantity) + parseFloat(item1.quantity)
                                element.status = element.quantity > 0 ? true : element.status
                            }
                        });
                        await productModel.updateOne({ _id: item2._id }, { $set: { sizeDetails :  item2.sizeDetails, subItem:item2.subItem,  status: item2.status} }) //inventory update
                    }
                });
            });
        }
        let orderResult = await orderModel.findById({ _id: orderId })
        let allData={ result: orderResult, user: user}
        let link = await updateOrderStatusHtml(allData, status)  
        sendMail(user.email, (result.item != 1 ? (req.body.status == 0 ? 'Your Magna Order Rejected:':(req.body.status == 2 ? 'Your Magna Order Delivered': ((req.body.status == 1 && result.productDetails[0].dispatchedQuantity == undefined) ? 'Your Magna Order Accepted:': 'Your order is Updated:'))) : (req.body.status == 1 ? 'Scap Sell Request Accepted: ': 'Scap Sell Request Rejected:'))+ "ORD-"+ result.orderId, null, link)
        return responseHandler(res, 200, req.body.status != 2 ? (req.body.status !=1 ? "Order rejected by Admin successfully." : "Order accepted by Admin successfully"): "Order completed successfully ")
    }
    catch (e) {
        return responseHandler(res, 500, e)
    }
}

/****************************** Single order display ***********************/
const getSingleOrder = async (req, res) => {
    const { orderId } = req.body; // destructuring
    if (!orderId) {
        return responseHandler(res, 400, "Bad request")
    }
    try {
        let check_order_exist = await orderModel.findById({ _id: orderId })
        if (!check_order_exist) return responseHandler(res, 407, "Order Does not exist")
        let orderhandler = await verifyJwtToken(req, res);
        let user = await userModel.findById({ _id: check_order_exist.customerId })
        let obj = {country:csc.getCountryById(user.countryId.toString()).name  , state: csc.getStateById(user.stateId.toString()).name , city:csc.getCityById(user.cityId.toString()).name }
        let  finalResponse = {result: user, csc: obj}
        if (orderhandler.roleId != 3)
            return responseHandler(res, 200, check_order_exist,finalResponse)
        else
            return responseHandler(res, 407, "Order doesn't exist")
    }
    catch (e) {
        return responseHandler(res, 500, e)
    }
}
/****************************** update order   (order accept or reject by Admin/ Employee)***********************/
const updateOrder = async (req, res) => {
    const { status, orderId, productDetails, rate, totalCost} = req.body; // destructuring
    if (!orderId || !productDetails || !rate || !totalCost)
        return responseHandler(res, 400, "Bad request")
    try {
        let check_order_exist = await orderModel.findById({ _id: orderId })
        if (!check_order_exist) return responseHandler(res, 407, "Order Does not exist")
        let orderhandler = await verifyJwtToken(req, res);
        req.body.orderhandler = orderhandler;
        let result = await orderModel.findOneAndUpdate({ _id: orderId }, { $set: {productDetails: productDetails, status: status, orderhandler: orderhandler, rate: rate , totalCost: totalCost }}) /* update order object */
        if(req.body.item !=1 && req.body.status==0){
            let product= await productModel.find();
            result.productDetails.forEach(item1 => {
                product.forEach(async item2 => {
                    if(item1.subItem == item2.subItem){
                        item2.sizeDetails.forEach(element => {
                            if(parseFloat(item1.size) == parseFloat(element.size)){
                                element.quantity = parseFloat(element.quantity) + parseFloat(item1.quantity)
                                element.status = element.quantity > 0 ? true : element.status
                            }
                        });
                        await productModel.updateOne({ _id: item2._id }, { $set: { sizeDetails :  item2.sizeDetails, subItem:item2.subItem,  status: item2.status} }) //inventory update
                    }
                });
            });
        }
        if (result) {
            let finalResponse = { result: result }
            let user_obj = await userModel.findOne({ _id: check_order_exist.customerId })
            let orderResult = await orderModel.findById({ _id: orderId })
            let allData={ result: orderResult, user: user_obj }
            let link = await updateOrderStatusHtml(allData, status) 
            sendMail(user_obj.email, (req.body.item != 1 ? (req.body.status == 0 ? 'Your Magna Order Rejected:':(req.body.status == 2 ? 'Your Magna Order Delivered': ((req.body.status == 1 && result.productDetails[0].dispatchedQuantity == undefined) ? 'Your Magna Order Accepted:': 'Your order is Updated:'))) : (req.body.status != 0 ? 'Scap Sell Request Accepted: ': 'Scap Sell Request Rejected:'))+ "ORD-"+ result.orderId, null, link)
            finalResponse.name = user_obj.firstName + ' ' + user_obj.lastName
            return responseHandler(res, 200, "Order updated successfully")
        } 
        else
            return responseHandler(res, 407, "Customer doesn't exist")
    }
    catch (e) {
        return responseHandler(res, 500, e)
    }
}
/************************** order List ************************/ 
const orderList = async (req, res) => {
    try {
        let orderhandler = await verifyJwtToken(req, res);
        let user_obj = await userModel.findOne({ _id: orderhandler })
        if (user_obj == null) return responseHandler(res, 400, "Bad request")
        let result = await orderModel.aggregate([
           // { $match: { customerId: ObjectId('5f5214d45dfd8532a688acb2') } }
            {
                $lookup: {
                    from: 'users',
                    localField: 'customerId',
                    foreignField: '_id',
                    as: 'orderArray'
                }
            },
            { $sort:{createdAt: -1}}
        ])
        return responseHandler(res, 200, "OK", result)
    }
    catch (e) {
        return responseHandler(res, 500, e)
    }
}

/************************** Item List ************************/ 
const itemList = async (req, res) => {
    try {
        let orderhandler = await verifyJwtToken(req, res);
        let user_obj = await userModel.findOne({ _id: orderhandler })
        if (user_obj == null) return responseHandler(res, 400, "Bad request")
        let result = await orderModel.aggregate([
            {   
            $lookup: {
                    from: 'users',
                    localField: 'customerId',
                    foreignField: '_id',
                    as: 'orderArray'
                }
            },
            { $sort:{createdAt: -1}}
         ])
         var simplifiedResponse = [];
         result.forEach(function fun(item){	
                 var word = item.createdAt.toISOString().substring(0,10);
                    var orderDate = word;
                    if(item.status != 0)
                    groupProductsQuantity(orderDate, item.productDetails, item.customerId, item.orderArray[0].firstName+' '+ item.orderArray[0].lastName, item.orderArray[0].email);
                });
                function groupProductsQuantity(orderDate, productDetails, customerId, name, email){
                    var isAvailable = false;
                    simplifiedResponse.forEach(function fun(item, index){
                        if(item.date == orderDate){
                            isAvailable = true;
                            productDetails.forEach(function fun1(item1, index1){
                                    var matched = false;
                                    item.productDetails.forEach(function fun2(item2, index2){
                                            if(item1.subItemId == item2.subItemId && item1.subItem == item2.subItem && item1.size == item2.size){
                                                matched = true;
                                                item2.quantity = parseFloat(item2.quantity) + parseFloat(item1.quantity);
                                                let pendingQuantity = parseFloat(item1.quantity) - (parseFloat(item1.dispatchedQuantity) +parseFloat(item1.deliveredQuantity) );
                                                if(item2.allCustomers){
                                                    var custDetails = {'curtomerId': customerId,  'quantityOrdered': item1.quantity, 'dispachedOrdered': item1.dispatchedQuantity != undefined ? item1.dispatchedQuantity : 0 ,'deliveredQuantity': item1.deliveredQuantity != undefined ? item1.deliveredQuantity : 0,'pendingQuantity':pendingQuantity != NaN ? pendingQuantity:item1.quantity ,'name': name, 'email': email};
                                                    item2.allCustomers.push(custDetails);
                                                } 
                                            }
                                    });                                
                                    if(!matched){
                                        var allCustomers = [];
                                        let pendingQuantity = parseFloat(item1.quantity) - (parseFloat(item1.dispatchedQuantity) +parseFloat(item1.deliveredQuantity));
                                        var custDetails = {'curtomerId': customerId, 'quantityOrdered': item1.quantity,  'dispachedOrdered': item1.dispatchedQuantity != undefined ? item1.dispatchedQuantity : 0 ,'deliveredQuantity': item1.deliveredQuantity != undefined ? item1.deliveredQuantity : 0, 'pendingQuantity':pendingQuantity != NaN ? pendingQuantity:item1.quantity, 'name': name, 'email': email};
                                        allCustomers.push(custDetails);
                                        item1.allCustomers = allCustomers;
                                        item.productDetails.push(item1);
                                        
                                    }
                            });
                       }  
                    });
                    
                    if(!isAvailable){
                        productDetails.forEach(function fun1(item1, index1){              	
                                    var allCustomers = [];
                                    let pendingQuantity = parseInt(item1.quantity) - (parseFloat(item1.dispatchedQuantity) +parseFloat(item1.deliveredQuantity));
                                    var custDetails = {'curtomerId': customerId, 'quantityOrdered': item1.quantity,  'dispachedOrdered': item1.dispatchedQuantity != undefined ? item1.dispatchedQuantity : 0 ,'deliveredQuantity': item1.deliveredQuantity != undefined ? item1.deliveredQuantity : 0,'pendingQuantity':pendingQuantity != NaN ? pendingQuantity:item1.quantity, 'name': name, 'email': email};
                                    allCustomers.push(custDetails);
                                    item1.allCustomers = allCustomers;                                 
                             });
                            var obj  = {};
                            obj.date = orderDate;
                            obj.productDetails = productDetails;
                            simplifiedResponse.push(obj);
                    }
                    
                }            
                 return responseHandler(res, 200, simplifiedResponse)                        
        }
    catch (e) {
        return responseHandler(res, 500, e)
    }
}

/************************** order List ************************/
const userOrderList = async (req, res) => {
    try {
        let orderhandler = await verifyJwtToken(req, res);
        let user_obj = await userModel.findOne({ _id: orderhandler })
        if (user_obj == null)
            return responseHandler(res, 400, "Bad request")
        let allOrderData = await orderModel.find({ customerId: orderhandler }).sort({createdAt: -1})
        if (!allOrderData)
            return responseHandler(res, 407, "No order found")
        else
            return responseHandler(res, 200, allOrderData)
    }
    catch (e) {
        return responseHandler(res, 500, e)
    }
}
/*********************************Report  *************************************/
const orderReport = async (req, res) => {
    const { report } = req.body; // destructuring
   
    if (!report)
        return responseHandler(res, 400, "Bad request")
    try {
        let id = await verifyJwtToken(req, res);
        let user_obj = await userModel.findOne({ _id: id})
        if (user_obj == null)
        return responseHandler(res, 400, "Bad request")
            var d = new Date();
            var data;
            if(report == 1){
                d.setDate(d.getDate()-1);               
                let to = new Date().toISOString().substring(0,10);
                let from = new Date().toISOString().substring(0,10);
                let todate = new Date(to + 'T23:59:00.000Z')
                let  fromdate = new Date(from + 'T00:01:00.000Z')
               
                  data = await orderModel.aggregate([
                      { $match: {createdAt:{$gte:fromdate, $lte:todate}}},
                      {
                          $lookup: {
                              from: 'users',
                              localField: 'customerId',
                              foreignField: '_id',
                              as: 'orderArray'
                          }
                      },
                      { $sort:{createdAt: -1}}
                  ])
            }
           else  if(report == 4){
                data = await orderModel.aggregate([
                    { $match: {createdAt:{$gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000)}}},
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'customerId',
                            foreignField: '_id',
                            as: 'orderArray'
                        }
                    },
                    { $sort:{createdAt: -1}}
                ])      
            }
            else{
             if(report == 2){
                    d.setMonth(d.getMonth() - 1);
                }
                else if(report == 3){
                    d.setFullYear(d.getFullYear() - 1);
                }
              
                 data = await orderModel.aggregate([
                     { $match: {createdAt:{$gte:d}}},
                     {
                         $lookup: {
                             from: 'users',
                             localField: 'customerId',
                             foreignField: '_id',
                             as: 'orderArray'
                         }
                     },
                     { $sort:{createdAt: -1}}
                 ])
            }
           
           //await orderModel.find({createdAt:{$gte:d}}).sort({createdAt: -1}); //change "data" for your collection's name
           return responseHandler(res, 200,'', data)
         }
    catch (e) {
        return responseHandler(res, 500, e)
    }
}
/*********************************Custom Report  *************************************/
const orderCustomReport = async (req, res) => {
    const { to,from } = req.body; // destructuring
    if (!to || !from)
        return responseHandler(res, 400, "Bad request")
    try {
        let id = await verifyJwtToken(req, res);
        let user_obj = await userModel.findOne({ _id: id})
        if (user_obj == null)
        return responseHandler(res, 400, "Bad request")
           let todate = new Date(to + 'T23:59:00.000Z')
           let  fromdate = new Date(from + 'T00:01:00.000Z')
         let data = await orderModel.aggregate([
                 { $match: {createdAt:{$gte:fromdate, $lte:todate}}},
                 {
                     $lookup: {
                         from: 'users',
                         localField: 'customerId',
                         foreignField: '_id',
                         as: 'orderArray'
                     }
                 },
                 { $sort:{createdAt: -1}}
             ])
           return responseHandler(res, 200,'', data)
         }
    catch (e) {
        return responseHandler(res, 500, e)
    }
}
/************************ Commented by User and Admin  ****************************/
const commentOrder = async (req, res) => {
    const { orderId, comment } = req.body; // destructuring
    if (!orderId || !comment)
        return responseHandler(res, 400, "Bad request")
    try {
        let id = await verifyJwtToken(req, res);
        let user_obj = await userModel.findOne({ _id: id})
        if (user_obj == null)
        return responseHandler(res, 400, "Bad request")
        let allOrderData = await orderModel.find({id: orderId})
        if (!allOrderData)
            return responseHandler(res, 407, "No order found")
        else
            {
                    req.body.name= user_obj.firstName+" "+user_obj.lastName,
                    req.body.userId= id
                let result = await commentModel.create(req.body) 
                let allComment = await commentModel.find({orderId:orderId}) 
                return responseHandler(res, 200, allComment)
   
            }
         }
    catch (e) {
        return responseHandler(res, 500, e)
    }
}
/************************ get all comment based on orderId  ****************************/
const allCommentBasedOnOrder = async (req, res) => {
    const { orderId } = req.body; // destructuring
    if (!orderId)
        return responseHandler(res, 400, "Bad request")
    try {
        let id = await verifyJwtToken(req, res);
        let user_obj = await userModel.findOne({ _id: id})
        if (user_obj == null)
        return responseHandler(res, 400, "Bad request")
        let allOrderData = await orderModel.find({id: orderId})
        if (!allOrderData)
            return responseHandler(res, 407, "No order found")
        else
            {
                let allComment = await commentModel.find({orderId:orderId}) 
                return responseHandler(res, 200, allComment)
   
            }
         }
    catch (e) {
        return responseHandler(res, 500, e)
    }
}
module.exports = {
    createOrder: createOrder,
    updateOrder: updateOrder,
    orderList: orderList,
    getSingleOrder: getSingleOrder,
    userOrderList: userOrderList,
    commentOrder: commentOrder,
    allCommentBasedOnOrder: allCommentBasedOnOrder,
    createOrderByAdmin: createOrderByAdmin,
    orderStatusUpdate: orderStatusUpdate,
    itemList:itemList,
    orderReport:orderReport,
    orderCustomReport:orderCustomReport
};

/********Mail HTML  **********/
const createOrderHtml = (allData) => {
    let count = 1;
    let totalFabrication=0;
    let subTotal=0;
    let link = ""
    link = '<html> <body> <div bgcolor="#f3f3f3" style="background-color:#f3f3f3"> <table width="650" bgcolor="#ffffff" border="0" align="center" cellpadding="0" cellspacing="0" style="color:#000;font-family:Lato,Helvetica Neue,Helvetica,Arial,sans-serif;"> <tbody> <tr> <td height="30" bgcolor="#f3f3f3"></td></tr><tr> <td height="102" align="center" style="border-bottom:1px solid #eaeaea;"> <img src="http://'+host+'/global_assets/images/logo.png" style="width:65px" alt="magna" class="CToWUd"> </td></tr><tr> <td valign="top"> <table width="100%" border="0" cellpadding="30" cellspacing="0" style="font-size:14px"> <tbody> <tr> <td> <div><div style="color:#000;style="font-size:16px""> <p>Hi '+  allData.user.firstName+' '+allData.user.lastName +'</p>'
    link+='<p>'+ (allData.result.item != 1 ? 'Thanks for placing with Magna. We will contact you soon, below are the order detials.':'Your scrap sell request is receieved. Below are the details.')+'</p><p>Order ID: ORD-'+allData.result.orderId +'</p>'
    link += '<table style="font-family: arial, sans-serif;border-collapse: collapse; width: 100%;">';
    link += '<tbody>';
    if(allData.result.item != 1){
        link += '<tr><th style="border: 1px solid #dddddd;text-align:center; padding: 8px"> S.N</th><th style="border: 1px solid #dddddd;text-align:center; padding: 8px"> Item  </th><th style="border: 1px solid #dddddd;text-align: center; padding: 8px"> Product </th><th style="border: 1px solid #dddddd;text-align: center; padding: 8px">Item Rate(Per Kg) </th><th style="border: 1px solid #dddddd;text-align: center; padding: 8px"> Size(mm) </th><th style="border: 1px solid #dddddd;text-align: center; padding: 8px"> Quantity </th><th style="border: 1px solid #dddddd;text-align: center; padding: 8px"> Fabrication Rate (Per Kg) </th></tr>'
        allData.result.productDetails.forEach(element => {
            link += '<tr><td style="border: 1px solid #dddddd;text-align: center; padding: 8px">'+ count +'</td><td style="border: 1px solid #dddddd;text-align: center; padding: 8px"> ROD </td><td style="border: 1px solid #dddddd;text-align: center; padding: 8px">'+element.subItem+'</td><td style="border: 1px solid #dddddd;text-align: center; padding: 8px">'+ allData.result.rate +'</td> <td style="border: 1px solid #dddddd;text-align: center; padding: 8px">'+element.size+'</td><td style="border: 1px solid #dddddd;text-align: center; padding: 8px">'+element.quantity+'</td><td style="border: 1px solid #dddddd;text-align: center; padding: 8px">'+element.labourCost+'</td></tr>'
            totalFabrication= parseFloat(totalFabrication)+  (parseFloat(element.quantity)*parseFloat(element.labourCost));
            subTotal= parseFloat(subTotal) + (parseFloat(allData.result.rate)*parseFloat(element.quantity))
            count++;
        })
    }
    else{
        link += '<tr><th style="border: 1px solid #dddddd;text-align:center; padding: 8px"> Item  </th><th style="border: 1px solid #dddddd;text-align: center; padding: 8px">Price(Per Kg) </th><th style="border: 1px solid #dddddd;text-align: center; padding: 8px"> Quantity </th></tr>'
        link += '<tr><td style="border: 1px solid #dddddd;text-align: center; padding: 8px">'+ (allData.result.item!= 1 ? 'ROD':'Scrap') +'</td><td style="border: 1px solid #dddddd;text-align: center; padding: 8px">'+allData.result.rate+'</td><td style="border: 1px solid #dddddd;text-align: center; padding: 8px">'+allData.result.productDetails[0].quantity+'</td></tr>' 
    }
    link += "</tbody></table><br>"
    link+= (allData.result.item != 1 ? ('<p style="text-align: right;">Item item cost: '+ subTotal +'  INR </p><p style="text-align: right;">Total Fabrication Cost : '+totalFabrication +' INR </p><p style="text-align: right;">Order Total : '+allData.result.totalCost +'  INR </p>') : ('<p style="text-align: right;"> Total Price: '+allData.result.totalCost +'  INR </p>') )+'<p>Thanks</p><p>The Magna Team </p><p>Mail : info@magna.com.</p></div></div></td></tr></tbody> </table> </td></tr><tr> <td height="40" align="center" valign="bottom" style="font-size:12px;color:#999"> © 2020 Magna. All Rights Reserved. </td></tr><tr> <td height="30"></td></tr><tr> <td height="30" bgcolor="#f3f3f3"></td></tr></tbody> </table> </div></body></html>'
    return link;
}

const updateOrderStatusHtml = (allData, status) => {
    let count = 1;
    let totalFabrication=0;
    let subTotal=0;
    let link = ""
    link = '<html> <body> <div bgcolor="#f3f3f3" style="background-color:#f3f3f3"> <table width="650" bgcolor="#ffffff" border="0" align="center" cellpadding="0" cellspacing="0" style="color:#000;font-family:Lato,Helvetica Neue,Helvetica,Arial,sans-serif;"> <tbody> <tr> <td height="30" bgcolor="#f3f3f3"></td></tr><tr> <td height="102" align="center" style="border-bottom:1px solid #eaeaea;"> <img src="http://'+host+'/global_assets/images/logo.png" style="width:65px" alt="magna" class="CToWUd"> </td></tr><tr> <td valign="top"> <table width="100%" border="0" cellpadding="30" cellspacing="0" style="font-size:14px"> <tbody> <tr> <td> <div><div style="color:#000;style="font-size:16px""> <p>Hi '+  allData.user.firstName+' '+allData.user.lastName +'</p>'
     if(allData.result.item != 1){
        link+='<p>'+ (  status == 0 ? 'Your order is rejected. Below are the order details' : (allData.result.productDetails[0].dispatchedQuantity == undefined ? 'Your order is accepted. Below are the order details': (status == 1 ? 'Your order is Updated. Below are the order details': (status == 2 ? 'Your order is Delivered. Below are the order details':'Your order is in-progress. Below are the order details' ))))+'</p><p>Order ID: ORD-'+allData.result.orderId +'</p>'
        link += '<table style="font-family: arial, sans-serif;border-collapse: collapse; width: 100%;">';
        link += '<tbody>';    
        link += '<tr><th style="border: 1px solid #dddddd;text-align:center; padding: 8px"> S.N</th><th style="border: 1px solid #dddddd;text-align:center; padding: 8px"> Item  </th><th style="border: 1px solid #dddddd;text-align: center; padding: 8px"> Product </th><th style="border: 1px solid #dddddd;text-align: center; padding: 8px">Item Rate(Per Kg) </th><th style="border: 1px solid #dddddd;text-align: center; padding: 8px"> Size(mm) </th><th style="border: 1px solid #dddddd;text-align: center; padding: 8px"> Quantity </th><th style="border: 1px solid #dddddd;text-align: center; padding: 8px"> Fabrication Rate (Per Kg) </th>'+(allData.result.productDetails[0].dispatchedQuantity != undefined ? '<th style="border: 1px solid #dddddd;text-align: center; padding: 8px"> Dispatched Quantity (Per Kg) </th><th style="border: 1px solid #dddddd;text-align: center; padding: 8px"> Delivered Quantity (Per Kg) </th>':'')+'</tr>'
        allData.result.productDetails.forEach(element => {
            link += '<tr><td style="border: 1px solid #dddddd;text-align: center; padding: 8px">'+ count +'</td><td style="border: 1px solid #dddddd;text-align: center; padding: 8px"> ROD </td><td style="border: 1px solid #dddddd;text-align: center; padding: 8px">'+element.subItem+'</td><td style="border: 1px solid #dddddd;text-align: center; padding: 8px">'+ allData.result.rate +'</td> <td style="border: 1px solid #dddddd;text-align: center; padding: 8px">'+element.size+'</td><td style="border: 1px solid #dddddd;text-align: center; padding: 8px">'+element.quantity+'</td><td style="border: 1px solid #dddddd;text-align: center; padding: 8px">'+element.labourCost+'</td>'+(allData.result.productDetails[0].dispatchedQuantity != undefined ? '<td style="border: 1px solid #dddddd;text-align: center; padding: 8px">'+element.dispatchedQuantity+'</td><td style="border: 1px solid #dddddd;text-align: center; padding: 8px">'+element.deliveredQuantity+'</td>' : '')+'</tr>'
            totalFabrication= parseFloat(totalFabrication)+  (parseFloat(element.quantity)*parseFloat(element.labourCost));
            subTotal= parseFloat(subTotal) + (parseFloat(allData.result.rate)*parseFloat(element.quantity))
            count++;
        })
    }
    else{
        link+='<p>'+ (status == 0 ? 'Your scrap sell request is rejected. Below are the details.' : (status == 1 ? 'Your scrap sell request is accepted. Below are the details.' : 'Your scrap sell request is Updated. Below are the details.'))+'</p><p>Order ID: ORD-'+allData.result.orderId +'</p>'
        link += '<table style="font-family: arial, sans-serif;border-collapse: collapse; width: 100%;">';
        link += '<tbody>';    
        link += '<tr><th style="border: 1px solid #dddddd;text-align:center; padding: 8px"> Item  </th><th style="border: 1px solid #dddddd;text-align: center; padding: 8px">Price(Per Kg) </th><th style="border: 1px solid #dddddd;text-align: center; padding: 8px"> Quantity </th></tr>'
        link += '<tr><td style="border: 1px solid #dddddd;text-align: center; padding: 8px">'+ (allData.result.item!= 1 ? 'ROD':'Scrap') +'</td><td style="border: 1px solid #dddddd;text-align: center; padding: 8px">'+allData.result.rate+'</td><td style="border: 1px solid #dddddd;text-align: center; padding: 8px">'+allData.result.productDetails[0].quantity+'</td></tr>' 
    }
    link += "</tbody></table><br>"
    link+= (allData.result.item != 1 ? ('<p style="text-align: right;">Total item cost: '+ subTotal +'  INR </p><p style="text-align: right;">Total Fabrication Cost : '+totalFabrication +' INR </p><p style="text-align: right;">Order Total : '+allData.result.totalCost +'  INR </p>') : ('<p style="text-align: right;"> Total Price: '+allData.result.totalCost +'  INR </p>') )+'<p>Thanks</p><p>The Magna Team </p><p>Mail : info@magna.com.</p></div></div></td></tr></tbody> </table> </td></tr><tr> <td height="40" align="center" valign="bottom" style="font-size:12px;color:#999"> © 2020 Magna. All Rights Reserved. </td></tr><tr> <td height="30"></td></tr><tr> <td height="30" bgcolor="#f3f3f3"></td></tr></tbody> </table> </div></body></html>'
    return link;
}