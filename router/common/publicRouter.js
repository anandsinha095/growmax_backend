const publicRoute= require('express').Router();
import {packages, level, reBuy} from '../../controller/common/packageController'

publicRoute.get('/packages', packages); 
publicRoute.post('/level', level); 
publicRoute.get('/reBuy', reBuy); 

export default publicRoute;