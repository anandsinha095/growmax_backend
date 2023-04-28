const adminRoute = require('express').Router();
import { signUp, getAllEmployee, updateCustomer, employeeDetail, updateEmployee, userIsActive, employeeIsActive, deleteEmployee, dashboard } from '../../controller/admin/adminController';
import { addPackage, addLevel, roleList, roleDetail, updateRole, updatePackage } from '../../controller/admin/packageController';
import { verifyJwt, checkSession } from '../../common/function';
var multer = require('multer')
// to upload single file  
var uploader = multer({
    dest: 'public/images/profile/'
});
var productImageUploader = multer({
    dest: 'public/images/product/'
});
var categoryImageUploader = multer({
    dest: 'public/images/category/'
});
var homeBannerUploader = multer({
    dest: 'public/images/banner/'
});

/************************* New Admin users  **************************/
adminRoute.post('/singup', signUp);

/*********************************** Create New order *************************************************************************/

adminRoute.put('/userIsActive', verifyJwt, userIsActive);


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
// /****************************Home Banner *************/
// adminRoute.post('/addBanner', homeBannerUploader.single('banner'), addBanner);
// adminRoute.delete('/removeHomePageBanner/:bannerId/', verifyJwt, removeHomePageBanner);
export default adminRoute;

