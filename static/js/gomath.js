const GoMath = (function() {
  let questionSlot, optionsSlot, resultSlot, timerSlot, timerBar, defaultResultTemplate, resultTemplate, requestId;

  function init() {
    document.addEventListener("DOMContentLoaded", function () {
      questionSlot = document.querySelector('[data-content="question"]');
      optionsSlot = document.querySelector('[data-content="options"]');
      resultSlot = document.querySelector('[data-content="result"]');
      timerSlot = document.querySelector('[data-content="timer"]');
      timerBar = document.querySelector('[data-content="timebar"]');
      defaultResultTemplate = `<img src="./static/img/thinking.svg" alt="" />`;
      resultTemplate = defaultResultTemplate;
      getQuestion();
    });
  }

  async function getQuestion() {
    resultSlot.innerHTML = defaultResultTemplate;
    const response = await fetch('/question?forceNew=true');
    const question = await response.json();
    questionSlot.textContent = `What is ${question.num1} ${question.operation} ${question.num2}?`;
    const options = question.options.map((option, i) => `<button id="option${i}">${option}</button>`).join('');
    optionsSlot.innerHTML = options;
    optionsSlot.addEventListener('click', handleOptionClick);
    startTimer(30, new Date().getTime() + 30000);
  }

  function handleOptionClick(event) {
    if (event.target.tagName !== 'BUTTON') return;
    const index = parseInt(event.target.id.replace('option', ''));
    checkAnswer(index);
  }

  async function checkAnswer(index) {
    cancelAnimationFrame(requestId);
    optionsSlot.removeEventListener('click', handleOptionClick);
    const response = await fetch('/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ option: index }),
    });
    const result = await response.json();
    resultTemplate = result.message === "Correct!" ?
      `<h2>${result.message}</h2><img src="./static/img/correct.svg" alt="" />` :
      `<h2>${result.message}</h2><img src="./static/img/incorrect.svg" alt="" />`;
    resultSlot.innerHTML = resultTemplate;
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
    
      if (distance <= 0) {
        cancelAnimationFrame(requestId);
        resultSlot.innerHTML = "<h2>Time's up!</h2>";
        optionsSlot.innerHTML = "";
        setTimeout(getQuestion, 3000);
        return;
      }
    
      if (percentLeft <= 0) {
        barWidth = 0;
        getQuestion();
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

  return { init, checkAnswer, cancelTimer };
})();

GoMath.init();
