/*
* Copyright IBM Corp All Rights Reserved
*
* SPDX-License-Identifier: Apache-2.0
 */

package main

import (
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	"github.com/hyperledger/fabric/protos/peer"
)

// SimpleAsset implements a simple chaincode to manage an asset
type SimpleAsset struct {
}

type User struct {
	Index        string `json: "index"`
	LatestQuiz   string `json: "latestQuiz"` // Quiz_Index
	LatestChoice string `json: "latestChoice"`
	Token        string `json: "token"`
}

type Quiz struct {
	Index  string `json: "index"`
	Quiz1  string `json: "quiz1"`
	Count1 string `json: "count1"`
	Quiz2  string `json: "quiz2"`
	Count2 string `json: "count2"`
}

func (t *SimpleAsset) Init(stub shim.ChaincodeStubInterface) peer.Response {

	return shim.Success(nil)
}

func (t *SimpleAsset) Invoke(stub shim.ChaincodeStubInterface) peer.Response {
	// Extract the function and args from the transaction proposal
	fn, args := stub.GetFunctionAndParameters()

	var result string
	var err error
	if fn == "registerUser" {
		result, err = registerUser(stub, args)
	} else if fn == "registerQuiz" {
		result, err = registerQuiz(stub, args)
	} else if fn == "vote" { // putState(update user, update quiz)
		result, err = vote(stub, args)
	} else if fn == "getResult" { // getState
		result, err = getResult(stub)
	} else {
		return shim.Error("Not supported chaincode function.")
	}

	if err != nil {
		return shim.Error(err.Error())
	}

	// Return the result as success payload
	return shim.Success([]byte(result))
}

// Set stores the asset (both key and value) on the ledger. If the key exists,
// it will override the value with the new one
func registerUser(stub shim.ChaincodeStubInterface, args []string) (string, error) {
	if len(args) != 3 {
		return "", fmt.Errorf("Incorrect arguments. Expecting a key and a value")
	}

	var user = User{Index: args[0], LatestQuiz: args[1], LatestChoice: args[2], Token: "5"}
	userAsBytes, _ := json.Marshal(user)

	err := stub.PutState(args[0], userAsBytes)
	if err != nil {
		return "", fmt.Errorf("Failed to set asset: %s", args[0])
	}
	return string(userAsBytes), nil
}

func registerQuiz(stub shim.ChaincodeStubInterface, args []string) (string, error) {
	if len(args) != 2 {
		return "", fmt.Errorf("Incorrect arguments. Expecting a key and a value")
	}

	var quiz = Quiz{Index: args[0], Quiz1: args[1], Count1: }
}
// Get returns the value of the specified asset key
func vote(stub shim.ChaincodeStubInterface, args []string) (string, error) {
	if len(args) != 1 {
		return "", fmt.Errorf("Incorrect arguments. Expecting a key and a value")
	}
	voteValueTemp := MyVote{}
	myvote, _ := stub.GetState(args[0])
	json.Unmarshal(myvote, &voteValueTemp)
	getValue, _ := strconv.Atoi(voteValueTemp.VALUE)
	getValue++
	voteValueTemp.VALUE = strconv.Itoa(getValue)
	myvoteAsBytes, _ := json.Marshal(voteValueTemp)

	err := stub.PutState(args[0], myvoteAsBytes)
	if err != nil {
		return "", fmt.Errorf("Failed to set asset: %s", args[0])
	}
	return string(myvoteAsBytes), nil
}

// Get returns the value of the specified asset key
func voteResult(stub shim.ChaincodeStubInterface) (string, error) {

	startKey := "a"
	endKey := "z"

	iter, err := stub.GetStateByRange(startKey, endKey)
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
			buffer += ","
		}
		buffer += string(res.Value)
		fmt.Println(res.Key)
		fmt.Println(res.Value)
		comma = true
	}
	buffer += "]"

	fmt.Println(buffer)

	return string(buffer), nil
}

// main function starts up the chaincode in the container during instantiate
func main() {
	if err := shim.Start(new(SimpleAsset)); err != nil {
		fmt.Printf("Error starting SimpleAsset chaincode: %s", err)
	}
}
