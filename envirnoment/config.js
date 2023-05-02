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

// const config=require('./config.json')
// const envirnoment= process.env.NODE_ENV || 'dev';
// const finalConfig= config[envirnoment];

// export const mongo_url = process.env.database || finalConfig.database;
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