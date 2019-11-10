const User = require('../model/schema/user');
const passport = require('../modules/passport');

const express = require('express');
const userRouter = express.Router();

const handleAuth = passport.authenticate('local', {
    successRedirect: '/',
    faliureRedirect: './login',
    faliureFlash: true
});

// 회원 가입
userRouter.post('/user', (req, res) => {
    console.log("진입");
    const user = {
        name: req.body.name,
        email: req.body.email,
        imgUrl: req.body.imgUrl,
        birth: req.body.birth,
        gender: req.body.gender,
        voted: []
    }
    const password = req.body.password;
    const result = User.register(user, password);

    res.status(200).send(result);
});

// 로그인
userRouter.post('/login', handleAuth);

module.exports = userRouter;