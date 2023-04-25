import userModel from '../../model/user/user'/* for  user */
import customerModel from '../../model/customer/customer'/* for  Customer */
import customerAddressModel from '../../model/customer/customerAddresses'
import productModel from '../../model/admin/inventory'/* inventory */
import { __esModule } from '@babel/register/lib/node';
import { responseHandler } from '../../common/response'
import { bcrypt, bcryptVerify, createJwt, sendMail, verifyJwtToken } from '../../common/function';
import { host, angular_port } from '../../envirnoment/config'
import tokenModel from '../../model/commonModel/token';
import csc from 'country-state-city'
const { Parser } = require('json2csv');
import fs from 'fs';
import multiparty from 'multiparty';

/* Get all User Info */
const getAllUsers = async (req, res) => {
    try {
        let info = await verifyJwtToken(req, res)
        let user = await userModel.findById({ _id: info }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0 })
        let allUserData = await customerModel.find().sort({ createdAt: -1 })
        return responseHandler(res, 200, "OK", allUserData)
    }
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
}
/* Get view details of a users Info */
const userDetail = async (req, res) => {
    if (!req.body.userId) return responseHandler(res, 400, "Bad Request")
    const userId = req.body.userId; // destructuring 
    var result = await customerModel.findById({ _id: userId }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0 })
    if (!result) return responseHandler(res, 404, "User doesn't Exist.")
    try {
        let info = await verifyJwtToken(req, res)
        let user = await userModel.findById({ _id: info }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0 })
        if (user.roleId != 3)
            return responseHandler(res, 400, "Bad Request.")
        else {
            return responseHandler(res, 200, "OK", result)
        }
    }
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
}

/* update customer profile  */
const updateCustomerDetail = async (req, res) => {
    var form = new multiparty.Form();
    form.parse(req, async function (err, fields, files) {
        const { firstName, lastName, phoneNumber, userId, status } = req.body; // destructuring 
        if (!firstName || !lastName || !userId || !status) {
            console.log("test1")
            return responseHandler(res, 400, "Bad request")
        }
        try {
            let user_id = await verifyJwtToken(req, res)
            let user_obj = await userModel.findOne({ _id: user_id })
            if (!user_obj) return responseHandler(res, 400, "Bad request")
            let customerData = await customerModel.findOne({ _id: userId })
            if (req.file == undefined && customerData.profilePicture != undefined) {
                req.body.profilePicture = customerData.profilePicture
            }
            else if (req.file != undefined) {
                let imagePath = req.file.path + '.' + req.file.originalname.split('.')[1];
                fs.rename(req.file.path, req.file.path + '.' + req.file.originalname.split('.')[1], function (err) {
                    if (err) console.log('ERROR: ' + err);
                });
                req.body.profilePicture = imagePath.replace("public/", "");
            }
            await customerModel.updateOne({ _id: userId }, { $set: { firstName: firstName, lastName: lastName, phoneNumber: phoneNumber, profilePicture: req.body.profilePicture, status: status } }) //update the password with new one
            return responseHandler(res, 200, "Profile updated successfully.")
        }
        catch (e) {
            console.log("Error ===>", e)
            return responseHandler(res, 500, e)
        }
    })
}

const customer_isActive = async (req, res) => {
    const { userId } = req.body; // destructuring 
    if (!userId) {
        return responseHandler(res, 400, "Bad request")
    }
    var result = await customerModel.find({ userId: userId }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0 })
    if (!result) return responseHandler(res, 404, "Customer doesn't Exist.")
    try {
        let info = await verifyJwtToken(req, res)
        let user = await userModel.findById({ _id: info }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0 })
        if (!user)
            return responseHandler(res, 400, "Bad request")
        let mainUser = await customerModel.findOneAndUpdate({ userId: userId }, { status: result[0].status == 1 ? 0 : 1 })
        if (mainUser.status == 0) {
            let link = '<html> <body> <div bgcolor="#f3f3f3" style="background-color:#f3f3f3"> <table width="650" bgcolor="#ffffff" border="0" align="center" cellpadding="0" cellspacing="0" style="color:#000;font-family:Lato,Helvetica Neue,Helvetica,Arial,sans-serif;"> <tbody> <tr> <td height="30" bgcolor="#f3f3f3"></td></tr><tr> <td height="102" align="center" style="border-bottom:1px solid #eaeaea;"> <img src="http://' + host + '/global_assets/images/logo.png" style="width:65px" alt="Caremx" class="CToWUd"> </td></tr><tr> <td valign="top"> <table width="100%" border="0" cellpadding="30" cellspacing="0" style="font-size:14px"> <tbody> <tr> <td> <div> <p style="font-size:16px">Dear ' + mainUser.firstName + ' ' + mainUser.lastName + ' ,</p><div style="color:#333;font-size:14px"> <p style="color:#333">You account is blocked ! Please contact to admin </p><p>Mail : info@caremx.com.</p><p>The Caremx Team </p></div></div></td></tr></tbody> </table> </td></tr><tr> <td height="40" align="center" valign="bottom" style="font-size:12px;color:#999"> © 2020 Caremx. All Rights Reserved. </td></tr><tr> <td height="30"></td></tr><tr> <td height="30" bgcolor="#f3f3f3"></td></tr></tbody> </table> </div></body></html>'
            sendMail(mainUser.email, "Your Caremx account status updated", null, link)
        }
        else if (mainUser.status == 1) {
            let link = '<html> <body> <div bgcolor="#f3f3f3" style="background-color:#f3f3f3"> <table width="650" bgcolor="#ffffff" border="0" align="center" cellpadding="0" cellspacing="0" style="color:#000;font-family:Lato,Helvetica Neue,Helvetica,Arial,sans-serif;"> <tbody> <tr> <td height="30" bgcolor="#f3f3f3"></td></tr><tr> <td height="102" align="center" style="border-bottom:1px solid #eaeaea;"> <img src="http://' + host + '/global_assets/images/logo.png" style="width:65px" alt="Caremx" class="CToWUd"> </td></tr><tr> <td valign="top"> <table width="100%" border="0" cellpadding="30" cellspacing="0" style="font-size:14px"> <tbody> <tr> <td> <div> <p style="font-size:16px">Dear ' + mainUser.firstName + ' ' + mainUser.lastName + ',</p><div style="color:#333;font-size:14px"> <p style="color:#333">You account is Unblocked ! </p><p>Mail : info@caremx.com.</p><p>The Caremx Team </p></div></div></td></tr></tbody> </table> </td></tr><tr> <td height="40" align="center" valign="bottom" style="font-size:12px;color:#999"> © 2020 Caremx. All Rights Reserved. </td></tr><tr> <td height="30"></td></tr><tr> <td height="30" bgcolor="#f3f3f3"></td></tr></tbody> </table> </div></body></html>'
            sendMail(mainUser.email, "Your Caremx account status updated", null, link)
        }
        return responseHandler(res, 200, "OK")
    }
    catch (e) {
        return responseHandler(res, 500, "Internal Server Error.", e)
    }
}

