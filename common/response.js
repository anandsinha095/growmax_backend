
export function responseHandler(res, code, message, data) {
    return res.status(code).send({ "code": code, "message": message, "data": data });
}

/***************************************************************************************************
                                   Standard ResPonse Code
****************************************************************************************************
200 - OK
201 - Created [ The request has been fulfilled, resulting in the creation of a new resource]
204 - No Content [ The server successfully processed the request and is not returning any content]
400 - Bad Request [If request not fullfill require data]
401 - Unauthorized [When token missing from header or invalid ]
403 - Forbidden  [ The request was valid, but the server is refusing action. The user might not have the necessary permissions for a resource, or may need an account of some sort.]
404 - Not Found  [ The requested resource could not be found but may be available in the future. Subsequent requests by the client are permissible.]
406 - Not Acceptable
408 - Request Timeout
440 - Session Expired
500 - Internal Server Error

***************************************************************************************************
                                        User Custom Response Code
***************************************************************************************************

1) 460 -469
 a) 460 - Please Verify New Ip after login again
 b) 461 - Please Verify Your Mail.
 c) 462 - Please Try After Ten Minutes.

2) 470 - 479
a) 470 - Your Otp has been Expire.
b)

3) 480 -489
a) 480 - Invalid 2FA SmsAuth Token / Invalid OTP
b) 481 - Invalid 2FA GAuth Token
c)

4) 490 - 499
a) 490 - Your Link has been Expired.
b) 491 - Invalid Email Link.
c)

******************************************************************************************************
                             Admin Custom Code
******************************************************************************************************

*/
