import { responseHandler } from '../../common/response';
import { __esModule } from '@babel/register/lib/node';
import userModel from '../../model/user/user';
import withdrawModel from '../../model/user/withdraw'
import { verifyJwtToken } from '../../common/function';
import { host, angular_port } from '../../envirnoment/config'

const addWithdrawWallet = async (req, res) => {
    try {
        let userId = await verifyJwtToken(req, res);
        let check_user_exist = await userModel.findOne({ _id: userId })
        if (!check_user_exist) return responseHandler(res, 461, "User doesn't exist")
        const { bnb, matic } = req.body; // destructuring 
        if (!bnb && !matic) {
            return responseHandler(res, 400, "Bad request")
        }
        req.body.userId = userId;
        const data = await withdrawModel.findOne({ userId: userId });
        if (!data) {
            req.body.bnb = req.body.bnb != undefined ? req.body.bnb : null
            req.body.matic = req.body.matic != undefined ? req.body.matic : null
            await withdrawModel.create(req.body)
            return responseHandler(res, 200, "Your Withdraw address added successfully.");
        }
        else {
            req.body.bnb = req.body.bnb != undefined ? req.body.bnb : data.bnb 
            req.body.matic = req.body.matic != undefined ? req.body.matic : data.matic  
            await withdrawModel.updateOne({ _id: data._id }, { $set: { bnb:  req.body.bnb, matic:  req.body.matic } }) //update the password with new one
            return responseHandler(res, 200, "Your Withdraw address updated successfully.")
        }
    }
    catch (e) {
        console.log("Error :=>", e)
        return responseHandler(res, 500, e)
    }
}

const getWithdrawWallet = async (req, res) => {
    try {
        let userId = await verifyJwtToken(req, res);
        const data = await withdrawModel.findOne({ userId: userId });
        if (!data) {
            return responseHandler(res, 200, "ok", { data: false });
        }
        return responseHandler(res, 200, "ok", data)
    }
    catch (e) {
        console.log("Error :=>", e)
        return responseHandler(res, 500, e)
    }
}
 

module.exports = {
    addWithdrawWallet: addWithdrawWallet,
    getWithdrawWallet: getWithdrawWallet
}
