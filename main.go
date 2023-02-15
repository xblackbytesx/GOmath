package main

import (
    "encoding/json"
    "fmt"
    "math/rand"
    "net/http"
)

var sessionStore = make(map[string]*Session)

type Session struct {
    ID              string
    CurrentQuestion *Question
}

type Question struct {
    Num1      int    `json:"num1"`
    Num2      int    `json:"num2"`
    Operation string `json:"operation"`
    Options   []int  `json:"options"`
    Answer    int    `json:"answer"`
    Time      int    `json:"time"`
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
        Time:      30, // set timer to 30 seconds
    }
    question.generateOptions()
    return question
}

func (s *Session) GetQuestion(forceNew bool) *Question {
    if forceNew || s.CurrentQuestion == nil {
        s.CurrentQuestion = generateQuestion()
    }
    return s.CurrentQuestion
}

func (s *Session) CheckAnswer(option int) string {
    currentQuestion := s.GetQuestion(false)
    if currentQuestion.Options[option] == currentQuestion.Answer {
        message := "Correct!"
        s.CurrentQuestion = generateQuestion()
        return message
    } else {
        message := fmt.Sprintf("Incorrect, the answer was %d", currentQuestion.Answer)
        s.CurrentQuestion = generateQuestion()
        return message
    }
}

func getSessionID(w http.ResponseWriter, r *http.Request) string {
    cookie, err := r.Cookie("session_id")
    if err != nil || cookie.Value == "" {
        // generate new session ID if no cookie is present or the cookie is empty
        sessionID := generateSessionID()
        http.SetCookie(w, &http.Cookie{
            Name:  "session_id",
            Value: sessionID,
        })
        return sessionID
    } else {
        return cookie.Value
    }
}

func generateSessionID() string {
    // generate a random 16-character string for the session ID
    b := make([]byte, 16)
    rand.Read(b)
    return fmt.Sprintf("%x", b)
}

func questionHandler(w http.ResponseWriter, r *http.Request) {
    sessionID := getSessionID(w, r)
    session, ok := sessionStore[sessionID]
    if !ok {
        // create new session if one does not exist
        session = &Session{
            ID: sessionID,
        }
        sessionStore[sessionID] = session
    }
    forceNew := r.URL.Query().Get("forceNew") == "true"
    currentQuestion := session.GetQuestion(forceNew)
    json.NewEncoder(w).Encode(currentQuestion)
}

func checkAnswerHandler(w http.ResponseWriter, r *http.Request) {
    sessionID := getSessionID(w, r)
    session, ok := sessionStore[sessionID]
    if !ok {
        // create new session if one does not exist
        session = &Session{
            ID: sessionID,
        }
        sessionStore[sessionID] = session
    }
    forceNew := r.URL.Query().Get("forceNew") == "true"
    defer r.Body.Close()
    var request struct {
        Option int `json:"option"`
    }
    json.NewDecoder(r.Body).Decode(&request)

    message := session.CheckAnswer(request.Option)
    currentQuestion := session.GetQuestion(forceNew)
    json.NewEncoder(w).Encode(map[string]interface{}{
        "message":  message,
        "question": currentQuestion,
    })
}

func main() {
    http.Handle("/", http.FileServer(http.Dir("./dist")))
    http.HandleFunc("/question", questionHandler)
    http.HandleFunc("/check", checkAnswerHandler)
    http.ListenAndServe(":8080", nil)
}