const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    name: String,
    coordinates: {
        latitude: Number,
        longitude: Number
    }
}, { timestamps: true });

module.exports = mongoose.model('Location', locationSchema);
