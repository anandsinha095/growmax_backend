import packagesModel from '../../model/package/package'/* inventory */
import { __esModule } from '@babel/register/lib/node';
import { responseHandler } from '../../common/response'
import levelModel from '../../model/rewards/level';
var fs = require('fs');
  /****************************  fetching package  ************************/
const packages = async (req, res) => {
    try{
        const silver =  await packagesModel.find({ name: "Basic"});
        const gold =  await packagesModel.find({ name: "Medium"})
        const daimond =  await packagesModel.find({ name: "Advance"});
        const platinum =  await packagesModel.find({ name: "Corporate"})
        return responseHandler(res, 200, "Packages Successfully fetched", {silver: silver, gold:gold, daimond:daimond, platinum:platinum})             
    }    
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }  
  }

  const reBuy = async (req, res) => {
    try{
        const silver =  await packagesModel.find({ name: "Basic"});
        const gold =  await packagesModel.find({ name: "Medium"})
        const daimond =  await packagesModel.find({ name: "Advance"})
        const platinum =  await packagesModel.find({ name: "Corporate"})
        const mini_pack =  await packagesModel.find({ name: "MINI PACK"})
        return responseHandler(res, 200, "Packages Successfully fetched", {silver: silver, gold:gold, daimond:daimond, platinum:platinum, mini_pack:mini_pack})             
    }    
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }  
  }


  const level = async (req, res) => {
    try{
        const data =  await levelModel.findOne({direct: req.body.direct});
      
        return responseHandler(res, 200, "level Successfully fetched", data)             
    }    
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }  
  }

module.exports = {
    packages:packages,
    level:level,
    reBuy:reBuy
};