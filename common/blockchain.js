import { __esModule } from '@babel/register/lib/node';
import { DefenderRelayProvider, DefenderRelaySigner } from 'defender-relay-client/lib/ethers';
import { ethers } from 'ethers';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../contract/abi.json';
import {
    ALCHEMY_GOERLI_URL,
    ALCHEMY_BNB,
    MATIC_FEE_RELAY,
    MATIC_FEE_RELAY_API_KEY,
    MATIC_FEE_RELAY_PRIVATEKEY,
    OWNER_ADDRESS,

    MATIC_WITHDRAWAL_RELAY,
    MATIC_WITHDRAWAL_RELAY_API_KEY,
    MATIC_WITHDRAWAL_RELAY_PRIVATEKEY,

    BSC_WITHDRAWAL_RELAY,
    BSC_WITHDRAWAL_RELAY_API_KEY,
    BSC_WITHDRAWAL_RELAY_PRIVATEKEY,
} from '../envirnoment/config'

// Alchemy goerli provider URL
const providerMatic = new ethers.WebSocketProvider(ALCHEMY_GOERLI_URL, 137);
const providerBNB = new ethers.JsonRpcProvider(ALCHEMY_BNB);
const credentials = { apiKey: MATIC_FEE_RELAY_API_KEY, apiSecret: MATIC_FEE_RELAY_PRIVATEKEY };
const provider = new DefenderRelayProvider(credentials);
const signer = new DefenderRelaySigner(credentials, provider, { speed: 'fastest' });
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

// Matic withdrawal relay
const maticCredentials = { apiKey: MATIC_WITHDRAWAL_RELAY_API_KEY, apiSecret: MATIC_WITHDRAWAL_RELAY_PRIVATEKEY };
const maticProvider = new DefenderRelayProvider(maticCredentials);
const maticSigner = new DefenderRelaySigner(maticCredentials, maticProvider, { speed: 'fastest' });



// BNB withdrawal relay
const bnbCredentials = { apiKey: BSC_WITHDRAWAL_RELAY_API_KEY, apiSecret: BSC_WITHDRAWAL_RELAY_PRIVATEKEY };
const bnbProvider = new DefenderRelayProvider(bnbCredentials);
const bnbSigner = new DefenderRelaySigner(bnbCredentials, bnbProvider, { speed: 'fastest' });

