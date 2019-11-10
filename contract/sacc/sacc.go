/*
 * Copyright IBM Corp All Rights Reserved
 *
 * SPDX-License-Identifier: Apache-2.0
 */

package main

import (
	"encoding/json"
	"fmt"
	"strconv" // 문자열 숫자 변환
	"strings" // 문자열 포함 검사

	"github.com/hyperledger/fabric/core/chaincode/shim"
	"github.com/hyperledger/fabric/protos/peer"
)

// 체인코드에서 발생되는 모든 데이터가 저장되는 공간
type SimpleAsset struct {
}

// 회원 클래스
type User struct {
	ObjectType	 string `json:"docType"`
	Id			 string `json:"id"`		 // 회원 식별값
	Name		 string `json:"name"`	 // 서비스에서 사용할 이름
	Birth		 string `json:"birth"`	 // 출생 년도
	Gender		 string `json:"gender"`	 // 성별
	Token		 string `json:"token"`	 // 투표권
	Quizzes	 	 string `json:"quizzes"` // 참여한 투표 id
	Choices		 string `json:"choices"` // 선택 항목
}

// 퀴즈 클래스 (World State에 담기는 정보)
type Quiz struct {
	ObjectType	 string `json:"docType"` // CouchDB의 인덱스 기능을 쓰기위한 파라미터, 이 오브젝트 타입에 만든 구조체 이름을 넣으면 인덱스를 찾을 수 있음
	Id			 string `json:"id"` 	 // 퀴즈 식별값
	Category	 string `json:"category"`// 퀴즈 종류 0: 무료 / 1: 유료
	Title   	 string `json:"title"` 	 // 퀴즈 제목
	Begin		 string `json:"begin"`	 // 시작 시간
	End			 string `json:"end"`	 // 종료 시간
	Choice1  	 string `json:"choice1"` // 선택지 1
	Count1	 	 string `json:"count1"`  // 선택지 1의 득표 수
	Choice2		 string `json:"choice2"` // 선택지 2
	Count2		 string `json:"count2"`	 // 선택지 2의 득표 수
	Result		 string `json:"result"`	 // 결과
	Status		 string `json:"status"`	 // 0: 생성, 1: 진행 중, 2: 종료
	Users		 string `json:"users"`	 // 유저 id
}

// 초기화 함수
func (t *SimpleAsset) Init(stub shim.ChaincodeStubInterface) peer.Response {
	// nil = null을 의미한다. 이는 0으로 초기화 되어 있거나 한 것이 아닌 진짜 비어있는 값이다.
	return shim.Success(nil)
}
 
// 호출할 함수를 식별하는 함수
func (t *SimpleAsset) Invoke(stub shim.ChaincodeStubInterface) peer.Response {
	// 함수 이름과, args를 분리하여 저장한다.
	fn, args := stub.GetFunctionAndParameters()

	var result string
	var err error
	if fn == "setUser" {
		result, err = setUser(stub, args)
	} else if fn == "getUser" {
		result, err = getUser(stub, args)
	} else if fn == "getUserByName" {
		result, err = getUserByName(stub, args)
	} else if fn == "getAllUsers" {
		result, err = getAllUsers(stub)
	} else if fn == "setQuiz" {				// Quiz 생성
		result, err = setQuiz(stub, args)
	} else if fn == "getQuiz" {				// 종료(Status: 2)인 경우에만 Count값 Return 할 것
		result, err = getQuiz(stub, args) 
	} else if fn == "getAllQuizzes" {		// for test
		result, err = getAllQuizzes(stub)
	} else if fn == "changeQuizStatus" {	// 시간 정보에 따라 Status 변경
		result, err = changeQuizStatus(stub, args)
	} else if fn == "choice" {				// 선택
		result, err = choice(stub, args)
	} else {
		return shim.Error("Not supported chaincode function.")
	}
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success([]byte(result))
}

