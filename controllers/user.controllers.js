const userModel = require('../models/user.model.js')
const userService = require('../services/user.services.js')
const {validationResult} = require('express-validator')
module.exports.registerUser = async (req,res,next)=>{
    
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(404).json({
            errors : errors.array()
        })
    }

}