import userModel from '../../model/user/user'/* To Create user */
import orderModel from '../../model/order/order'/* To Create user */
import { __esModule } from '@babel/register/lib/node';
import { responseHandler } from '../../common/response'
import { bcrypt, bcryptVerify, createJwt, sendMail, verifyJwtToken} from '../../common/function';
import tokenModel from '../../model/commonModel/token';
import permissionModel from '../../model/admin/permission'
import multiparty from 'multiparty';
import csc from 'country-state-city'
import { host, angular_port } from '../../envirnoment/config';
var randomstring = require("randomstring");
var fs = require('fs');
/* Employee Signup */
const signUp = async (req, res) => {
    var form = new multiparty.Form();
    form.parse(req, async function (err, fields, files) {
        const { firstName, lastName, email, phoneNumber, dob, gender,  roleId,  addressOne, addressTwo, countryId, stateId, cityId, zipcode} = req.body; // destructuring 
        if (!firstName || !lastName || !email || !dob || !gender || !roleId  ||  !addressOne || !countryId || !stateId || !cityId || !zipcode ){ 
            return responseHandler(res, 400, "Bad request")
        }
        try {
            let check_email_exist = await userModel.findOne({ email: email })
            if (check_email_exist) return responseHandler(res, 403, "email already exist")
             /* 1: Admin // 2: Employee // 3:Customer //4: production head*/
            if(req.file != undefined){
                let imagePath = req.file.path+'.'+req.file.originalname.split('.')[1];              
                fs.rename( req.file.path , req.file.path + '.'+req.file.originalname.split('.')[1], function(err) {
                    if ( err ) console.log('ERROR: ' + err);
                });
                req.body.profilePicture = imagePath.replace("public/","");
            }
            let plainPassword = randomstring.generate({
                length: 8,
                charset: 'alphanumeric'
            });
            req.body.password =await bcrypt(plainPassword) 
            let info = await verifyJwtToken(req, res)
            let user = await userModel.findById({ _id: info }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
            if(user.roleId != 1)
            return responseHandler(res, 400, "Bad Request.")
            req.body.status = true;
            req.body.emailVerified = true;
            let lastUser=  await userModel.find({}).sort({_id:-1}).limit(1)
            req.body.userId = lastUser[0] !=undefined || lastUser[0] !=NaN ? parseFloat(lastUser[0].userId) + 1 : 1001;
            let result = await userModel.create(req.body) /* create user object */
            /* mail sending process */
            let link = '<html> <body> <div bgcolor="#f3f3f3" style="background-color:#f3f3f3"> <table width="650" bgcolor="#ffffff" border="0" align="center" cellpadding="0" cellspacing="0" style="color:#000;font-family:Lato,Helvetica Neue,Helvetica,Arial,sans-serif;"> <tbody> <tr> <td height="30" bgcolor="#f3f3f3"></td></tr><tr> <td height="102" align="center" style="border-bottom:1px solid #eaeaea;"> <img src="http://'+host+'/global_assets/images/logo.png" style="width:65px" alt="Caremx" class="CToWUd"> </td></tr><tr> <td valign="top"> <table width="100%" border="0" cellpadding="30" cellspacing="0" style="font-size:14px"> <tbody> <tr> <td> <div> <p style="font-size:16px">Dear Concern,</p><div style="color:#333;font-size:14px"><p>Your account is created with Caremx. Use below credential to login. </p><p>Link: '+host+ '</p> <p>Username: '+ email +'</p><p>Password: '+ plainPassword +'</p><p>Mail : info@caremx.com.</p><p>The Caremx Team </p></div></div></td></tr></tbody> </table> </td></tr><tr> <td height="40" align="center" valign="bottom" style="font-size:12px;color:#999"> © 2020 Caremx. All Rights Reserved. </td></tr><tr> <td height="30"></td></tr><tr> <td height="30" bgcolor="#f3f3f3"></td></tr></tbody> </table> </div></body></html>'
            sendMail(email, "[Caremx] Confirm Your Registration From " + " " + new Date() + "", "", link) /* verification mail send */
            return responseHandler(res, 200, "Employee successfully registered.")
        }
        catch (e) {
            console.log("Error :=>", e)
            return responseHandler(res, 500, e)
        }
    })
    }
    /* get all employee data */
const getAllEmployee = async (req, res) => {
    try {
        let info = await verifyJwtToken(req, res)
        let user = await userModel.findById({ _id: info }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
        if(user == null)
        return responseHandler(res, 400, "Bad Request.")
        else{
            let allUserData =  await userModel.find({ roleId: { $ne:3} }).sort({createdAt: -1})
                return responseHandler(res, 200, "OK", allUserData)
        }       
    }
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
}

/* update user product price data */
const userRateUpdate = async (req, res) => {
    const { userId, rodRate} = req.body; // destructuring 
        if (!userId || !rodRate ) {
            return responseHandler(res, 400, "Bad request")
        }
    try {
        let info = await verifyJwtToken(req, res)
        let user = await userModel.findById({ _id: info }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
        if(user == null)
        return responseHandler(res, 400, "Bad request")
        let customer = await userModel.findOneAndUpdate({ _id: userId},{rodRate: rodRate})
        if(!customer)
        return responseHandler(res, 400, "Customer doesn't exist")
        else
        return responseHandler(res, 200, "OK")
    }
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
}
/* Get view details of a Employee  Info */    
const employeeDetail = async (req, res) => {
    if (!req.body.userId) return responseHandler(res, 400, "Bad Request")
    const  userId  = req.body.userId; // destructuring 
    var result =  await userModel.findById({ _id: userId }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
    if (!result) return responseHandler(res, 404, "User doesn't Exist.")
    if (result.roleId ==3 ) return responseHandler(res, 404, "User doesn't Exist.")
    try {
        let info = await verifyJwtToken(req, res)
        let user = await userModel.findById({ _id: info }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
        let obj = { country: csc.getCountryById(result.countryId.toString()).name, state: csc.getStateById(result.stateId.toString()).name, city: csc.getCityById(result.cityId.toString()).name }
        let finalResponse = { result: result, csc: obj }
        return responseHandler(res, 200, finalResponse)       
    }
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
}
/* update Employee profile  */
const updateEmployee = async (req, res) => {
    var form = new multiparty.Form();
    form.parse(req, async function (err, fields, files) {
        const { firstName, lastName, phoneNumber, userId, roleId, addressOne, addressTwo, countryId, stateId, cityId, zipcode} = req.body; // destructuring 
        if (!firstName || !lastName  || !userId || !roleId  || !addressOne || !countryId || !stateId || !cityId || !zipcode) {
            return responseHandler(res, 400, "Bad request")
        }
        try {
            let user_id= await verifyJwtToken(req, res)
            let user_obj = await userModel.findOne({ _id: user_id })
            if(!user_obj) return responseHandler(res, 400, "Bad request")         
            let employeeData = await userModel.findOne({ _id: userId })   
            if(!employeeData) return responseHandler(res, 400, "Bad request")     
            await userModel.findByIdAndUpdate({ _id: userId }, { $set: { firstName: firstName, lastName:lastName, phoneNumber: phoneNumber, roleId:roleId, addressOne: addressOne, addressTwo: addressTwo,  countryId: countryId,  stateId: stateId, cityId: cityId, zipcode: zipcode} }) //update the password with new one
            return responseHandler(res, 200, "Your profile updated successfully.")
        }
        catch (e) {
            console.log("Error ===>", e)
            return responseHandler(res, 500, e)
        }
    })
}
/* Get User Info after Any changes in user Record And update the local Storage */
const user_isActive = async (req, res) => {
    const { userId } = req.body; // destructuring 
    if (!userId) {
        return responseHandler(res, 400, "Bad request")
    }
    var result =  await userModel.findById({ _id: userId }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
    if (!result) return responseHandler(res, 404, "User doesn't Exist.")
    try {
        let info = await verifyJwtToken(req, res)
        let user = await userModel.findById({ _id: info }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
        if(user.roleId != 1 && user.roleId !=2 && user.roleId !=4 )
        return responseHandler(res, 400, "Bad Request.")
        else
        {
           let mainUser = await userModel.findByIdAndUpdate({ _id: userId }, {status: result.status==1? 0 : 1})
           if(result.status==1){
            let link = '<html> <body> <div bgcolor="#f3f3f3" style="background-color:#f3f3f3"> <table width="650" bgcolor="#ffffff" border="0" align="center" cellpadding="0" cellspacing="0" style="color:#000;font-family:Lato,Helvetica Neue,Helvetica,Arial,sans-serif;"> <tbody> <tr> <td height="30" bgcolor="#f3f3f3"></td></tr><tr> <td height="102" align="center" style="border-bottom:1px solid #eaeaea;"> <img src="http://'+host+'/global_assets/images/logo.png" style="width:65px" alt="Caremx" class="CToWUd"> </td></tr><tr> <td valign="top"> <table width="100%" border="0" cellpadding="30" cellspacing="0" style="font-size:14px"> <tbody> <tr> <td> <div> <p style="font-size:16px">Dear '+mainUser.firstName+' '+ mainUser.lastName+' ,</p><div style="color:#333;font-size:14px"> <p style="color:#333">You account is blocked ! Please contact to admin </p><p>Mail : info@caremx.com.</p><p>The Caremx Team </p></div></div></td></tr></tbody> </table> </td></tr><tr> <td height="40" align="center" valign="bottom" style="font-size:12px;color:#999"> © 2020 Caremx. All Rights Reserved. </td></tr><tr> <td height="30"></td></tr><tr> <td height="30" bgcolor="#f3f3f3"></td></tr></tbody> </table> </div></body></html>'
            sendMail(mainUser.email, "Your Caremx account status updated", null, link)
                }
           else if(result.status==0){
            let link = '<html> <body> <div bgcolor="#f3f3f3" style="background-color:#f3f3f3"> <table width="650" bgcolor="#ffffff" border="0" align="center" cellpadding="0" cellspacing="0" style="color:#000;font-family:Lato,Helvetica Neue,Helvetica,Arial,sans-serif;"> <tbody> <tr> <td height="30" bgcolor="#f3f3f3"></td></tr><tr> <td height="102" align="center" style="border-bottom:1px solid #eaeaea;"> <img src="http://'+host+'/global_assets/images/logo.png" style="width:65px" alt="Caremx" class="CToWUd"> </td></tr><tr> <td valign="top"> <table width="100%" border="0" cellpadding="30" cellspacing="0" style="font-size:14px"> <tbody> <tr> <td> <div> <p style="font-size:16px">Dear '+mainUser.firstName+' '+ mainUser.lastName+',</p><div style="color:#333;font-size:14px"> <p style="color:#333">You account is Unblocked ! </p><p>Mail : info@caremx.com.</p><p>The Caremx Team </p></div></div></td></tr></tbody> </table> </td></tr><tr> <td height="40" align="center" valign="bottom" style="font-size:12px;color:#999"> © 2020 Caremx. All Rights Reserved. </td></tr><tr> <td height="30"></td></tr><tr> <td height="30" bgcolor="#f3f3f3"></td></tr></tbody> </table> </div></body></html>'
            sendMail(mainUser.email, "Your Caremx account status updated", null, link)
             }           
           
           return responseHandler(res, 200, "OK")           
        }
    }
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
}
const employee_isActive = async (req, res) => {
    const { userId } = req.body; // destructuring 
    if (!userId) {
        return responseHandler(res, 400, "Bad request")
    }
    var result =  await userModel.find({ userId: userId }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
    if (!result) return responseHandler(res, 404, "User doesn't Exist.")
    try {
        let info = await verifyJwtToken(req, res)
        let user = await userModel.findById({ _id: info }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
        if(user.userId == userId)
        return responseHandler(res, 400, "Unable to change own account status")
        let mainUser = await userModel.findOneAndUpdate({ userId: userId }, {status: result[0].status==1? 0 : 1})
        if(mainUser.status == 0){
        let link = '<html> <body> <div bgcolor="#f3f3f3" style="background-color:#f3f3f3"> <table width="650" bgcolor="#ffffff" border="0" align="center" cellpadding="0" cellspacing="0" style="color:#000;font-family:Lato,Helvetica Neue,Helvetica,Arial,sans-serif;"> <tbody> <tr> <td height="30" bgcolor="#f3f3f3"></td></tr><tr> <td height="102" align="center" style="border-bottom:1px solid #eaeaea;"> <img src="http://'+host+'/global_assets/images/logo.png" style="width:65px" alt="Caremx" class="CToWUd"> </td></tr><tr> <td valign="top"> <table width="100%" border="0" cellpadding="30" cellspacing="0" style="font-size:14px"> <tbody> <tr> <td> <div> <p style="font-size:16px">Dear '+mainUser.firstName+' '+ mainUser.lastName+' ,</p><div style="color:#333;font-size:14px"> <p style="color:#333">You account is blocked ! Please contact to admin </p><p>Mail : info@caremx.com.</p><p>The Caremx Team </p></div></div></td></tr></tbody> </table> </td></tr><tr> <td height="40" align="center" valign="bottom" style="font-size:12px;color:#999"> © 2020 Caremx. All Rights Reserved. </td></tr><tr> <td height="30"></td></tr><tr> <td height="30" bgcolor="#f3f3f3"></td></tr></tbody> </table> </div></body></html>'
        sendMail(mainUser.email, "Your Caremx account status updated", null, link)
            }
        else if(mainUser.status == 1){
        let link = '<html> <body> <div bgcolor="#f3f3f3" style="background-color:#f3f3f3"> <table width="650" bgcolor="#ffffff" border="0" align="center" cellpadding="0" cellspacing="0" style="color:#000;font-family:Lato,Helvetica Neue,Helvetica,Arial,sans-serif;"> <tbody> <tr> <td height="30" bgcolor="#f3f3f3"></td></tr><tr> <td height="102" align="center" style="border-bottom:1px solid #eaeaea;"> <img src="http://'+host+'/global_assets/images/logo.png" style="width:65px" alt="Caremx" class="CToWUd"> </td></tr><tr> <td valign="top"> <table width="100%" border="0" cellpadding="30" cellspacing="0" style="font-size:14px"> <tbody> <tr> <td> <div> <p style="font-size:16px">Dear '+mainUser.firstName+' '+ mainUser.lastName+',</p><div style="color:#333;font-size:14px"> <p style="color:#333">You account is Unblocked ! </p><p>Mail : info@caremx.com.</p><p>The Caremx Team </p></div></div></td></tr></tbody> </table> </td></tr><tr> <td height="40" align="center" valign="bottom" style="font-size:12px;color:#999"> © 2020 Caremx. All Rights Reserved. </td></tr><tr> <td height="30"></td></tr><tr> <td height="30" bgcolor="#f3f3f3"></td></tr></tbody> </table> </div></body></html>'
        sendMail(mainUser.email, "Your Caremx account status updated", null, link)        
        }
        return responseHandler(res, 200, "OK")           
    }
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
}
const deleteEmployee = async (req, res) => {
    const { userId } = req.body; // destructuring 
    if (!userId) {
        return responseHandler(res, 400, "Bad request")
    }
    var result =  await userModel.find({ userId: userId }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
    if (!result) return responseHandler(res, 404, "User doesn't Exist.")
    try {
        let info = await verifyJwtToken(req, res)
        let user = await userModel.findById({ _id: info }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
        if(user.userId == userId)
        return responseHandler(res, 400, "Unable to delete own account")
        else{
            let mainUser = await userModel.findOneAndUpdate({ userId: userId }, {softDelete:1})
            let link = '<html> <body> <div bgcolor="#f3f3f3" style="background-color:#f3f3f3"> <table width="650" bgcolor="#ffffff" border="0" align="center" cellpadding="0" cellspacing="0" style="color:#000;font-family:Lato,Helvetica Neue,Helvetica,Arial,sans-serif;"> <tbody> <tr> <td height="30" bgcolor="#f3f3f3"></td></tr><tr> <td height="102" align="center" style="border-bottom:1px solid #eaeaea;"> <img src="http://'+host+'/global_assets/images/logo.png" style="width:65px" alt="Caremx" class="CToWUd"> </td></tr><tr> <td valign="top"> <table width="100%" border="0" cellpadding="30" cellspacing="0" style="font-size:14px"> <tbody> <tr> <td> <div> <p style="font-size:16px">Dear '+mainUser.firstName+' '+ mainUser.lastName+' ,</p><div style="color:#333;font-size:14px"> <p style="color:#333">You account is Suspended ! Please contact to admin </p><p>Mail : info@caremx.com.</p><p>The Caremx Team </p></div></div></td></tr></tbody> </table> </td></tr><tr> <td height="40" align="center" valign="bottom" style="font-size:12px;color:#999"> © 2020 Caremx. All Rights Reserved. </td></tr><tr> <td height="30"></td></tr><tr> <td height="30" bgcolor="#f3f3f3"></td></tr></tbody> </table> </div></body></html>'
            sendMail(mainUser.email, "Your Caremx account Suspended", null, link)
            return responseHandler(res, 200, "OK")  
        }               
    }
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }

}
/* Dashboard Details */
const dashboard = async (req, res) => {
    try {
        let info = await verifyJwtToken(req, res)
        let user = await userModel.findById({ _id: info }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
        if(user.roleId != 1 && user.roleId !=2 && user.roleId !=4)
        return responseHandler(res, 400, "Bad Request.")
        let totalUser =  await userModel.find({roleId: 3}).countDocuments();
        let totalEmployee = await userModel.find({roleId:{$ne: 3}}).countDocuments();
        let totalOrder = await orderModel.find().countDocuments();
        let totalcompleteOrder = await orderModel.find({ status: 2}).countDocuments();
        let data= {'totalUser':totalUser,'totalEmployee':totalEmployee,'totalOrder':totalOrder, 'totalcompleteOrder':totalcompleteOrder}
        return responseHandler(res, 200, data)  
    }
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
}
 /*************************Customer Signup  *************/
const customerSignUp = async (req, res) => {
    const { firstName, lastName, email, phoneNumber, dob, gender,  roleId,  addressOne, addressTwo, countryId, stateId, cityId, zipcode} = req.body; // destructuring 
    if (!firstName || !lastName || !email || !dob || !gender || !roleId  ||  !addressOne || !countryId || !stateId || !cityId || !zipcode ){ 
        return responseHandler(res, 400, "Bad request")
    }
    try {
        let check_email_exist = await userModel.findOne({ email: email })
        if (check_email_exist) return responseHandler(res, 403, "email already exist")
        req.body.roleId = req.body.roleId == null || req.body.roleId == '' ? 3 : req.body.roleId /* 1: Admin // 2: Employee // 3:Customer */
        let plainPassword = randomstring.generate({
            length: 8,
            charset: 'alphanumeric'
        });
        //console.log(plainPassword)
       // req.body.emailVerified = true;
        req.body.password =await bcrypt(plainPassword)
        let lastUser=  await userModel.find({}).sort({_id:-1}).limit(1)
        req.body.userId = lastUser[0] !=undefined ? parseFloat(lastUser[0].userId) + 1 : 1001;
        let result = await userModel.create(req.body) /* create user object */ 
        let token = await createJwt({ userId: result._id}) /* generate jwt */
        /* mail sending process */
        let link = '<html> <body> <div bgcolor="#f3f3f3" style="background-color:#f3f3f3"> <table width="650" bgcolor="#ffffff" border="0" align="center" cellpadding="0" cellspacing="0" style="color:#000;font-family:Lato,Helvetica Neue,Helvetica,Arial,sans-serif;"> <tbody> <tr> <td height="30" bgcolor="#f3f3f3"></td></tr><tr> <td height="102" align="center" style="border-bottom:1px solid #eaeaea;"> <img src="http://'+host+'/global_assets/images/logo.png" style="width:65px" alt="Caremx" class="CToWUd"> </td></tr><tr> <td valign="top"> <table width="100%" border="0" cellpadding="30" cellspacing="0" style="font-size:14px"> <tbody> <tr> <td> <div> <p style="font-size:16px">Dear Customer,</p><div style="color:#333;font-size:14px"> <p> Email: '+ req.body.email+' </p></p>Password: '+ plainPassword +' </p><p> Click <a href="http://'+host+'/verify/'+token +'">here</a> to verify your account</p> <p>Mail : info@caremx.com.</p><p>The Caremx Team </p></div></div></td></tr></tbody> </table> </td></tr><tr> <td height="40" align="center" valign="bottom" style="font-size:12px;color:#999"> © 2020 Caremx. All Rights Reserved. </td></tr><tr> <td height="30"></td></tr><tr> <td height="30" bgcolor="#f3f3f3"></td></tr></tbody> </table> </div></body></html>' 
        sendMail(email, "[Caremx] Confirm Your Registration From " + " " + new Date() + "", "", link) /* verification mail send */
        await tokenModel.create({ userId: result._id, token: token, type: "EMAILV"})/* Save Token to user Corresponding  */
        return responseHandler(res, 200, "You have successfully registered. Please Verify your email")
    }
    catch (e) {
        console.log("Error :=>", e)
        return responseHandler(res, 500, e)
    }
}

/*************************Customer Edit Profile  *************/
const updateCustomer = async (req, res) => {
    var form = new multiparty.Form();
    form.parse(req, async function (err, fields, files) {
        const { firstName, lastName, phoneNumber, userId, addressOne, addressTwo, countryId, stateId, cityId, zipcode, status,roleId } = req.body; // destructuring 
        if (!firstName || !lastName  || !userId || !addressOne ||  !countryId || !stateId || !cityId || !zipcode || !status) {
            return responseHandler(res, 400, "Bad request")
        }
        try {
            let user_id= await verifyJwtToken(req, res)
            let user_obj = await userModel.findOne({ _id: user_id })
            if(!user_obj) return responseHandler(res, 400, "Bad request")
            let customerData = await userModel.findOne({ _id: userId })            
            if(req.file == undefined && customerData.profilePicture !=undefined){
                req.body.profilePicture = customerData.profilePicture
            }
            else if(req.file != undefined){
                let imagePath = req.file.path+'.'+req.file.originalname.split('.')[1];              
                fs.rename( req.file.path , req.file.path + '.'+req.file.originalname.split('.')[1], function(err) {
                    if ( err ) console.log('ERROR: ' + err);
                });
                req.body.profilePicture = imagePath.replace("public/","");
            }   
                await userModel.updateOne({ _id: userId }, { $set: { firstName: firstName, lastName:lastName, phoneNumber: phoneNumber, profilePicture: req.body.profilePicture, roleId:roleId,addressOne:addressOne, addressTwo:addressTwo, zipcode:zipcode, countryId:countryId, stateId:stateId, cityId:cityId, status: status} }) //update the password with new one
                return responseHandler(res, 200, "Your profile updated successfully.")
        }
        catch (e) {
            console.log("Error ===>", e)
            return responseHandler(res, 500, e)
        }
    })
}
/************************ Customer Search  ************ */
const searchCustomer = async (req, res) => {
    const { search } = req.body; // destructuring 
    if (!search) {
        return responseHandler(res, 400, "Bad request")
    }
    var result =  await userModel.find({$and:[{$or:[{firstName : new RegExp(search.trim())}, {lastName :new RegExp(search.trim())}, {email : new RegExp(search.trim())}, {userId : new RegExp(search.trim())}]},{roleId: 3}]}).sort({createdAt:-1});
    try {
        let info = await verifyJwtToken(req, res)   
        let user = await userModel.findById({ _id: info }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
        if(user.roleId != 1 && user.roleId !=2 && user.roleId !=4)
        return responseHandler(res, 400, "Bad Request")
        if (result.length < 1) return responseHandler(res, 404, "No record found.")
        else
          return responseHandler(res, 200,"Ok", result)           
    }
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
}
/************************ employee Search  ************ */
const searchEmployee = async (req, res) => {
    const { search } = req.body; // destructuring 
    if (!search) {
        return responseHandler(res, 400, "Bad request")
    }
    var result =  await userModel.find({$and:[{$or:[{firstName : new RegExp(search.trim())}, {lastName :new RegExp(search.trim())}, {email : new RegExp(search.trim())}, {userId : new RegExp(search.trim())}]},{roleId:{$ne:3}}]}).sort({createdAt:-1});
    try {
        let info = await verifyJwtToken(req, res)   
        let user = await userModel.findById({ _id: info }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
        if(user.roleId != 1 && user.roleId !=2 && user.roleId !=4)
        return responseHandler(res, 400, "Bad Request")
        if (result.length < 1){
            return responseHandler(res, 404, "No record found.")
        } 
        else
          return responseHandler(res, 200,"Ok", result)           
    }
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
}
 

module.exports = {
    userIsActive: user_isActive,
    employeeIsActive:employee_isActive,
    dashboard:dashboard,
    signUp:signUp,
    updateEmployee:updateEmployee,
    getAllEmployee:getAllEmployee,
    employeeDetail:employeeDetail,
    customerSignUp:customerSignUp,
    updateCustomer:updateCustomer, 
    searchCustomer:searchCustomer,
    searchEmployee:searchEmployee,
    userRateUpdate:userRateUpdate,
    deleteEmployee:deleteEmployee
};