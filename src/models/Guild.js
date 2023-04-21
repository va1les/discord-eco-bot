const mongoose = require('mongoose');

const guildSchema = mongoose.Schema({
    gid: String,
    shop: Array,
    comm: {type: Number, default: 10}
})

module.exports = mongoose.model('guild', guildSchema);