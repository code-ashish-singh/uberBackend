const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controllers.js')
const {body} = require('express-validator')

router.post('/register',[
    body('email').isEmail().withMessage('invalid email'),
    body('fullname.firstname').isLength({min : 3}).withMessage('first must be at least 3 character long'),
    body('password').isLength({min : 5}).withMessage('password must be at least 5 charcter long')
],
userController.registerUser
)

router.post('/login',[
    body('email').isEmail().withMessage('invalid Email'),
    body('password').isLength({min : 6}).withMessage('password invalid')
],
userController.loginUser
)

module.exports = router