const mongoose = require('mongoose');
const timezone = require('mongoose-timezone');

const quizSchema = mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    title: String,
    begin: Date,
    end: Date,
    choice1: String,
    choice2: String,
    result: String,
    status: Number
});

quizSchema.plugin(timezone, {paths: ['begin', 'end']});

module.exports = mongoose.model('Quiz', quizSchema);