/* --------------------------------------- USER --------------------------------------- */
func setUser(stub shim.ChaincodeStubInterface, args []string) (string, error) {
	if len(args) != 4 {
		return "", fmt.Errorf("Incorrect arguments. Please input 4 args.")
	}

	// 키 중복 검사
	result, _ := stub.GetState(args[0])
	if result != nil {
		return "", fmt.Errorf("This key already exist")
	}

	var user = User {
		ObjectType: "User",
		Id:			args[0],
		Name:		args[1],
		Birth:		args[2],
		Gender:		args[3],
		Token:		"10",
		Quizzes:	"",
		Choices:	"",
	}

	userAsBytes, _ := json.Marshal(user)

	err := stub.PutState(args[0], userAsBytes)
	if err != nil {
		return "", fmt.Errorf("Failed to set asset: %s", args[0]);
	}

	nameIdIndexKey, err := stub.CreateCompositeKey("name~id", []string{user.Name, user.Id})
	if err != nil {
		return "", fmt.Errorf("%s", err)
	}
	
	userIdIndexKey, err := stub.CreateCompositeKey("user~id", []string{user.ObjectType, user.Id})
	if err != nil {
		return "", fmt.Errorf("%s", err)
	}

	// value 에 비어있는 바이트 배열 생성
	value := []byte{0x00}
	
	stub.PutState(nameIdIndexKey, value)
	stub.PutState(userIdIndexKey, value)
	
	return string(userAsBytes), nil
}

func getUser(stub shim.ChaincodeStubInterface, args []string) (string, error) {
	if len(args) != 1 {
		return "", fmt.Errorf("Incorrect arguments. Please input 1 arg.")
	}
	id := args[0]
	userAsBytes, err := stub.GetState(id)
	if err != nil {
		return "", fmt.Errorf("User does not exist.")
	}

	return string(userAsBytes), nil
}

func getUserByName(stub shim.ChaincodeStubInterface, args []string) (string, error) {
	if len(args) != 1 {
		return "", fmt.Errorf("Incorrect arguments. Expecting a key")
	}
	name := args[0]
	queriedIdByNameIterator, err := stub.GetStateByPartialCompositeKey("name~id", []string{name})
	if err != nil {
		return "", fmt.Errorf("%s", err)
	}
	defer queriedIdByNameIterator.Close()

	var result []byte
	var i int
	for i = 0; queriedIdByNameIterator.HasNext(); i++ {
		res, err := queriedIdByNameIterator.Next()
		if err != nil {
			return "", fmt.Errorf("%s", err)
		}
		objectType, compositeKeyParts, err := stub.SplitCompositeKey(res.Key)
		if err != nil {
			return "", fmt.Errorf("%s", err)
		}
		returnedName := compositeKeyParts[0]
		returnedKey := compositeKeyParts[1]
		fmt.Printf("- found a key from index:%s name:%s key:%s\n", objectType, returnedName, returnedKey)

		userAsBytes, err := stub.GetState(returnedKey)
		if err != nil {
			return "", fmt.Errorf("%s", err)
		}

		result = userAsBytes
	}

	return string(result), nil
}

// 테스트 해야함
func getAllUsers(stub shim.ChaincodeStubInterface) (string, error) {
	queriedIdByUserIterator, err := stub.GetStateByPartialCompositeKey("user~id", []string{"User"})
	if err != nil {
		return "", fmt.Errorf("%s", err)
	}
	defer queriedIdByUserIterator.Close()

	var buffer string
	buffer = "["
	comma := false

	var i int
	for i = 0; queriedIdByUserIterator.HasNext(); i++ {
		res, err := queriedIdByUserIterator.Next()
		if err != nil {
			return "", fmt.Errorf("%s", err)
		}

		objectType, compositeKeyParts, err := stub.SplitCompositeKey(res.Key)
		if err != nil {
			return "", fmt.Errorf("%s", err)
		}

		returnedObjectType := compositeKeyParts[0]
		returnedId := compositeKeyParts[1]
		fmt.Printf("- found a key from index:%s name:%s key:%s\n", objectType, returnedObjectType, returnedId)
		if comma == true {
			buffer += ", "
		}

		result, err := getUser(stub, []string{returnedId})
		if err != nil {
			return "", fmt.Errorf("%s", err)
		}
		buffer += result
		comma = true
	}
	buffer += "]"
	
	return string(buffer), nil
}
/* --------------------------------------- USER --------------------------------------- */


