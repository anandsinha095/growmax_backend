import customerModel from '../../model/customer/customer'/* To Create user */
import vendorModel from '../../model/vendor/vendor'
import customerAddressModel from '../../model/customer/customerAddresses'
import { __esModule } from '@babel/register/lib/node';
import { responseHandler } from '../../common/response'
import { bcrypt, bcryptVerify, createJwt, sendMail, verifyJwtToken, tenMinutesJwt} from '../../common/function';
import { host, fontend_host } from '../../envirnoment/config'
import tokenModel from '../../model/commonModel/token';
import csc from 'country-state-city';
import multiparty from 'multiparty';
import { createTestAccount } from 'nodemailer';
var fs = require('fs');
const signUp = async (req, res) => {
       const { firstName, lastName, email, password, confirmPassword,phoneNumber} = req.body; // destructuring 
       if (!firstName || !lastName || !email || !password || !confirmPassword || !phoneNumber) {
        return responseHandler(res, 400, "Bad request")
    }
    if (password != confirmPassword) return responseHandler(res, 400, "password and confirmpassword not matching")
    try {
        let check_email_exist = await customerModel.findOne({ email: email })
        if (check_email_exist) return responseHandler(res, 403, "email already exist")
        req.body.password = await bcrypt(password)
        let lastUser=  await customerModel.find({}).sort({_id:-1}).limit(1)
        req.body.userId = lastUser[0] !=undefined ? parseFloat(lastUser[0].userId) + 1 : 1001;
        let result = await customerModel.create(req.body) /* create user object */
        let token = await createJwt({ userId: result._id}) /* generate jwt */
        /* mail sending process */ 
        let link = '<html> <body> <div bgcolor="#f3f3f3" style="background-color:#f3f3f3"> <table width="650" bgcolor="#ffffff" border="0" align="center" cellpadding="0" cellspacing="0" style="color:#000;font-family:Lato,Helvetica Neue,Helvetica,Arial,sans-serif;"> <tbody> <tr> <td height="30" bgcolor="#f3f3f3"></td></tr><tr> <td height="102" align="center" style="border-bottom:1px solid #eaeaea;"> <img src="http://'+host+'/global_assets/images/logo.png" style="width:65px" alt="caremx" class="CToWUd"> </td></tr><tr> <td valign="top"> <table width="100%" border="0" cellpadding="30" cellspacing="0" style="font-size:14px"> <tbody> <tr> <td> <div> <p style="font-size:16px">Hi '+firstName+ ' ' +lastName+',</p><div style="color:#333;font-size:14px"><p>Thanks for getting started with Caremx! To complete the email verification, </p><p> Click <a href="http://'+fontend_host+'/Verify/'+token +'">here</a> to verify your account</p> <p>Mail : info@caremx.com.</p><p>The Caremx Team </p></div></div></td></tr></tbody> </table> </td></tr><tr> <td height="40" align="center" valign="bottom" style="font-size:12px;color:#999"> © 2020 Caremx. All Rights Reserved. </td></tr><tr> <td height="30"></td></tr><tr> <td height="30" bgcolor="#f3f3f3"></td></tr></tbody> </table> </div></body></html>' 
        sendMail(email, "[CareMX] Confirm Your Registration From " + " " + new Date() + "", "", link) /* verification mail send */
        await tokenModel.create({ userId: result._id, token: token, type: "EMAILV"})/* Save Token to user Corresponding  */
        return responseHandler(res, 200, "You have successfully registered. Please Verify your email")
    }
    catch (e) {
        console.log("Error :=>", e)
        return responseHandler(res, 500, e)
    }
}
const signIn = async (req, res) => {
    if (!req.body.email || !req.body.password) return responseHandler(res, 400, "Bad Request")
    try {
        var result = await customerModel.findOne({ email: req.body.email }, { createdAt: 0, updatedAt: 0, __v: 0 })
        if (!result) return responseHandler(res, 404, "User doesn't Exist.")
        let verified = await bcryptVerify(req.body.password, result.password)
        if (verified == false) return responseHandler(res, 404, "Invalid Password")
        else if(result.status == false) return responseHandler(res, 407, "Your account is blocked ! Contact to Admin")
        else if (result.emailVerified == false) {
            /* Check What Type of Link Send To user  */
            await sendMailForEmailVerification(result.email, result._id, res)
            return responseHandler(res, 461, "Please Verify Your Mail.", { _id: result._id, email: result.email })
        }
        else if (verified == true && result.status == true){            
            let finalResponse =  { result: result}          
             let token = await createJwt(result._id)    
             finalResponse.jwt = token  
             return responseHandler(res, 200, "OK", finalResponse)
        }
    }
    catch (e) {
        console.log("error =>", e)
        return responseHandler(res, 500, e)
    }
}

