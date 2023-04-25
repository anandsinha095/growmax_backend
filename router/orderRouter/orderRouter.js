const orderRoute= require('express').Router();
import {createOrder, getOrder, paymentHistory, directLeg, passiveIncome, communityIncome} from '../../controller/user/orderController';
import {coreToEco, coreToTrade} from '../../controller/user/walletTransferController'
import { verifyJwt, checkSession } from '../../common/function';

/*********************************** Create New order *************************************************************************/
orderRoute.post('/createOrder',verifyJwt, createOrder);
orderRoute.get('/getOrder',verifyJwt, getOrder);
orderRoute.get('/paymentHistory',verifyJwt, paymentHistory); 
orderRoute.get('/directLeg',verifyJwt, directLeg);
orderRoute.get('/passiveIncome',verifyJwt, passiveIncome);
orderRoute.get('/communityIncome',verifyJwt, communityIncome);

orderRoute.post('/coreToEco',verifyJwt, coreToEco);
orderRoute.post('/coreToTrade',verifyJwt, coreToTrade);
export default orderRoute;
