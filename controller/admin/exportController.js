import userModel from '../../model/user/user'/* To Create user */
import orderModel from '../../model/order/order'/* To Create user */
import { __esModule } from '@babel/register/lib/node';
import { responseHandler } from '../../common/response'
import {  verifyJwtToken } from '../../common/function';
import { compareSync } from 'bcryptjs';
const { Parser } = require('json2csv')
const exportUser = async (req, res) => {
    try {
        const fileName = 'users1.csv' //generate csv file with this name
        let userId = await verifyJwtToken(req, res);
        let user_obj = await userModel.findOne({ _id: userId })
        if (user_obj == null) return responseHandler(res, 400, "Bad request")
        let userData = await userModel.find({roleId: 3 })

        if (!userData) return responseHandler(res, 407, "Customer doesn't exist")      
        const fields = [
            {
                label: 'FirstName',
                value: 'firstName'
            },
            {
                label: 'LastName',
                value: 'lastName'
            },
            {
                label: 'Email Address',
                value: 'email'
            },
            {
                label: 'Password',
                value: 'password'
            },
            {
                label: 'Status',
                value: 'status'
            }
        ];
        const json2csv = new Parser({ fields });
        const csv = json2csv.parse(userData);
        res.header('Content-Type', 'text/csv');
        res.attachment(fileName);
        res.status(200).send(csv);
        window.open("data:text/csv;charset=utf-8," + escape(csv))
    }
    catch (e) {
        res.send(e)
    }
}
module.exports = {
    exportUser: exportUser,
};