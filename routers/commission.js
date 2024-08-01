// routers/commissions.js
const express = require('express');
const router = express.Router();
const {Commission} = require('../models/commission');

// Get all commissions
router.get('/', async (req, res) => {
    try {
        const commissions = await Commission.find();
        res.json(commissions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new commission
router.post('/', async (req, res) => {
    const commission = new Commission({
        level: req.body.level,
        commissionPercentage: req.body.commissionPercentage
    });

    try {
        const newCommission = await commission.save();
        res.status(201).json(newCommission);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get a commission by ID
router.get('/:id', async (req, res) => {
    try {
        const commission = await Commission.findById(req.params.id);
        if (!commission) return res.status(404).json({ message: 'Commission not found' });
        res.json(commission);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update a commission
router.put('/:id', async (req, res) => {
    try {
        const commission = await Commission.findById(req.params.id);
        if (!commission) return res.status(404).json({ message: 'Commission not found' });

        commission.level = req.body.level;
        commission.commissionPercentage = req.body.commissionPercentage;

        const updatedCommission = await commission.save();
        res.json(updatedCommission);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a commission
router.delete('/:id', async (req, res) => {
    try {
        const commission = await Commission.findById(req.params.id);
        if (!commission) return res.status(404).json({ message: 'Commission not found' });

        await commission.remove();
        res.json({ message: 'Commission deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
