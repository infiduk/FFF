// Express
const express = require('express');
const userRouter = express.Router();
const crypto = require('crypto');

const indexGen = require('../modules/indexGen')
const userModel = require('../model/user');

// 회원 가입
userRouter.post('/user', async (req, res) => {
    try {
        const name = req.body.name; // Nickname
        const password = req.body.password;

        const hname = crypto.createHash('sha256').update(name).digest();
        const hpw = crypto.createHash('sha256').update(password).digest();
        const key = crypto.createHash('sha256').update(hname + hpw).digest('hex');

        const user = { 
            id: await indexGen, 
            name, birth: req.body.birth, 
            gender: req.body.gender, 
            key
        }
        const result = await userModel.create(user)
        res.status(200).send(result);
    } catch (err) {
        console.error(`Failed to register user : ${error}`);
        res.status(500).send(err);
    }
});

// 로그인
userRouter.post('/login', (req, res) => {

});

module.exports = userRouter;