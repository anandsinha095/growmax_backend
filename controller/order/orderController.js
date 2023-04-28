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
// import user from '../../model/User/user.js';
// import { angular_host, angular_port } from '../../enviornment/config';
/***************** Create Order by User ******************/
import mongoose from 'mongoose';
const ObjectId = mongoose.Types.ObjectId;



const createOrder = async (req, res) => {
    let userId = await verifyJwtToken(req, res);
    const { blockHash, blockNumber, from, to, amount, paymentType, paymentMethod, packageName, paymentCoin } = req.body; // destructuring
    if (!blockHash || !blockNumber || !from || !to || !amount || !paymentType || !paymentMethod || !packageName || !paymentCoin) {
        return responseHandler(res, 400, "Bad request")
    }
    try {
        let check_user_exist = await userModel.findOne({ _id: userId })
        if (!check_user_exist.emailVerified) {
            return responseHandler(res, 406, "Please verify your email Id")
        }
        if (!check_user_exist) return responseHandler(res, 406, "User doesn't exist")
        const packages = await packagesModel.findOne({ name: packageName });
        if (!packages) return responseHandler(res, 406, "Package doesn't exist")
        const totalRewards = amount * 3
        req.body.dailyReward = (amount * packages.roi) / 100;
        req.body.userId = check_user_exist._id;
        const data = { userId: check_user_exist._id, title: packageName, price: amount, roi: packages.roi, dailyReward: req.body.dailyReward, totalRewards: totalRewards, productStatus: "Active", pendingReward: totalRewards}
        await productModel.create(data) /* create purchased product object */
        await paymentHistoryModel.create(req.body) /* create payment history object */
        await userModel.findByIdAndUpdate({ _id: check_user_exist._id }, { $set: { paymentStatus: true } }) //update the paymentStatus with new one
        if (check_user_exist.username != "anandsinha095") {
            await rewardDistribution(check_user_exist._id, check_user_exist.username, check_user_exist.referralCode, amount, packages.roi, check_user_exist.createdAt);
        }
        return responseHandler(res, 200, "Course successfully added in your account")
    }
    catch (e) {
        console.log("Error :=>", e)
        return responseHandler(res, 500, e)
    }
}

const miniOrder = async (req, res) => {
    let userId = await verifyJwtToken(req, res);
    try {
        let check_user_exist = await userModel.findOne({ _id: userId })
        if (!check_user_exist) return responseHandler(res, 461, "User doesn't exist")
        const packages = await packagesModel.findOne({ name: "MINI PACK" });
        if (!packages) return responseHandler(res, 461, "Package doesn't exist")
        const totalRewards = parseInt(packages.price) * 3
        req.body.dailyReward = (packages.price * packages.roi) / 100;
        var walletData = await walletModel.findOne({ userId: check_user_exist._id });
        let coreWallet = !walletData ? 0 : walletData.coreWallet;
        const ecoWallet = !walletData ? 0 : walletData.ecoWallet;
        const tradeWallet = !walletData ? 0 : walletData.tradeWallet;
        if (coreWallet < 50) {
            return responseHandler(res, 461, "Don't have sufficient balance for Mini Pack")
        }
        const data = { userId: check_user_exist._id, title: packages.name, price: packages.price, roi: packages.roi, dailyReward: req.body.dailyReward, totalRewards: totalRewards, productStatus: "Active", pendingReward: totalRewards};
        await productModel.create(data) /* create purchased product object */
        await walletModel.findOneAndUpdate({ userId: check_user_exist._id }, { $set: { coreWallet: (coreWallet - 50), ecoWallet: ecoWallet, tradeWallet: tradeWallet } })
        if (check_user_exist.username != "anandsinha095") {
            await rewardDistribution(check_user_exist._id, check_user_exist.username, check_user_exist.referralCode, packages.price, packages.roi, check_user_exist.createdAt);
        }
        return responseHandler(res, 200, "Course successfully added in your account")
    }
    catch (e) {
        console.log("Error :=>", e)
        return responseHandler(res, 500, e)
    }
}

const getOrder = async (req, res) => {
    let userId = await verifyJwtToken(req, res);
    try {
        let check_user_exist = await userModel.findOne({ _id: userId });
        if (!check_user_exist) return responseHandler(res, 406, "User doesn't exist");
        const data = await productModel.find({ userId: userId }).sort({ createdAt: -1 });
        if (!data) return responseHandler(res, 406, "No course found");

        return responseHandler(res, 200, "OK", data);
    }
    catch (e) {
        console.log("Error :=>", e)
        return responseHandler(res, 500, e)
    }
}

