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

        const hname = crypto.createHash('sha256').update(name).digest('hex');
        const hpw = crypto.createHash('sha256').update(password).digest('hex');
        const key = crypto.createHash('sha256').update(hname + hpw).digest('hex');

        const user = { 
            id: await indexGen.generate(), 
            name,
            birth: req.body.birth, 
            gender: req.body.gender
        }
        console.log(`USERID: ${user.id}`);
        const result = await userModel.setUser(key, user);
        res.status(200).send(result);
    } catch (error) {
        console.error(`Failed to register user : ${error}`);
        res.status(400).send();
    }
});

// 로그인
userRouter.post('/login', async (req, res) => {
    try {
        const name = req.body.name; // Nickname
        const password = req.body.password;

        const hname = crypto.createHash('sha256').update(name).digest('hex');
        const hpw = crypto.createHash('sha256').update(password).digest('hex');
        const key = crypto.createHash('sha256').update(hname + hpw).digest('hex');

        const result = await userModel.getUserByName(key, name);
        const obj = JSON.parse(result);
        console.log("obj: " + JSON.stringify(obj));
        if (!obj) {
            res.status(400).send("로그인 실패");
        } else {
            req.session.user = {
                name: obj.name,
                birth: obj.birth,
                gender: obj.gender,
                token: obj.token,
                votes: obj.votes,
                choices: obj.choices,
                hpw
            }
            const data = { user: req.session.user }
            res.status(200).send({msg: "로그인 성공", data: data });
        }
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(400).send({msg: "로그인 실패"});
    }
});

// 회원 목록 조회 (관리자 추가하면)


module.exports = userRouter;