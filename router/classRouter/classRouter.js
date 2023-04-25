const classesRoute= require('express').Router();
import {addClass, classList, classInfo, updateClass} from '../../controller/classes/classController';
import { verifyJwt, checkSession } from '../../common/function';


classesRoute.post('/addClass', verifyJwt, addClass);
classesRoute.get('/classList', verifyJwt, classList);
classesRoute.get('/classInfo/:id', verifyJwt, classInfo);
classesRoute.put('/updateClass/:id', verifyJwt, updateClass);
export default classesRoute;
