// DB Initialize
const timeModule = require('./modules/time');

// For test
const quizModel = require('./model/quiz');

// 외부 모듈 포함
const express = require('express');
const app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:false}));

// 서버 설정
const PORT = 8080;
const HOST = '0.0.0.0';

// 라우터 설정
const router = require('./router');
app.use(router);

app.get('/', (req, res)=>{
    res.send("Welcome!")
})

// server start
app.listen(PORT, HOST, async () => {
    try {
        const result = await quizModel.findAllFromLedger();
        console.log("결과: " + result);
        await timeModule.initQuizStatus();
    } catch (err) {
        console.log(err);
    }
});
console.log(`Running on http://${HOST}:${PORT}`);
