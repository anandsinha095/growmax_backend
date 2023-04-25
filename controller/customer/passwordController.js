import vendorModel from '../../model/vendor/vendor'/* To Create user */
import customerModel from '../../model/customer/customer';
import userModel from '../../model/user/user.js';
import { responseHandler } from '../../common/response';
import tokenModel from '../../model/commonModel/token'
import { sendMail, tenMinutesJwt, verifyEmail, bcrypt, bcryptVerify, verifyJwtToken, createJwt } from '../../common/function';
import { host,fontend_host } from '../../envirnoment/config.js';
//import { angular_host, angular_port } from '../../enviornment/config';


/* Forgot Password */
const forgotPassword = async (req, res) => {
    if (!req.body.email) return responseHandler(res, 400, "Bad Request")
    try {
        let user = (await userModel.findOne({ email: req.body.email })) || (await vendorModel.findOne({ email: req.body.email })) 
        if (!user) return responseHandler(res, 404, "Invalid Email")
        
        let token = await createJwt(req.body.email, res)
        /* check Reset password Link is already send .then Send A next link after Ten Minutes. */
        let checkToken = await check_token_exist(user._id, token)
       
        let link = await forgotPassword_HTML(token)
            sendMail(user.email, "Caremx Reset Password Link", null, link)
        
       
        return responseHandler(res, 200, "A reset password link sent to your Email.")
    }
    catch (e) {
     console.log(e)
        return responseHandler(res, 500, "Internal Server Error.", e)
    }
}

/* Forgot Password */
const customerForgotPassword = async (req, res) => {
    if (!req.body.email) return responseHandler(res, 400, "Bad Request")
    try {
        let user =  await customerModel.findOne({ email: req.body.email })
        if (!user) return responseHandler(res, 404, "Invalid Email")
        
        let token = await createJwt(req.body.email, res)
        /* check Reset password Link is already send .then Send A next link after Ten Minutes. */
        let checkToken = await check_token_exist(user._id, token)
       
        let link = await customer_forgotPassword_HTML(token)
            sendMail(user.email, "Caremx Reset Password Link", null, link)
        
       
        return responseHandler(res, 200, "A reset password link sent to your Email.")
    }
    catch (e) {
     console.log(e)
        return responseHandler(res, 500, "Internal Server Error.", e)
    }
}

/* check Reset Link is valid or not */
const checkResetLink = async (req, res) => {
    try {
        let tokenObj = await tokenModel.findOne({ token: req.params.token })
        if(tokenObj== null){
            return responseHandler(res, 407, "This link does not exist.")  
        }
        else{
            let check = await verifyEmail(req, res)
            return responseHandler(res, 200, "OK")
        }        
    }
    catch (e) {
        if(e== "TokenExpiredError") return responseHandler(res, 500, "Link has been expired.", e)
        return responseHandler(res, 500, "Internal Server Error.", e) }
}

/* Reset Password Call */
const resetPassword = async (req, res) => {
    if (!req.body.confirmPassword || !req.body.password || !req.params.token) return responseHandler(res, 400, "Bad Request")
    try {
        let tokenObj = await tokenModel.findOne({ token: req.params.token })
        if(tokenObj== null){
            return responseHandler(res, 407, "This link does not exist.")  
        }
        let token = await verifyEmail(req, res) //verify JWt and get email from token
        if (req.body.confirmPassword != req.body.password) return responseHandler(res, 400, "Password and Confirm Password should be same.")
        let new_bcr = await bcrypt(req.body.password)
        let user_obj = (await userModel.findOneAndUpdate({ email: token.data }, { $set: { password: new_bcr } }, { new: true })) || ( await vendorModel.findOneAndUpdate({ email: token.data }, { $set: { password: new_bcr } }, { new: true })) || ( await customerModel.findOneAndUpdate({ email: token.data }, { $set: { password: new_bcr } }, { new: true }))
       //let user_obj = await vendorModel.findOneAndUpdate({ email: token.data }, { $set: { password: new_bcr } }, { new: true })
        if (!user_obj) return responseHandler(res, 404, "Invalid Credentials.")
        /* Reset Password Html */
        let link = await reset_password_html(user_obj)
        sendMail(user_obj.email, "Your Caremx Password has been Reset", null, link)
        await tokenModel.deleteOne({ token: req.params.token }) // delete token 
        return responseHandler(res, 200, "OK")
    }
    catch (e) {
        return responseHandler(res, 500, "Internal Server Error.", e)
    }
}

