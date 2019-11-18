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
        const hname = crypto.createHash('sha256').update(name).digest();
        const key = crypto.createHash('sha256').update(hname + user.hpw).digest('hex');

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

        const result = await quizModel.setQuiz(key, quiz);
        
        // Set timer
        timeModule.registerTimer(id, begin);
        timeModule.registerTimer(id, end);

        const data = { user, msg: result }
        res.status(200).json({data: data});

    } catch (error) {
        const data = { user, msg: '오류가 발생했습니다.' }
        console.error(`Failed to submit transaction: ${error}`);
        res.status(400).json({data: data});
    }
});

// 목록 조회
quizRouter.get('/quiz', async (req, res) => {
    try {
        const user = req.session.user.name;
        const hname = crypto.createHash('sha256').update(name).digest();
        const key = crypto.createHash('sha256').update(hname + user.hpw).digest('hex');
        
        const result = await quizModel.getAllQuizzes(key);
        const data = { user, quizzes: result, msg: '조회 성공' }
        res.status(200).json({data: data});
    } catch (error) {
        const data = { user, msg: '조회 실패' }
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(400).json({data: data});
    }
});

// 상세 조회
quizRouter.post('/quiz/detail', async (req, res) => {
    try {
        const user = req.session.user.name;
        const hname = crypto.createHash('sha256').update(name).digest();
        const key = crypto.createHash('sha256').update(hname + user.hpw).digest('hex');
        const id = req.body.id;

        const result = await quizModel.getQuiz(key, id);
        console.log(result);

        const obj = JSON.parse(result);
        res.status(200).json(obj);

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(400).json();
    }
});

// 투표
quizRouter.post('/quiz/choose', async (req, res) => {
    try {
        const user = req.session.user;
        const hname = crypto.createHash('sha256').update(name).digest();
        const key = crypto.createHash('sha256').update(hname + user.hpw).digest('hex');
        const quiz = {
            id: req.body.id,
            choose: req.body.choose
        }

        const result = await quizModel.choice(key, quiz); // user 정보 최신화
        // 안되면 JSON.parse
        req.session.user.Token = result.Token;
        req.session.user.Quizzes = result.Quizzes;
        req.session.user.Choices = result.Choices;
        const data = { user: req.session.user, msg: '투표 성공' }
        res.status(200).json({data: data});
    } catch (error) {
        const data = { msg: '투표 실패' }
        console.error(`Failed to submit transaction: ${error}`);
        res.status(400).json({data: data});
    }
});

// 퀴즈 내역 조회
quizRouter.post('/quiz/history', async (req, res) => {
    try {
        const user = req.session.user;
        const hname = crypto.createHash('sha256').update(name).digest();
        const key = crypto.createHash('sha256').update(hname + user.hpw).digest('hex');
        const id = req.body.id; // quiz id

        const result = await quizModel.getHistoryByQuizId(key, id);
        const obj = JSON.parse(result);
        res.status(200).json({data: obj, msg: '조회 성공'});
    } catch (error) {
        const data = { msg: '조회 실패'};
        console.error(`Failed to submit transaction: ${error}`);
        res.status(400).json({data: data});
    }
});

module.exports = quizRouter;