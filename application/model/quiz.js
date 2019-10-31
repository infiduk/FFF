const Quiz = require('./schema/quiz');

class QuizModel {
    create(quizData) {
        return new Promise(async (resolve, reject) => {
            var quiz = new Quiz({ ...quizData });
            try {
                await quiz.save();
                resolve(quiz._id);
            } catch (err) {
                reject(err);
            }
        });
    }

    findAll() {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await Quiz.find({});
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
    }
    
    updateStatus(_id) {
        return new Promise(async (resolve, reject) => {
            try {
                const doc = await Quiz.findOne({ _id });
                if( ! doc ) {
                    console.log('Cannot find document.');
                    return;
                }
                if(doc.status < 2) doc.status ++;
                const result = await doc.save();
                console.log('Update status success :', result);
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
    }
}

module.exports = new QuizModel();