/* Change Password call inside account options */
const changePassword = async (req, res) => {
    let user_id= await verifyJwtToken(req, res)
    if ( !req.body.oldPassword || !req.body.newPassword || !req.body.confirmPassword) return responseHandler(res, 400, "Bad Request")
    const { oldPassword, newPassword, confirmPassword } = req.body
    if (newPassword != confirmPassword) return responseHandler(res, 406, "Password and Confirm Password should be same.")
    try {
       
        let user_obj = (await userModel.findOne({ _id: user_id })) || (await vendorModel.findOne({ _id: user_id })) || (await customerModel.findOne({ _id: user_id }))
        let check_password = await bcryptVerify(oldPassword, user_obj.password) //match the old password and real password
        if (!check_password) return responseHandler(res, 404, "Current password is not correct.")
        else {
            let check_password_not_repeat_last_time = await bcryptVerify(newPassword, user_obj.password)
            if (check_password_not_repeat_last_time) return responseHandler(res, 403, "Oh! Please try a different password.")
            let new_password_bcr = await bcrypt(newPassword)
            let test=(await userModel.findOneAndUpdate({ _id: user_id }, { $set: { password: new_password_bcr } })) || ( await vendorModel.findOneAndUpdate({ _id: user_id }, { $set: { password: new_password_bcr } })) || (await customerModel.findOneAndUpdate({ _id: user_id }, { $set: { password: new_password_bcr } })) //update the password with new one
            let link = await change_password_html(user_obj)
            sendMail(user_obj.email, "Your Caremx Password has been Changed", null, link)
            return responseHandler(res, 200, "You have changed your password successfully.")
        }
    }
    catch (e) {
        console.log("Error ===>", e)
        return responseHandler(res, 500, e)
    }
}
/* check token Exist then not send link on user email Id */
const check_token_exist = (userId, token) => {
    return new Promise(async (resolve, reject) => {
        try {   
                await tokenModel.deleteOne({ userId: userId, type: "PASSV"})
                await tokenModel.create({ userId: userId, type: "PASSV", token: token })
                resolve(true)          
        }
        catch (e) {
            reject(e)
        }
    })
}
module.exports = {
    forgotPassword: forgotPassword,
    checkResetLink: checkResetLink,
    resetPassword: resetPassword,
    changePassword: changePassword,
    customerForgotPassword:customerForgotPassword
}




/*********************************************************************************************************************************************************/
/* HTML Template for forgot password */
const forgotPassword_HTML = (token) => {    
    let link = '<html> <body> <div bgcolor="#f3f3f3" style="background-color:#f3f3f3"> <table width="650" bgcolor="#ffffff" border="0" align="center" cellpadding="0" cellspacing="0" style="color:#000;font-family:Lato,Helvetica Neue,Helvetica,Arial,sans-serif;"> <tbody> <tr> <td height="30" bgcolor="#f3f3f3"></td></tr><tr> <td height="102" align="center" style="border-bottom:1px solid #eaeaea;"> <img src="http://'+host+'/global_assets/images/logo.png" style="width:65px" alt="magna" class="CToWUd"> </td></tr><tr> <td valign="top"> <table width="100%" border="0" cellpadding="30" cellspacing="0" style="font-size:14px"> <tbody> <tr> <td> <div> <p style="font-size:16px">Dear concern,</p><div style="color:#333;font-size:14px"> <p style="color:#333">Please use the link below to complete the process of changing your password for Caremx. </p><p>Click <a style="color:#0099cc;text-decoration:none" href="http://'+ host + '/resetpassword/' + token + '">here</a> to reset your password</p><p> If you did not try to reset your password, feel free to ignore this message. If you have any additional questions, feel free to reach out to us at info@caremx.com.</p><p>The Caremx Team </p></div></div></td></tr></tbody> </table> </td></tr><tr> <td height="40" align="center" valign="bottom" style="font-size:12px;color:#999"> © 2020 Caremx -order management. All Rights Reserved. </td></tr><tr> <td height="30"></td></tr><tr> <td height="30" bgcolor="#f3f3f3"></td></tr></tbody> </table> </div></body></html>';
    return link;
}

/* HTML Template for forgot password customer */
const customer_forgotPassword_HTML = (token) => {    
    let link = '<html> <body> <div bgcolor="#f3f3f3" style="background-color:#f3f3f3"> <table width="650" bgcolor="#ffffff" border="0" align="center" cellpadding="0" cellspacing="0" style="color:#000;font-family:Lato,Helvetica Neue,Helvetica,Arial,sans-serif;"> <tbody> <tr> <td height="30" bgcolor="#f3f3f3"></td></tr><tr> <td height="102" align="center" style="border-bottom:1px solid #eaeaea;"> <img src="http://'+host+'/global_assets/images/logo.png" style="width:65px" alt="magna" class="CToWUd"> </td></tr><tr> <td valign="top"> <table width="100%" border="0" cellpadding="30" cellspacing="0" style="font-size:14px"> <tbody> <tr> <td> <div> <p style="font-size:16px">Dear concern,</p><div style="color:#333;font-size:14px"> <p style="color:#333">Please use the link below to complete the process of changing your password for Caremx. </p><p>Click <a style="color:#0099cc;text-decoration:none" href="http://'+ fontend_host + '/ResetPassword/' + token + '">here</a> to reset your password</p><p> If you did not try to reset your password, feel free to ignore this message. If you have any additional questions, feel free to reach out to us at info@caremx.com.</p><p>The Caremx Team </p></div></div></td></tr></tbody> </table> </td></tr><tr> <td height="40" align="center" valign="bottom" style="font-size:12px;color:#999"> © 2020 Caremx -order management. All Rights Reserved. </td></tr><tr> <td height="30"></td></tr><tr> <td height="30" bgcolor="#f3f3f3"></td></tr></tbody> </table> </div></body></html>';
    return link;
}
/* Changed password HTML  */
const change_password_html = () => {
    let link = ""
    link = '<p>You have SuccessFully changed Your Caremx Password<p>'
    return link;
}
/* Reset Password HTML. When user has been successfully reset his password */
const reset_password_html = () => {
    let link = ""
    link = '<p>You have SuccessFully Reset Your Caremx Password<p>'
    return link;
}
