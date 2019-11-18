const quizModel = require('../model/quiz');
const moment = require('./moment');

class Time {
    // 퀴즈 상태 초기화
    async initQuizStatus() {
        try {
            // '생성됨' 상태인 퀴즈 조회
            let result = await quizModel.getQuizByStatus("0");
            let obj = JSON.parse(result);
            for(let i = 0; i < obj.length; i++) {
                let res = obj[i];
                console.log("0: " + JSON.stringify(res));
                if(this.isDatePassed(res.begin)) {
                    await quizModel.changeQuizStatus(res.id);
                } else {
                    this.registerTimer(res.id, res.begin);
                }
            }

            // '퀴즈 진행 중' 상태인 퀴즈 조회
            result = await quizModel.getQuizByStatus("1");
            obj = JSON.parse(result);
            for(let i = 0; i < obj.length; i++) {
                let res = obj[i];
                console.log("1: " + JSON.stringify(res));
                if(this.isDatePassed(res.end)) {
                    await quizModel.changeQuizStatus(res.id);
                } else {
                    this.registerTimer(res.id, res.end);
                }
            }
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
    registerTimer(id, referenceDate) {
        setTimeout(async () => { // 완료시간 경과 안됐으면 상태 변경 타이머 작동
            await quizModel.changeQuizStatus(id);
        }, moment(referenceDate).diff(moment()));
    }
}

module.exports = new Time();