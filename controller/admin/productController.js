import { __esModule } from '@babel/register/lib/node';
import { responseHandler } from '../../common/response'
import { bcrypt, bcryptVerify, createJwt, sendMail, verifyJwtToken } from '../../common/function';
import { host, angular_port } from '../../envirnoment/config'
import productModel from '../../model/product/product'/* inventory */
import walletModel from '../../model/rewards/wallet'
import rewardsModel from '../../model/rewards/rewards';
import userModel from '../../model/user/user'
import withdrawModel from '../../model/user/withdraw';
import passiveRewardModel from '../../model/rewards/passive';
import addressModel from '../../model/user/address';
import communityRewardModel from '../../model/rewards/community';

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
           // claimedPassiveRewards: product[index].claimedPassiveRewards,
            claimedCommunityRewards: product[index].claimedCommunityRewards,
            //pendingReward: product[index].pendingReward,
            //coreWallet: wallet.coreWallet,
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
   // var useremail=  await passiveRewardModel.find({userId:"6459eea0c98eea01578e2791"});
    // console.log(">>>>>>>>useremail", useremail);
     var useremail=   await userModel.find({referralCode:"Mehar001", paymentStatus: true}).sort({createdAt: -1});
     console.log(">>>>>>>>useremail", useremail);
    // users._id>>> 64501c1579e368d956c8372c
    //     var wallet =  await walletModel.find({userId:"64501c1579e368d956c8372c"});
    //   var user=  await userModel.findOne({_id:"64501c1579e368d956c8372c"});
    //     console.log(user);
    //     await walletModel.deleteOne({userId:"64501c1579e368d956c8372c"});
    return responseHandler(res, 200, "OK", useremail);
}
const findWaithdrawWallet = async (req, res) => {
        var useremail=  await rewardsModel.findOne({ username:"Mehar001", senderUsername: "Rajni"}).sort({createdAt: -1});
    // console.log(">>>>>>>>useremail", useremail);
    // var useremail=  await withdrawModel.findOne({bnb:"0x8a76d9dc130600f2093045d15c5f276ca0af71da"});
    // console.log(">>>>>>>>useremail", useremail);
    // users._id>>> 64501c1579e368d956c8372c
//      var wallet =  await walletModel.findOne({userId:"6459eea0c98eea01578e2791"});
      //  var user=  await userModel.find({referralCode:"Mehar001", paymentStatus: true});
        
     //   console.log(" user.length=====>",  useremail.length);
       
//     var passiveReward =   await passiveRewardModel.find({userId:"6459eea0c98eea01578e2791"}).sort({ createdAt: -1 });
//     let comBal = 0
//     for (let index = 0; index < passiveReward.length; index++) {
//         comBal += passiveReward[index].reward
//     }
//     console.log(">>>>>comBal", comBal);
//     //wrong community : 645113f370c044e0358a8e45
//    // 64543808c98eea01578e2316
//         console.log(wallet);
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
    var wallet = await addressModel.findOne({userId:"6459f231c98eea01578e27ab"});
    return responseHandler(res, 200, "OK", wallet);
}

const communityReward = async(req, res)=>{
    var communityIncome = await communityRewardModel.find({userId:"64723c9b5707bf9e383501df"}).sort({createdAt: -1});
    console.log(">>>>>>>======>",  communityIncome);
    let comBal = 0
    // for (let index = 0; index < communityIncome.length; index++) {
    //     comBal += communityIncome[index].reward
    // }
    // console.log(">>>>>comBal", comBal);
    return responseHandler(res, 200, "OK", communityIncome);
}

const products = async(req, res)=>{
    var product =  await productModel.find({userId: req.body.userId})
    return responseHandler(res, 200, "OK", product);
}


const displayData = async (req, res) => {   
    try {
        const userId = '6459eea0c98eea01578e2791'
        let check_user_exist = await userModel.findOne({ _id: userId})
        if (!check_user_exist) return responseHandler(res, 406, "User doesn't exist")
        var product =  await productModel.find({userId:userId})
        if(product.length==0){
         return responseHandler(res, 404, "No Course found")   
        }   
        const courses = product.length 
        let totalReward =0;
        let passiveReward =0;
        let communityReward=0;
        let pending  = 0;
        product.forEach(element => {
            totalReward = totalReward + element.totalRewards;
            passiveReward = passiveReward + element.claimedPassiveRewards;
            pending = pending + element.pendingReward;
            communityReward = communityReward + element.claimedCommunityRewards;
        }); 
        console.log(">>>>>>>>>>>>>courses", courses);
        const reward = await rewardsModel.findOne({ username: check_user_exist.username}).sort({createdAt: -1});
        console.log(">>>>>>>>>>>>>reward", reward);
        const leg = reward == null  ? 0 : reward.directLeg;
        const totalbusiness = reward == null  ? 0 : reward.totalbusiness;
        const businessIn24h = reward == null  ? 0 : reward.businessIn24h;
        const rank = reward == null  ? 0 : reward.rank;
        var walletData =  await walletModel.findOne({userId:userId});
        let pendingReward = totalReward - (walletData.coreWallet + walletData.tradeWallet + walletData.ecoWallet);
        var communityIncome =  await communityRewardModel.find({userId:userId})
        // communityIncome.forEach(element => {
        //     communityReward = communityReward + element.reward;
        //     });
        //     console.log("communityReward",communityReward); 
        return responseHandler(res, 200, "Success", {totalCourse: courses, totalReward: totalReward, pendingReward: pending, passiveReward: passiveReward, coreWallet: walletData.coreWallet, leg: leg, totalbusiness: totalbusiness, businessIn24h: businessIn24h, ecoWallet: walletData.ecoWallet, tradeWallet: walletData.tradeWallet,  communityReward: communityReward})       
    }
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
}


module.exports = {
    getWalletBalance: getWalletBalance,
    usersWallet: usersWallet,
    findWallet: findWallet,
    coreWalletBal: coreWalletBal,
    findWaithdrawWallet:findWaithdrawWallet,
    accountDetails:accountDetails,
    communityReward:communityReward,
    products:products,
    displayData:displayData
};