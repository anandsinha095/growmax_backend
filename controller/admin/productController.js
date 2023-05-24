import { __esModule } from '@babel/register/lib/node';
import { responseHandler } from '../../common/response'
import { bcrypt, bcryptVerify, createJwt, sendMail, verifyJwtToken } from '../../common/function';
import { host, angular_port } from '../../envirnoment/config'
import productModel from '../../model/product/product'/* inventory */
import walletModel from '../../model/rewards/wallet'
import userModel from '../../model/user/user'
import withdrawModel from '../../model/user/withdraw';
import addressModel from '../../model/user/address';

const getWalletBalance = async (req, res) => {
    var product = await productModel.find();
    let userData = [];
    for (let index = 0; index < product.length; index++) {
        let wallet = await walletModel.findOne({ userId: product[index].userId });
        let user = await userModel.findOne({ _id: product[index].userId });
        console.log(" product[index].pendingReward>>>", product[index].pendingReward);
        userData.push({
            userId: wallet.userId,
            user: user.email,
            claimedPassiveRewards: product[index].claimedPassiveRewards,
            claimedCommunityRewards: product[index].claimedCommunityRewards,
            pendingReward: product[index].pendingReward,
            coreWallet: wallet.coreWallet,
            tradeWallet: wallet.tradeWallet,
            ecoWallet: wallet.ecoWallet
        })
    }
    return responseHandler(res, 200, "OK", userData);
}


const usersWallet = async (req, res) => {
    var users = await walletModel.find();
    console.log();
    let userData = [];
    for (let index = 0; index < users.length; index++) {
        let wallet = await userModel.findOne({ _id: users[index].userId });
        if (wallet) {
            userData.push({
                userId: wallet._id,
            })
        }
        else {
            console.log("users._id>>>", users[index].userId);
        }

    }
    return responseHandler(res, 200, "OK", userData);
}

const findWallet = async (req, res) => {
    //var useremail=  await userModel.findOne({email:"mohanrajchaudhary143@gmail.com"});
    // console.log(">>>>>>>>useremail", useremail);
    var useremail=  await userModel.findOne({_id:"645884a3c98eea01578e2638"});
    console.log(">>>>>>>>useremail", useremail);
    // users._id>>> 64501c1579e368d956c8372c
    //     var wallet =  await walletModel.find({userId:"64501c1579e368d956c8372c"});
    //   var user=  await userModel.findOne({_id:"64501c1579e368d956c8372c"});
    //     console.log(user);
    //     await walletModel.deleteOne({userId:"64501c1579e368d956c8372c"});
    return responseHandler(res, 200, "OK", useremail);
}
const findWaithdrawWallet = async (req, res) => {
    //var useremail=  await userModel.findOne({email:"mohanrajchaudhary143@gmail.com"});
    // console.log(">>>>>>>>useremail", useremail);
    var useremail=  await withdrawModel.findOne({userId:"645884a3c98eea01578e2638"});
    console.log(">>>>>>>>useremail", useremail);
    // users._id>>> 64501c1579e368d956c8372c
    //     var wallet =  await walletModel.find({userId:"64501c1579e368d956c8372c"});
    //   var user=  await userModel.findOne({_id:"64501c1579e368d956c8372c"});
    //     console.log(user);
    //     await walletModel.deleteOne({userId:"64501c1579e368d956c8372c"});
    return responseHandler(res, 200, "OK", useremail);
}
const coreWalletBal = async (req, res) => {
    var wallet = await walletModel.find();
    let walletBal= 0
    console.log(">>>>>>>======>",  wallet.length);
    for (let index = 0; index < wallet.length; index++) {
        walletBal += wallet[index].coreWallet
    }
    return responseHandler(res, 200, "OK", walletBal);
}


const accountDetails = async (req, res) => {
    var wallet = await addressModel.findOne({userId:"645884a3c98eea01578e2638"});
    return responseHandler(res, 200, "OK", wallet);
}

module.exports = {
    getWalletBalance: getWalletBalance,
    usersWallet: usersWallet,
    findWallet: findWallet,
    coreWalletBal: coreWalletBal,
    findWaithdrawWallet:findWaithdrawWallet,
    accountDetails:accountDetails
};