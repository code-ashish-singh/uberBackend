# User Registration API Documentation

## Endpoint

`POST /users/register`

This endpoint is used to register a new user in the application.

---

# Description

The `/users/register` endpoint:

- Validates user input
- Hashes the password using bcrypt
- Creates a new user in MongoDB
- Generates a JWT authentication token
- Returns the created user and token

---

# Request Body

The request body must be sent in JSON format.

## Required Fields

| Field | Type | Required | Description |
|------|------|------|------|
| fullname.firstname | String | Yes | User first name (minimum 3 characters) |
| fullname.lastname | String | No | User last name |
| email | String | Yes | Valid email address |
| password | String | Yes | Password (minimum 5 characters) |

---

# Example Request

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

# Example Success Response

## Status Code: `201 Created`

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.exampletoken",
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

# Example Validation Error Response

## Status Code: `404`

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

# Example Missing Password Response

## Status Code: `404`

```json
{
  "errors": [
    {
      "type": "field",
      "msg": "password must be at least 5 character long",
      "path": "password",
      "location": "body"
    }
  ]
}
```

---

# Validation Rules

## Email
- Must be a valid email format

## First Name
- Minimum 3 characters required

## Password
- Minimum 5 characters required

---

# Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- bcryptjs
- jsonwebtoken
- express-validator

---

# Example Route Setup

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

# Example Controller

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

# Example Service

```js
module.exports.createUser = async ({
    firstname,
    lastname,
    email,
    password
})=>{

    if(!firstname || !email || !password){
        throw new Error('All fields are required')
    }

    const user = await userModel.create({
        fullname : {
            firstname,
            lastname
        },
        email,
        password
    })

    return user
}
```