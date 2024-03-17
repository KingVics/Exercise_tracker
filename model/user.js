const mongoose = require('mongoose')

const UserModel = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please provide username'],
        unique: true
    },
    description: String,
    duration: Number,
    date: String
})

module.exports = mongoose.model('UserModel', UserModel)