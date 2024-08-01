const mongoose = require('mongoose');

const packageRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    packageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
        required: true
    },
    status: {
        type: String,
        default: 'pending'
    },
    createdAt: { type: Date, default: Date.now }
});

const PackageRequest = mongoose.model('PackageRequest', packageRequestSchema);

module.exports = { PackageRequest };
