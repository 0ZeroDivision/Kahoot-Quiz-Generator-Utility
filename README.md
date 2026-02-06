# Kahoot Quiz Generator via AI

This project shows how to use **any AI chatbot** to generate quiz questions and automatically apply them to a **Kahoot Quiz** using your browser’s developer console.

---

## Overview

You can use the AI chatbot of your choice to generate questions and have them applied to a Kahoot Quiz.

The flow is simple:

1. Generate questions in a strict JSON format using AI  
2. Open the Kahoot quiz creator  
3. Open the browser console  
4. Run the provided JavaScript automation script  
5. Paste in your generated questions and let it run  

---

## Step 1: Generate Questions with AI

Generate the questions with a prompt similar to the one below in order to receive your data in the **correct JSON format**.

> **Copy & paste this prompt into your AI chatbot:**

```text
Generate 40 multiple choice questions on the French Revolution in a json format compatible with this example code:

async function runAutomation() {
  console.log("Kahoot Automation Starting...");
  // Enter your questions JSON here
  const questions = [
    {
      title: "What is the capital of France?",
      answers: ["London", "Paris", "Berlin", "Madrid"],
      correctIndex: 1
    },
    {
      title: "What is 2 + 2?",
      answers: ["3", "4", "5", "6"],
      correctIndex: 1
    },
    {
      title: "Which planet is known as the Red Planet?",
      answers: ["Venus", "Mars", "Jupiter", "Saturn"],
      correctIndex: 1
    },
    {
      title: "Who wrote 'Romeo and Juliet'?",
      answers: ["Charles Dickens", "William Shakespeare", "Mark Twain", "Jane Austen"],
      correctIndex: 1
    },
    {
      title: "What is the largest ocean on Earth?",
      answers: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
      correctIndex: 3
    }
  ];
  await waitForUserClick();
  await sleep(300);
  for (let i = 0; i < questions.length; i++) {
    console.log(`:: Creating question ${i + 1} of ${questions.length}...`);
    await buildQuestion(questions[i]);
    console.log(`[ OK ] Question ${i + 1} created!`);
    if (i < questions.length - 1) {
      await sleep(50);
      clickAddQuestion();
      await sleep(50);
      await selectQuizQuestionType();
      await sleep(100);
    }
  }
  console.log("[ DONE ] All questions created successfully!");
}
runAutomation();

Give me the full code with the new JSON questions list integrated in instead of these example question.
```

## Step 2: Open Kahoot Quiz Creator

Visit:
```text
https://create.kahoot.it/creator
```
![Kahoot Creator Page](./Image%201.png)
---
## Step 3: Open the Web Console
Inspect the page and open your browser’s developer tools, then switch to the **Console** tab.

![Web Console](./Image%202.png)
---

## Step 4: Load the Automation Script

Paste the following JavaScript into the console and press **Enter**.  
This will load the program and prepare Kahoot for automated question entry.

```text

const sleep = ms => new Promise(r => setTimeout(r, ms));
function waitForUserClick() {
  return new Promise((resolve) => {
    const titleEl = document.querySelector('[data-functional-selector="question-title__input"]');
    if (!titleEl) {
      console.error("[ ERROR ] Question title input not found. Make sure you're on a question editing page.");
      return;
    }
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #ff6b35;
      color: white;
      padding: 20px 40px;
      border-radius: 10px;
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      z-index: 999999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: pulse 2s infinite;
    `;
    overlay.innerHTML = `
      <div style="font-size: 24px; margin-bottom: 10px;">Click on the question title field below</div>
      <div style="font-size: 14px; opacity: 0.9;">Automation will start automatically after you click</div>
    `;
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { transform: translateX(-50%) scale(1); }
        50% { transform: translateX(-50%) scale(1.05); }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(overlay);
    const originalBorder = titleEl.style.border;
    const originalBoxShadow = titleEl.style.boxShadow;
    titleEl.style.border = '3px solid #ff6b35';
    titleEl.style.boxShadow = '0 0 20px rgba(255, 107, 53, 0.5)';
    titleEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const clickHandler = () => {
      console.log("[ OK ] User click detected! Starting automation...");
      document.body.removeChild(overlay);
      document.head.removeChild(style);
      titleEl.style.border = originalBorder;
      titleEl.style.boxShadow = originalBoxShadow;
      titleEl.removeEventListener('click', clickHandler);
      resolve();
    };
    titleEl.addEventListener('click', clickHandler, { once: true });
    console.log("[ IDLE ] Waiting for user to click the question title field...");
  });
}
async function humanType(el, text, delay = 60) {
  el.focus();
  const isInput = el.tagName === "INPUT" || el.tagName === "TEXTAREA";
  if (isInput) {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    ).set;
    const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value"
    ).set;
    const setter = el.tagName === "TEXTAREA" ? nativeTextAreaValueSetter : nativeInputValueSetter;
    setter.call(el, text);
    el.dispatchEvent(new InputEvent("input", { 
      bubbles: true,
      cancelable: true,
      inputType: 'insertText',
      data: text
    }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  } else if (el.isContentEditable) {
    el.innerText = text;
    el.dispatchEvent(new InputEvent("input", { 
      bubbles: true,
      inputType: 'insertText',
      data: text
    }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }
  await sleep(delay);
  el.blur();
}
function clickAddQuestion() {
  const btn =
    document.querySelector('[data-functional-selector*="add-question"]') ||
    [...document.querySelectorAll("button")].find(b =>
      /add question/i.test(b.innerText)
    );
  if (!btn) throw "Add Question button not found";
  btn.scrollIntoView({ block: "center" });
  btn.click();
}
async function selectQuizQuestionType() {
  for (let attempt = 0; attempt < 50; attempt++) {
    const quizBtn = document.querySelector('button[data-functional-selector="create-button__quiz"]');
    if (quizBtn && quizBtn.offsetParent !== null) {
      quizBtn.scrollIntoView({ block: "center" });
      quizBtn.click();
      console.log("[ OK ] Quiz button clicked");
      await sleep(200);
      return true;
    }
    await sleep(50);
  }
  console.warn("[ ERROR ] Quiz type button not found after multiple attempts");
  return false;
}
function selectCorrectAnswer(index) {
  const toggles = document.querySelectorAll(
    '[data-functional-selector="question-answer__toggle-button"]'
  );
  if (!toggles[index]) {
    throw `Correct answer toggle not found at index ${index}`;
  }
  toggles[index].click();
}
async function buildQuestion({ title, answers, correctIndex }) {
  const titleEl = document.querySelector(
    '[data-functional-selector="question-title__input"]'
  );
  if (!titleEl) throw "Question title input not found";
  await humanType(titleEl, title);
  await sleep(50);
  const answerEls = document.querySelectorAll(
    '[data-functional-selector="question-answer__input"]'
  );
  for (let i = 0; i < answers.length; i++) {
    if (!answers[i]) continue; // skip null / ""
    if (!answerEls[i]) throw `Answer input ${i} not found`;
    await humanType(answerEls[i], answers[i]);
    await sleep(50);
  }
  selectCorrectAnswer(correctIndex);
  await sleep(50);
  const form = document.querySelector('[data-functional-selector="question-form"]');
  if (form) {
    form.dispatchEvent(new Event("change", { bubbles: true }));
  }
  await sleep(100);
}
```
---

## Step 5: Paste Your Generated Questions

Finally, paste the JSON output generated by your AI chatbot (the questions array) into the console and run it.

Once loaded, the script will automatically populate your Kahoot quiz!