const paymentHistory = async (req, res) => {
    let userId = await verifyJwtToken(req, res);
    try {
        const check_user_exist = await userModel.findOne({ _id: userId });
        if (!check_user_exist) return responseHandler(res, 406, "User doesn't exist");
        const data = await paymentHistoryModel.find({ userId: userId }).sort({ createdAt: -1 });
        if (!data) return responseHandler(res, 406, "No histroy found");
        return responseHandler(res, 200, "OK", data);
    }
    catch (e) {
        console.log("Error :=>", e)
        return responseHandler(res, 500, e)
    }
}

const rewardDistribution = async (userId, username, referralCode, price, roi, createdAt, res) => {
    const parent = await userModel.findOne({ username: referralCode }); // parent data
    const parentData = await communityRewardsModel.findOne({ userId: parent._id }); // parent community  data
    const userChain = await communityRewardsModel.findOne({ userId: userId }); // user data
    if (!userChain && !parentData) {
        await communityRewardsModel.create({ userId, username, parentsDetails: { userId: parent._id, username: parent.username } })
        await rewardCounter(userId, username, price, roi, createdAt, parent._id, parent.username, 0)

    }
    else if (!userChain && parentData) {
        var parentsDetail = parentData.parentsDetails.length > 32 ? ((parentData.parentsDetails).slice(0, 31)) : parentData.parentsDetails
        parentsDetail = [{ userId: parent._id, username: parent.username }, ...parentsDetail];
        await communityRewardsModel.create({ userId, username, parentsDetails: parentsDetail })
        for (let index = 0; index < parentsDetail.length; index++) {
            await rewardCounter(userId, username, price, roi, createdAt, parentsDetail[index].userId, parentsDetail[index].username, index)
            //await rewardCounter(userId, username, price, roi, createdAt, parent._id,  parent.username, index)
        }
    }
    else if (userChain && !parentData) {
        parentsDetail = { userId: parent._id, username: parent.username }
        await communityRewardsModel.create({ userId, username, parentsDetails: parentsDetail })
        await rewardCounter(userId, username, price, roi, createdAt, parent._id, parent.username, 0)
        //await rewardCounter(userId, username, price, roi, createdAt, parent._id,  parent.username, index)
    }
    else {
        var parentsDetail = parentData.parentsDetails.length > 32 ? ((parentData.parentsDetails).slice(0, 31)) : parentData.parentsDetails
        parentsDetail = [{ userId: parent._id, username: parent.username }, ...parentsDetail];
        for (let index = 0; index < parentsDetail.length; index++) {
            await rewardCounter(userId, username, price, roi, createdAt, parentsDetail[index].userId, parentsDetail[index].username, index)
        }
    }
}


const rewardCounter = async (userId, username, price, roi, createdAt, parentId, parentUsername, index, res) => {
    try {
        const parentReward = await rewardsModel.findOne({ username: parentUsername }).sort({ createdAt: -1 }); // parent data
        var product = await productModel.find({ userId: parentId, isActive: true, productStatus: "Active" })
        let level;
        let directLeg;
        let rewardPoint;
        let rewardPersentage;
        let totalbusiness;
        let direct = false;
        if (index + 1 == 1) {
            const legVerify = await rewardsModel.findOne({ username: parentUsername, senderId: userId });
            directLeg = !parentReward ? 1 : (!legVerify ? (parentReward.directLeg + 1) : parentReward.directLeg);
            rewardPoint = ((price * roi) / 100) * (20 / 100);
            level = await levelModel.findOne({ direct: directLeg });
            totalbusiness = price;
            rewardPersentage = 20;
            direct = true;
        }
        else {
            level = await levelModel.findOne({ direct: parentReward.directLeg });
            if (level.direct >= index + 1) {
                let levels = await levelModel.findOne({ level: index + 1 });
                rewardPoint = ((price * roi) / 100) * (levels.rewardPersentage / 100);
                rewardPersentage = levels.rewardPersentage
            }
            else {
                return;
            }
            directLeg = parentReward.directLeg;
            totalbusiness = parentReward.totalbusiness + price;
        }
        const data = {
            userId: parentId,
            username: parentUsername,
            directLeg: directLeg,
            senderId: userId,
            senderUsername: username,
            direct: direct,
            level: level.level,
            rewardPoint: rewardPoint,
            rewardPersentage: rewardPersentage,
            activePackage: product.length,
            totalbusiness: totalbusiness,
            businessIn24h: totalbusiness,
            rank: "",
            upComingRank: "Star 10",
            senderCreatedAt: createdAt,
            status: true,
            isActive: true
        }
        await rewardsModel.create(data);
    }
    catch (e) {
        console.log("Error :=>", e)
        return responseHandler(res, 500, e)
    }
}