/* Get User Info after Any changes in user Record And update the local Storage */
const user_Info = async (req, res) => {
    try {
        let info = await verifyJwtToken(req, res)
        let user = await customerModel.findById({ _id: info }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
        if(user == null)
        return responseHandler(res, 400, "Bad Request.")
        if(user.countryId != undefined){
            let obj = {country:csc.getCountryById(user.countryId.toString()).name  , state: csc.getStateById(user.stateId.toString()).name , city:csc.getCityById(user.cityId.toString()).name }
            let  finalResponse = {result: user, csc: obj}
            return responseHandler(res, 200, "OK", finalResponse)
        }
        else
        {
             let  finalResponse = {result: user}
             return responseHandler(res, 200, "OK", finalResponse)
        }
    }
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
}


/* Get User Info after Any changes in user Record And update the local Storage */
const update_profile = async (req, res) => {
    var form = new multiparty.Form();
    form.parse(req, async function (err, fields, files) {
        const { firstName, lastName, phoneNumber} = req.body; // destructuring 
            if ( !firstName || !lastName || !phoneNumber) {
                return responseHandler(res, 400, "Bad request")
            }
            else{
                    try {
                        let user_id= await verifyJwtToken(req, res)
                        let user_obj = await customerModel.findOne({ _id: user_id })
                        if(!user_obj) return responseHandler(res, 400, "Bad request")
                        if(req.file == undefined && user_obj.profilePicture !=undefined){
                            req.body.profilePicture = user_obj.profilePicture
                        }
                        else if(req.file != undefined){
                            let imagePath = req.file.path+'.'+req.file.originalname.split('.')[1];              
                                    fs.rename( req.file.path , req.file.path + '.'+req.file.originalname.split('.')[1], function(err) {
                                        if ( err ) console.log('ERROR: ' + err);
                                    });
                            req.body.profilePicture = imagePath.replace("public/","");
                        }  
                        else if(req.file == undefined && user_obj.profilePicture ==undefined){
                            req.body.profilePicture = null;
                        }              
                        await customerModel.updateOne({ _id: user_id }, { $set: { firstName: firstName, lastName:lastName, phoneNumber: phoneNumber , profilePicture: req.body.profilePicture} }) //update the password with new one
                        return responseHandler(res, 200, "Your profile updated successfully.")        
                    }
                    catch (e) {
                        console.log("Error ===>", e)
                        return responseHandler(res, 500, e)
                    }
            }      
    })
}

/************************ customerAdd Address ************************/

const addAddress = async (req, res) => {
    const {fullName,  phoneNumber, alternetNumber,  addressOne, addressTwo, landmark, countryId, stateId, cityId, zipcode } = req.body // destructuring
    if ( !fullName ||  !phoneNumber || !addressOne || !countryId || !stateId || !cityId || !zipcode ) {
      return responseHandler(res, 400, "Bad request")
    }
        try {
            let user_id= await verifyJwtToken(req, res)
            let user_obj = await customerModel.findOne({ _id: user_id })
            if(!user_obj) return responseHandler(res, 400, "Bad request")
            req.body.userId= user_id
             await customerAddressModel.create(req.body) /* create user object */
              return responseHandler(res, 200, "Address added successfully.")

        }
        catch (e) {
            console.log("Error :=>", e)
            return responseHandler(res, 500, e)
        }
}

/************************customer Edit Address ************************/

const editAddress = async (req, res) => {
    const {fullName,  phoneNumber, alternetNumber,  addressOne, addressTwo, landmark, countryId, stateId, cityId, zipcode, addressId } = req.body // destructuring
    if ( !addressId || !fullName ||  !phoneNumber || !addressOne || !countryId || !stateId || !cityId || !zipcode ) {
      return responseHandler(res, 400, "Bad request")
    }
        try {
            let user_id= await verifyJwtToken(req, res)
            let user_obj = await customerModel.findOne({ _id: user_id })
            if(!user_obj) return responseHandler(res, 400, "Bad request")
            let customerAddressId = await customerAddressModel.findOne({ _id: addressId })
            if(!customerAddressId) return responseHandler(res, 400, "Bad request")
            await customerAddressModel.updateOne({ _id: addressId }, { $set: { fullName: fullName, phoneNumber: phoneNumber , alternetNumber:alternetNumber ,  addressOne: addressOne, addressTwo: addressTwo, landmark: landmark, countryId: countryId, stateId: stateId, cityId: cityId, zipcode: zipcode, userId: user_id} }) //update the password with new one
            return responseHandler(res, 200, "Address updated successfully.")    
        }
        catch (e) {
            console.log("Error :=>", e)
            return responseHandler(res, 500, e)
        }
}

/************************customer Address List view ************************/
const addressList = async (req, res) => {
        try {
            let user_id= await verifyJwtToken(req, res)
            let user_obj = await customerModel.findOne({ _id: user_id })
            if(!user_obj) return responseHandler(res, 400, "Bad request")
            let customerAddresses = await customerAddressModel.find({ userId: user_id, softDelete: false})
            if(!customerAddresses){
                return responseHandler(res, 404, "No record found");
            }
          let countryStateCity =[];
            customerAddresses.forEach(async result => {
                const obj = { country: csc.getCountryById(result.countryId.toString()).name, state: csc.getStateById(result.stateId.toString()).name, city: csc.getCityById(result.cityId.toString()).name }
                countryStateCity.push({ result: result, csc: obj })
             })
              return responseHandler(res, 200, "Success", countryStateCity)  
        }
        catch (e) {
            console.log("Error :=>", e)
            return responseHandler(res, 500, e)
        }
}

/******************************** single View address *************************/
const addressView = async (req, res) => {
    try {
        let user_id= await verifyJwtToken(req, res)
        let user_obj = await customerModel.findOne({ _id: user_id })
        if(!user_obj) return responseHandler(res, 400, "Bad request")
        let customerAddresses = await customerAddressModel.findOne({ _id: req.params.addressId})
        if(!customerAddresses){
            return responseHandler(res, 404, "No record found");
        }
        else{
            let countryStateCity =[];
            const obj = { country: csc.getCountryById(customerAddresses.countryId.toString()).name, state: csc.getStateById(customerAddresses.stateId.toString()).name, city: csc.getCityById(customerAddresses.cityId.toString()).name }
            countryStateCity.push({ result: customerAddresses, csc: obj })
           return responseHandler(res, 200, "Success", countryStateCity)  
        }     
    }
    catch (e) {
        console.log("Error :=>", e)
        return responseHandler(res, 500, e)
    }
}

/************************customer Delete Address  ************************/
const deleteAddress = async (req, res) => { 
    const {addressId} = req.body
    if ( !addressId ) 
       return responseHandler(res, 400, "Bad request")
       else{
        try {
            let user_id= await verifyJwtToken(req, res)
            let user_obj = await customerModel.findOne({ _id: user_id })
            if(!user_obj) return responseHandler(res, 400, "Bad request")
            let customerAddressId = await customerAddressModel.findOne({ _id: addressId })
            if(!customerAddressId) return responseHandler(res, 400, "Bad request")
            await customerAddressModel.updateOne({ _id: addressId }, { $set: { softDelete: true} }) //update the password with new one
            return responseHandler(res, 200, "Address deleted successfully.")      
        }
        catch (e) {
            console.log("Error :=>", e)
            return responseHandler(res, 500, e)
        }
       }    
}
 /*********************Vendor Signup ********************/

const vendorSignUp = async (req, res) => {
    const {firstName, lastName,  email,  phoneNumber, password, confirmPassword, storeName, addressOne, addressTwo, countryId, stateId, cityId, zipcode } = req.body // destructuring
    if ( !firstName || !lastName || !email ||  !phoneNumber || !password || !confirmPassword || !storeName || !addressOne || !countryId || !stateId || !cityId || !zipcode ) {
      return responseHandler(res, 400, "Bad request")
    }
 if (password != confirmPassword) return responseHandler(res, 400, "password and confirmpassword not matching")
 try {
     let check_email_exist = await vendorModel.findOne({ email: email })
     if (check_email_exist) return responseHandler(res, 403, "email already exist")
     req.body.password = await bcrypt(password)
     let lastUser=  await vendorModel.find({}).sort({_id:-1}).limit(1)
     req.body.userId = lastUser[0] !=undefined ? parseFloat(lastUser[0].userId) + 1 : 1001;
     let result = await vendorModel.create(req.body) /* create user object */
     let token = await createJwt({ userId: result._id}) /* generate jwt */
     /* mail sending process */ 
     let link = '<html> <body> <div bgcolor="#f3f3f3" style="background-color:#f3f3f3"> <table width="650" bgcolor="#ffffff" border="0" align="center" cellpadding="0" cellspacing="0" style="color:#000;font-family:Lato,Helvetica Neue,Helvetica,Arial,sans-serif;"> <tbody> <tr> <td height="30" bgcolor="#f3f3f3"></td></tr><tr> <td height="102" align="center" style="border-bottom:1px solid #eaeaea;"> <img src="http://'+host+'/global_assets/images/logo.png" style="width:65px" alt="magna" class="CToWUd"> </td></tr><tr> <td valign="top"> <table width="100%" border="0" cellpadding="30" cellspacing="0" style="font-size:14px"> <tbody> <tr> <td> <div> <p style="font-size:16px">Hi '+firstName+ ' ' +lastName+',</p><div style="color:#333;font-size:14px"><p>Thanks for getting started with Magna! To complete the email verification, </p><p> Click <a href="http://'+host+'/verify/'+token +'">here</a> to verify your account</p> <p>Mail : info@magna.com.</p><p>The Magna Team </p></div></div></td></tr></tbody> </table> </td></tr><tr> <td height="40" align="center" valign="bottom" style="font-size:12px;color:#999"> © 2020 Magna. All Rights Reserved. </td></tr><tr> <td height="30"></td></tr><tr> <td height="30" bgcolor="#f3f3f3"></td></tr></tbody> </table> </div></body></html>' 
     sendMail(email, "[Magna] Confirm Your Registration From " + " " + new Date() + "", "", link) /* verification mail send */
     await tokenModel.create({ userId: result._id, token: token, type: "EMAILV"})/* Save Token to user Corresponding  */
     return responseHandler(res, 200, "You have successfully registered. Please Verify your email")
 }
 catch (e) {
     console.log("Error :=>", e)
     return responseHandler(res, 500, e)
 }
} 

/* Send Mail At SignIn Time if User has Expired Email Verification Link */
const sendMailForEmailVerification = async (email, userId, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            let tokenObj = await tokenModel.findOne({ userId: userId, type: "EMAILV" })
            if (tokenObj) return resolve()
            let token = await tenMinutesJwt({ userId: userId }, res)
            await tokenModel.create({ userId: userId, token: token, type: "EMAILV" })
            let link = '<p>Click <a href="file:///home/david/Desktop/mailbody.html' + token + ' ">here</a > to verify your account</p> '
            sendMail(email, "[Caremx] Confirm Your LoginIp Or Email Verification From " + " " + new Date() + "", link)
            resolve()
        }
        catch (e) {
            reject(e)
        }
    })
}

module.exports = {
    signUp: signUp,
    signIn: signIn,
    userInfo: user_Info,
    updateProfile: update_profile,
    vendorSignUp:vendorSignUp,
    addAddress:addAddress,
    editAddress:editAddress,
    addressList:addressList,
    deleteAddress: deleteAddress,
    addressView:addressView
};