import { responseHandler } from '../../common/response';
import { __esModule } from '@babel/register/lib/node';
import userModel from '../../model/user/user';
import productModel from '../../model/product/product'/* inventory */
import { host, angular_port } from '../../envirnoment/config'
import { sendMail, tenMinutesJwt, verifyEmail, bcrypt, bcryptVerify, verifyJwtToken } from '../../common/function';
import walletModel from '../../model/rewards/wallet'
// import user from '../../model/User/user.js';
// import { angular_host, angular_port } from '../../enviornment/config';
/***************** Create Order by User ******************/
import mongoose from 'mongoose';
const ObjectId = mongoose.Types.ObjectId;

const coreToEco = async (req, res) => {
    try {
       if(!req.body.amount){
        return responseHandler(res, 400, "Bad request");
       }
       let userId = await verifyJwtToken(req, res);
       let check_user_exist = await userModel.findOne({ _id: userId })
       if (!check_user_exist) return responseHandler(res, 461, "User doesn't exist")
        const data = await walletModel.findOne({ userId: userId});
        if(data.coreWallet < req.body.amount){
            return responseHandler(res, 406, "Don't have sufficient balance in core wallet");
        }
         const coreWallet = data.coreWallet - req.body.amount;
         const ecoWallet = data.ecoWallet +  req.body.amount;
         await walletModel.findOneAndUpdate({ _id: data._id }, { ecoWallet: ecoWallet, coreWallet: coreWallet })
        if(data.length==0){
            return responseHandler(res, 406, "No Community Reward found");
        }
        return responseHandler(res, 200, "OK", data);
    }
    catch (e) {
        console.log("Error :=>", e)
        return responseHandler(res, 500, e)
    }
}

const coreToTrade = async (req, res) => {
    try {
       if(!req.body.amount){
        return responseHandler(res, 400, "Bad request");
       }
        let userId = await verifyJwtToken(req, res);
        let check_user_exist = await userModel.findOne({ _id: userId })
       if (!check_user_exist) return responseHandler(res, 461, "User doesn't exist")
        const data = await walletModel.findOne({ userId: userId})
        if(data.coreWallet < req.body.amount){
            return responseHandler(res, 406, "Don't have sufficient balance in core wallet");
        }
         const coreWallet = data.coreWallet - req.body.amount;
         const tradeWallet = data.tradeWallet +  req.body.amount;
         await walletModel.findOneAndUpdate({ _id: data._id }, { tradeWallet: tradeWallet, coreWallet: coreWallet })
        if(data.length==0){
            return responseHandler(res, 406, "No Community Reward found");
        }
        return responseHandler(res, 200, "OK", data);
    }
    catch (e) {
        console.log("Error :=>", e)
        return responseHandler(res, 500, e)
    }
}

const coreWalletBalance = async (req, res) => {
    try {
       let userId = await verifyJwtToken(req, res);
        const data = await walletModel.findOne({ userId: userId});
        if(!data){
            return responseHandler(res, 200, {coreWalletBalance: 0});
        }
        return responseHandler(res, 200, "OK", {coreWalletBalance: data.coreWallet});
    }
    catch (e) {
        console.log("Error :=>", e)
        return responseHandler(res, 500, e)
    }
}

module.exports = {
    coreToTrade: coreToTrade,
    coreToEco: coreToEco,
    coreWalletBalance: coreWalletBalance
}