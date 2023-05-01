import { responseHandler } from '../../common/response';
import { __esModule } from '@babel/register/lib/node';
import productModel from '../../model/product/product'/* inventory */
import packagesModel from '../../model/package/package'/* inventory */
import userModel from '../../model/user/user';
import paymentHistoryModel from '../../model/paymentHistory/paymentHistory';
import communityRewardsModel from '../../model/rewards/communityRewards';
import rewardsModel from '../../model/rewards/rewards';
import levelModel from '../../model/rewards/level';
import passiveRewardModel from '../../model/rewards/passive';
import communityRewardModel from '../../model/rewards/community';
import walletModel from '../../model/rewards/wallet'
import tokenModel from '../../model/commonModel/token';
import { host, angular_port } from '../../envirnoment/config'
import { sendMail, tenMinutesJwt, verifyEmail, bcrypt, bcryptVerify, verifyJwtToken } from '../../common/function';

async function rewardBooster() {
    const data = await productModel.find({ productStatus: "Active" });
    for (let index = 0; index < data.length; index++) {
        if (data[index].dailyReward < data[index].pendingReward && data[index].pendingReward > 0) {
            const claimedPassiveRewards = data[index].claimedPassiveRewards + data[index].dailyReward;
            const pendingRewards = data[index].pendingReward - data[index].dailyReward;
            await productModel.findOneAndUpdate({ _id: data[index]._id, productStatus: "Active" }, { $set: { claimedPassiveRewards: claimedPassiveRewards, pendingReward: pendingRewards } })
            await updateWalletBalance(data[index].userId, data[index].dailyReward);
            await passiveEntry(data[index].userId, data[index].title, data[index]._id, data[index].price, data[index].roi, data[index].dailyReward, pendingRewards, data[index].totalRewards);
        }
        else if (data[index].dailyReward == data[index].pendingReward && data[index].pendingReward > 0) {
            const claimedPassiveRewards = data[index].claimedPassiveRewards + data[index].dailyReward;
            await productModel.findOneAndUpdate({ _id: data[index]._id, productStatus: "Active" }, { $set: { productStatus: "Completed", claimedPassiveRewards: claimedPassiveRewards, pendingReward: 0 } })
            await updateWalletBalance(data[index].userId, data[index].dailyReward);
            await passiveEntry(data[index].userId, data[index].title, data[index]._id, data[index].price, data[index].roi, data[index].dailyReward, 0, data[index].totalRewards);
        }
        // extra
        else if (data[index].dailyReward > data[index].pendingReward && data[index].pendingReward) {
            const extraRewards = data[index].dailyReward - data[index].pendingReward;
            const newReward = data[index].dailyReward - parseFloat(extraRewards);
            const claimedPassiveReward = data[index].claimedPassiveRewards + parseFloat(newReward)
            await productModel.findOneAndUpdate({ _id: data[index]._id, productStatus: "Active" }, { $set: { claimedPassiveRewards: claimedPassiveReward, pendingReward: 0, productStatus: "Completed", extraReward: extraRewards } })
            await updateWalletBalance(data[index].userId, parseFloat(newReward));
            await passiveEntry(data[index].userId, data[index].title, data[index]._id, data[index].price, data[index].roi, newReward, 0, data[index].totalRewards);
        }
        // community reward
        const reward = await rewardsModel.find({ userId: data[index].userId, isActive: true });
        if (reward.length > 0) {
           let activePackage  = await productModel.find({ productStatus: "Active", userId: data[index].userId});
            for (let i = 0; i < reward.length; i++) {
                //var rewardPoint = 0;
                var product = await productModel.findOne({ _id: data[index]._id });
                var comReward =  (reward[i].rewardPoint / activePackage.length).toFixed(12);
                if (parseFloat(comReward) < product.pendingReward && product.pendingReward > 0 && product.productStatus == "Active") {
                    var claimedCommunityRewards = product.claimedCommunityRewards + parseFloat(comReward); // 100 % reward distributed in package 
                    var pendingRewards = (product.pendingReward - parseFloat(comReward));// 100 % reward deducted
                    await updateWallet(product.userId, parseFloat(comReward));
                    await productModel.findOneAndUpdate({ _id: product._id, productStatus: "Active" }, { $set: { claimedCommunityRewards: claimedCommunityRewards, pendingReward: pendingRewards, productStatus: "Active" } })
                }
                else if (parseFloat(comReward) == product.pendingReward && product.pendingReward > 0 && product.productStatus == "Active") {
                    var claimedCommunityRewards = product.claimedCommunityRewards + parseFloat(comReward);
                    await updateWallet(product.userId, parseFloat(comReward));
                    await productModel.findOneAndUpdate({ _id: product._id, productStatus: "Active" }, { $set: { productStatus: "Completed", claimedCommunityRewards: claimedCommunityRewards, pendingReward: 0 } })
                }
                else if (parseFloat(comReward) > product.pendingReward && product.pendingReward > 0 && product.productStatus == "Active") {
                    const extraRewards = parseFloat(comReward) - product.pendingReward;
                    const newReward = parseFloat(comReward) - parseFloat(extraRewards);
                    const claimedCommunityRewards = product.claimedCommunityRewards + parseFloat(newReward)
                    await updateWallet(product.userId, parseFloat(newReward));
                    await productModel.findOneAndUpdate({ _id: product._id, productStatus: "Active" }, { $set: { claimedCommunityRewards: claimedCommunityRewards, productStatus: "Completed", pendingReward: 0, extraRewards: extraRewards } })
                }
                if (product.productStatus == "Active") {
                    let community = {
                        userId: reward[i].userId,
                        username: reward[i].username,
                        senderId: reward[i].senderId,
                        senderUsername: reward[i].senderUsername,
                        roi: reward[i].roi,
                        reward: reward[i].rewardPoint,
                        senderCreatedAt: reward[i].senderCreatedAt
                    }
                    await communityRewardModel.create(community);
                }
            }
        }
    }
}

async function passiveEntry(userId, packages, packageId, price, roi, dailyReward, pendingReward, totalRewards) {
    let passive = {
        userId: userId,
        package: packages,
        packageId: packageId,
        price: price,
        roi: roi,
        reward: dailyReward,
        pendingReward: pendingReward,
        totalReward: totalRewards
    }
    await passiveRewardModel.create(passive);
}

async function updateWallet(userId, rewardPoint) {
    const wallet = await walletModel.findOne({ userId: userId })
    let coreWallet = (rewardPoint * 8 / 10) + wallet.coreWallet;
    let tradeWallet = wallet.tradeWallet + (rewardPoint / 10);
    let ecoWallet = wallet.ecoWallet + (rewardPoint / 10);
    await walletModel.findOneAndUpdate({ userId: userId }, { $set: { coreWallet: coreWallet, tradeWallet: tradeWallet, ecoWallet: ecoWallet } });
}

async function updateWalletBalance(userId, passiveReward) {
    const wallet = await walletModel.findOne({userId: userId});
    const coreWallet = wallet.coreWallet + passiveReward;
    await walletModel.findOneAndUpdate({ userId: userId }, { $set: { coreWallet: coreWallet } });
}

setInterval(rewardBooster, 12000);
