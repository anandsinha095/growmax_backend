import { responseHandler } from '../../common/response';
import { __esModule } from '@babel/register/lib/node';
import userModel from '../../model/user/user';
import walletModel from '../../model/rewards/wallet';
import withdrawModel from '../../model/user/withdraw';
import withdrawHistoryModel from '../../model/paymentHistory/withdrawHistroy';
import withdrawSplitHistoryModel from '../../model/paymentHistory/withdrawSplitHistrory'
import { verifyJwtToken } from '../../common/function';
import { createAccount, transferAdmin, transferBNB, transferMatic, getBalance, approve, transferFrom, transferMaticByRelay, getBalanceUser } from '../../common/blockchain';
import addressModel from '../../model/user/address';
import axios from 'axios';
import { MATIC_WITHDRAW_FEE, BNB_WITHDRAW_FEE, GMT_RECEIVER, RELAY_OUTPUT } from '../../envirnoment/config'

/***************** Create Order by User ******************/
import mongoose from 'mongoose';
const ObjectId = mongoose.Types.ObjectId;

const transferFund = async (req, res) => {
    try {
        if (!req.body.coin || !req.body.gmt) {
            return responseHandler(res, 400, "Bad request");
        }
        const gmtTxId = Date.now();
        let userId = await verifyJwtToken(req, res);
        let check_user_exist = await userModel.findOne({ _id: userId })
        if (!check_user_exist) return responseHandler(res, 461, "User doesn't exist")
        const userAddress = await account(userId); // User Address 
        const checkbalance = await coreWalletBalance(userId) // core wallet current balance
        var userBalance = await getBalanceUser(userAddress.address); // your blockchain balance
        if (parseFloat(userBalance) < 0) {
            return responseHandler(res, 403, "We are working on your Growmaxx account setup. Please try to withdraw after 10 mins");
        }
        if (checkbalance < req.body.gmt) {
            return responseHandler(res, 403, "You don't have sufficient fund for withdraw");
        }
        const wallet = await withdrawModel.findOne({ userId: userId });
        if (req.body.coin == 'BNB' && (wallet.bnb == null || wallet.bnb == undefined)) {
            return responseHandler(res, 403, "Please set your withdraw BNB address before withdraw");
        }
        else if (req.body.coin == 'MATIC' && (wallet.matic == null || wallet.matic == undefined)) {
            return responseHandler(res, 403, "Please set your withdraw MATIC address before withdraw");
        }
        // approval setup 
       // var corebalance = checkbalance;
        await checkApproval(userId, userAddress, checkbalance, req.body.gmt);
        // Price calculation in  USD
        const bitcoinObject = await livePrice(req.body.coin)
        var fee = req.body.coin == 'BNB' ? BNB_WITHDRAW_FEE : MATIC_WITHDRAW_FEE;
        const amount = (((req.body.gmt - (req.body.gmt * 1 / 100)) / bitcoinObject).toFixed(4)) - fee // Amount calculator 
        const relayAmount = (req.body.gmt * 1 / 100) / bitcoinObject;
        // checking balance bnb
        var coinBalance = await getBalance(req.body.coin);
        if (coinBalance < (amount + relayAmount)) {
            return responseHandler(res, 403, "Something went wrong !! Please Try after sometime");
        }
        const walletAddress = req.body.coin == 'BNB' ? wallet.bnb :  wallet.matic;
        //Creating history
        const createOrder = {
            userId: userId,
            type: "WITHDRAW",
            destination: walletAddress,
            gmtAmount: req.body.gmt,
            orderId: gmtTxId,
            status: true,
            pair: "GMT - " + req.body.coin,
            orderStatus: "PENDING",
            fee: fee,
            asset: req.body.coin,
            slippage: relayAmount,
            totalAmount: amount
        }
        await withdrawHistoryModel.create(createOrder)
        // update core wallet balance
        const coreWallet = checkbalance - req.body.gmt;
        await walletModel.findOneAndUpdate({ userId: userId }, { $set: { coreWallet: coreWallet } })
        //GMT transfer relay to user
        const transferGmtToUser = await transferAdmin(userAddress.address, req.body.gmt)
        await withdrawDeatils(userId, 'DEPOSIT', 'GMT', req.body.gmt, userAddress.address, transferGmtToUser.hash, gmtTxId, 1)
        //GMT transfer User to Relay
        const transferUserToAdmin = await transferFrom(userAddress.address, GMT_RECEIVER, req.body.gmt)
        await withdrawDeatils(userId, 'WITHDRAW', 'GMT', req.body.gmt, GMT_RECEIVER, transferUserToAdmin.hash, gmtTxId, 2)
        // Withdraw coin process
        const coinTransfer = req.body.coin == 'BNB' ? await transferBNB(wallet.bnb, amount) : await transferMatic(wallet.matic, amount)
        req.body.coin == 'BNB' ? await transferBNB(RELAY_OUTPUT, relayAmount.toFixed(5)) : await transferMatic(RELAY_OUTPUT, relayAmount.toFixed(5))

        await withdrawDeatils(userId, 'WITHDRAW', req.body.coin, amount, req.body.coin == 'BNB' ? wallet.bnb : wallet.matic, coinTransfer.hash, gmtTxId, 3)
        await withdrawHistoryModel.findOneAndUpdate({ orderId: gmtTxId }, { $set: { orderStatus: "COMPLETED"} })
        return responseHandler(res, 200, "Withdrawal Request Successful");
    }
    catch (e) {
        console.log("Error :=>", e)
        return responseHandler(res, 500, e)
    }
}



