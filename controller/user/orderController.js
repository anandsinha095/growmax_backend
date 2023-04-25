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
        console.log(">>>>>>>>>", req.body);
        let check_user_exist = await userModel.findOne({ _id: userId })
        if (!check_user_exist.emailVerified) {
            return responseHandler(res, 406, "Please verify your email Id")
        }
        console.log(">>>>>>>check_user_exist>>", check_user_exist);
        if (!check_user_exist) return responseHandler(res, 406, "User doesn't exist")
        const packages = await packagesModel.findOne({ name: packageName });
        if (!packages) return responseHandler(res, 406, "Package doesn't exist")
        const totalRewards = parseInt(amount) * 3
        req.body.dailyReward = (amount * packages.roi) / 100;
        req.body.userId = check_user_exist._id;
        var walletData =  await productModel.findOne({userId: check_user_exist._id}).sort({createdAt: -1});
        const coreWallet = !walletData ? walletData.coreWallet :0;
        const ecoWallet = !walletData ? walletData.ecoWallet: 0;
        const tradeWallet = !walletData ? walletData.tradeWallet: 0;
        const data = { userId: check_user_exist._id, title: packageName, price: amount, roi: packages.roi, dailyReward: req.body.dailyReward, totalRewards: totalRewards, productStatus: "Active", coreWallet: coreWallet, ecoWallet: ecoWallet, tradeWallet: tradeWallet}
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
        var walletData =  await productModel.findOne({userId: check_user_exist._id}).sort({createdAt: -1});
        let coreWallet = !walletData ? 0 :walletData.coreWallet;
        const ecoWallet = !walletData ? 0: walletData.ecoWallet;
        const tradeWallet = !walletData ? 0: walletData.tradeWallet;
        if(coreWallet < 50){
            console.log("req.body.coreWallet", coreWallet < 50);
            return responseHandler(res, 461, "Don't have sufficient balance for Mini Pack")
        }
        const data = { userId: check_user_exist._id, title: packages.name, price: packages.price, roi: packages.roi, dailyReward: req.body.dailyReward, totalRewards: totalRewards, productStatus: "Active", coreWallet: (coreWallet-50), ecoWallet: ecoWallet, tradeWallet: tradeWallet};
        await productModel.create(data) /* create purchased product object */
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
    console.log(">>>>>>>parent", parent);
    const parentData = await communityRewardsModel.findOne({ userId: parent._id }); // parent community  data
    console.log(">>>>parentData", parentData);
    const userChain = await communityRewardsModel.findOne({ userId: userId }); // user data
    console.log(">>>>userChain", userChain);
    if (!userChain && !parentData) {
        console.log(">>>>>>>>>> !!if userChain");
        await communityRewardsModel.create({ userId, username, parentsDetails: { userId: parent._id, username: parent.username } })
        await rewardCounter(userId, username, price, roi, createdAt, parent._id, parent.username, 0)

    }
    else if (!userChain && parentData) {
        console.log(">>>>else if 1");
        var parentsDetail = parentData.parentsDetails.length > 32 ? ((parentData.parentsDetails).slice(0, 31)) : parentData.parentsDetails
        parentsDetail = [{ userId: parent._id, username: parent.username }, ...parentsDetail];
        await communityRewardsModel.create({ userId, username, parentsDetails: parentsDetail })
        for (let index = 0; index < parentsDetail.length; index++) {
            console.log("parentsDetail[index]", parentsDetail[index]);
            console.log("parentsDetail[index].userId", parentsDetail[index].userId);
            await rewardCounter(userId, username, price, roi, createdAt, parentsDetail[index].userId, parentsDetail[index].username, index)
            //await rewardCounter(userId, username, price, roi, createdAt, parent._id,  parent.username, index)
        }
    }
    else if (userChain && !parentData) {
        console.log(">>>>else if 2");
        parentsDetail = { userId: parent._id, username: parent.username }
        await communityRewardsModel.create({ userId, username, parentsDetails: parentsDetail })
        await rewardCounter(userId, username, price, roi, createdAt, parent._id, parent.username, 0)
        //await rewardCounter(userId, username, price, roi, createdAt, parent._id,  parent.username, index)
    }
    else {
        console.log(">>>>else");
        var parentsDetail = parentData.parentsDetails.length > 32 ? ((parentData.parentsDetails).slice(0, 31)) : parentData.parentsDetails
        parentsDetail = [{ userId: parent._id, username: parent.username }, ...parentsDetail];
        for (let index = 0; index < parentsDetail.length; index++) {
            console.log("parentsDetail[index]", parentsDetail.length);
            console.log("index", index);
            await rewardCounter(userId, username, price, roi, createdAt, parentsDetail[index].userId, parentsDetail[index].username, index)
        }
    }
}


