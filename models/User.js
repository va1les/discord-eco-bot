const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
	guildId: String,
	userId: String,
	economy: {
		balance: { type: Number, default: 50 },
		bank: { type: Number, default: 0 },
		lastWork: { type: Number, default: 0 },
		lastRob: { type: Number, default: 0 }
	}
})

module.exports = mongoose.model('users', userSchema);