/* --------------------------------------- QUIZ --------------------------------------- */
func setQuiz(stub shim.ChaincodeStubInterface, args []string) (string, error) {
	if len(args) != 7 {
		return "", fmt.Errorf("Incorrect arguments. Please input 8 args.")
	}

	// 키 중복 검사
	result, _ := stub.GetState(args[0])
	if result != nil {
		return "", fmt.Errorf("This key already exist")
	}

	// JSON  변환
	var quiz = Quiz {
		ObjectType: "Quiz",
		Id:			args[0],
		Category:	args[1],
		Title: 		args[2],
		Begin: 		args[3],
		End: 		args[4],
		Choice1: 	args[5],
		Count1: 	"0",
		Choice2: 	args[6],
		Count2: 	"0",
		Result: 	"",	
		Status: 	"0",
		Users:		"",	
	}
	// json 형식으로 변환
	quizAsBytes, _ := json.Marshal(quiz)

	err := stub.PutState(args[0], quizAsBytes)
	if err != nil {
		return "", fmt.Errorf("Failed to set asset: %s", args[0])
	}

	quizIdIndexKey, err := stub.CreateCompositeKey("quiz~id", []string{quiz.ObjectType, quiz.Id})
	if err != nil {
		return "", fmt.Errorf("%s", err)
	}

	value := []byte{0x00}

	stub.PutState(quizIdIndexKey, value)

	return string(quizAsBytes), nil
}

func getQuiz(stub shim.ChaincodeStubInterface, args[] string) (string, error) {
	if len(args) != 1 {
		return "", fmt.Errorf("Incorrect arguments. Please input 1 arg.")
	}
	id := args[0]
	quizAsBytes, err := stub.GetState(id)

	quizToTransfer := Quiz{}
	err = json.Unmarshal(quizAsBytes, &quizToTransfer)
	if err != nil {
		return "", fmt.Errorf("%s", err)
	}
	
	// 완료된 퀴즈인 경우
	if quizToTransfer.Status != "2" {
		quizToTransfer.Count1 = ""
		quizToTransfer.Count2 = ""
	}

	quizJSONasBytes, _ := json.Marshal(quizToTransfer)

	return string(quizJSONasBytes), nil
}

// For test (Not used)
func getAllQuizzes(stub shim.ChaincodeStubInterface) (string, error) {
	queriedIdByQuizIterator, err := stub.GetStateByPartialCompositeKey("quiz~id", []string{"Quiz"})
	if err != nil {
		return "", fmt.Errorf("%s", err)
	}
	defer queriedIdByQuizIterator.Close()

	var buffer string
	buffer = "["
	comma := false

	var i int
	for i = 0; queriedIdByQuizIterator.HasNext(); i++ {
		res, err := queriedIdByQuizIterator.Next()
		if err != nil {
			return "", fmt.Errorf("%s", err)
		}

		objectType, compositeKeyParts, err := stub.SplitCompositeKey(res.Key)
		if err != nil {
			return "", fmt.Errorf("%s", err)
		}

		returnedObjectType := compositeKeyParts[0]
		returnedId := compositeKeyParts[1]
		fmt.Printf("- found a key from index:%s name:%s key:%s\n", objectType, returnedObjectType, returnedId)
		if comma == true {
			buffer += ", "
		}

		result, err := getQuiz(stub, []string{returnedId})
		if err != nil {
			return "", fmt.Errorf("%s", err)
		}
		buffer += result
		comma = true
	}
	buffer += "]"

	return string(buffer), nil
}

func changeQuizStatus(stub shim.ChaincodeStubInterface, args []string) (string, error) {
	if len(args) != 1 {
		return "", fmt.Errorf("Incorrect arguments. Please input 1 args.")
	}
	id := args[0]

	quizAsBytes, err := stub.GetState(id)
	if err != nil {
		return "", fmt.Errorf("%s", err)
	} else if quizAsBytes == nil {
		return "", fmt.Errorf("Quiz does not exist.")
	}

	quizToTransfer := Quiz{}
	err = json.Unmarshal(quizAsBytes, &quizToTransfer)
	if err != nil {
		return "", fmt.Errorf("%s", err)
	}
	status, err := strconv.Atoi(quizToTransfer.Status)
	if err != nil {
		return "", fmt.Errorf("%s", err)
	}
	status += 1
	quizToTransfer.Status = strconv.Itoa(status)

	if quizToTransfer.Status == "2" {
		count1, err := strconv.Atoi(quizToTransfer.Count1)
		if err != nil {
			return "", fmt.Errorf("%s", err)
		}
		count2, err := strconv.Atoi(quizToTransfer.Count2)
		if err != nil {
			return "", fmt.Errorf("%s", err)
		}
		if count1 > count2 {
			quizToTransfer.Result = quizToTransfer.Choice1
		} else if count1 < count2 {
			quizToTransfer.Result = quizToTransfer.Choice2
		} else {
			quizToTransfer.Result = "Draw"
		}
	}

	quizJSONasBytes, _ := json.Marshal(quizToTransfer)
	err = stub.PutState(id, quizJSONasBytes)
	if err != nil {
		return "", fmt.Errorf("%s", err)
	}
	return string(quizToTransfer.Result), nil
}

