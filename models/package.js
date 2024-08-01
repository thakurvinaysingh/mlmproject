const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    percentage: { type: Number, required: true },
    duration: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Package = mongoose.model('Package', packageSchema);

module.exports = { Package };