const deleteCustomer = async (req, res) => {
    const { userId } = req.body; // destructuring 
    if (!userId) {
        return responseHandler(res, 400, "Bad request")
    }
    var result = await customerModel.find({ userId: userId }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0 })
    if (!result) return responseHandler(res, 404, "Customer doesn't Exist.")
    try {
        let info = await verifyJwtToken(req, res)
        let user = await userModel.findById({ _id: info }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0 })
        if (!user)
            return responseHandler(res, 400, "Bad request")
        else {
            let mainUser = await customerModel.findOneAndUpdate({ userId: userId }, { softDelete: 1 })
            let link = '<html> <body> <div bgcolor="#f3f3f3" style="background-color:#f3f3f3"> <table width="650" bgcolor="#ffffff" border="0" align="center" cellpadding="0" cellspacing="0" style="color:#000;font-family:Lato,Helvetica Neue,Helvetica,Arial,sans-serif;"> <tbody> <tr> <td height="30" bgcolor="#f3f3f3"></td></tr><tr> <td height="102" align="center" style="border-bottom:1px solid #eaeaea;"> <img src="http://' + host + '/global_assets/images/logo.png" style="width:65px" alt="Caremx" class="CToWUd"> </td></tr><tr> <td valign="top"> <table width="100%" border="0" cellpadding="30" cellspacing="0" style="font-size:14px"> <tbody> <tr> <td> <div> <p style="font-size:16px">Dear ' + mainUser.firstName + ' ' + mainUser.lastName + ' ,</p><div style="color:#333;font-size:14px"> <p style="color:#333">You account is Suspended ! Please contact to admin </p><p>Mail : info@caremx.com.</p><p>The Caremx Team </p></div></div></td></tr></tbody> </table> </td></tr><tr> <td height="40" align="center" valign="bottom" style="font-size:12px;color:#999"> © 2020 Caremx. All Rights Reserved. </td></tr><tr> <td height="30"></td></tr><tr> <td height="30" bgcolor="#f3f3f3"></td></tr></tbody> </table> </div></body></html>'
            sendMail(mainUser.email, "Your Caremx account Suspended", null, link)
            return responseHandler(res, 200, "OK")
        }
    }
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }

}

/* get export customer data */
const exportUserData = async (req, res) => {
    let user = await userModel.findById({ _id: '5f59cfe07ec0822870d603fd' }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0 })
    let allUserData = await userModel.find({ roleId: 3 })
    if (user.roleId != 1 && user.roleId != 2 && user.roleId != 4) {
        return responseHandler(res, 400, "Bad Request")
    }
    try {
        const fileName = 'users.csv'
        var fields = [
            {
                label: 'UserId',
                value: '_id'
            },
            {
                label: 'First Name',
                value: 'firstName'
            },
            {
                label: 'Last Name',
                value: 'lastName'
            }
            // {
            //     label: 'Admin Password',
            //     value: 'phoneNumber'
            // },
            // {
            //     label: 'Admin Status',
            //     value: 'companyName'
            // },
            // {
            //     label: 'Admin LastName',
            //     value: 'addressOne'
            // },
            // {
            //     label: 'Admin Email Address',
            //     value: 'countryId'
            // },
            // {
            //     label: 'Admin Password',
            //     value: 'stateId'
            // },
            // {
            //     label: 'Admin Status',
            //     value: 'cityId'
            // },
            // {
            //     label: 'Admin Password',
            //     value: 'roleId'
            // },
            // {
            //     label: 'Admin Status',
            //     value: 'status'
            // }

        ];
        // const opts = { fields };
        const parser = new Parser(fields);
        const csv = parser.parse(allUserData);
        res.header('Content-Type', 'text/csv');
        res.attachment(fileName);
        res.send(csv);
        // return responseHandler( res , 200)   
    }
    catch (e) {
        return responseHandler(res, 500, "Internal Server Error.", e)
    }
}

module.exports = {
    getAllUsers: getAllUsers,
    userDetail: userDetail,
    updateCustomerDetail: updateCustomerDetail,
    exportUserData: exportUserData,
    customerIsActive: customer_isActive,
    deleteCustomer: deleteCustomer
    // userRate: userRate,
    // productRate: productRate,
    // customerProductRate: customerProductRate
};