const Quiz = require('./schema/quiz');

class QuizModel {
    create(quizData) {
        return new Promise(async (resolve, reject) => {
            var quiz = new Quiz({ ...quizData });
            try {
                /* ---------------------------- DATABASE ----------------------------*/
                await quiz.save();
                /* ---------------------------- DATABASE ----------------------------*/

                /* ----------------------------- LEDGER -----------------------------*/
                // HF connect (Wallet -> Chaincode -> Network)
                const hf = await require('../model/hf-connection');
                
                // Submit
                await hf.contract.submitTransaction('setQuiz', quiz._id.toString(), quiz.title, quiz.begin.toString(), quiz.end.toString(), quiz.choice1, quiz.choice2);
                console.log('Transaction has been submitted');

                // Disconnect from the gateway.
                // await hf.gateway.disconnect();
                /* ----------------------------- LEDGER -----------------------------*/
                resolve(quiz._id);
            } catch (err) {
                reject(err);
            }
        });
    }

    findAll() {
        return new Promise(async (resolve, reject) => {
            try {
                /* ---------------------------- DATABASE ----------------------------*/
                const result = await Quiz.find({});
                /* ---------------------------- DATABASE ----------------------------*/
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

    findByStatus(status) {
        return new Promise(async (resolve, reject) => {
            try {
                /* ---------------------------- DATABASE ----------------------------*/
                const result = await Quiz.find({ status });
                /* ---------------------------- DATABASE ----------------------------*/
                resolve(result);
            } catch (err) {
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

                /* ---------------------------- DATABASE ----------------------------*/
                const doc = await Quiz.findOne({ _id });
                if( ! doc ) {
                    console.log('Cannot find document.');
                    return;
                }
                if(doc.status < 2) doc.status ++;

                doc.result = quizResult;

                const result = await doc.save();
                console.log('Update status success :', result);
                /* ---------------------------- DATABASE ----------------------------*/
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new QuizModel();