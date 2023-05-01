var Promise = require('bluebird');
var bcrypt = Promise.promisifyAll(require('bcryptjs'));
var jwt = Promise.promisifyAll(require('jsonwebtoken'));
var nodemailer = Promise.promisifyAll(require('nodemailer'));
import { nodeMailerEmail, nodeMailerPass } from '../envirnoment/config';
import { responseHandler } from './response'
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import fs from 'fs';
module.exports = {
    /* To encrypt the password string */
    bcrypt: async (password) => {
        return new Promise(async (resolve, reject) => {
            try {
                let salt = await bcrypt.genSalt(10)
                let hash = await bcrypt.hash(password, salt)
                resolve(hash)
            }
            catch (e) {
                console.log("Error==>", e)
                reject(e)
            }
        })

    },
    /* To decrypt the password */
    bcryptVerify: async (password, dbPassword) => {
        return new Promise(async (resolve, reject) => {
            try {
                resolve(await bcrypt.compare(password, dbPassword))
            }
            catch (e) {
                reject(e)
            }
        })
    },

    /* To generate Auth token for checking every request */
    createJwt: async (payload) => {
        return new Promise(async (resolve, reject) => {
            try {
                console.log('payload',payload);
                var privateKEY = await fs.readFileSync('./certificate/private.key', 'utf8') 
                resolve(await jwt.sign({ data: payload }, privateKEY, { expiresIn: '1000h', algorithm: 'RS256' }));
            }
            catch (e) {
                reject(e)
            }

        })
    },

    /* To Validate the User is Authenticate Or working as a middleWare */
    verifyJwt: async (req, res, next) => {
       // console.log("req.headers ==> ", req.headers.authorization)
        try {
            if (!req.headers.authorization) return responseHandler(res, 401, "Unauthorized")
            else {
                const publicKEY = fs.readFileSync('./certificate/public.key', 'utf8')
                const decoded = jwt.verify(req.headers.authorization, publicKEY, { algorithm: 'RS256' });
                req.user = decoded.data
                next()
            }
        }
        catch (e) {
            console.log("JWT NOT Verify ==>", e)
            return responseHandler(res, 401, e)
        }
    },

      /* To Validate the User is Authenticate Or working as a middleWare */
      verifyJwtToken: async (req, res, next) => {
        // console.log("req.headers ==> ", req.headers.authorization)
        try {
            if (!req.headers.authorization) return responseHandler(res, 401, "Unauthorized")
            else {
                var publicKEY = fs.readFileSync('./certificate/public.key', 'utf8')
                let verifyToken = jwt.verify(req.headers.authorization, publicKEY, { algorithm: 'RS256' });
                return verifyToken.data;
            }
        }
        catch (e) {
            console.log("JWT NOT Verify ==>", e)
            return responseHandler(res, 401, e)
        }
    },
    /* Genearte Secret Key for validating QR code */
    generateSecretKeyForQrCode: async () => {
        return new Promise(async (resolve, reject) => {
            try {
                resolve(await speakeasy.generateSecret({ length: 10 }));
            }
            catch (e) { reject(e) }
        })
    },

    /* Generate QR Code For Google Auth */
    generateQrCode: async (req, secret) => {
        return new Promise(async (resolve, reject) => {
            try {
                var url = await speakeasy.otpauthURL({ secret: secret.ascii, label: "cychange" + "(" + req.body.email_id + ")" });
                resolve(await QRCode.toDataURL(url))
            }
            catch (e) { reject(e) }
        })

    },

    /* Verify QR Code */
    verifyQrCode: async (userToken, secret) => {
        return new Promise(async (resolve, reject) => {
            try {
                resolve(await speakeasy.totp.verify({ secret: secret.base32, encoding: 'base32', token: userToken, window: 0 }))
            }
            catch (e) {
                console.log("err =>", e)
                reject(e)
            }
        })
    },
    /* Send Mail After when User Sign Up */
    sendMail: async (to, subj, text, link) => {
        try {
            let transporter = await nodemailer.createTransport({ service: 'smtp.hostinger.com', auth: { user: nodeMailerEmail, pass: nodeMailerPass } })
            let messageObj = {
                from: 'test',
                to: to,
                subject: subj,
                html: link
            }
            await transporter.sendMail(messageObj)
            console.log("Mail sent")
        }
        catch (e) { console.log("Errror in sending Email-->", e) }
    },

    /* verify the Email Link */
    verifyEmail: (req, res) => {
        return new Promise(async (resolve, reject) => {
            try {
                 var publicKEY = await fs.readFileSync('./certificate/public.key', 'utf8')
                let verifyToken = await jwt.verify(req.params.token, publicKEY, { algorithm: 'RS256' });
                 return resolve(verifyToken)
            }
            catch (e) {
                if (e.name === 'TokenExpiredError') return reject(e.name)
                else if (e.name === 'JsonWebTokenError') return reject(e.name)
                else return reject(e.name)
            }
        })
    },
    tenMinutesJwt: async (payload, res) => {
        try {
            var privateKEY = await fs.readFileSync('./certificate/private.key', 'utf8')
            return await jwt.sign({ data: payload }, privateKEY, { expiresIn: '24h', algorithm: 'RS256' });
        } catch (e) { return responseHandler(res, 500, "Internal Server Error") }
    },
    /* verify JWT and return decrypt token */
    decryptJwt: async (req, res) => {
        try {
            if (!req.headers.authorization) return responseHandler(res, 401, "Unauthorized")
            else {
                var publicKEY = await fs.readFileSync('./certificate/public.key', 'utf8')
                let verifyToken = await jwt.verify(req.headers.authorization, publicKEY, { algorithm: 'RS256' });
                return verifyToken;
            }
        }
        catch (e) { return responseHandler(res, 401, e) }
    },

}
