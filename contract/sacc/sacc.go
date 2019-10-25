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

// 퀴즈 구조체 (World State에 담기는 정보)
type Quiz struct {
	ObjectType	 string `json:"docType"` // CouchDB의 인덱스 기능을 쓰기위한 파라미터, 이 오브젝트 타입에 만든 구조체 이름을 넣으면 인덱스를 찾을 수 있음
	Id	 	 	 string `json:"id"` 	 // 퀴즈 식별값
	Title   	 string `json:"title"` 	 // 퀴즈 제목
	Begin		 string `json:"begin"`	 // 시작 시간
	End			 string `json:"end"`	 // 종료 시간
	Choice1  	 string `json:"choice1"` // 선택지 1
	Count1	 	 string `json:"count1"`  // 선택지 1의 득표 수
	Choice2		 string `json:"choice2"` // 선택지 2
	Count2		 string `json:"count2"`	 // 선택지 2의 득표 수
	Result		 string `json:"result"`	 // 결과
	Status		 string `json:"status"`	 // 0: 생성, 1: 진행 중, 2: 종료
	Users		 string `json:"users"`	 // 유저 id 해시
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
	if fn == "setQuiz" {					// Quiz 생성
		result, err = setQuiz(stub, args)
	} else if fn == "getQuizList" {			// 종료(Status: 2)인 경우에만 Count값 Return 할 것
		result, err = getQuizList(stub) 
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
 
func setQuiz(stub shim.ChaincodeStubInterface, args []string) (string, error) {
	if len(args) != 6 {
		return "", fmt.Errorf("Incorrect arguments. Please input 6 args.")
	}

	// JSON  변환
	var quiz = Quiz {
		ObjectType: "Quiz",
		Id: 		args[0],
		Title: 		args[1],
		Begin: 		args[2],
		End: 		args[3],
		Choice1: 	args[4],
		Count1: 	"0",		// initialize
		Choice2: 	args[5],
		Count2: 	"0",		// initialize
		Result: 	"",			// initialize
		Status: 	"0",		// initialize
		Users:		"",			// initialize
	}
	// json 형식으로 변환
	quizAsBytes, _ := json.Marshal(quiz)

	err := stub.PutState(args[0], quizAsBytes)
	if err != nil {
		return "", fmt.Errorf("Failed to set asset: %s", args[0])
	}
	return string(quizAsBytes), nil
}

func getQuizList(stub shim.ChaincodeStubInterface) (string, error) {

	iter, err := stub.GetStateByRange("0", "9")
	if err != nil {
		return "", fmt.Errorf("Failed to get all keys with error: %s", err)
	}
	defer iter.Close()

	var buffer string
	buffer = "["
	comma := false
	for iter.HasNext() {
		res, err := iter.Next()
		if err != nil {
			return "", fmt.Errorf("%s", err)
		}
		if comma == true {
			buffer += ", "
		}
		quizToTransfer := Quiz{}
		err = json.Unmarshal(res.Value, &quizToTransfer)
		if err != nil {
			return "", fmt.Errorf("%s", err)
		}
		
		if quizToTransfer.Status != "2" {
			quizToTransfer.Count1 = ""
			quizToTransfer.Count2 = ""
		}

		quizJSONasBytes, _ := json.Marshal(quizToTransfer)
		buffer += string(quizJSONasBytes)
		fmt.Printf(res.Key, quizJSONasBytes)
		comma = true
	}
	buffer += "]"

	fmt.Println(buffer)

	return string(buffer), nil
}

func changeQuizStatus(stub shim.ChaincodeStubInterface, args []string) (string, error) {
	if len(args) != 2 {
		return "", fmt.Errorf("Incorrect arguments. Please input 2 args.")
	}
	id		:= args[0]
	status 	:= args[1]

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
	quizToTransfer.Status = status

	if status == "2" {
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
	return string("Status changed!"), nil
}

func choice(stub shim.ChaincodeStubInterface, args[] string) (string, error) {
	if len(args) != 3 {
		return "", fmt.Errorf("Incorrect arguments. Please input 3 args.")
	}

	id 		:= args[0]
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

	if choice == "0" {
		count, err := strconv.Atoi(quizToTransfer.Count1)
		if err != nil {
			return "", fmt.Errorf("%s", err)
		}
		count += 1
		quizToTransfer.Count1 = strconv.Itoa(count)
	} else {
		count, err := strconv.Atoi(quizToTransfer.Count2)
		if err != nil {
			return "", fmt.Errorf("%s", err)
		}
		count += 1
		quizToTransfer.Count2 = strconv.Itoa(count)
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
	return string("Choice succeed!"), nil
}

func main() {
	if err := shim.Start(new(SimpleAsset)); err != nil {
		fmt.Printf("Error starting SimpleAsset chaincode: %s", err)
	}
}