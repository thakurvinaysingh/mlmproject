const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const verifyToken = require('../routers/jwt');
const mongoose = require('mongoose');
const { calculateAndAddDailyBenefits, addUser } = require('../utils');
const { User } = require('../models/user'); // Ensure this path is correct
const {Package} = require('../models/package');
const { populate } = require("dotenv");
// Get the JWT secret key from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

router.get('/', (req, res) => {
    console.log('Vercel verification');
    res.status(200).json('Vercel deployment is successful');
});

router.post('/admin', async (req, res) => {
   
    try {
        const { name, email, phone, isAdmin, password, cpassword } = req.body;

        if (password !== cpassword) {
            return res.status(400).json({ success: false, message: "Passwords do not match" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email is already registered' });
        }

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            isAdmin,
        //    masteruserID: req.user ? req.user.userId : null //  send to id.
        });

        await newUser.save();
        res.status(200).json({ success: true, message: 'User registered successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

router.post('/register', verifyToken, async (req, res) => {
    const adminId = req.user.userId;
    const { name, email, phone, isAdmin, password, cpassword, method } = req.body;

    const chosenMethod = method || 'Any';

    if (password !== cpassword) {
        return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email is already registered' });
        }

        const newUser = {
            name,
            email,
            password: hashedPassword,
            phone,
            isAdmin,
        };

        console.log('Calling addUserDFS');
        const createdUser = await addUser(adminId, newUser, chosenMethod);
        res.status(201).json(createdUser);
    } catch (err) {
        console.error('Error in /register route:', err.message);
        res.status(500).json({ error: 'Error registering user' });
    }
});



router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Password does not match' });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                name: user.name,
                isAdmin: user.isAdmin,
                email: user.email,
                phone: user.phone
            },
            JWT_SECRET,
            {
                expiresIn: '24h'
            }
        );

        res.status(200).json({
            success: true,
            message: "User logged in successfully!",
            userId: user._id,
            name: user.name,
            isAdmin: user.isAdmin,
            email: user.email,
            phone: user.phone,
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// calculating the amount of benifits 
router.get('/benefit/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await calculateAndAddDailyBenefits(userId);
        res.status(200).json(result);
    } catch (err) {
        console.error('Error in /benefit/:userId route:', err);
        res.status(500).json({ error: err.message });
    }
});

// router.post("/commission",verifyToken, async (req, res) => {
//     const userID  = req.user.userId;
   
//     try {
       
//         const  user = await User.findById(userID).populate({
//             path: 'masteruserID',
//             populate: {
//                 path: 'masteruserID',
//                 populate: {
//                     path: 'masteruserID',
//                     populate:{
//                         path: 'masteruserID',
//                         populate:{
//                             path: 'masteruserID',
//                         } 
//                     }
//                 }
//             }
//         });

      

//         const level5 = user.masteruserID._id;
//         const level4= user.masteruserID.masteruserID._id;
//         const level3 = user.masteruserID.masteruserID.masteruserID._id;
//         const level2 = user.masteruserID.masteruserID.masteruserID.masteruserID._id
//         const level1 = user.masteruserID.masteruserID.masteruserID.masteruserID.masteruserID._id

//         // Calculate commissions by the model , level and percentage
    
 
//         res.status(200).json({
//             message: 'Commission processed successfully',
           
//         });
//     } catch (error) {
//         console.error('Error processing transaction:', error.message);
//         res.status(500).json({ message: 'An error occurred while processing the transaction' });
//     }
//     //

// });

module.exports = router;
