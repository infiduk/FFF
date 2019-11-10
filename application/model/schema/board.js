const mongoose = require('mongoose');
const timezone = require('mongoose-timezone');

const boardSchema = mongoose.Schema({
    id: mongoose.Schema.Types.ObjectId,
    title: String, // 
    context: String, 
    writer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // 
    recommender: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}], // 중복 추천 방지, 추천 수 계산
    term: Number, // 투표를 며칠 동안 진행할 지
    date: Date // 게시 날짜
});



module.exports = mongoose.model('Board', boardSchema);