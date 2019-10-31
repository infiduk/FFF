// Database
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

        // HF connect (Wallet -> Chaincode -> Network)
        const hf = await require('./hf-connection');

        // DB create
        var quizData = { title, begin, end, choice1, choice2, result: "", status: 0 }
        var id = await quizModel.create(quizData);

        // Set timer


        // Submit
        await hf.contract.submitTransaction('setQuiz', id.toString(), title, begin, end, choice1, choice2);
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await hf.gateway.disconnect();

        res.status(200).json({response: 'Transaction has been submitted'});

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(400).json(error);
    }
});

// 목록 조회
quizRouter.get('/quizzes', async (req, res) => {
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
quizRouter.get('/quiz/:id', async (req, res) => {
    try {
        var id = req.params.id;

        // HF connect (Wallet -> Chaincode -> Network)
        const hf = await require('./hf-connection');

        // Evaluate the specified transaction.
        const result = await hf.contract.evaluateTransaction('getQuiz', id.toString());

        // Disconnect from the gateway.
        await hf.gateway.disconnect();

        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

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