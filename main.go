package main

import (
	"encoding/json"
	"math/rand"
	"net/http"
)

type Question struct {
	Num1      int    `json:"num1"`
	Num2      int    `json:"num2"`
	Operation string `json:"operation"`
	Options   []int  `json:"options"`
	Answer    int    `json:"answer"`
}

func (q *Question) generateOptions() {
	q.Options = []int{q.Answer}
	for len(q.Options) < 4 {
		option := rand.Intn(q.Answer*2 + 1)
		if option != q.Answer {
			q.Options = append(q.Options, option)
		}
	}
}

func generateQuestion() *Question {
	num1 := rand.Intn(10)
	num2 := rand.Intn(10)
	operation := "+"
	answer := num1 + num2
	question := &Question{
		Num1:      num1,
		Num2:      num2,
		Operation: operation,
		Answer:    answer,
	}
	question.generateOptions()

	return question
}

func questionHandler(w http.ResponseWriter, r *http.Request) {
	question := generateQuestion()
	json.NewEncoder(w).Encode(question)
}

func checkAnswerHandler(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	var request struct {
		Option int `json:"option"`
	}
	json.NewDecoder(r.Body).Decode(&request)

	question := generateQuestion()
	var message string
	if question.Options[request.Option] == question.Answer {
		message = "Correct!"
	} else {
		message = "Incorrect, the answer was " + string(question.Answer)
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": message,
	})
}

func main() {
	http.Handle("/", http.FileServer(http.Dir(".")))
	http.HandleFunc("/question", questionHandler)
	http.HandleFunc("/check", checkAnswerHandler)
	http.ListenAndServe(":8080", nil)
}
