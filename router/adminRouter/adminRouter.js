const adminRoute = require('express').Router();
import { signUp, signIn, getAllusers, adminInfo, adminDisplayData, updateCustomer, employeeDetail, updateEmployee, userIsActive, employeeIsActive, deleteEmployee, dashboard } from '../../controller/admin/adminController';
import { addPackage, addLevel, roleList, roleDetail, updateRole, updatePackage } from '../../controller/admin/packageController';
import {getWalletBalance, usersWallet, findWallet, coreWalletBal, findWaithdrawWallet, accountDetails, communityReward, products, displayData} from '../../controller/admin/productController';
import { verifyJwt, checkSession } from '../../common/function';

/************************* New Admin users  **************************/
adminRoute.post('/signup', signUp);
adminRoute.post('/signin', signIn);

/*********************************** Create New order *************************************************************************/

adminRoute.put('/userIsActive', verifyJwt, userIsActive);
adminRoute.get('/users', verifyJwt, getAllusers); 
adminRoute.get('/adminDisplayData', verifyJwt, adminDisplayData);
adminRoute.get('/adminInfo', verifyJwt, adminInfo);
/************************Employee/ User ********************/






/******************Product *******************/
// adminRoute.post('/addProduct', productImageUploader.single('productImage'), addProduct);
// adminRoute.get('/productList', verifyJwt, productList);
// adminRoute.put('/updateProduct', productImageUploader.single('productImage'), updateProduct);
// adminRoute.post('/viewProduct', verifyJwt, viewProduct);
// adminRoute.put('/deleteProduct', verifyJwt, deleteProduct);
// adminRoute.put('/productIsActive', verifyJwt, productIsActive);
// adminRoute.put('/productToggleStatus', verifyJwt, productToggleStatus);
// adminRoute.put('/featuredToggleProduct', verifyJwt, featuredToggleProduct);
// adminRoute.put('/newArrivalProduct', verifyJwt, newArrivalProduct);



/**********************Role  ********************/
adminRoute.post('/addPackage', addPackage);
adminRoute.post('/addLevel', addLevel);
adminRoute.get('/roleList', verifyJwt, roleList);
adminRoute.post('/roleDetails', verifyJwt, roleDetail);
adminRoute.put('/updateRole', verifyJwt, updateRole);
adminRoute.put('/updatePackage', updatePackage);

adminRoute.get('/getWalletBalance', getWalletBalance);

adminRoute.get('/usersWallet', usersWallet);
adminRoute.get('/findWallet', findWallet);
adminRoute.get('/coreWalletBal', coreWalletBal);
adminRoute.get('/findWaithdrawWallet', findWaithdrawWallet);
adminRoute.get('/accountDetails', accountDetails); 
adminRoute.get('/communityReward', communityReward); 
adminRoute.post('/products', products); displayData
adminRoute.get('/displayData', displayData);
// /****************************Home Banner *************/
// adminRoute.post('/addBanner', homeBannerUploader.single('banner'), addBanner);
// adminRoute.delete('/removeHomePageBanner/:bannerId/', verifyJwt, removeHomePageBanner);
export default adminRoute;

