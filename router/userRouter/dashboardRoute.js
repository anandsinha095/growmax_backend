const dashboardRoute= require('express').Router();
import {signUp,signIn} from '../../controller/user/userController.js';
import { displayData } from '../../controller/dashboard/dashboardContraoller';
import { verifyJwt, checkSession } from '../../common/function';


dashboardRoute.get('/displayData', verifyJwt ,displayData);

export default dashboardRoute;
