const express = require('express');
const router = express.Router();
const { User } = require('../models/user');
const { Package } = require('../models/package');
const { PackageRequest } = require('../models/packageRequest');

// Create Package Request
router.post('/package-requests', async (req, res) => {
    const { userId, packageId } = req.body;

    try {
        const user = await User.findById(userId);
        const pkg = await Package.findById(packageId);

        if (!user) return res.status(404).json('User not found.');
        if (!pkg) return res.status(404).json('Package not found.');

        const packageRequest = new PackageRequest({
            userId: user._id,
            packageId: pkg._id
        });

        await packageRequest.save();
        res.status(201).json(packageRequest);
    } catch (err) {
        res.status(500).json('Server error.');
    }
});

// Get All Package Requests
router.get('/package-requests', async (req, res) => {
    try {
        const packageRequests = await PackageRequest.find().populate('userId packageId');
        res.status(200).json(packageRequests);
    } catch (err) {
        res.status(500).json('Server error.');
    }
});

// Get Package Request by ID
router.get('/package-requests/:id', async (req, res) => {
    try {
        const packageRequest = await PackageRequest.findById(req.params.id).populate('userId packageId');

        if (!packageRequest) return res.status(404).send('Package request not found.');

        res.status(200).json(packageRequest);
    } catch (err) {
        res.status(500).json('Server error.');
    }
});

// Update Package Request only Admin
router.put('/package-requests/:id', async (req, res) => {
    const { status } = req.body;

    try {
        const packageRequest = await PackageRequest.findById(req.params.id);

        if (!packageRequest) return res.status(404).send('Package request not found.');

        // Update only the status
        if (status) packageRequest.status = status;

        await packageRequest.save();
        res.status(200).json(packageRequest);
    } catch (err) {
        res.status(500).json('Server error.');
    }
});

// Delete Package Request only Admin 
router.delete('/package-requests/:id', async (req, res) => {
    try {
        const packageRequest = await PackageRequest.findById(req.params.id);

        if (!packageRequest) return res.status(404).send('Package request not found.');

        await packageRequest.remove();
        res.status(200).json('Package request deleted successfully.');
    } catch (err) {
        res.status(500).json('Server error.');
    }
});


// Admin Approving the Package
router.post('/approve-package', async (req, res) => {
    const { requestId } = req.body;

    try {
        const packageRequest = await PackageRequest.findById(requestId).populate('userId packageId');

        if (!packageRequest) {
            return res.status(404).json('Package request not found.');
        }

        if (packageRequest.status !== 'pending') {
            return res.status(400).json('Package request already processed.');
        }

        const user = packageRequest.userId;
        const pkg = packageRequest.packageId;

        if (!user || !pkg) {
            return res.status(400).json('User or Package not found.');
        }
        // Set the user's package to the new package
        user.package = {
            packageId: pkg._id,
            purchasedAt: new Date()
        }; 
        // Update user's packages multple  user
        // user.packages.push({
        //     packageId: pkg._id,
        //     purchasedAt: new Date()
        // });

      

        // Update request status  // update user status
        packageRequest.status = 'approved';
        user.status = 'active';
        
        await user.save();
        await packageRequest.save();

        res.status(200).json('Package approved and activated successfully.');
    } catch (err) {
        res.status(500).send('Server error.');
    }
});



module.exports = router;
