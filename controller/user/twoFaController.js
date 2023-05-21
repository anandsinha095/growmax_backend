import twoFA from '../../model/user/gauth';
import { __esModule } from '@babel/register/lib/node';
import { responseHandler } from '../../common/response';
import { generateSecretKeyForQrCode, generateQrCode, verifyQrCode, bcryptVerify } from '../../common/function'
import userModel from '../../model/user/user';
module.exports = {
    /* Generate QR Code Call  When User want to enable GAuth*/
    generateQrCode: async (req, res) => {
        console.log("re====>", req.body)
        if (!req.body.user_id || !req.body.email_id) return responseHandler(res, 400, "Bad Request")
        try {
            let userObj = await userModel.findOne({ _id: req.body.user_id })
            if (!userObj) return responseHandler(res, 404, "Invalid Credentials")
            let check_twoFA_obj_exist = await twoFA.findOne({ userId: req.body.user_id })
            /* check userTwoFaObj has exist */
            if (check_twoFA_obj_exist) {
                /* If secret Key Exist */
                if (check_twoFA_obj_exist.secretKeyForGAuth) {
                    let qr = await generateQrCode(req, check_twoFA_obj_exist.secretKeyForGAuth)
                    return responseHandler(res, 200, "OK", { qr: qr, secret: check_twoFA_obj_exist.secretKeyForGAuth.base32 })
                }
                /* if secret key is not Exist */
                else {
                    let secretKey = await generateSecretKeyForQrCode()
                    let qr = await generateQrCode(req, secretKey)
                    await twoFA.updateOne({ userId: req.body.user_id }, { $set: { secretKeyForGAuth: secretKey } })
                    return responseHandler(res, 200, "OK", { qr: qr, secret: secretKey.base32 })
                }
            }
            /* if Two FA obj is not exist with user then create  */
            else {
                let secretKey = await generateSecretKeyForQrCode()
                let qr = await generateQrCode(req, secretKey)
                let newObj = await twoFA.findOneAndUpdate({ userId: req.body.user_id }, { $set: { secretKeyForGAuth: secretKey, userId: req.body.user_id } }, { upsert: true, new: true })
                let test = await userModel.findOneAndUpdate({ _id: req.body.user_id }, { $set: { twoFaPopulate: newObj._id } })
                return responseHandler(res, 200, "OK", { qr: qr, secret: secretKey.base32 })
            }
        }
        catch (e) {
            return responseHandler(res, 500, e)
        }
    },

    /* To Verify QR Code number [ 1-> if body has status key then update that value Otherwise only check Gauth code is valid or not  */
    verifyQrCode: async (req, res) => {
        console.log("###==>", req.body)
        if (!req.body.user_id || !req.body.token) return responseHandler(res, 400, "Bad Request")
        try {
            let userObj = await userModel.findOne({ _id: req.body.user_id })
            console.log("user oBj ==>", userObj)
            if (!userObj) return responseHandler(res, 404, "Invalid Credentials.")
            let twoFAObj = await twoFA.findOne({ userId: req.body.user_id })
            let Verify = await verifyQrCode(req.body.token, twoFAObj.secretKeyForGAuth)
            if (Verify) {
                await twoFA.updateOne({ userId: req.body.user_id }, { $set: { enableDisbaleGAuth: true, updatedAt: Date.now() } })
              let a=  await userModel.updateOne({ _id: req.body.user_id }, { $set: { twoFaStatus: true, updatedAt: Date.now() } })
              return responseHandler(res, 200, "OK")
            }
            else return responseHandler(res, 481, "Invalid Code.")
        }
        catch (e) {
            console.log("verify Qr Code Error ==>", e)
            return responseHandler(res, 500, e)
        }
    },

    /* Disable GAuth   */
    disableGAuth: async (req, res) => {
        try {
            let userObj = await userModel.findById({ _id: req.body.user_id })
            let check_password = await bcryptVerify(req.body.password, userObj.password)
            if (check_password == false) return responseHandler(res, 404, "Invalid Password.")
            await twoFA.findOneAndUpdate({ userId: req.body.user_id }, { $set: { enableDisbaleGAuth: false } }, { new: true })
            return responseHandler(res, 200, "GAuth has been Disabled.")
        }
        catch (e) {
            return responseHandler(res, 500, e)
        }
    },

    /* Verify GAuth Code..  When There is no need of Gauth middleware but Gauth is enabled . So this api call from front End and check Gauth is correct or not . If correct then hit the next call in success Response. */
    verifyGAuthCode: async (req, res) => {
        if (!req.body.user_id || !req.body.token) return responseHandler(res, 400, "Bad Request.")
        try {
            let twoFAObj = await twoFA.findOne({ userId: req.body.user_id })
            let Verify = await verifyQrCode(req.body.token, twoFAObj.secretKeyForGAuth)
            if (Verify) return responseHandler(res, 200, "OK")
            return responseHandler(res, 481, "Invalid Code.")
        }
        catch (e) {
            return responseHandler(res, 500, e)
        }
    },
}