module.exports = {
    /**
     * Creates an ethereum account (address, private key)
     * 
     */
    createAccount: async () => {
        return new Promise(async (resolve, reject) => {
            try {
                var myWallet = ethers.Wallet.createRandom();
                const mnemonicWallet = ethers.Wallet.fromPhrase(myWallet.mnemonic.phrase);
                const data = { ...myWallet, ...{ privatekey: mnemonicWallet.privateKey } }
                return resolve(data)
            }
            catch (e) {
                console.log("Error==>", e)
                return reject(e)
            }
        })

    },

    getBalance: async (coin) => {
        var provider = coin == 'BNB' ? providerBNB : providerMatic;
        var account = coin == 'BNB' ? BSC_WITHDRAWAL_RELAY : MATIC_WITHDRAWAL_RELAY;
        try {
            return await provider.getBalance(account).then((balance) => {
                // convert a currency unit from wei to ether
                const balanceInEth = ethers.formatEther(balance.toString());
                return balanceInEth;
            })
        } catch (e) {
            console.log(`getBalance|${e}`);
            return e
        }
    },

    getBalanceUser: async (account) => {
        try {
            return await providerMatic.getBalance(account).then((balance) => {
                // convert a currency unit from wei to ether
                const balanceInEth = ethers.formatEther(balance.toString());
                return balanceInEth;
            })
        } catch (e) {
            console.log(`getBalanceUser|${e}`);
            return e
        }
    },

    /**
     * IERC20:totalSupply()
     * Returns the amount of tokens in existence.
     * 
     */

    getTotalSupply: async () => {
        try {
            // return await new Promise(async (resolve) => {
            return await contract.totalSupply().then(totalSupply => {
                return resolve(ethers.formatEther(totalSupply));
            });
        } catch (e) {
            console.log(`getBalance|${e}`);
            return e
        }
    },

    /**
     * ERC20Mintable:mint()
     * Mint amount tokens to toAccount.
     * 
     */
    mint: async (toAccount, amount) => {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, walletWithProvider);
        try {
            console.log(`Web3ERC20Service:mint|${contractAddress}|${toAccount}|${amount}`);
            const txData = await contract.mint(toAccount, ethers.parseUnits(amount.toString(), 18));
            await this.providerMatic.waitForTransaction(txData.hash, 1);
            return resolve(txData.hash);
        }
        catch (e) {
            console.log(`mint|${e}`);
            return e
        }
    },

    /**
     * ERC20Burnable:burn()
     * Destroys amount tokens from account, deducting from the caller’s allowance.
     * 
     */
    burn: async (amount) => {
        const contract = new ethers.Contract(CONTRACT_ABI, walletWithProvider);
        try {
            console.log(`Web3ERC20Service:burn|${CONTRACT_ADDRESS}||${amount}`);
            const txData = await contract.burn(ethers.parseUnits(amount.toString(), 18));
            await this.providerMatic.waitForTransaction(txData.hash, 1);
            return resolve(txData.hash);
        }
        catch (e) {
            console.log(`burn|${e}`);
            return e
        }
    },

    /**
     * IERC20:approve()
     * Moves amount tokens from the caller’s account to toAccount.
     * Returns a boolean value indicating whether the operation succeeded.
     * Emits a Transfer event
     * 
     */

    approve: async (privateKey, amount) => {
        return new Promise(async (resolve, reject) => {
            console.log(">>>>>>approve");
            const feeData = await providerMatic.getFeeData();
            const walletWithProvider = new ethers.Wallet(privateKey, providerMatic);
            try {
                const contractIn = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, walletWithProvider);
                const txnData = await contractIn.approve(MATIC_FEE_RELAY, ethers.parseUnits(amount.toString(), 18),{ gasPrice: feeData.gasPrice});
                const data = await providerMatic.waitForTransaction(txnData.hash, 1);
                console.log(">>>>>>approve", data);
                return resolve(data)
            }
            catch (e) {
                console.log(`approve|${e}`);
                return reject(e)
            }
        })
    },
    /**
     * IERC20:transfer()
     * Moves amount tokens from the caller’s account to toAccount.
     * Returns a boolean value indicating whether the operation succeeded.
     * Emits a Transfer event
     * 
     */
    // transfer: async (toAccount, amount, privateKey) => {
    //     console.log(">>>>>>>>>>> transfer", amount);
    //     const walletWithProvider = new ethers.Wallet(privateKey, providerMatic);
    //     try {
    //         const contractIn = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, walletWithProvider);
    //         const txnData = await contractIn.transfer(toAccount, ethers.parseUnits(amount.toString(), 18));
    //         const data = await providerMatic.waitForTransaction(txnData.hash, 1);
    //         console.log(">>>>>>>>data", data);
    //         return data;
    //     }
    //     catch (e) {
    //         console.log(`transfer|${e}`);
    //         return reject(e)
    //     }
    // },

    /**
 * IERC20:transfer()
 * Moves amount tokens from the caller’s account to toAccount.
 * Returns a boolean value indicating whether the operation succeeded.
 * Emits a Transfer event
 * 
 */
    transferFrom: async (from, toAccount, amount) => {
        return new Promise(async (resolve, reject) => {
            try {
                console.log(">>>>>>>>>>>>transferFromIn", from, '>>>>>>>',toAccount, '>>>>>>>',amount);
                const txnData = await contract.transferFrom(from, toAccount, ethers.parseUnits(amount.toString(), 18));
                const data = await providerMatic.waitForTransaction(txnData.hash, 1);
                console.log(">>>>>>>>>>>>transferFrom", data);
                return resolve(data)
            }
            catch (e) {
                console.log(`transferFrom|${e}`);
                return reject(e)
            }
        })
    },


    transferAdmin: async (toAccount, amount) => {
        return new Promise(async (resolve, reject) => {
            try {
                console.log(">>>>>>>>>>>>transferAdmin in");
                const txnData = await contract.transferFrom(OWNER_ADDRESS, toAccount, ethers.parseUnits(amount.toString(), 18));
                const data = await providerMatic.waitForTransaction(txnData.hash, 1);
                console.log(">>>>>>>>>>>>transferAdmin", data);
                return resolve(data)
            }
            catch (e) {
                console.log(`transferAdmin|${e}`);
                return reject(e)
            }
        })
    },

    /*
    * transferBNB
    *
    * */
    transferBNB: async (receiverAddress, amount) => {
        return new Promise(async (resolve, reject) => {
            try {
                console.log(">>>>>>>>>>>>bnb In");
                // let wallet = new ethers.Wallet(BNB_PRIVATEKEY, providerBNB);
                let tx = {
                    to: receiverAddress,
                    value: ethers.parseEther(amount.toString(), 18)
                }
                // Send a transaction
                const txnData = await bnbSigner.sendTransaction(tx)
                console.log(">>>>>>>>>>>>bnb txnData", txnData);
                return resolve(txnData)
            }
            catch (e) {
                console.log(`transferBNB|${e}`);
                return reject(e)
            }
        })
    },

    /*
    * transferMatic
    *
    * */
    transferMatic: async (receiverAddress, amount) => {
        return new Promise(async (resolve, reject) => {
            try {
                console.log(">>>>>>>>>>>>matic In", amount);
                const feeData = await providerMatic.getFeeData();
              //  const walletWithProvider = new ethers.Wallet(privateKey, providerMatic);
                let tx = {
                    to: receiverAddress,
                    value: ethers.parseEther(amount.toString(), 18)
                }
                // Send a transaction
                const txnData = await maticSigner.sendTransaction(tx)
                console.log(">>>>>>>>>>>>matic txnData", txnData);
                return resolve(txnData);
            }
            catch (e) {
                console.log(`transferMatic|${e}`);
                return reject(e)
            }
        })
    },
    /*
   * transferMatic
   *
   * */
    transferMaticByRelay: async (receiverAddress) => {
        console.log(">>>>>>>>>>>>transferMaticByRelay receiverAddress", receiverAddress);
        return new Promise(async (resolve, reject) => {
            try {
                const amount = "0.1";
                //    let wallet = new ethers.Wallet(MATIC_PRIVATEKEY, providerMatic);
                let tx = {
                    to: receiverAddress,
                    value: ethers.parseEther(amount.toString(), 18)
                }
                // Send a transaction
                const txnData = await signer.sendTransaction(tx);
                console.log(">>>>>>>>>>transferMaticByRelay>>txnData", txnData);
                return resolve(txnData);
            }
            catch (e) {
                console.log(`transferMaticByRelay|${e}`);
                return reject(e)
            }
        })
    }
}

