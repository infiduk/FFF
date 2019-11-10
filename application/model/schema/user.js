const mongoose = require('mongoose');
const timezone = require('mongoose-timezone');
const passportLocalMongoose = require('passport-local-mongoose');

// populate로 voted 치환하기
const userSchema = new mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    imgUrl: String,
    birth: { type: Date },
    gender: { type: Number, min: 1, max: 2 },
    voted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }]
});

userSchema.index({ email: 1, name: 1 })
userSchema.plugin(passportLocalMongoose, {usernameField: 'name'});
userSchema.plugin(timezone, {paths: ['birth']});

module.exports = mongoose.model('User', userSchema);