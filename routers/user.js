const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const multer = require('multer');

const { User } = require('../models/user'); // Ensure this path is correct

// Get the JWT secret key from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

router.get('/', (req, res) => {
    console.log('Vercel verification');
    res.status(200).send('Vercel deployment is successful');
});

router.post('/register', async (req, res) => {
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
            isAdmin
        });

        await newUser.save();
        res.status(200).json({ success: true, message: 'User registered successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
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

module.exports = router;