async function communityRewardDistribute() {
    const data = await rewardsModel.find();
    for (let index = 0; index < data.length; index++) {
        let community = {
            userId: data[index].userId,
            username: data[index].username,
            senderId: data[index].senderId,
            senderUsername: data[index].senderUsername,
            roi: data[index].roi,
            reward: data[index].rewardPoint,
            senderCreatedAt: data[index].senderCreatedAt
        }
        const rewardPoint = data[index].rewardPoint - (data[index].rewardPoint * 20 / 100)
        const product = await productModel.find({ userId: data[index].userId, productStatus: "Active" }).sort({ createdAt: -1 });
        for (let i = 0; i < product.length; i++) {
            var comReward = rewardPoint / data[index].activePackage;

            if (comReward < product[i].pendingReward) {
                var claimedCommunityRewards = product[i].claimedCommunityRewards + comReward;
                var pendingRewards = product[i].pendingReward - comReward;
                await productModel.findOneAndUpdate({ _id: product[i]._id, userId: data[index].userId }, { $set: { claimedCommunityRewards: claimedCommunityRewards, pendingReward: pendingRewards } })
            }
            else if (comReward == product[i].pendingReward) {
                var claimedCommunityRewards = product[i].claimedCommunityRewards + comReward;
                var pendingRewards = product[i].pendingReward - comReward;
                await productModel.findOneAndUpdate({ _id: product[i]._id, userId: data[index].userId }, { $set: { productStatus: "Completed", claimedCommunityRewards: claimedCommunityRewards, pendingReward: pendingRewards } })
            }
            else if (comReward > product[i].pendingReward) {
                const extraRewards = comReward - product[i].pendingReward;
                const newReward = comReward - extraRewards;
                const claimedCommunityRewards = product[i].claimedCommunityRewards + newReward
                const pendingRewards = product[i].pendingReward - newReward;
                const wallet = await walletModel.findOne({ userId: data[index].userId });
                const coreWallet = wallet.coreWallet + newReward;
                await walletModel.findOneAndUpdate({ userId: data[index].userId }, { $set: { coreWallet: coreWallet } });
                await productModel.findOneAndUpdate({ _id: data[index]._id, userId: data[index].userId }, { $set: { claimedCommunityRewards: claimedCommunityRewards, productStatus: "Completed", pendingReward: pendingRewards, extraRewards:extraRewards } })
            }
            else {
                return
            }
        }
        const pro = await productModel.findOne({ userId: data[index].userId, productStatus: "Active" }).sort({ createdAt: -1 });
        if (pro) {
            const wallet = await walletModel.findOne({ userId: data[index].userId });
            let coreWallet = rewardPoint + wallet.coreWallet;
            let tradeWallet = wallet.tradeWallet + (data[index].rewardPoint / 10);
            let ecoWallet = wallet.ecoWallet + (data[index].rewardPoint / 10);
            var products =  await productModel.find({userId: data[index].userId})
            let totalRewards =0;
            products.forEach(element => {
                totalRewards = totalRewards + element.totalRewards;
            }); 
            if((coreWallet+ecoWallet+tradeWallet) <= totalRewards ){
                await walletModel.findOneAndUpdate({ userId: data[index].userId }, { $set: { coreWallet: coreWallet, ecoWallet: ecoWallet, tradeWallet: tradeWallet } })
            }
            await communityRewardModel.create(community);
        }
        else {
            return
        }
    }
}

