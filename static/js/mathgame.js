// Declare global variables
let questionSlot;
let optionsSlot;
let resultSlot;
let defaultResultTemplate;
let resultTemplate;

document.addEventListener("DOMContentLoaded", function () {
  // Assign values to global variables
  questionSlot = document.querySelector('[data-content="question"]');
  optionsSlot = document.querySelector('[data-content="options"]');
  resultSlot = document.querySelector('[data-content="result"]');

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
}

async function checkAnswer(index) {
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

getQuestion();