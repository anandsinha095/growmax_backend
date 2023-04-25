import classesModel from '../../model/classes/classes'/* To Create user */
import userModel from '../../model/user/user'/* To Create user */
import { __esModule } from '@babel/register/lib/node';
import { responseHandler } from '../../common/response'
import { bcrypt, bcryptVerify, createJwt, sendMail, verifyJwtToken} from '../../common/function';

const addClass = async (req, res) => {
    const {name , steats, subject}= req.body
    if(!name || !subject)
     return responseHandler(res, 400, "Bad Request.")
    try {
        let info = await verifyJwtToken(req, res)
        let user = await userModel.findById({ _id: info }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
        if(user == null)
        return responseHandler(res, 400, "Bad Request.")
        let classDetails = await classesModel.findOne({ name: name }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
        if(classDetails)
        return responseHandler(res, 406, "Class already Exist")
        else
        {
             req.body.createdBy=info
             await classesModel.create(req.body) 
             return responseHandler(res, 200, "Class add successfully")
        }
    }
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
}

/************************** class details *********************/

const classInfo = async (req, res) => {    
    if (!req.params.id) return responseHandler(res, 400, "Bad Request")
    let info = await verifyJwtToken(req, res)
    let user = await userModel.findById({ _id: info }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
    if(!user)return responseHandler(res, 400, "Bad Request")
    const  classId  = req.params.id; // destructuring 
    var result =  await classesModel.findById({ _id: classId }, { __v: 0, password: 0})
    if (!result) return responseHandler(res, 404, "Class doesn't Exist.")
    try {
        return responseHandler(res, 200, 'Success',result)       
    }
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
}

/**************************Update class *******************/
const updateClass = async (req, res) => {
    const {name , registration,security,admission, annual, exam, tuition, computer, dance, miscellaneous, extraActivityClasses , seats}= req.body
    let classId= req.params.id;
    if(!name || !seats)
        return responseHandler(res, 400, "Bad Request.")
    try {
        let info = await verifyJwtToken(req, res)
        let user = await userModel.findById({ _id: info }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
        if(user == null)
        return responseHandler(res, 400, "Bad Request.")
        let classDetails = await classesModel.findOne({_id: classId}, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
        if(!classDetails)
        return responseHandler(res, 406, "Class doesn't Exist")
        else
        {
            req.body.classFee={
                registration: (registration!= null ? registration : 0), security: (security!= null ? security : 0), admission:(admission!= null ? admission : 0), annual:(annual!= null ? annual : 0), exam:(exam!= null ? exam : 0), tuition:(tuition!= null ? tuition : 0), computer:(computer!= null ? computer : 0), dance: (dance!= null ? dance : 0), miscellaneous:(miscellaneous!= null ? miscellaneous : 0), extraActivityClasses:(extraActivityClasses!= null ? extraActivityClasses : 0)
            }
            await classesModel.findByIdAndUpdate({ _id: classId},{ $set: { name: name, seats: seats, classFee: req.body.classFee,  updatedBy: info } }) //update the class data
             return responseHandler(res, 200, "Class updated successfully")
        }
    }
    catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
}
/*******************Class List  **************/
    const classList = async (req, res) => {
        try {
            let info = await verifyJwtToken(req, res)
            let user = await userModel.findById({ _id: info }, { __v: 0, password: 0, createdAt: 0, updatedAt: 0})
            if(!user) return responseHandler(res, 400, "Bad Request.")
            else{
                let result =  await classesModel.find({ status: 1}).sort({createdAt:1})
                    return responseHandler(res, 200, "OK", result)
            }       
        }
        catch (e) { return responseHandler(res, 500, "Internal Server Error.", e) }
    } 

module.exports = {
    addClass: addClass,
    classList:classList,
    classInfo:classInfo,
    updateClass:updateClass
}
