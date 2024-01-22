const express = require('express');

const router = express.Router();
const zod = require('zod');
const {User} = require('../db')
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

//Signup route

const signUpSchema = zod.object({
    username: zod.string().email(),
    firstName: zod.string(),
    lastName: zod.string(),
    password: zod.string()
})

router.post('/signup', async (req, res) => {
    const { success } = signUpSchema.safeParse(req.body)
    if(!success) {
        return res.status(411).json({
            message :"Email Exists / Incorrect inputs"
        })
    }

    const existingUser = await User.findOne({
        username: req.body.username
    })

    if(existingUser) {
        return res.status(411).json({
            message: 'Email already taken/ Incorrect Inputs'
        })
    }

    const user = await User.create({
        username: req.body.username,
        password: req.body.paaword,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    })

    const userId = user._id;

    const token = jwt.sign({
        userId
    }, JWT_SECRET)

    res.status(200).json({
        message: "User created successfully",
        token: token
    })

})

// SignIn route

const signInSchema =  zod.object({
    username: zod.string().email(),
    password: zod.string()
})

router.post('/signin', async (req, res) => {
    const { success } = signInSchema.safeParse(req.body)
    if(!success) {
        return res.status(411).json({
            message :"Incorrect inputs"
        })
    }

    const user = await User.findOne({
        username: req.body.username,
        password: req.body.password,
    });

    if(user) {
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET);

        res.status(200).json({
            token: token
        })
        return
    }

    res.status(411).json({
        message: "Login Error"
    })
})


module.exports = router