const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', '..', 'network', 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

class QuizModel {
    create(quiz) {
        return new Promise(async (resolve, reject) => {
            try {
                // Create a new file system based wallet for managing identities.
                const walletPath = path.join(process.cwd(), 'wallet');
                const wallet = new FileSystemWallet(walletPath);
                console.log(`Wallet path: ${walletPath}`);

                // Check to see if we've already enrolled the user.
                const userExists = await wallet.exists(quiz.user);
                if (!userExists) {
                    console.log('An identity for the user "user1" does not exist in the wallet');
                    console.log('Run the registerUser.js application before retrying');
                    return;
                }

                // Create a new gateway for connecting to our peer node.
                const gateway = new Gateway();
                await gateway.connect(ccp, { wallet, identity: quiz.user, discovery: { enabled: false } });

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

    getAllQuizzes(user) {
        return new Promise(async (resolve, reject) => {
            try {
                // Create a new file system based wallet for managing identities.
                const walletPath = path.join(process.cwd(), 'wallet');
                const wallet = new FileSystemWallet(walletPath);
                console.log(`Wallet path: ${walletPath}`);

                // Check to see if we've already enrolled the user.
                const userExists = await wallet.exists(user);
                if (!userExists) {
                    console.log('An identity for the user does not exist in the wallet');
                    console.log('Run the registerUser.js application before retrying');
                    return;
                }

                // Create a new gateway for connecting to our peer node.
                const gateway = new Gateway();
                await gateway.connect(ccp, { wallet, identity: user, discovery: { enabled: false } });

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

    findAll() {
        return new Promise(async (resolve, reject) => {
            try {
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
    }
    
    findById(id) {
        return new Promise(async (resolve, reject) => {
            try {
                /* ----------------------------- LEDGER -----------------------------*/
                // HF connect (Wallet -> Chaincode -> Network)
                const hf = await require('../model/hf-connection');
                
                // Evaluate the specified transaction.
                const result = await hf.contract.evaluateTransaction('getQuiz', id.toString());
                // Disconnect from the gateway.
                
                // await hf.gateway.disconnect();
                console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
                /* ----------------------------- LEDGER -----------------------------*/
                resolve(result);
            } catch(err) {
                reject(err);
            }
        });
    }

    updateStatus(_id) {
        return new Promise(async (resolve, reject) => {
            try {
                /* ----------------------------- LEDGER -----------------------------*/
                // HF connect (Wallet -> Chaincode -> Network)
                const hf = await require('../model/hf-connection');
                
                // Submit
                const quizResult = await hf.contract.submitTransaction('changeQuizStatus', _id.toString());
                console.log('Transaction has been submitted');

                // Disconnect from the gateway.
                // await hf.gateway.disconnect();
                /* ----------------------------- LEDGER -----------------------------*/
                resolve(quizResult);
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new QuizModel();