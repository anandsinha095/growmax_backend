import { __esModule } from '@babel/register/lib/node';
import { responseHandler } from '../../common/response'
import { bcrypt, bcryptVerify, createJwt, sendMail, verifyJwtToken, tenMinutesJwt} from '../../common/function';
import productModel from '../../model/product/product'
import userModel from '../../model/user/user'/* To Create user */
import rewardsModel from '../../model/rewards/rewards';
import communityRewardModel from '../../model/rewards/community';
import passiveRewardModel from '../../model/rewards/passive';
import paymetHistoryModel from '../../model/paymentHistory/paymentHistory'
import passive from '../../model/rewards/passive';
import walletModel from '../../model/rewards/wallet'

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
        let communityReward=0;
        let dailyCommunityReward = 0;
        let pending  = 0;
        product.forEach(element => {
            totalReward = totalReward + element.totalRewards;
            passiveReward = passiveReward + element.claimedPassiveRewards;
            pending = pending + element.pendingReward;
            communityReward = communityReward + element.claimedCommunityRewards;
        }); 
      
        const reward = await rewardsModel.findOne({ username: check_user_exist.username}).sort({createdAt: -1});
        const leg = reward == null  ? 0 : reward.directLeg;
        const totalbusiness = reward == null  ? 0 : reward.totalbusiness;
        const businessIn24h = reward == null  ? 0 : reward.businessIn24h;
        const rank = reward == null  ? 0 : reward.rank;
        var walletData =  await walletModel.findOne({userId:userId});
        var datetime = new Date();
        const cTime = datetime.toISOString().substr(0, 10)
        let upTime = cTime.concat('T00:00:00Z')
        let DownTime = cTime.concat('T23:59:59Z')
        console.log("datetime", upTime, DownTime);
        const comRewards = await communityRewardModel.find({ userId: userId, createdAt: { $gte: upTime, $lt: DownTime } });
        if (comRewards) {
            for (const comReward of comRewards) {
                dailyCommunityReward = dailyCommunityReward + comReward.reward;
            }
        }
        return responseHandler(res, 200, "Success", { totalCourse: courses, totalReward: totalReward, pendingReward: pending, passiveReward: passiveReward, coreWallet: walletData.coreWallet, leg: leg, totalbusiness: totalbusiness, businessIn24h: businessIn24h, ecoWallet: walletData.ecoWallet, tradeWallet: walletData.tradeWallet, communityReward: communityReward, dailyCommunityReward: dailyCommunityReward })
    }
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
}
 

module.exports = {
    displayData:displayData
};