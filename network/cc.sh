# chaincode install
docker exec cli peer chaincode install -n sacc -v 0.1 -p github.com/sacc
sleep 5

# chaincode instatiate
docker exec cli peer chaincode instantiate -n sacc -v 0.1 -C mychannel -c '{"Args":[]}' -P 'OR ("Org1MSP.member", "Org2MSP.member","Org3MSP.member")'
# docker exec cli peer chaincode upgrade -n sacc -v 0.2 -C mychannel -c '{"Args":[]}' -P 'OR ("Org1MSP.member", "Org2MSP.member","Org3MSP.member")'
sleep 5

# TEST FOR INSTANTIATE
echo '===================================== TEST START ====================================='

echo '---------------------------------------- USER ----------------------------------------'

# setUser
echo '□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□ User 생성 테스트 □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□'
docker exec cli peer chaincode invoke -n sacc -C mychannel -c '{"Args":["setUser", "0-0", "홍길동", "1995", "0"]}'
sleep 2
docker exec cli peer chaincode invoke -n sacc -C mychannel -c '{"Args":["setUser", "0-1", "아무개", "1995", "0"]}'
sleep 2

# getUser
echo '□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□ User 조회 테스트 □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□'
docker exec cli peer chaincode query -n sacc -C mychannel -c '{"Args":["getUser", "0-0"]}'
sleep 2
docker exec cli peer chaincode query -n sacc -C mychannel -c '{"Args":["getUser", "0-1"]}'
sleep 2

# getUserByName
echo '□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□ User 이름으로 조회 테스트 □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□'
docker exec cli peer chaincode query -n sacc -C mychannel -c '{"Args":["getUserByName", "홍길동"]}'
sleep 2
docker exec cli peer chaincode query -n sacc -C mychannel -c '{"Args":["getUserByName", "아무개"]}'
sleep 2

# getAllUsers
echo '□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□ User 전체 조회 테스트 □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□'
docker exec cli peer chaincode query -n sacc -C mychannel -c '{"Args": ["getAllUsers"]}'
sleep 2

echo '--------------------------------------------------------------------------------------'

sleep 1

echo '---------------------------------------- QUIZ ----------------------------------------'

# setQuiz
echo '□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□ Quiz 생성 테스트 □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□'
docker exec cli peer chaincode invoke -n sacc -C mychannel -c '{"Args":["setQuiz", "1-0", "0", "테스트", "2019-11-10 00:00:00", "2019-11-11 00:00:00", "박보검", "박보영"]}'
sleep 2
docker exec cli peer chaincode invoke -n sacc -C mychannel -c '{"Args":["setQuiz", "1-1", "1", "테스트", "2019-11-13 00:00:00", "2019-11-14 00:00:00", "우마", "헌터퐝"]}'
sleep 2

# getQuiz
echo '□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□ Quiz 조회 테스트 □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□'
docker exec cli peer chaincode query -n sacc -C mychannel -c '{"Args": ["getQuiz", "1-0"]}'
sleep 2
docker exec cli peer chaincode query -n sacc -C mychannel -c '{"Args": ["getQuiz", "1-1"]}'
sleep 2

# getAllQuizzes
echo '□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□ Quiz 전체 조회 테스트 □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□'
docker exec cli peer chaincode query -n sacc -C mychannel -c '{"Args": ["getAllQuizzes"]}'
sleep 2

echo '--------------------------------------------------------------------------------------'

sleep 1

echo '---------------------------------------- Etc -----------------------------------------'

# 투표 불가능 테스트
echo '□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□ 투표 불가능 테스트(투표 전) □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□'
docker exec cli peer chaincode invoke -n sacc -C mychannel -c '{"Args":["choice", "1-0", "0", "홍길동"]}'
sleep 2

# changeQuizStatus
echo '□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□ 상태 변경 테스트 □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□'
docker exec cli peer chaincode invoke -n sacc -C mychannel -c '{"Args":["changeQuizStatus", "1-0"]}'
sleep 2
docker exec cli peer chaincode invoke -n sacc -C mychannel -c '{"Args":["changeQuizStatus", "1-1"]}'
sleep 2

# choice
echo '□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□ 투표 테스트 □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□'
docker exec cli peer chaincode invoke -n sacc -C mychannel -c '{"Args":["choice", "1-0", "0", "홍길동"]}'
sleep 2
docker exec cli peer chaincode invoke -n sacc -C mychannel -c '{"Args":["choice", "1-0", "1", "아무개"]}'
sleep 2
docker exec cli peer chaincode invoke -n sacc -C mychannel -c '{"Args":["choice", "1-1", "0", "아무개"]}'
sleep 2

# 중복 투표 테스트
echo '□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□ 중복 투표 테스트 □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□'
docker exec cli peer chaincode invoke -n sacc -C mychannel -c '{"Args":["choice", "1-0", "1", "홍길동"]}'
sleep 2

# 투표 불가능 테스트(투표 종료)
echo '□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□ 투표 불가능 테스트(투표 종료) □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□'
docker exec cli peer chaincode invoke -n sacc -C mychannel -c '{"Args":["changeQuizStatus", "1-1"]}'
sleep 2
docker exec cli peer chaincode invoke -n sacc -C mychannel -c '{"Args":["choice", "1-1", "1", "홍길동"]}'
sleep 2

# getAllQuizzes
echo '□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□ 결과 - 유저 □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□'
docker exec cli peer chaincode query -n sacc -C mychannel -c '{"Args": ["getAllUsers"]}'
sleep 2

echo '□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□ 결과 - 퀴즈 □□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□□'
docker exec cli peer chaincode query -n sacc -C mychannel -c '{"Args": ["getAllQuizzes"]}'
sleep 2


echo '--------------------------------------------------------------------------------------'

echo '===================================== Test END ====================================='



# TEST FOR UPGRADE