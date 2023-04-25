import { __esModule } from '@babel/register/lib/node';
import { responseHandler } from '../../common/response'
import { bcrypt, bcryptVerify, createJwt, sendMail, verifyJwtToken, tenMinutesJwt} from '../../common/function';
import userModel from '../../model/user/user'/* for  user */
import bannerModel from '../../model/home/banner'
import multiparty from 'multiparty';
var fs = require('fs');

/**********************************Add Banner **************************************/
const addBanner = async (req, res) => {     
    var form = new multiparty.Form();
    form.parse(req, async function (err, fields, files) {
        const { bannerHeader, bannerText, bannerLinkId, status} = req.body;
        if(!bannerHeader || !bannerText || !bannerLinkId || !status )
        return responseHandler(res, 400, "Bad Request.")   
        try {
            let info = await verifyJwtToken(req, res)
            let user = await userModel.findById({ _id: info }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
           if(user == null)
            return responseHandler(res, 400, "Bad Request.")          
           else{
                if(req.file != undefined){
                    let imagePath = req.file.path+'.'+req.file.originalname.split('.')[1];              
                    fs.rename( req.file.path , req.file.path + '.'+req.file.originalname.split('.')[1], function(err) {
                        if ( err ) console.log('ERROR: ' + err);
                    });
                    req.body.banner = imagePath.replace("public/","");
                }   
                req.body.createdBy = info
                let lastBanner=  await bannerModel.find({}).sort({_id:-1}).limit(1)  
                req.body.countId =  lastBanner[0] !=undefined ? parseFloat(lastBanner[0].countId) + 1 : 1; 
          
                await bannerModel.create(req.body) /* create user object */    
                return responseHandler(res, 200, "Banner added successfully")
            }
        }
        catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
    })
}

/************************* Remove Banner ************************/
const removeHomePageBanner = async (req, res) => {
    const {bannerId}= req.params
    console.log('bannerId', bannerId)
    if(!bannerId)
     return responseHandler(res, 400, "Bad Request.")
    try {
        let info = await verifyJwtToken(req, res)
        let user = await userModel.findById({ _id: info }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
        if(user == null)
        return responseHandler(res, 400, "Bad Request.")
        let banner = await bannerModel.findById({ _id: bannerId}, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
        if(!banner)
        return responseHandler(res, 406, "Banner does not exist")
        else
        {
             await bannerModel.findByIdAndDelete({ _id: bannerId }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
             return responseHandler(res, 200, "Banner removed from successfully")
        }
    }
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
}


module.exports = {
    addBanner:addBanner,
    removeHomePageBanner:removeHomePageBanner
};  