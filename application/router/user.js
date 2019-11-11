'use strict';

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
            name,
            birth: req.body.birth, 
            gender: req.body.gender
        }
        const result = await userModel.create(user, key)
        res.status(200).send(result);
    } catch (error) {
        console.error(`Failed to register user : ${error}`);
        res.status(400).send();
    }
});

// 로그인
userRouter.post('/login', (req, res) => {
    try {
        const name = req.body.name; // Nickname
        const password = req.body.password;

        const hname = crypto.createHash('sha256').update(name).digest();
        const hpw = crypto.createHash('sha256').update(password).digest();
        const key = crypto.createHash('sha256').update(hname + hpw).digest('hex');

        const result = await userModel.findone(key, name);
        if (!result) {
            res.status(200).send("로그인 실패");
        } else {
            req.session.user = {
                name: result.Name,
                birth: result.Birth,
                gender: result.Gender,
                token: result.Token,
                quizzes: result.Quizzes,
                choices: result.Choices
            }
            const data = { user: req.session.user }
            res.status(200).send({msg: "로그인 성공", data: data });
        }
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(400).send({msg: "로그인 실패"});
    }
});

// 회원 목록 조회 (나중에)


module.exports = userRouter;