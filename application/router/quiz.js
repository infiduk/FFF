'use strict';

// Express
const express = require('express');
const quizRouter = express.Router();

const indexGen = require('../modules/indexGen')
const quizModel = require('../model/quiz');
const timeModule = require('../modules/time');

// 퀴즈 등록
quizRouter.post('/quiz', async (req, res) => { 
    try {
        // Request body parsing
        const user = req.session.user.name;
        const begin = req.body.begin;
        const end = req.body.end;
        const quiz = { 
            id      : await indexGen, 
            category: req.body.category, 
            title   : req.body.title, 
            begin, 
            end,
            choice1 : req.body.choice1, 
            choice2 : req.body.choice2,
        }

        const result = await quizModel.create(user, quiz);
        
        // Set timer
        timeModule.registerTimer(id, begin);
        timeModule.registerTimer(id, end);

        const data = { user: req.session.user, msg: result }
        res.status(200).json({data: data});

    } catch (error) {
        const data = { user: req.session.user, msg: '오류가 발생했습니다.' }
        console.error(`Failed to submit transaction: ${error}`);
        res.status(400).json({data: data});
    }
});

// 목록 조회
quizRouter.get('/quiz', async (req, res) => {
    try {
        const user = req.session.user.name;
        const result = await quizModel.findAll(user);
        const data = { user: req.session.user, quizzes: result, msg: '조회 성공' }
        res.status(200).json({data: data});
    } catch (error) {
        const data = { user: req.session.user, msg: '조회 실패' }
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(400).json({data: data});
    }
});

// 상세 조회
quizRouter.post('/quizDetail', async (req, res) => {
    try {
        var id = req.body.id;

        const result = await quizModel.findById(id);
        console.log(result);

        var obj = JSON.parse(result)
        res.status(200).json(obj);

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(400).json();
    }
});

module.exports = quizRouter;