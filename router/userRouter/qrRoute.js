const qrRoute = require('express').Router();
import { generateQrCode, verifyQrCode, disableGAuth, verifyGAuthCode } from '../../controller/user/twoFaController'
import { verifyJwt } from '../../common/function';
import { verify2FA } from '../../common/middleware';
qrRoute.post('/generateQrCode', verifyJwt, generateQrCode)
qrRoute.post('/verifyQrCode', verifyJwt, verifyQrCode)
qrRoute.put('/disableGAuth', verifyJwt, verify2FA, disableGAuth)
qrRoute.post('/verifyGAuthCode', verifyJwt, verifyGAuthCode)
export default qrRoute;