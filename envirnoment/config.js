const config=require('./config.json')
const envirnoment= process.env.NODE_ENV || 'dev';
const finalConfig= config[envirnoment];
export const mongo_url= process.env.database || finalConfig.database;

export const fontend_host = finalConfig.fontend_host
export const host = finalConfig.host
export const nodeMailerEmail = process.env.nodeMailerEmail || finalConfig.nodeMailerEmail
export const nodeMailerPass = process.env.nodeMailerPass || finalConfig.nodeMailerPass

// const config=require('./config.json')
// const envirnoment= process.env.NODE_ENV || 'dev';
// const finalConfig= config[envirnoment];

// export const mongo_url = process.env.database || finalConfig.database;