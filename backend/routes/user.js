const express = require('express');

const router = express.Router();
const zod = require('zod');
const { User, Account } = require('../db')
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

const { authMiddleware } = require('../middleware');

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

    await Account.create({
        userId,
        balance: 1 + Math.random() * 10000
    })

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


//user update route

const updateSchema = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
})

router.put('/', authMiddleware, async (req, res) => {
    const { success } = updateSchema.safeParse(req.body)
    if(!success) {
        return res.status(411).json({
            message :"Error while updating information"
        })
    }

    await User.updateOne(req.body, {
        id: req.userId
    })

    res.status(200).json({
        message: "Updated Successfully"
    })
})


// FindUser Route

router.get('/bulk', async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstName: {
                '$regex': filter
            }

        }, {
            lastName: {
               '$regex': filter
            }
            
        }]
    })

    res.json({
        user: users.map(user => ({
            username : user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})

module.exports = router