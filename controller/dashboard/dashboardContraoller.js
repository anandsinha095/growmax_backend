import { __esModule } from '@babel/register/lib/node';
import { responseHandler } from '../../common/response'
import { bcrypt, bcryptVerify, createJwt, sendMail, verifyJwtToken, tenMinutesJwt} from '../../common/function';
import productModel from '../../model/product/product'
import userModel from '../../model/user/user'/* To Create user */
import rewardsModel from '../../model/rewards/rewards';
import communityRewardModel from '../../model/rewards/community';
import paymetHistoryModel from '../../model/paymentHistory/paymentHistory'

/***************************Display All dashboard page banner  *******************/
const displayData = async (req, res) => {   
    try {
        let userId = await verifyJwtToken(req, res);
        let check_user_exist = await userModel.findOne({ _id: userId})
        if (!check_user_exist) return responseHandler(res, 406, "User doesn't exist")
        var product =  await productModel.find({userId:userId})
        if(product.length==0){
         return responseHandler(res, 404, "No Course found")   
        }   
        const courses = product.length 
        let totalReward =0;
        let passiveReward =0;
        let coreWallet =0;
        let communityReward=0;
        product.forEach(element => {
            totalReward = totalReward + parseInt(element.totalRewards);
            passiveReward = passiveReward + element.claimedPassiveRewards;
        }); 
        // eco and trade needs to add
       
        const reward = await rewardsModel.findOne({ username: check_user_exist.username}).sort({createdAt: -1});
        const leg = reward == null  ? 0 : reward.directLeg;
        const totalbusiness = reward == null  ? 0 : reward.totalbusiness;
        const businessIn24h = reward == null  ? 0 : reward.businessIn24h;
        const rank = reward == null  ? 0 : reward.rank;
        var walletData =  await productModel.findOne({userId:userId}).sort({createdAt: -1});
        coreWallet = walletData.coreWallet
        console.log("coreWallet", coreWallet);
        const ecoWallet =walletData.ecoWallet;
        const tradeWallet =  walletData.tradeWallet;
        let pendingReward = totalReward - (coreWallet + tradeWallet + ecoWallet);
        var community =  await communityRewardModel.find({userId:userId})
        community.forEach(element => {
            communityReward = communityReward + element.reward;
        });
        return responseHandler(res, 200, "Success", {totalCourse: courses, totalReward: totalReward, pendingReward: pendingReward, passiveReward: passiveReward, coreWallet: coreWallet, leg: leg, totalbusiness: totalbusiness, businessIn24h: businessIn24h, ecoWallet:ecoWallet, tradeWallet: tradeWallet,  communityReward:communityReward})       
    }
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
}
 

module.exports = {
    displayData:displayData
};