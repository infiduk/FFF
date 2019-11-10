// For test
// const quizModel = require('./model/quiz');

// DB Initialize
require('./model/db-connection')
const timeModule = require('./modules/time');

// 외부 모듈 포함
const express = require('express');
const session = require('express-session')
const app = express();
const bodyParser = require('body-parser');
const passport = require('./modules/passport');
const mongoose = require('mongoose');
const connectMongo = require('connect-mongo');
const sessionStore = connectMongo(session);

// 모듈
app.use(bodyParser.urlencoded({extended:false}));
app.use(passport.initialize());
app.use(passport.session());
app.use(session({
    secret: 'secretK',
    store: new sessionStore({ mongooseConnection: mongoose.connection }),
    resave: false,
    saveUninitialized: true
}));

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
        await timeModule.initQuizStatus();
    } catch (err) {
        console.log(err);
    }
});
console.log(`Running on http://${HOST}:${PORT}`);
