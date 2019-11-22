'use strict';

// Express
const express = require('express');
const voteRouter = express.Router();

const indexGen = require('../modules/indexGen')
const voteModel = require('../model/vote');
const timeModule = require('../modules/time');

const crypto = require('crypto');

// 퀴즈 등록
voteRouter.post('/vote', async (req, res) => { 
    // const user = req.body.user; // For test on Postman
    const user = req.session.user; // For service
    try {
        // Request body parsing
        const hname = crypto.createHash('sha256').update(user.name).digest('hex');
        const key = crypto.createHash('sha256').update(hname + user.hpw).digest('hex');

        const vote = { 
            id      : await indexGen.generate(), 
            category: req.body.category, 
            title   : req.body.title, 
            begin   : req.body.begin, 
            end     : req.body.end,
            choice1 : req.body.choice1, 
            choice2 : req.body.choice2,
        }
        console.log(`VOTEID: ${vote.id}`);
        const result = await voteModel.setVote(key, vote);
        
        // Set timer
        timeModule.registerTimer(vote.id, vote.begin);
        timeModule.registerTimer(vote.id, vote.end);

        const data = { user, msg: result }
        res.status(200).json({data: data});

    } catch (error) {
        const data = { user, msg: '오류가 발생했습니다.' }
        console.error(`Failed to submit transaction: ${error}`);
        res.status(400).json({data: data});
    }
});

// 목록 조회
voteRouter.get('/vote', async (req, res) => {
    // const user = req.body.user; // For test on Postman
    console.log(`□□□ session in other router: ${JSON.stringify(req.session)}`);
    const user = req.session.user; // For service
    console.log(user);

    try {
        const hname = crypto.createHash('sha256').update(user.name).digest('hex');
        const key = crypto.createHash('sha256').update(hname + user.hpw).digest('hex');

        const result = await voteModel.getAllVotes(key);
        const obj = JSON.parse(result);
        const data = { user, votes: obj, msg: '조회 성공' }
        res.status(200).json({data: data});
    } catch (error) {
        const data = { user, msg: '조회 실패' }
        console.error(`Get Vote - Error: ${error}`);
        res.status(400).json({data: data});
    }
});

// 상세 조회
voteRouter.post('/vote/detail', async (req, res) => {
    // const user = req.body.user; // For test on Postman
    const user = req.session.user; // For service

    try {
        const hname = crypto.createHash('sha256').update(user.name).digest('hex');
        const key = crypto.createHash('sha256').update(hname + user.hpw).digest('hex');
        const id = req.body.id;

        const result = await voteModel.getVote(key, id);
        console.log(result);

        const obj = JSON.parse(result);
        res.status(200).json(obj);

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(400).json();
    }
});

// 투표
voteRouter.post('/vote/choose', async (req, res) => {
    // const user = req.body.user; // For test on Postman
    const user = req.session.user; // For service

    try {
        const hname = crypto.createHash('sha256').update(user.name).digest('hex');
        const key = crypto.createHash('sha256').update(hname + user.hpw).digest('hex');
        const vote = {
            id: req.body.id,
            choose: req.body.choose,
            user: user.name
        }

        const result = await voteModel.choice(key, vote); // user 정보 최신화
        const obj = JSON.parse(result);
        /* For service */
        req.session.user.token = obj.token;                        // For service
        req.session.user.votes = obj.votes;                        // For service
        req.session.user.choices = obj.choices;                    // For service
        const data = { user: req.session.user, msg: '투표 성공' }   // For service

        // /* For test on Postman */
        // let userToTransfer = user;                              // For test on Postman
        // userToTransfer.token = obj.token;                       // For test on Postman
        // userToTransfer.votes = obj.votes;                       // For test on Postman
        // userToTransfer.choices = obj.choices;                   // For test on Postman
        // const data = { user: userToTransfer, msg: '투표 성공' }  // For test on Postman

        res.status(200).json({data: data});
    } catch (error) {
        const data = { msg: '투표 실패' }
        console.error(`Failed to submit transaction: ${error}`);
        res.status(400).json({data: data});
    }
});

// 퀴즈 내역 조회
voteRouter.post('/vote/history', async (req, res) => {
    // const user = req.body.user; // For test on Postman
    const user = req.session.user; // For service

    try {
        const hname = crypto.createHash('sha256').update(user.name).digest('hex');
        const key = crypto.createHash('sha256').update(hname + user.hpw).digest('hex');
        const id = req.body.id; // vote id

        const result = await voteModel.getHistoryByVoteId(key, id);
        const obj = JSON.parse(result);
        res.status(200).json({data: obj, msg: '조회 성공'});
    } catch (error) {
        const data = { msg: '조회 실패'};
        console.error(`Failed to submit transaction: ${error}`);
        res.status(400).json({data: data});
    }
});

module.exports = voteRouter;