import twoFA from '../model/user/gauth';
// import twoFA from '../model/User/twoFAAccurentCoverage';
import { responseHandler } from './response';
import { verifyQrCode } from './function';
module.exports = {
    /* Second Factor Authentication MiddleWare............This function Call When user perform those activity that always need TWOFA */
    verify2FA: async (req, res, next) => {
        // console.log("verify 2FA =>", req.body)
        if (!req.body.user_id || !req.body.otp || !req.body.password) return responseHandler(res, 400, "Bad Request")
        try {
            let two_Fa_Obj = await twoFA.findOne({ userId: req.body.user_id })
            // console.log("obj *** ====>", two_Fa_Obj)
            if (!two_Fa_Obj) return responseHandler(res, 404, "Invalid Credentials")
            if (!two_Fa_Obj.enableDisbaleGAuth) {
                return responseHandler(res, 403, "Please enable 2FA to perform this action.")
            }
            else if (two_Fa_Obj.enableDisbaleGAuth) {
                // console.log(" *********    only for GAuth On   *********")
                let gAuthObj = await verifyQrCode(req.body.otp, two_Fa_Obj.secretKeyForGAuth)
                if (!gAuthObj) return responseHandler(res, 481, "Invalid 2FA GAuth Token.")
                else next()
            }
        }
        catch (e) {
            return responseHandler(res, 500, e)
        }
    },

    /* Second Factor Authentication MiddleWare............This function Call When user perform those activity that has TWO FA may be disable/Enable */
    is_2FA_On_verify2FA: async (req, res, next) => {
        if (!req.body.user_id) return responseHandler(res, 400, "Bad Request")
        try {
            let two_Fa_Obj = await twoFA.findOne({ userId: req.body.user_id })
            // console.log("In MiddleWare Function To Check Two FA is On Or Not  ====>", two_Fa_Obj)
            if (!two_Fa_Obj) next()
            else if (!two_Fa_Obj.enableDisbaleGAuth) {
                // return responseHandler(res, 403, "Please enable 2FA to perform this action.")
                next()
            }
            else if (two_Fa_Obj.enableDisbaleGAuth) {
                if (!req.body.otp) return responseHandler(res, 400, "Bad Request")
                // console.log(" *********    only for GAuth On   *********")
                let gAuthObj = await verifyQrCode(req.body.otp, two_Fa_Obj.secretKeyForGAuth)
                if (!gAuthObj) return responseHandler(res, 481, "Invalid 2FA GAuth Token.")
                else next()
            }
        }
        catch (e) {
            return responseHandler(res, 500, e)
        }
    }
}