const verifyAccount = async (req, res) => {
    try {
        let userId = await verifyJwtToken(req, res);
        let check_user_exist = await userModel.findOne({ _id: userId })
        if (!check_user_exist) return responseHandler(res, 461, "User doesn't exist")
        const userAddress = await account(userId); // User Address 
        const userTxFee = await transferMaticByRelay(userAddress.address)
        console.log(">>>>>>>>userTxFee", userTxFee);
        if (userTxFee.hash) {
           const data =  await withdrawModel.findOneAndUpdate({ userId: userId }, { $set: { feeStatus: true } })
           console.log(">>>>>data", data);
            return responseHandler(res, 200, "Your Growmaxx account validated on Blockchain");
        }
    }
    catch (e) {
        console.log("Error :=>", e)
        return responseHandler(res, 500, e)
    }
}

async function withdrawDeatils(userId, type, asset, amount, destination, txId, orderId, step) {
    const withdrawHistory = {
        userId,
        type,
        asset,
        amount,
        destination,
        txId,
        orderId
    }
    console.log(">>>>>>>withdrawHistory", withdrawHistory );
    console.log(">>>>>>>step", step );
    await withdrawSplitHistoryModel.create(withdrawHistory) /* create Withdraw Coin history object */
    await withdrawHistoryModel.findOneAndUpdate({ orderId: orderId }, { $set: { step: step } })
    return;
}

async function livePrice(coin) {
    const options = {
        method: 'GET',
        url: coin == 'BNB' ? 'https://api.coingecko.com/api/v3/simple/price?ids=binance-coin-wormhole&vs_currencies=usd' : 'https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd'
    };
    const result = await axios(options);
    var dataString = JSON.stringify(result.data);
    var dataJSON = JSON.parse(dataString);
    var bitcoinObject = coin == 'BNB' ? dataJSON["binance-coin-wormhole"].usd : dataJSON["matic-network"].usd;
    return bitcoinObject
}

async function checkApproval(userId, userAddress, corebalance, gmt){
    console.log(">>>>>>>checkApproval userAddress", userAddress );
    console.log(">>>>>>>checkApproval corebalance", corebalance );
    if (userAddress.approveAmount == 0) {
        const approveEpd = corebalance - gmt;
        const approval = await approve(userAddress.privatekey, corebalance);
        if (approval) {
            await addressModel.findOneAndUpdate({ userId: userId }, { $set: { approveAmount: corebalance, approveExpend: approveEpd } })
            return;
        }
    }
    else if (userAddress.approveAmount != 0 && userAddress.approveExpend < gmt) {
        const approveAmt = corebalance + userAddress.approveAmount;
        const approveExpend = (corebalance + userAddress.approveExpend) - gmt;
        console.log(">>>>>>>>approveAmt", approveAmt);
        console.log(">>>>>>>>approveExpend", approveExpend);
        const approval = await approve(userAddress.privatekey, approveAmt);
        if (approval) {
            await addressModel.findOneAndUpdate({ userId: userId }, { $set: { approveAmount: approveAmt, approveExpend: approveExpend } })
            return;
        }
    }
    else {
        const approveExpend = userAddress.approveExpend - gmt;
        await addressModel.findOneAndUpdate({ userId: userId }, { $set: { approveExpend: approveExpend } })
        return;
    }
}

