const authRoute= require('express').Router();
import {signUp, signIn, vendorSignUp , userInfo, updateProfile, addAddress, editAddress, addressList, deleteAddress, addressView } from '../../controller/customer/customerController';
import { verifyEmail, resendMail_For_Verify_Email } from '../../controller/customer/mailController';
import { country, state, city } from '../../controller/customer/countryStateCityController';
import { checkResetLink, resetPassword, changePassword } from '../../controller/customer/passwordController'
import { addWishlist, removeWishlist, wishlistProduct } from '../../controller/wishlist/wishlistController';
import { verifyJwt, checkSession } from '../../common/function';
var multer = require('multer')
// to upload single file  
var uploader = multer({
    dest: 'public/images/profile/'
});

authRoute.post('/signup', signUp);
authRoute.post('/vendorSignup', vendorSignUp);
authRoute.post('/login', signIn);

// /*********************************** Send Mail Again Calls *************************************************************************/
// authRoute.post('/resendMail_For_Verify_Email', resendMail_For_Verify_Email)
// authRoute.get('/country', country)
// authRoute.post('/state', state)
// authRoute.post('/city', city)


// /*************************************** To verify the Email Link ******************************************************************/
authRoute.get('/verifyEmail/:token', verifyEmail)


// /*************************************** To Customer profile Update ******************************************************************/
 authRoute.get('/userInfo',verifyJwt,userInfo)

// /***************************************** Customer Addresses  ****************************************************************/
authRoute.put('/editAddress',verifyJwt, editAddress)
authRoute.post('/addAddress', verifyJwt, addAddress)
authRoute.get('/addressList',verifyJwt, addressList)
authRoute.put('/deleteAddress', verifyJwt, deleteAddress)
authRoute.get('/addressView/:addressId',verifyJwt, addressView);


// /************************************  Password Controller Routes Calls ***********************************************************/
authRoute.put('/changePassword',changePassword)
authRoute.get('/checkResetLink/:token', checkResetLink)
authRoute.post('/resetPassword/:token', resetPassword)
authRoute.put('/updateProfile',uploader.single('profilePicture'),updateProfile);

/*************************************************  Wishlist  *******************************************/
authRoute.get('/addWishlist/:productId', verifyJwt, addWishlist)
authRoute.delete('/removeWishlist/:productId', verifyJwt, removeWishlist)
authRoute.get('/wishlistProduct', verifyJwt, wishlistProduct)

export default authRoute;

