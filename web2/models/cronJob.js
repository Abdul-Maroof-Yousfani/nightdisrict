const mongoose = require('mongoose');

const cronJobSchema = new mongoose.Schema({
    run: { type: String }

}, { timestamps: true }
);

module.exports = mongoose.model('cronJob', cronJobSchema);