func choice(stub shim.ChaincodeStubInterface, args[] string) (string, error) {
	if len(args) != 3 {
		return "", fmt.Errorf("Incorrect arguments. Please input 3 args.")
	}

	id		:= args[0]
	choice 	:= args[1]
	user	:= args[2]

	quizAsBytes, err := stub.GetState(id)
	if err != nil {
		return "", fmt.Errorf("%s", err)
	} else if quizAsBytes == nil {
		return "", fmt.Errorf("Quiz does not exist.")
	}

	quizToTransfer := Quiz{}
	err = json.Unmarshal(quizAsBytes, &quizToTransfer)
	if err != nil {
		return "", fmt.Errorf("%s", err)
	}

	if quizToTransfer.Status != "1" {
		return "", fmt.Errorf("This quiz is not the time to choose.")
	}

	if strings.Contains(quizToTransfer.Users, user) {
		return "", fmt.Errorf("The user has already chosen.")
	}
/* --------------------------------------------------------------- */
	userArray := []string{user}

	userAsString, err := getUserByName(stub, userArray)
	if err != nil {
		return "", fmt.Errorf("%s", err)
	} 

	userAsBytes := []byte(userAsString)

	userToTransfer := User{}
	err = json.Unmarshal(userAsBytes, &userToTransfer)
	if err != nil {
		return "", fmt.Errorf("%s", err)
	}

	if userToTransfer.Quizzes != "" {
		userToTransfer.Quizzes += ", "
	}

	if userToTransfer.Choices != "" {
		userToTransfer.Choices += ", "
	}

	if quizToTransfer.Category == "1" { // 유료 투표
		token, err := strconv.Atoi(userToTransfer.Token)
		if err != nil {
			return "", fmt.Errorf("%s", err)
		}
		token -= 1
		userToTransfer.Token = strconv.Itoa(token)
	}

	userToTransfer.Quizzes += quizToTransfer.Title

/* --------------------------------------------------------------- */

	if choice == "0" {
		count, err := strconv.Atoi(quizToTransfer.Count1)
		if err != nil {
			return "", fmt.Errorf("%s", err)
		}
		count += 1
		quizToTransfer.Count1 = strconv.Itoa(count)
		userToTransfer.Choices += quizToTransfer.Choice1
	} else {
		count, err := strconv.Atoi(quizToTransfer.Count2)
		if err != nil {
			return "", fmt.Errorf("%s", err)
		}
		count += 1
		quizToTransfer.Count2 = strconv.Itoa(count)
		userToTransfer.Choices += quizToTransfer.Choice2
	}

	if quizToTransfer.Users != "" {
		quizToTransfer.Users += ", "
	}

	quizToTransfer.Users += user

	quizJSONasBytes, _ := json.Marshal(quizToTransfer)
	err = stub.PutState(id, quizJSONasBytes)
	if err != nil {
		return "", fmt.Errorf("%s", err)
	}

	userJSONasBytes, _ := json.Marshal(userToTransfer)
	err = stub.PutState(userToTransfer.Id, userJSONasBytes)
	if err != nil {
		return "", fmt.Errorf("%s", err)
	}

/* --------------------------------------------------------------- */

	return string("Choice succeed!"), nil
}

/* --------------------------------------- QUIZ --------------------------------------- */

func main() {
	if err := shim.Start(new(SimpleAsset)); err != nil {
		fmt.Printf("Error starting SimpleAsset chaincode: %s", err)
	}
}