const mongoose = require('mongoose')

const ExerciseModel = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: [true, 'Please provide username'],
        ref: 'UserMdoel'
    },
    description: String,
    duration: Number,
    date: String
})

module.exports = mongoose.model('ExerciseModel', ExerciseModel)