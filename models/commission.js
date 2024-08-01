// models/commission.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commissionSchema = new Schema({
    level: {
        type: Number,
        required: true
    },
    commissionPercentage: {
        type: Number,
        required: true
    }
});

const Commission = mongoose.model('Commission', commissionSchema);

module.exports = { Commission };