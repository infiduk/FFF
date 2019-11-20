'use strict'

// Express
const express = require('express');
const boardRouter = express.Router();

const boardModel = require('../model/board');

boardRouter.post('/post', async (req, res) => {
    const user = req.body.user; // For test on Postman
    // const user = req.session.user; // For service
    const post = {
        title: req.body.title,
        context: req.body.context,
        writer: user.name
    }
    try {
        const result = await boardModel.setPost(post);
        console.log(result);
        resolve(result);
    } catch (err) {
        console.log(err);
        res.status(500).send(`err msg`);
    }
});

boardRouter.get('/post', async (req, res) => {
    try {
        const result = await boardModel.getAllPosts();
        res.status(200).send(result);
    } catch (err) {
        console.log(err);
        res.status(500).send(`err msg`);
    }
})

module.exports = boardRouter;