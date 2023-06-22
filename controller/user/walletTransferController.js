import { responseHandler } from '../../common/response';
import { __esModule } from '@babel/register/lib/node';
import productModel from '../../model/product/product'/* inventory */
import userModel from '../../model/user/user';
import rewardsModel from '../../model/rewards/rewards';
import passiveRewardModel from '../../model/rewards/passive';
import communityRewardModel from '../../model/rewards/community';
import walletModel from '../../model/rewards/wallet'
import { verifyJwtToken } from '../../common/function';
import { host, angular_port } from '../../envirnoment/config'

/***************** Create Order by User ******************/
import mongoose from 'mongoose';
const ObjectId = mongoose.Types.ObjectId;

const coreToEco = async (req, res) => {
    try {
        if (!req.body.amount) {
            return responseHandler(res, 400, "Bad request");
        }
        let userId = await verifyJwtToken(req, res);
        let check_user_exist = await userModel.findOne({ _id: userId })
        if (!check_user_exist) return responseHandler(res, 461, "User doesn't exist")
        const data = await walletModel.findOne({ userId: userId });
        if (data.coreWallet < req.body.amount) {
            return responseHandler(res, 406, "Don't have sufficient balance in core wallet");
        }
        const coreWallet = data.coreWallet - req.body.amount;
        const ecoWallet = data.ecoWallet + req.body.amount;
        await walletModel.findOneAndUpdate({ _id: data._id }, { ecoWallet: ecoWallet, coreWallet: coreWallet })
        if (data.length == 0) {
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
        if (!req.body.amount) {
            return responseHandler(res, 400, "Bad request");
        }
        let userId = await verifyJwtToken(req, res);
        let check_user_exist = await userModel.findOne({ _id: userId })
        if (!check_user_exist) return responseHandler(res, 461, "User doesn't exist")
        const data = await walletModel.findOne({ userId: userId })
        if (data.coreWallet < req.body.amount) {
            return responseHandler(res, 406, "Don't have sufficient balance in core wallet");
        }
        const coreWallet = data.coreWallet - req.body.amount;
        const tradeWallet = data.tradeWallet + req.body.amount;
        await walletModel.findOneAndUpdate({ _id: data._id }, { tradeWallet: tradeWallet, coreWallet: coreWallet })
        if (data.length == 0) {
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
        const data = await walletModel.findOne({ userId: userId });
        if (!data) {
            return responseHandler(res, 200, { coreWalletBalance: 0 });
        }
        return responseHandler(res, 200, "OK", { coreWalletBalance: data.coreWallet });
    }
    catch (e) {
        console.log("Error :=>", e)
        return responseHandler(res, 500, e)
    }
}



async function rewardBooster() {
    const data = await productModel.find({ productStatus: "Active" });
    var datetime = new Date();
    var productLen = data.length
    var index = 0, productLen = data.length;
    while (index < productLen) {
        var timeTest = await checkPassiveReward(data[index].userId, data[index]._id, data[index].createdAt);
        if (timeTest.updatedAt <= datetime) {
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
        }
        const reward = await rewardsModel.find({ userId: data[index].userId, isActive: true });
        if (reward.length > 0) {
            let activePackage = await productModel.find({ productStatus: "Active", userId: data[index].userId });
            var i = 0, len = reward.length;
            while (i < len) {
                //var rewardPoint = 0;
                var timeTestCommunity = await checkCommunityReward(reward[i].userId, reward[i]._id, data[index]._id, reward[i].createdAt);
                if (timeTestCommunity.updatedAt <= datetime) {
                    var product = await productModel.findOne({ _id: data[index]._id });
                    var comReward = (reward[i].rewardPoint / activePackage.length).toFixed(12);
                    if (parseFloat(comReward) < product.pendingReward && product.pendingReward > 0 && product.productStatus == "Active") {
                        var claimedCommunityRewards = product.claimedCommunityRewards + parseFloat(comReward); // 100 % reward distributed in package 
                        var pendingRewards = (product.pendingReward - parseFloat(comReward));// 100 % reward deducted
                        await productModel.findOneAndUpdate({ _id: product._id, productStatus: "Active" }, { $set: { claimedCommunityRewards: claimedCommunityRewards, pendingReward: pendingRewards, productStatus: "Active" } })
                        await updateWallet(product.userId, parseFloat(comReward));   
                    }
                    else if (parseFloat(comReward) == product.pendingReward && product.pendingReward > 0 && product.productStatus == "Active") {
                        var claimedCommunityRewards = product.claimedCommunityRewards + parseFloat(comReward);
                        await productModel.findOneAndUpdate({ _id: product._id, productStatus: "Active" }, { $set: { productStatus: "Completed", claimedCommunityRewards: claimedCommunityRewards, pendingReward: 0 } })
                        await updateWallet(product.userId, parseFloat(comReward));
                    }
                    else if (parseFloat(comReward) > product.pendingReward && product.pendingReward > 0 && product.productStatus == "Active") {
                        const extraRewards = parseFloat(comReward) - product.pendingReward;
                        const newReward = parseFloat(comReward) - parseFloat(extraRewards);
                        const claimedCommunityRewards = product.claimedCommunityRewards + parseFloat(newReward)
                        await productModel.findOneAndUpdate({ _id: product._id, productStatus: "Active" }, { $set: { claimedCommunityRewards: claimedCommunityRewards, productStatus: "Completed", pendingReward: 0, extraRewards: extraRewards } })
                        await updateWallet(product.userId, parseFloat(newReward));
                    }
                    await communityEntry(reward[i].userId, reward[i].username, reward[i].senderId, reward[i].senderUsername, data[index].roi, reward[i]._id, data[index]._id, data[index].title, comReward, reward[i].rewardPoint, "1/" + activePackage.length, reward[i].senderCreatedAt);
                }
                i++;
            }
        }
        index++;
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

async function communityEntry(userId, username, senderId, senderUsername, roi, rewardId, packageId, packages, comReward, rewards, ratio, senderCreatedAt) {
    let community = {
        userId: userId,
        username: username,
        senderId: senderId,
        senderUsername: senderUsername,
        roi: roi,
        rewardId: rewardId,
        packageId: packageId,
        package: packages,
        reward: comReward,
        rewards: rewards,
        ratio: ratio,
        senderCreatedAt: senderCreatedAt
    }
    await communityRewardModel.create(community);
}

async function checkPassiveReward(userId, packageId, createdAt) {
    const updatedTime = createdAt.toISOString().substr(11, 13)
    var passiveIncome = await passiveRewardModel.findOne({ userId: userId, packageId: packageId }).sort({ updatedAt: -1 });
    if (passiveIncome) {
        const pTime = passiveIncome.updatedAt.toISOString().substr(0, 11)
        let upTime = pTime.concat(updatedTime)
        var updatedTimeDate = new Date(upTime);
        let updatedDate = new Date((updatedTimeDate).setHours((updatedTimeDate).getHours() + 24));
        return { updatedAt: updatedDate };;
    }
    else {
        let CreatedDateOfProduct = new Date((createdAt).setHours(createdAt.getHours() + 24));
        return { updatedAt: CreatedDateOfProduct };
    }
}

async function checkCommunityReward(userId, rewardId, packageId, createdAt) {
    var communityIncome = await communityRewardModel.findOne({ userId: userId, rewardId: rewardId, packageId: packageId }).sort({ updatedAt: -1 });
    const updatedTime = createdAt.toISOString().substr(11, 13)
    if (communityIncome) {
        const cTime = communityIncome.updatedAt.toISOString().substr(0, 11)
        let upTime = cTime.concat(updatedTime)
        var updatedTimeDate = new Date(upTime);
        let updatedDate = new Date((updatedTimeDate).setHours((updatedTimeDate).getHours() + 24));
        return { updatedAt: updatedDate };
    }
    else {
        let createdDateOfProduct = new Date((createdAt).setHours(createdAt.getHours() + 24));
        return { updatedAt: createdDateOfProduct };
    }
}


async function updateWallet(userId, rewardPoint) {
    const wallet = await walletModel.findOne({ userId: userId })
    let coreBal = (rewardPoint * 8 / 10) + wallet.coreWallet;
    let commReward = wallet.tradeWallet + (rewardPoint / 10);
    await walletModel.findOneAndUpdate({ userId: userId }, { $set: { coreWallet: coreBal, tradeWallet: commReward, ecoWallet: commReward } });
}

async function updateWalletBalance(userId, passiveReward) {
    const wallet = await walletModel.findOne({ userId: userId });
    const coreWallet = wallet.coreWallet + passiveReward;
    await walletModel.findOneAndUpdate({ userId: userId }, { $set: { coreWallet: coreWallet } });
}

setInterval(async () => await rewardBooster(), 900000);
//setInterval(rewardBooster, 12000);




module.exports = {
    coreToTrade: coreToTrade,
    coreToEco: coreToEco,
    coreWalletBalance: coreWalletBalance
}