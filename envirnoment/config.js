const config=require('./config.json')
const envirnoment= process.env.NODE_ENV || 'dev';
const finalConfig= config[envirnoment];
export const mongo_url= process.env.database || finalConfig.database;
export const mongo_user= process.env.mongo_user || finalConfig.mongo_user;
export const mongo_password= process.env.mongo_password || finalConfig.mongo_password;
export const fontend_host = finalConfig.fontend_host
export const host = finalConfig.host
export const nodeMailerEmail = process.env.nodeMailerEmail || finalConfig.nodeMailerEmail
export const nodeMailerPass = process.env.nodeMailerPass || finalConfig.nodeMailerPass

export const ALCHEMY_GOERLI_URL = finalConfig.ALCHEMY_GOERLI_URL
export const ALCHEMY_BNB = finalConfig.ALCHEMY_BNB

export const BNB_WITHDRAW_FEE = finalConfig.BNB_WITHDRAW_FEE
export const MATIC_WITHDRAW_FEE = finalConfig.MATIC_WITHDRAW_FEE

export const RELAY_OUTPUT = finalConfig.RELAY_OUTPUT
export const GMT_RECEIVER =  finalConfig.GMT_RECEIVER
export const OWNER_ADDRESS = finalConfig.OWNER_ADDRESS

export const MATIC_FEE_RELAY = finalConfig.MATIC_FEE_RELAY
export const MATIC_FEE_RELAY_API_KEY = finalConfig.MATIC_FEE_RELAY_API_KEY
export const MATIC_FEE_RELAY_PRIVATEKEY = finalConfig.MATIC_FEE_RELAY_PRIVATEKEY

export const MATIC_WITHDRAWAL_RELAY = finalConfig.MATIC_WITHDRAWAL_RELAY
export const MATIC_WITHDRAWAL_RELAY_API_KEY = finalConfig.MATIC_WITHDRAWAL_RELAY_API_KEY
export const MATIC_WITHDRAWAL_RELAY_PRIVATEKEY = finalConfig.MATIC_WITHDRAWAL_RELAY_PRIVATEKEY

export const BSC_WITHDRAWAL_RELAY = finalConfig.BSC_WITHDRAWAL_RELAY
export const BSC_WITHDRAWAL_RELAY_API_KEY = finalConfig.BSC_WITHDRAWAL_RELAY_API_KEY
export const BSC_WITHDRAWAL_RELAY_PRIVATEKEY = finalConfig.BSC_WITHDRAWAL_RELAY_PRIVATEKEY


// const config=require('./config.json')
// const envirnoment= process.env.NODE_ENV || 'dev';
// const finalConfig= config[envirnoment];
// {
//     "dev": {
//       "config_id": "dev",
//       "app_name": "Growmax",
//       "app_desc": "Growmax",
//       "json_indentation": 4,
//       "database": "mongodb+srv://growmaxx:RGrb0OK3UDJVVdYk@cluster0.cm0qosy.mongodb.net/growmaxx?retryWrites=true&w=majority",
//       "fontend_host": "https://growmaxxdashboard.com",
//       "host": "https://growmaxxdashboard.com",
//       "mongo_user": "growmaxx",
//       "mongo_password":"RGrb0OK3UDJVVdYk",
//       "nodeMailerEmail": "email.new.tester2014@gmail.com",
//       "nodeMailerPass": "maiplzlmrjfmhara"
//     }
// }

// {
//     "dev": {
//       "config_id": "dev",
//       "app_name": "Growmax",
//       "app_desc": "Growmax",
//       "json_indentation": 4,
//       "database": "mongodb://localhost:27017/GrowMaxx",
//       "fontend_host": "http://43.205.112.88",
//       "host": "http://43.205.112.88:5000",
//       "nodeMailerEmail": "email.new.tester2014@gmail.com",
//       "nodeMailerPass": "maiplzlmrjfmhara"
//     }
//   }