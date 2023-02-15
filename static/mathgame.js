async function getQuestion() {
  const response = await fetch('/question');
  const question = await response.json();
  document.querySelector('[data-content="result"]').innerHTML = "";
  document.querySelector('[data-content="question"]').innerHTML = `What is ${question.num1} ${question.operation} ${question.num2}?`;

  let options = '';
  for (let i = 0; i < question.options.length; i++) {
    options += `<button id="option${i}" onclick="checkAnswer(${i})">${question.options[i]}</button>`;
  }
  document.querySelector('[data-content="options"]').innerHTML = options;
}

async function checkAnswer(index) {
  const response = await fetch('/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ option: index }),
  });
  const result = await response.json();
  document.querySelector('[data-content="result"]').innerHTML = result.message;
  document.querySelector('[data-content="options"]').innerHTML = '';
  setTimeout(getQuestion, 3000);
}

getQuestion();
