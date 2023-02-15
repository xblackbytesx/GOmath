// Declare global variables
let questionSlot;
let optionsSlot;
let resultSlot;
let timerSlot;
let timerBar;
let defaultResultTemplate;
let resultTemplate;
let requestId;

document.addEventListener("DOMContentLoaded", function () {
  // Assign values to global variables
  questionSlot = document.querySelector('[data-content="question"]');
  optionsSlot = document.querySelector('[data-content="options"]');
  resultSlot = document.querySelector('[data-content="result"]');
  timerSlot = document.querySelector('[data-content="timer"]');
  timerBar = document.querySelector('[data-content="timebar"]');

  defaultResultTemplate = `<img src="./static/img/thinking.svg" alt="" />`;
  resultTemplate = defaultResultTemplate;
});

async function getQuestion() {
  const response = await fetch('/question');
  const question = await response.json();
  resultSlot.innerHTML = defaultResultTemplate;
  questionSlot.innerHTML = `What is ${question.num1} ${question.operation} ${question.num2}?`;

  let options = '';
  for (let i = 0; i < question.options.length; i++) {
    options += `<button id="option${i}" onclick="checkAnswer(${i})">${question.options[i]}</button>`;
  }
  optionsSlot.innerHTML = options;

  const startTime = new Date().getTime();
  const endTime = startTime + 30000;

  cancelAnimationFrame(requestId);
  startTimer(30, endTime);
}

async function checkAnswer(index) {
  // Clear the timer
  cancelAnimationFrame(requestId);

  const response = await fetch('/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ option: index }),
  });
  const result = await response.json();

  result.message === "Correct!"
    ? resultTemplate = `<h2>${result.message}</h2><img src="./static/img/correct.svg" alt="" />`
    : resultTemplate = `<h2>${result.message}</h2><img src="./static/img/incorrect.svg" alt="" />`
  resultSlot.innerHTML = resultTemplate;
  optionsSlot.innerHTML = '';
  setTimeout(getQuestion, 3000);
}

function startTimer(duration, endTime) {
  const startTime = new Date().getTime();
  let barWidth = 100;

  function updateTimer() {
    const now = new Date().getTime();
    const distance = endTime - now;
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    const percentLeft = distance / (duration * 1000);

    timerSlot.textContent = `Time remaining: ${seconds}`;

    if (distance < 0) {
      // Clear the timer and get the next question
      cancelAnimationFrame(requestId);
      getQuestion();
    }

    if (percentLeft <= 0) {
      barWidth = 0;
    } else {
      barWidth = percentLeft * 100;
    }
    timerBar.style.width = `${barWidth}%`;

    requestId = requestAnimationFrame(updateTimer);
  }

  requestId = requestAnimationFrame(updateTimer);
}


function cancelTimer() {
  cancelAnimationFrame(requestId);
  timerSlot.textContent = '';
}

getQuestion();
