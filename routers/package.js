const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const { Package } = require('../models/package'); // Adjust the path if necessary

// Create a new package
router.post('/create', async (req, res) => {
    try {
        const { amount, percentage, duration } = req.body;

        if (amount == null || percentage == null || duration == null) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        if (typeof amount !== 'number' || typeof percentage !== 'number' || typeof duration !== 'number') {
            return res.status(400).json({ success: false, message: "Invalid data types" });
        }

        const newPackage = new Package({
            amount,
            percentage,
            duration
        });

        await newPackage.save();
        res.status(201).json({ success: true, message: 'Package created successfully!', data: newPackage });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// Get all packages
router.get('/', async (req, res) => {
    try {
        const packages = await Package.find();
        res.status(200).json({ success: true, data: packages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// Get a package by ID
router.get('/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid ID format' });
        }

        const package = await Package.findById(req.params.id);

        if (!package) {
            return res.status(404).json({ success: false, message: 'Package not found' });
        }

        res.status(200).json({ success: true, data: package });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// Update a package by ID
router.put('/:id', async (req, res) => {
    try {
        const { amount, percentage, duration } = req.body;

        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid ID format' });
        }

        if (amount == null || percentage == null || duration == null) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        if (typeof amount !== 'number' || typeof percentage !== 'number' || typeof duration !== 'number') {
            return res.status(400).json({ success: false, message: "Invalid data types" });
        }

        const updatedPackage = await Package.findByIdAndUpdate(req.params.id, {
            amount,
            percentage,
            duration
        }, { new: true });

        if (!updatedPackage) {
            return res.status(404).json({ success: false, message: 'Package not found' });
        }

        res.status(200).json({ success: true, message: 'Package updated successfully!', data: updatedPackage });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// Delete a package by ID
router.delete('/:id', async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid ID format' });
        }

        const deletedPackage = await Package.findByIdAndDelete(req.params.id);

        if (!deletedPackage) {
            return res.status(404).json({ success: false, message: 'Package not found' });
        }

        res.status(200).json({ success: true, message: 'Package deleted successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

module.exports = router;
