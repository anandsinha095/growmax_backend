const authRoute= require('express').Router();
import {signUp, signIn, firstIdSignUp, userInfo, verifyUsername, verifyEmailId, verifyReferral} from '../../controller/user/userController.js';
import { verifyEmail, resendMail_For_Verify_Email } from '../../controller/common/mailController';
import { forgotPassword, checkResetLink, resetPassword, changePassword } from '../../controller/common/passwordController'
import { verifyJwt, checkSession } from '../../common/function';


authRoute.post('/signup', signUp);
authRoute.post('/firstIdSignUp', firstIdSignUp);
authRoute.post('/login', signIn);
//authRoute.get('/btc',getInfo)
// authRoute.get('/btcNetwork',getAccount)

/*********************************** Send Mail Again Calls *************************************************************************/
authRoute.post('/resendMail_For_Verify_Email', resendMail_For_Verify_Email)
/*********************************** Send Mail Again Calls *************************************************************************/


/*************************************** To verify the Email Link ******************************************************************/
authRoute.post('/verifyEmail/', verifyJwt, verifyEmail)
authRoute.get('/userInfo/', verifyJwt, userInfo)


/*************************************** To User profile Update ******************************************************************/
//authRoute.get('/userInfo',verifyJwt,userInfo)
/***************************************** To verify the Email Link ****************************************************************/
/************************************  Password Controller Routes Calls ***********************************************************/
authRoute.put('/changePassword',changePassword)
authRoute.post('/forgotPassword', forgotPassword)
authRoute.get('/checkResetLink/:token', checkResetLink)
authRoute.post('/resetPassword/:token', resetPassword)
//authRoute.put('/updateProfile',uploader.single('profilePicture'),updateProfile);

// before signup verify
authRoute.post('/verifysUsername/', verifyJwt, verifyUsername)
authRoute.post('/verifyEmailId/', verifyJwt, verifyEmailId)
authRoute.post('/verifyReferral/', verifyJwt, verifyReferral)


export default authRoute;

