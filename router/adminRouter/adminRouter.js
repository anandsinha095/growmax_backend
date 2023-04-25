const adminRoute = require('express').Router();
import { signUp, getAllEmployee, updateCustomer, employeeDetail, updateEmployee, userIsActive, employeeIsActive, deleteEmployee, dashboard } from '../../controller/admin/adminController';
import { getAllUsers, userDetail, exportUserData, updateCustomerDetail, customerIsActive, deleteCustomer } from '../../controller/admin/customerController';
import { addBanner, removeHomePageBanner } from '../../controller/admin/homePageAdminController';
import { getAllvendor, createVendor, vendorDetail, updateVendor, deleteVendor, vendorIsActive } from '../../controller/admin/vendorController';
import { exportUser } from '../../controller/admin/exportController';
import { addCategory, categoryList, updateCategory, categoryToggleStatus, deleteCategory, categoryDetail, addProduct, productList, productToggleStatus, updateProduct, viewProduct, deleteProduct, productIsActive, featuredToggleProduct, newArrivalProduct } from '../../controller/admin/productController';
import { addPackage, addLevel, roleList, roleDetail, updateRole } from '../../controller/admin/packageController';
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
adminRoute.put('/customerIsActive', verifyJwt, customerIsActive);
adminRoute.get('/exportUser', verifyJwt, exportUser);
adminRoute.put('/updateCustomer', uploader.single('profilePicture'), updateCustomer);
adminRoute.put('/updateCustomerDetail', uploader.single('profilePicture'), updateCustomerDetail);
adminRoute.get('/getAllUsers', verifyJwt, getAllUsers);
adminRoute.post('/userDetail', verifyJwt, userDetail);
adminRoute.put('/deleteCustomer', verifyJwt, deleteCustomer);
adminRoute.get('/dashboard', verifyJwt, dashboard);

/************************Employee/ User ********************/

adminRoute.post('/employeeDetail', verifyJwt, employeeDetail);
adminRoute.get('/exportUserData', verifyJwt, exportUserData);
adminRoute.get('/getAllEmployee', verifyJwt, getAllEmployee);
adminRoute.post('/signUp', uploader.single('profilePicture'), signUp);
adminRoute.put('/updateEmployee', uploader.single('profilePicture'), updateEmployee);
adminRoute.put('/employeeIsActive', verifyJwt, employeeIsActive);
adminRoute.put('/deleteEmployee', verifyJwt, deleteEmployee);


/**************Category **************/
adminRoute.post('/addCategory', categoryImageUploader.single('categoryImage'), addCategory);
adminRoute.get('/categoryList', categoryList);
adminRoute.put('/updateCategory', categoryImageUploader.single('categoryImage'), updateCategory);
adminRoute.post('/categoryDetails', categoryDetail);
adminRoute.put('/deleteCategory', verifyJwt, deleteCategory);
adminRoute.put('/categoryToggleStatus', verifyJwt, categoryToggleStatus);

/******************Product *******************/
adminRoute.post('/addProduct', productImageUploader.single('productImage'), addProduct);
adminRoute.get('/productList', verifyJwt, productList);
adminRoute.put('/updateProduct', productImageUploader.single('productImage'), updateProduct);
adminRoute.post('/viewProduct', verifyJwt, viewProduct);
adminRoute.put('/deleteProduct', verifyJwt, deleteProduct);
adminRoute.put('/productIsActive', verifyJwt, productIsActive);
adminRoute.put('/productToggleStatus', verifyJwt, productToggleStatus);
adminRoute.put('/featuredToggleProduct', verifyJwt, featuredToggleProduct);
adminRoute.put('/newArrivalProduct', verifyJwt, newArrivalProduct);

/***********************Vendor ********************/
adminRoute.get('/getAllvendor', getAllvendor);
adminRoute.post('/createVendor', verifyJwt, createVendor);
adminRoute.post('/vendorDetails', verifyJwt, vendorDetail);
adminRoute.put('/vendorIsActive', verifyJwt, vendorIsActive);
adminRoute.put('/deleteVendor', verifyJwt, deleteVendor);
adminRoute.put('/updateVendor', uploader.single('profilePicture'), updateVendor);

/**********************Role  ********************/
adminRoute.post('/addPackage', addPackage);
adminRoute.post('/addLevel', addLevel);
adminRoute.get('/roleList', verifyJwt, roleList);
adminRoute.post('/roleDetails', verifyJwt, roleDetail);
adminRoute.put('/updateRole', verifyJwt, updateRole);

/****************************Home Banner *************/
adminRoute.post('/addBanner', homeBannerUploader.single('banner'), addBanner);
adminRoute.delete('/removeHomePageBanner/:bannerId/', verifyJwt, removeHomePageBanner);
export default adminRoute;

