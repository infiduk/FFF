const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const url = 'mongodb://ch-4ml:knifeark7677@ds339648.mlab.com:39648/heroku_x9548w8z';
mongoose.connect(url, { useNewUrlParser: true });

var db = mongoose.connection;
module.exports = db;