const rewardCounter = async (userId, username, price, roi, createdAt, parentId, parentUsername, index, res) => {
    ;
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
            totalbusiness = !parentReward ? price : parentReward.totalbusiness + price;
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
            totalbusiness = !parentReward ? price : parentReward.totalbusiness + price;
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
        console.log(">>>>>>data", data);
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
        const rewardPoint = data[index].rewardPoint - data[index].rewardPoint*20 /100
        let tradeWallet;
        let ecoWallet;
        const product = await productModel.find({ userId: data[index].userId, productStatus:"Active"}).sort({ createdAt: -1 });
        for (let i = 0; i < product.length; i++) {
            let comReward =  rewardPoint /  data[index].activePackage;
            const claimedCommunityRewards = product[i].coreWallet +  comReward;
            await productModel.findOneAndUpdate({ userId: data[index].userId }, { coreWallet: claimedCommunityRewards })
            tradeWallet= product[i].tradeWallet;
            ecoWallet= product[i].ecoWallet;
        }
        const tradeWallets = tradeWallet +  data[index].rewardPoint /10;
        const  ecoWallets = ecoWallet +  data[index].rewardPoint /10;
        await productModel.findOneAndUpdate({ userId: data[index].userId }, {tradeWallet: tradeWallets, ecoWallet: ecoWallets}).sort({ createdAt: -1 });

        await communityRewardModel.create(community);
    }
}

async function passiveRewardDistribute() {
    const data = await productModel.find({ productStatus: "Active" });
    for (let index = 0; index < data.length; index++) {
        const claimedPassiveRewards = data[index].claimedPassiveRewards + data[index].dailyReward
        if (claimedPassiveRewards < data[index].totalRewards) {
            const pendingPassiveRewards = data[index].totalRewards - claimedPassiveRewards;
            const corewallet = data[index].coreWallet + data[index].dailyReward;
            await productModel.findOneAndUpdate({ userId: data[index].userId }, { claimedPassiveRewards: claimedPassiveRewards, coreWallet: corewallet })
            let passive = {
                userId: data[index].userId,
                package: data[index].title,
                packageId: data[index]._id,
                price: data[index].price,
                roi: data[index].roi,
                reward: data[index].dailyReward,
                pendingReward: pendingPassiveRewards,
                totalReward: data[index].totalRewards
            }
            await passiveRewardModel.create(passive);
        }
        else if (claimedPassiveRewards == data[index].totalRewards) {
            await productModel.findOneAndUpdate({ userId: data[index].userId }, { productStatus: "Completed" })
        }
        // extra
        else if (claimedPassiveRewards > data[index].totalRewards) {
            data[index].claimedPassiveRewards + data[index].dailyReward
            const extraRewards = claimedPassiveRewards - data[index].totalRewards;
            const newReward =  data[index].dailyReward - extraRewards;
            const claimedPassiveReward = data[index].claimedPassiveRewards + newReward
            const corewallet = data[index].coreWallet +  data[index].dailyReward;
            await productModel.findOneAndUpdate({ userId: data[index].userId }, { claimedPassiveRewards: claimedPassiveReward, coreWallet: corewallet, productStatus: "Completed" })
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
    }
}

setInterval(communityRewardDistribute, 250000);
setInterval(passiveRewardDistribute, 250000);

const directLeg = async (req, res) => {
    try {
        let userId = await verifyJwtToken(req, res);
        const data = await rewardsModel.find({ userId: userId, direct: true }).sort({ createdAt: -1 });
        if(data.length==0){
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
        const data = await passiveRewardModel.find({ userId: userId}).sort({ createdAt: -1 });
        if(data.length==0){
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
        const data = await communityRewardModel.find({ userId: userId}).sort({ createdAt: -1 });
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


module.exports = {
    createOrder: createOrder,
    getOrder: getOrder,
    paymentHistory: paymentHistory,
    directLeg: directLeg,
    passiveIncome:passiveIncome,
    communityIncome:communityIncome,
    miniOrder:miniOrder
}