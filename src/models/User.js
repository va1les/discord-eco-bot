const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    gid: String,
    uid: String,
    balance: { type: Number, default: 0 },
    bank: { type: Number, default: 0 },
    work: { type: Number, default: 0 },
    rob: { type: Number, default: 0 },
    timely: { type: Number, default: 0 },
    daily: { type: Number, default: 0 },
    weekly: { type: Number, default: 0 },
})

module.exports = mongoose.model('user', userSchema);