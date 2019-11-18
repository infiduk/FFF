'use strict';

const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', '..', 'network', 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

class QuizModel {
    // 퀴즈 등록
    setQuiz(key, quiz) {
        return new Promise(async (resolve, reject) => {
            try {
                // Create a new file system based wallet for managing identities.
                const walletPath = path.join(process.cwd(), 'wallet');
                const wallet = new FileSystemWallet(walletPath);
                console.log(`Wallet path: ${walletPath}`);

                // Check to see if we've already enrolled the user.
                const userExists = await wallet.exists(key);
                if (!userExists) {
                    console.log('An identity for the user does not exist in the wallet');
                    console.log('Run the registerUser.js application before retrying');
                    return;
                }

                // Create a new gateway for connecting to our peer node.
                const gateway = new Gateway();
                await gateway.connect(ccp, { wallet, identity: key, discovery: { enabled: false } });

                // Get the network (channel) our contract is deployed to.
                const network = await gateway.getNetwork('mychannel');

                // Get the contract from the network.
                const contract = network.getContract('sacc');

                // Submit the specified transaction.
                await contract.submitTransaction(
                    'setQuiz', 
                    quiz.id.toString(), 
                    quiz.category.toString(), 
                    quiz.title.toString(), 
                    quiz.begin.toString(), 
                    quiz.end.toString(), 
                    quiz.choice1.toString(), 
                    quiz.choice2.toString()
                );
                console.log('Transaction has been submitted');

                // Disconnect from the gateway.
                await gateway.disconnect();
                resolve("The quiz has been successfully registered.")
            } catch (err) {
                reject(err);
            }
        });
    }

