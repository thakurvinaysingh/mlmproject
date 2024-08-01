const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'user',
        required: true
    },
    image: {
        type: String
    },
    status: {
        type: String,
        default: 'pending'
    },
    wallet:{
        type: Number,
        default: 0
    },
    packages: {
        packageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Package'
        },
        purchasedAt: {
            type: Date,
            default: Date.now
        }
    },
    leftChild: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rightChild: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    level: { type: Number, default: 0 }, // Level in the tree
    createdAt: { type: Date, default: Date.now }

});

const User = mongoose.model('User', userSchema);

module.exports = { User };