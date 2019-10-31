const mongoose = require('mongoose');
const timezone = require('mongoose-timezone');
const db = require('../db-connection');
const moment = require('moment'); require('moment-timezone');
moment.tz.setDefault('Asia/Seoul');


db.on('error', (err) => {
    console.log('Error : ', err);
});

db.on('open', () => {
    console.log('Open Event');
});

const QuizScheme = mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    title: String,
    begin: Date,
    end: Date,
    choice1: String,
    choice2: String,
    result: String,
    status: Number
});

QuizScheme.plugin(timezone, {paths: ['begin', 'end']});

module.exports = mongoose.model('Quiz', QuizScheme);