async function coreWalletBalance(userId) {
    try {
        const data = await walletModel.findOne({ userId: userId });
        if (!data) {
            return responseHandler(res, 200, { coreWalletBalance: 0 });
        }
        return data.coreWallet;
    }
    catch (e) {
        console.log("Error :=>", e)
        return responseHandler(res, 500, e)
    }
}



async function account(userId) {
    const address = await addressModel.findOne({ userId: userId })
    if (address) return address;
    const data = await createAccount();
    const userAddress = {
        userId: userId,
        address: data.address,
        chainCode: data.chainCode,
        publickey: data.publicKey,
        mnemonic: data.mnemonic,
        fingerprint: data.fingerprint,
        parentFingerprint: data.parentFingerprint,
        privatekey: data.privatekey,
        approveAmount: 0,
        approveExpend: 0,
        status: true,
        isActive: true
    }
    await addressModel.create(userAddress);

    return userAddress;
}

const feeCalculator = async (req, res) => {
    try {
        const options = {
            method: 'GET',
            url: 'https://api.coingecko.com/api/v3/simple/price?ids=binance-coin-wormhole&vs_currencies=usd'
        };

        const optionsMatic = {
            method: 'GET',
            url: 'https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd'
        };
        const result = await axios(options);
        var dataString = JSON.stringify(result.data);
        var dataJSON = JSON.parse(dataString);
        var bnbCost = dataJSON["binance-coin-wormhole"].usd
        const resultMatic = await axios(optionsMatic);
        var dataStringMatic = JSON.stringify(resultMatic.data);
        var dataJSONMatic = JSON.parse(dataStringMatic);
        var maticCost = dataJSONMatic["matic-network"].usd
        const maticFee = MATIC_WITHDRAW_FEE
        const bnbFee = BNB_WITHDRAW_FEE
        const feeData = {
            bnbCost: bnbCost,
            maticCost: maticCost,
            maticFee: maticFee,
            bnbFee: bnbFee
        }
        return responseHandler(res, 200, "OK", feeData);
    }
    catch (e) {
        console.log("Error :=>", e)
        return responseHandler(res, 500, e)
    }
}

const withdrawHistory = async (req, res) => {
    let userId = await verifyJwtToken(req, res);
    let check_user_exist = await userModel.findOne({ _id: userId })
    if (!check_user_exist) return responseHandler(res, 461, "User doesn't exist");
    let check_history_exist = await withdrawHistoryModel.find({ userId: userId }).sort({ createdAt: -1 });
    if (check_history_exist.length < 1) return responseHandler(res, 461, "No History found");
    return responseHandler(res, 200, "ok", check_history_exist);
}

const withdrawHistoryDetails = async (req, res) => {
    if (!req.body.orderId) {
        return responseHandler(res, 400, "Bad request");
    }
    let userId = await verifyJwtToken(req, res);
    let check_user_exist = await userModel.findOne({ _id: userId })
    if (!check_user_exist) return responseHandler(res, 461, "User doesn't exist");
    let check_history_exist = await withdrawSplitHistoryModel.find({ orderId: req.body.orderId });
    if (!check_history_exist) return responseHandler(res, 461, "No History found");
    return responseHandler(res, 200, "ok", check_history_exist);
}


module.exports = {
    transferFund: transferFund,
    feeCalculator: feeCalculator,
    withdrawHistory: withdrawHistory,
    withdrawHistoryDetails: withdrawHistoryDetails,
    verifyAccount: verifyAccount
}