async function passiveRewardDistribute() {
    const data = await productModel.find({ productStatus: "Active" });
    for (let index = 0; index < data.length; index++) {
        if (data[index].dailyReward < data[index].pendingReward) {
            const claimedPassiveRewards = data[index].claimedPassiveRewards + data[index].dailyReward;
            const pendingRewards = data[index].pendingReward - data[index].dailyReward;
            await productModel.findOneAndUpdate({ _id: data[index]._id, userId: data[index].userId }, { $set: { claimedPassiveRewards: claimedPassiveRewards, pendingReward: pendingRewards } })
            let passive = {
                userId: data[index].userId,
                package: data[index].title,
                packageId: data[index]._id,
                price: data[index].price,
                roi: data[index].roi,
                reward: data[index].dailyReward,
                pendingReward: pendingRewards,
                totalReward: data[index].totalRewards
            }
            await passiveRewardModel.create(passive);
            const wallet = await walletModel.findOne({ userId: data[index].userId });
            const coreWallet = wallet.coreWallet + data[index].dailyReward;
            await walletModel.findOneAndUpdate({ userId: data[index].userId }, { $set: { coreWallet: coreWallet } }).sort({ createdAt: -1 });

        }
        else if (data[index].dailyReward == data[index].pendingReward) {
            const claimedPassiveRewards = data[index].claimedPassiveRewards + data[index].dailyReward;
            const pendingRewards = data[index].pendingReward - data[index].dailyReward;
            await productModel.findOneAndUpdate({ _id: data[index]._id, userId: data[index].userId }, { $set: { productStatus: "Completed", claimedPassiveRewards: claimedPassiveRewards, pendingReward: pendingRewards } })
            const wallet = await walletModel.findOne({ userId: data[index].userId });
            const coreWallet = wallet.coreWallet + data[index].dailyReward;
            await walletModel.findOneAndUpdate({ userId: data[index].userId }, { $set: { coreWallet: coreWallet } });
            let passive = {
                userId: data[index].userId,
                package: data[index].title,
                packageId: data[index]._id,
                price: data[index].price,
                roi: data[index].roi,
                reward: data[index].dailyReward,
                pendingReward: 0,
                totalReward: data[index].totalRewards
            }
            await passiveRewardModel.create(passive);
        }
        // extra
        else if (data[index].dailyReward > data[index].pendingReward) {
            const extraRewards = data[index].dailyReward - data[index].pendingReward;
            const newReward = data[index].dailyReward - extraRewards;
            const claimedPassiveReward = data[index].claimedPassiveRewards + newReward
            const pendingRewards = data[index].pendingReward - newReward;
            const wallet = await walletModel.findOne({ userId: data[index].userId });
            const coreWallet = wallet.coreWallet + newReward;
            await productModel.findOneAndUpdate({ _id: data[index]._id, userId: data[index].userId }, { $set: { claimedPassiveRewards: claimedPassiveReward, pendingReward: pendingRewards, productStatus: "Completed", extraReward: extraRewards } })
            var products =  await productModel.find({userId: data[index].userId})
            let totalRewards =0;
            products.forEach(element => {
                totalRewards = totalRewards + element.totalRewards;
            }); 
            if((coreWallet + wallet.tradeWallet + wallet.ecoWallet) <= totalRewards ){
                await walletModel.findOneAndUpdate({ userId: data[index].userId }, { $set: { coreWallet: coreWallet } });
            }
            let passive = {
                userId: data[index].userId,
                package: data[index].title,
                packageId: data[index]._id,
                price: data[index].price,
                roi: data[index].roi,
                reward: newReward,
                pendingReward: 0,
                totalReward: data[index].totalRewards
            }
            await passiveRewardModel.create(passive);
        }
        else {
            return
        }
    }
}

setInterval(communityRewardDistribute, 30000);
setInterval(passiveRewardDistribute, 15000);

const directLeg = async (req, res) => {
    try {
        let userId = await verifyJwtToken(req, res);
        const data = await rewardsModel.find({ userId: userId, direct: true }).sort({ createdAt: -1 });
        if (data.length == 0) {
            return responseHandler(res, 406, "No Direct Connection found");
        }
        return responseHandler(res, 200, "OK", data);
    }
    catch (e) {
        console.log("Error :=>", e)
        return responseHandler(res, 500, e)
    }
}


const passiveIncome = async (req, res) => {
    try {
        let userId = await verifyJwtToken(req, res);
        const data = await passiveRewardModel.find({ userId: userId }).sort({ createdAt: -1 });
        if (data.length == 0) {
            return responseHandler(res, 406, "No Passive Reward found");
        }
        return responseHandler(res, 200, "OK", data);
    }
    catch (e) {
        console.log("Error :=>", e)
        return responseHandler(res, 500, e)
    }
}

const communityIncome = async (req, res) => {
    try {
        let userId = await verifyJwtToken(req, res);
        const data = await communityRewardModel.find({ userId: userId }).sort({ createdAt: -1 });
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


const deleteTable = async (req, res) => {
    try {
        await userModel.deleteMany();
        await productModel.deleteMany();
        await paymentHistoryModel.deleteMany();
        await communityRewardModel.deleteMany();
        await communityRewardsModel.deleteMany();
        await passiveRewardModel.deleteMany();
        await rewardsModel.deleteMany();
        await tokenModel.deleteMany();
        await packagesModel.deleteMany();
        await walletModel.deleteMany();
        return responseHandler(res, 200, "deleted ");
    }
    catch (e) {
        console.log("Error :=>", e)
        return responseHandler(res, 500, e)
    }
}


module.exports = {
    createOrder: createOrder,
    getOrder: getOrder,
    paymentHistory: paymentHistory,
    directLeg: directLeg,
    passiveIncome: passiveIncome,
    communityIncome: communityIncome,
    miniOrder: miniOrder,
    deleteTable: deleteTable
}