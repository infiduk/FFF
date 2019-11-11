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
        const begin = req.body.begin;
        const end = req.body.end;

        // DB create
        const quiz = { 
            id: await indexGen, 
            category: req.body.category, 
            title: req.body.title, 
            begin, 
            end,
            choice1: req.body.choice1, 
            choice2: req.body.choice2,
            user: req.session.user
        }

        // Set timer
        timeModule.registerTimer(id, begin);
        timeModule.registerTimer(id, end);

        res.status(200).json({response: 'Transaction has been submitted'});

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(400).json(error);
    }
});

// 목록 조회
quizRouter.get('/quiz', async (req, res) => {
    try {
        const result = await quizModel.findAll();
        console.log(result);
        res.status(200).json(result);
    } catch(error) {
        console.error(`Failed: ${error}`);
        res.status(400).json(error);
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
        res.status(400).json(`{response: ${error}`);
    }
});

// 상태 변경
// quizRo


module.exports = quizRouter;