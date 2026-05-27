# Backend API Documentation

This backend API is built using Node.js, Express.js, MongoDB, Mongoose, JWT Authentication, bcryptjs, and express-validator.

---

# Base URL

```bash
http://localhost:3000
```

---

# Features

- User Registration
- User Login Authentication
- Password Hashing using bcryptjs
- JWT Token Authentication
- MongoDB Database Integration
- Request Validation
- Protected Routes Ready

---

# Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- bcryptjs
- jsonwebtoken
- express-validator
- dotenv
- cookie-parser

---

# API Endpoints

| Method | Endpoint | Description |
|------|------|------|
| POST | /users/register | Register a new user |
| POST | /users/login | Login existing user |

---

# User Register API

## Endpoint

`POST /users/register`

---

## Description

This endpoint is used to register a new user in the application.

The endpoint:

- Validates request body
- Hashes password using bcrypt
- Creates new user in MongoDB
- Generates JWT token
- Returns token and user data

---

## Request Body

```json
{
  "fullname": {
    "firstname": "Ashish",
    "lastname": "Singh"
  },
  "email": "ashish@example.com",
  "password": "123456"
}
```

---

## Required Fields

| Field | Type | Required | Description |
|------|------|------|------|
| fullname.firstname | String | Yes | Minimum 3 characters |
| fullname.lastname | String | No | User last name |
| email | String | Yes | Valid email |
| password | String | Yes | Minimum 5 characters |

---

## Success Response

### Status Code: `201 Created`

```json
{
  "token": "jwt_token_here",
  "user": {
    "_id": "6654b2f7a12bc45d98ef1234",
    "fullname": {
      "firstname": "Ashish",
      "lastname": "Singh"
    },
    "email": "ashish@example.com",
    "socketId": null
  }
}
```

---

## Validation Error Response

### Status Code: `404`

```json
{
  "errors": [
    {
      "type": "field",
      "msg": "invalid email",
      "path": "email",
      "location": "body"
    }
  ]
}
```

---

# User Login API

## Endpoint

`POST /users/login`

---

## Description

This endpoint authenticates existing users.

The endpoint:

- Validates email and password
- Checks if user exists
- Compares password using bcrypt
- Generates JWT token
- Returns authenticated user data

---

## Request Body

```json
{
  "email": "ashish@example.com",
  "password": "123456"
}
```

---

## Required Fields

| Field | Type | Required | Description |
|------|------|------|------|
| email | String | Yes | Registered email |
| password | String | Yes | Minimum 6 characters |

---

## Success Response

### Status Code: `200 OK`

```json
{
  "token": "jwt_token_here",
  "user": {
    "_id": "6654b2f7a12bc45d98ef1234",
    "fullname": {
      "firstname": "Ashish",
      "lastname": "Singh"
    },
    "email": "ashish@example.com"
  }
}
```

---

## Invalid Credentials Response

### Status Code: `401 Unauthorized`

```json
{
  "message": "invalid email or password"
}
```

---

## Validation Error Response

### Status Code: `400 Bad Request`

```json
{
  "errors": [
    {
      "type": "field",
      "msg": "password invalid",
      "path": "password",
      "location": "body"
    }
  ]
}
```

---

# Authentication

JWT token is generated after successful login/register.

Example:

```bash
Authorization: Bearer your_jwt_token
```

---

# Folder Structure

```bash
project/
│
├── controllers/
├── models/
├── routes/
├── services/
├── middlewares/
├── db/
├── app.js
├── server.js
├── package.json
└── README.md
```

---

# Example Route Setup

## Register Route

```js
router.post('/register',[
    body('email').isEmail().withMessage('invalid email'),

    body('fullname.firstname')
    .isLength({min : 3})
    .withMessage('first must be at least 3 character long'),

    body('password')
    .isLength({min : 5})
    .withMessage('password must be at least 5 character long')

],
userController.registerUser)
```

---

## Login Route

```js
router.post('/login',[
    body('email')
    .isEmail()
    .withMessage('invalid Email'),

    body('password')
    .isLength({min : 6})
    .withMessage('password invalid')

],
userController.loginUser)
```

---

# Example Register Controller

```js
module.exports.registerUser = async (req,res,next)=>{

    const errors = validationResult(req)

    if(!errors.isEmpty()){
        return res.status(404).json({
            errors : errors.array()
        })
    }

    const {fullname , email , password} = req.body

    const hashedPassword = await userModel.hashPassword(password)

    const user = await userService.createUser({
        firstname : fullname.firstname,
        lastname : fullname.lastname,
        email,
        password : hashedPassword
    })

    const token = user.generateAuthToken()

    res.status(201).json({
        token,
        user
    })
}
```

---

# Example Login Controller

```js
module.exports.loginUser = async (req,res,next)=>{

    const errors = validationResult(req)

    if(!errors.isEmpty()){
        return res.status(400).json({
            errors : errors.array()
        })
    }

    const {email , password} = req.body;

    const user = await userModel
    .findOne({email})
    .select('+password')

    if(!user){
        return res.status(401).json({
            message : 'invalid email or password'
        })
    }

    const isMatch = await user.comparePassword(password)

    if(!isMatch){
        return res.status(401).json({
            message : 'invalid email or password'
        })
    }

    const token = user.generateAuthToken()

    res.status(200).json({
        token,
        user
    })
}
```

---

# Example User Model

```js
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({

    fullname : {
        firstname : {
            type : String,
            required : true,
            minlength : [3,'first name must be at least 3 character long']
        },

        lastname : {
            type : String,
            minlength : [3,'last name must be at least 3 character long']
        }
    },

    email : {
        type : String,
        required : true,
        unique : true,
        minlength : [5,'Email must be at 5 Character']
    },

    password : {
        type : String,
        required : true,
        select : false
    },

    socketId : {
        type : String
    }

})

userSchema.methods.generateAuthToken = function (){
    return jwt.sign({_id : this._id},process.env.JWT_SECRET)
}

userSchema.methods.comparePassword = async function (password){
    return await bcrypt.compare(password, this.password)
}

userSchema.statics.hashPassword = async function (password){
    return await bcrypt.hash(password,10)
}

const userModel = mongoose.model('User',userSchema)

module.exports = userModel
```

---

# Notes

- Passwords are hashed before saving into database
- JWT token is generated using jsonwebtoken
- Password field is hidden using `select: false`
- express-validator is used for request validation
- MongoDB is connected using Mongoose

---

# Future Improvements

- Logout API
- Protected Routes
- Refresh Tokens
- Role Based Authentication
- Email Verification
- Password Reset
- Profile Management

---

# Author

Ashish Singh