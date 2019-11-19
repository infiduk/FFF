const express = require('express');
const router = express.Router();
const userRouter = require('./user');   // userRouter
const voteRouter = require('./vote');    // voteRouter

router.use(userRouter);
router.use(voteRouter);

module.exports = router;