const express = require('express');
const userRouter = express.Router();

const indexGen = require('../modules/indexGen')

const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', 'network', 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

// 회원 가입
userRouter.post('/user', (req, res) => {
    const id = indexGen;
    const name = req.body.name;         // Nickname
    const birth = req.body.birth;       // YYYY
    const gender = req.body.gender;     // 0: Male, 1: Female
    
    const password = req.body.password;
    
});

// 로그인
userRouter.post('/login', handleAuth);

module.exports = userRouter;