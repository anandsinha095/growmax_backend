import userModel from '../../model/user/user' /* To Create user */
import vendorModel from '../../model/vendor/vendor'
import { __esModule } from '@babel/register/lib/node';
import { responseHandler } from '../../common/response'
import { bcrypt, bcryptVerify, createJwt, sendMail, verifyJwtToken, tenMinutesJwt} from '../../common/function';
import { host, fontend_host } from '../../envirnoment/config'
import tokenModel from '../../model/commonModel/token';
import permissionModel from '../../model/admin/permission'
import csc from 'country-state-city';
import multiparty from 'multiparty';
var fs = require('fs');
const signUp = async (req, res) => {
       const { firstName, lastName, email, password, confirmPassword,phoneNumber, addressOne, addressTwo, countryId, stateId, cityId, zipcode,  companyName, roleId} = req.body; // destructuring 
       if (!firstName || !lastName || !email || !password || !confirmPassword || !addressOne || !countryId || !stateId || !cityId || !zipcode) {
        return responseHandler(res, 400, "Bad request")
    }
    if (password != confirmPassword) return responseHandler(res, 400, "password and confirmpassword not matching")
    try {
        let check_email_exist = await userModel.findOne({ email: email })
        if (check_email_exist) return responseHandler(res, 403, "email already exist")
        req.body.password = await bcrypt(password)
        req.body.roleId = req.body.roleId == null || req.body.roleId == '' ? 3 : req.body.roleId /* 1: Admin // 2: Employee // 3:Customer */
        let lastUser=  await userModel.find({}).sort({_id:-1}).limit(1)
        req.body.userId = lastUser[0] !=undefined ? parseFloat(lastUser[0].userId) + 1 : 1001;
        let result = await userModel.create(req.body) /* create user object */
        let token = await createJwt({ userId: result._id}) /* generate jwt */
        /* mail sending process */ 
        let link = '<html> <body> <div bgcolor="#f3f3f3" style="background-color:#f3f3f3"> <table width="650" bgcolor="#ffffff" border="0" align="center" cellpadding="0" cellspacing="0" style="color:#000;font-family:Lato,Helvetica Neue,Helvetica,Arial,sans-serif;"> <tbody> <tr> <td height="30" bgcolor="#f3f3f3"></td></tr><tr> <td height="102" align="center" style="border-bottom:1px solid #eaeaea;"> <img src="http://'+fontend_host+'/global_assets/images/logo.png" style="width:65px" alt="magna" class="CToWUd"> </td></tr><tr> <td valign="top"> <table width="100%" border="0" cellpadding="30" cellspacing="0" style="font-size:14px"> <tbody> <tr> <td> <div> <p style="font-size:16px">Hi '+firstName+ ' ' +lastName+',</p><div style="color:#333;font-size:14px"><p>Thanks for getting started with Magna! To complete the email verification, </p><p> Click <a href="http://'+fontend_host+'/Verify/'+token +'">here</a> to verify your account</p> <p>Mail : info@magna.com.</p><p>The Magna Team </p></div></div></td></tr></tbody> </table> </td></tr><tr> <td height="40" align="center" valign="bottom" style="font-size:12px;color:#999"> © 2020 Magna. All Rights Reserved. </td></tr><tr> <td height="30"></td></tr><tr> <td height="30" bgcolor="#f3f3f3"></td></tr></tbody> </table> </div></body></html>' 
        sendMail(email, "[Magna] Confirm Your Registration From " + " " + new Date() + "", "", link) /* verification mail send */
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
        var result = (await userModel.findOne({ email: req.body.email }, { createdAt: 0, updatedAt: 0, __v: 0 })) || (await vendorModel.findOne({ email: req.body.email }, { createdAt: 0, updatedAt: 0, __v: 0 }))
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

/* Ge
t User Info after Any changes in user Record And update the local Storage */
const user_Info = async (req, res) => {
    try {
        let info = await verifyJwtToken(req, res)
        let user = await userModel.findById({ _id: info }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
        if(user == null)
        return responseHandler(res, 400, "Bad Request.")
        if(user.countryId != undefined){
            let obj = {country:csc.getCountryById(user.countryId.toString()).name  , state: csc.getStateById(user.stateId.toString()).name , city:csc.getCityById(user.cityId.toString()).name }
            let  finalResponse = {result: user, csc: obj}
            return responseHandler(res, 200, "OK", finalResponse)
        }
        else
        {
            if(user.roleId != 3)
             var permission = await permissionModel.findOne({ userId: user._id})
             let  finalResponse = {result: user, permission:permission}
             return responseHandler(res, 200, "OK", finalResponse)
        }

    }
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
}

/* Get User Info after Any changes in user Record And update the local Storage */
const update_profile = async (req, res) => {
    var form = new multiparty.Form();
    form.parse(req, async function (err, fields, files) {
        const { firstName, lastName, phoneNumber, addressOne, addressTwo, countryId, stateId, cityId, companyName, zipcode, roleId} = req.body; // destructuring 
        if(roleId ==3){
            if ( !firstName || !lastName || !addressOne || !countryId || !stateId || !cityId || !zipcode) {
                return responseHandler(res, 400, "Bad request")
            }
        }
       
       else if (roleId !=3 && !firstName || !lastName ) {
            return responseHandler(res, 400, "Bad request")
        }
        try {
            let user_id= await verifyJwtToken(req, res)
            let user_obj = await userModel.findOne({ _id: user_id })
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
            if(user_obj.roleId != 3)  {
                await userModel.updateOne({ _id: user_id }, { $set: { firstName: firstName, lastName:lastName, phoneNumber: phoneNumber, profilePicture: req.body.profilePicture} }) //update the password with new one
                return responseHandler(res, 200, "Your profile updated successfully.")
            }
            else{
                await userModel.updateOne({ _id: user_id }, { $set: { firstName: firstName, lastName:lastName, phoneNumber: phoneNumber , addressOne: addressOne, addressTwo: addressTwo , countryId: countryId , stateId:stateId, cityId:cityId, zipcode:zipcode, companyName: companyName , profilePicture: req.body.profilePicture} }) //update the password with new one
                return responseHandler(res, 200, "Your profile updated successfully.")
            }            
        }
        catch (e) {
            console.log("Error ===>", e)
            return responseHandler(res, 500, e)
        }
    })
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
            sendMail(email, "[Magna] Confirm Your LoginIp Or Email Verification From " + " " + new Date() + "", link)
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
};