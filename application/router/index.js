const express = require('express');
const router = express.Router();
const userRouter = require('./user');   // userRouter
const quizRouter = require('./quiz');    // quizRouter

router.use(userRouter);
router.use(quizRouter);

module.exports = router;