    // 퀴즈 조회
    getQuiz(key, id) {
        return new Promise(async (resolve, reject) => {
            try {
                // Create a new file system based wallet for managing identities.
                const walletPath = path.join(process.cwd(), 'wallet');
                const wallet = new FileSystemWallet(walletPath);
                console.log(`Wallet path: ${walletPath}`);

                // Check to see if we've already enrolled the user.
                const userExists = await wallet.exists(key);
                if (!userExists) {
                    console.log('An identity for the user does not exist in the wallet');
                    console.log('Run the registerUser.js application before retrying');
                    return;
                }

                // Create a new gateway for connecting to our peer node.
                const gateway = new Gateway();
                await gateway.connect(ccp, { wallet, identity: key, discovery: { enabled: false } });

                // Get the network (channel) our contract is deployed to.
                const network = await gateway.getNetwork('mychannel');

                // Get the contract from the network.
                const contract = network.getContract('sacc');

                // Evaluate the specified transaction.
                const result = await contract.evaluateTransaction('getQuiz', id.toString());
                console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
    }

    // 퀴즈 상태로 조회 
    getQuizByStatus(status) {
        return new Promise(async (resolve, reject) => {
            try {
                // Create a new file system based wallet for managing identities.
                const walletPath = path.join(process.cwd(), 'wallet');
                const wallet = new FileSystemWallet(walletPath);
                console.log(`Wallet path: ${walletPath}`);

                // Check to see if we've already enrolled the user.
                const userExists = await wallet.exists('admin');
                if (!userExists) {
                    console.log('An identity for the user admin does not exist in the wallet');
                    console.log('Run the registerUser.js application before retrying');
                    return;
                }

                // Create a new gateway for connecting to our peer node.
                const gateway = new Gateway();
                await gateway.connect(ccp, { wallet, identity: 'admin', discovery: { enabled: false } });

                // Get the network (channel) our contract is deployed to.
                const network = await gateway.getNetwork('mychannel');

                // Get the contract from the network.
                const contract = network.getContract('sacc');

                // Submit the specified transaction.
                const result = await contract.submitTransaction('changeQuizStatus', status.toString());
                console.log('Transaction has been submitted');

                // Disconnect from the gateway.
                await gateway.disconnect();
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
    }

    // 퀴즈 전체조회
    getAllQuizzes(key) {
        return new Promise(async (resolve, reject) => {
            try {
                // Create a new file system based wallet for managing identities.
                const walletPath = path.join(process.cwd(), 'wallet');
                const wallet = new FileSystemWallet(walletPath);
                console.log(`Wallet path: ${walletPath}`);

                // Check to see if we've already enrolled the user.
                const userExists = await wallet.exists(key);
                if (!userExists) {
                    console.log('An identity for the user does not exist in the wallet');
                    console.log('Run the registerUser.js application before retrying');
                    return;
                }

                // Create a new gateway for connecting to our peer node.
                const gateway = new Gateway();
                await gateway.connect(ccp, { wallet, identity: key, discovery: { enabled: false } });

                // Get the network (channel) our contract is deployed to.
                const network = await gateway.getNetwork('mychannel');

                // Get the contract from the network.
                const contract = network.getContract('sacc');

                // Evaluate the specified transaction.
                const result = await contract.evaluateTransaction('getAllQuizzes');
                console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
    }
    
    // 퀴즈 이름으로 조회
    getUserByName(key, name) {
        return new Promise(async (resolve, reject) => {
            try {
                // Create a new file system based wallet for managing identities.
                const walletPath = path.join(process.cwd(), 'wallet');
                const wallet = new FileSystemWallet(walletPath);
                console.log(`Wallet path: ${walletPath}`);

                // Check to see if we've already enrolled the user.
                const userExists = await wallet.exists(key);
                if (!userExists) {
                    console.log('An identity for the user does not exist in the wallet');
                    console.log('Run the registerUser.js application before retrying');
                    return;
                }

                // Create a new gateway for connecting to our peer node.
                const gateway = new Gateway();
                await gateway.connect(ccp, { wallet, identity: key, discovery: { enabled: false } });

                // Get the network (channel) our contract is deployed to.
                const network = await gateway.getNetwork('mychannel');

                // Get the contract from the network.
                const contract = network.getContract('sacc');
                
                // Evaluate the specified transaction.
                const result = await contract.evaluateTransaction('getUserByName', name.toString());
                console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
                resolve(result);
            } catch(err) {
                reject(err);
            }
        });
    }

    // 퀴즈 상태 변경
    changeQuizStatus(id) {
        return new Promise(async (resolve, reject) => {
            try {
                // Create a new file system based wallet for managing identities.
                const walletPath = path.join(process.cwd(), 'wallet');
                const wallet = new FileSystemWallet(walletPath);
                console.log(`Wallet path: ${walletPath}`);

                // Check to see if we've already enrolled the user.
                const userExists = await wallet.exists('admin');
                if (!userExists) {
                    console.log('An identity for the user admin does not exist in the wallet');
                    console.log('Run the registerUser.js application before retrying');
                    return;
                }

                // Create a new gateway for connecting to our peer node.
                const gateway = new Gateway();
                await gateway.connect(ccp, { wallet, identity: 'admin', discovery: { enabled: false } });

                // Get the network (channel) our contract is deployed to.
                const network = await gateway.getNetwork('mychannel');

                // Get the contract from the network.
                const contract = network.getContract('sacc');

                // Submit the specified transaction.
                await contract.submitTransaction('changeQuizStatus', id.toString());
                console.log('Transaction has been submitted');

                // Disconnect from the gateway.
                await gateway.disconnect();

                resolve(`Quiz ${id} status successfully updated`);
            } catch (err) {
                reject(err);
            }
        });
    }

    // 투표
    choice(key, quiz) {
        return new Promise(async (resolve, reject) => {
            try {
                // Create a new file system based wallet for managing identities.
                const walletPath = path.join(process.cwd(), 'wallet');
                const wallet = new FileSystemWallet(walletPath);
                console.log(`Wallet path: ${walletPath}`);

                // Check to see if we've already enrolled the user.
                const userExists = await wallet.exists(key);
                if (!userExists) {
                    console.log('An identity for the user does not exist in the wallet');
                    console.log('Run the registerUser.js application before retrying');
                    return;
                }

                // Create a new gateway for connecting to our peer node.
                const gateway = new Gateway();
                await gateway.connect(ccp, { wallet, identity: key, discovery: { enabled: false } });

                // Get the network (channel) our contract is deployed to.
                const network = await gateway.getNetwork('mychannel');

                // Get the contract from the network.
                const contract = network.getContract('sacc');

                // Submit the specified transaction.
                await contract.submitTransaction('choice', quiz.id.toString(), quiz.choose.toString(), user.toString());
                console.log('Transaction has been submitted');

                const result = await contract.evaluateTransaction('getQuiz', quiz.id.toString());
                console.log('Transaction has been evaluated');

                // Disconnect from the gateway.
                await gateway.disconnect();

                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
    }

    // 퀴즈 이력 조회
    getHistoryByQuizId(key, id) {
        return new Promise(async (resolve, reject) => {
            try {
                // Create a new file system based wallet for managing identities.
                const walletPath = path.join(process.cwd(), 'wallet');
                const wallet = new FileSystemWallet(walletPath);
                console.log(`Wallet path: ${walletPath}`);

                // Check to see if we've already enrolled the user.
                const userExists = await wallet.exists(key);
                if (!userExists) {
                    console.log('An identity for the user does not exist in the wallet');
                    console.log('Run the registerUser.js application before retrying');
                    return;
                }

                // Create a new gateway for connecting to our peer node.
                const gateway = new Gateway();
                await gateway.connect(ccp, { wallet, identity: key, discovery: { enabled: false } });

                // Get the network (channel) our contract is deployed to.
                const network = await gateway.getNetwork('mychannel');

                // Get the contract from the network.
                const contract = network.getContract('sacc');
                
                // Evaluate the specified transaction.
                const result = await contract.evaluateTransaction('getHistoryByQuizId', id.toString());
                console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
                resolve(result);
            } catch(err) {
                reject(err);
            }
        });
    }
}

module.exports = new QuizModel();