package main

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
)

var currentQuestion *Question

type Question struct {
	Num1      int    `json:"num1"`
	Num2      int    `json:"num2"`
	Operation string `json:"operation"`
	Options   []int  `json:"options"`
	Answer    int    `json:"answer"`
}

func (q *Question) generateOptions() {
	q.Options = make([]int, 4)
	q.Options[0] = q.Answer
	for i := 1; i < 4; i++ {
		option := rand.Intn(q.Answer*2 + 1)
		if option == q.Answer {
			i--
		} else {
			q.Options[i] = option
		}
	}
	rand.Shuffle(len(q.Options), func(i, j int) {
		q.Options[i], q.Options[j] = q.Options[j], q.Options[i]
	})
}

func generateQuestion() *Question {
	num1 := rand.Intn(100)
	num2 := rand.Intn(100)
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
	if currentQuestion == nil {
		currentQuestion = generateQuestion()
	}
	json.NewEncoder(w).Encode(currentQuestion)
}

func checkAnswerHandler(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	var request struct {
		Option int `json:"option"`
	}
	json.NewDecoder(r.Body).Decode(&request)

	var message string
	if currentQuestion.Options[request.Option] == currentQuestion.Answer {
		message = "Correct!"
	} else {
		message = fmt.Sprintf("Incorrect, the answer was %d", currentQuestion.Answer)
	}

	// generate a new question for the next round
	currentQuestion = generateQuestion()

	json.NewEncoder(w).Encode(map[string]string{
		"message": message,
	})
}

func main() {
	http.Handle("/", http.FileServer(http.Dir("./dist")))
	http.HandleFunc("/question", questionHandler)
	http.HandleFunc("/check", checkAnswerHandler)
	http.ListenAndServe(":8080", nil)
}
