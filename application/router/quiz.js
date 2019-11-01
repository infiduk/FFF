// Database
const timeModule = require('../modules/time');
const quizModel = require('../model/quiz');

// Express
const express = require('express');
const quizRouter = express.Router();

quizRouter.post('/quiz', async (req, res) => {
    try {
        // Request body parsing
        var title = req.body.title;
        var begin = req.body.begin;
        var end = req.body.end;
        var choice1 = req.body.choice1;
        var choice2 = req.body.choice2;

        // DB create
        var quizData = { title, begin, end, choice1, choice2, result: "", status: 0 }
        var id = await quizModel.create(quizData);

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