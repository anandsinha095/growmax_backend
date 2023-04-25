
import { responseHandler } from '../../common/response';
import { __esModule } from '@babel/register/lib/node';

import csc from 'country-state-city'

const country = async (req, res) => {
    try {
        let countryData = csc.getAllCountries()
        return responseHandler(res, 200, "success", countryData)
      }
    catch (e) {
        console.log("error =>", e)
        return responseHandler(res, 500, e)
    }
}

const state = async (req, res) => {
    try {
        let state = csc.getStatesOfCountry(req.body.countryId)
        return responseHandler(res, 200, "success", state)
      }
    catch (e) {
        console.log("error =>", e)
        return responseHandler(res, 500, e)
    }
}

const city = async (req, res) => {
    try {
        let city = csc.getCitiesOfState(req.body.stateId)
        return responseHandler(res, 200, "success", city)
      }
    catch (e) {
        console.log("error =>", e)
        return responseHandler(res, 500, e)
    }
}
module.exports = {
    country: country,
    state: state,
    city:city
}