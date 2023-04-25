const studentRoute= require('express').Router();
import {signUp ,studentInfo, studentList, studentIsActive, studentToggle} from '../../controller/student/studentController';
import { verifyEmail, resendMail_For_Verify_Email } from '../../controller/common/mailController';
import { country, state, city } from '../../controller/customer/countryStateCityController';
import { forgotPassword, checkResetLink, resetPassword, changePassword } from '../../controller/common/passwordController'
import { verifyJwt, checkSession } from '../../common/function';
var multer = require('multer')
// to upload single file  
var uploader = multer({
    dest: 'public/images/profile/'
});

studentRoute.post('/signup', signUp); 
//studentRoute.post('/login', signIn);
//studentRoute.get('/btc',getInfo)
// studentRoute.get('/btcNetwork',getAccount)

/*********************************** Send Mail Again Calls *************************************************************************/
studentRoute.post('/resendMail_For_Verify_Email', resendMail_For_Verify_Email)
// studentRoute.get('/countries', country)
// studentRoute.post('/states', state)
// studentRoute.post('/cities', city)
/*********************************** Send Mail Again Calls *************************************************************************/


/*************************************** To verify the Email Link ******************************************************************/
studentRoute.get('/verifyEmail/:token', verifyEmail)


/*************************************** To User profile Update ******************************************************************/
studentRoute.get('/studentInfo/:id',verifyJwt,studentInfo)

studentRoute.get('/studentList',verifyJwt,studentList)
/***************************************** To verify the Email Link ****************************************************************/
/************************************  Password Controller Routes Calls ***********************************************************/
studentRoute.put('/changePassword',changePassword)
studentRoute.post('/forgotPassword', forgotPassword)
studentRoute.get('/checkResetLink/:token', checkResetLink)
studentRoute.post('/resetPassword/:token', resetPassword)
studentRoute.put('/studentIsActive', verifyJwt, studentIsActive)
studentRoute.put('/studentToggle', verifyJwt, studentToggle)

export default studentRoute;