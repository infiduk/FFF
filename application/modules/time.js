const quizModel = require('../model/quiz');
const moment = require('./moment');

class Time {
    // 퀴즈 상태 초기화
    async initquizStatus() {
        try {
            // '생성됨' 상태인 퀴즈 조회
            let result = await quizModel.find({status: 0});
            console.log(result);
            // result 어떻게 나오는지 보고 res 형태 결정 
            for(let i = 0; i < result.length; i++) {
                let res = result[i];
                if(this.isDatePassed(res.begin)) {
                    await quizModel.updateStatus(res._id);
                } else {
                    this.registerTimer(res._id, res.begin);
                }
            }

            result = await quizModel.find({status: 1});
            for(let i = 0; i < result.length; i++) {
                let res = result[i];
                if(this.isDatePassed(res.end)) {
                    await quizModel.updateStatus(res._id);
                } else {
                    this.registerTimer(res._id, res.end);
                }
            }
            // '퀴즈 진행 중' 상태인 퀴즈 조회
        } catch(error) {
            console.log(error);
            return;
        } 
    }

    // 경과 여부 확인
    isDatePassed(referenceDate) {
        return moment(referenceDate).isBefore(moment()) ? true : false;
    }

    // 타이머 등록
    registerTimer(quizId, referenceDate) {
        setTimeout(async () => { // 완료시간 경과 안됐으면 상태 변경 타이머 작동
            await quizModel.updateStatus(quizId);
        }, moment(referenceDate).diff(moment()));
    }
}

module.exports = new Time();