/***********************
 *  LOW-LEVEL HELPERS  *
 ***********************/
const sleep = ms => new Promise(r => setTimeout(r, ms));

/**
 * Waits for user to click on the question title input field
 */
function waitForUserClick() {
  return new Promise((resolve) => {
    const titleEl = document.querySelector('[data-functional-selector="question-title__input"]');
    
    if (!titleEl) {
      console.error("[ ERROR ] Question title input not found. Make sure you're on a question editing page.");
      return;
    }
    
    // Create overlay with instructions
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
    
    // Add pulsing animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { transform: translateX(-50%) scale(1); }
        50% { transform: translateX(-50%) scale(1.05); }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(overlay);
    
    // Highlight the title field
    const originalBorder = titleEl.style.border;
    const originalBoxShadow = titleEl.style.boxShadow;
    titleEl.style.border = '3px solid #ff6b35';
    titleEl.style.boxShadow = '0 0 20px rgba(255, 107, 53, 0.5)';
    titleEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Listen for click on the title field
    const clickHandler = () => {
      console.log("[ OK ] User click detected! Starting automation...");
      
      // Remove overlay and highlight
      document.body.removeChild(overlay);
      document.head.removeChild(style);
      titleEl.style.border = originalBorder;
      titleEl.style.boxShadow = originalBoxShadow;
      
      // Remove event listener
      titleEl.removeEventListener('click', clickHandler);
      
      // Resolve the promise to continue automation
      resolve();
    };
    
    titleEl.addEventListener('click', clickHandler, { once: true });
    
    console.log("[ IDLE ] Waiting for user to click the question title field...");
  });
}

/**
 * Types text into an input or contentEditable element in a way that
 * modern frameworks like React/Vue can detect.
 */
async function humanType(el, text, delay = 60) {
  el.focus();
  
  // Detect input type: <input>/<textarea> vs contentEditable
  const isInput = el.tagName === "INPUT" || el.tagName === "TEXTAREA";
  
  if (isInput) {
    // Set the value directly using React's internal setter if available
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    ).set;
    
    const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value"
    ).set;
    
    const setter = el.tagName === "TEXTAREA" ? nativeTextAreaValueSetter : nativeInputValueSetter;
    
    // Set value all at once
    setter.call(el, text);
    
    // Dispatch input event to trigger React
    el.dispatchEvent(new InputEvent("input", { 
      bubbles: true,
      cancelable: true,
      inputType: 'insertText',
      data: text
    }));
    
    // Dispatch change event
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

/***********************
 *  KAHOOT ACTIONS     *
 ***********************/
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

async function setKahootTitleAndDescription(title, description) {
  console.log(`[ INFO ] Setting kahoot title to: "${title}"`);
  
  // Click the "Enter kahoot title…" button to open the dialog
  const titleButton = document.querySelector('.settings-button__TitleButton-sc-1mmj9ec-1');
  if (!titleButton) throw "Kahoot title button not found";
  
  titleButton.scrollIntoView({ block: "center" });
  titleButton.click();
  console.log("[ OK ] Title dialog opened");
  await sleep(500);
  
  // Find and type into the title input field that appears in the dialog
  const titleInput = document.querySelector('[data-functional-selector="dialog-information-kahoot__kahoot_title_input"]');
  
  if (!titleInput) throw "Kahoot title input not found in dialog";
  
  await humanType(titleInput, title);
  console.log("[ OK ] Title entered");
  await sleep(200);
  
  // Find and type into the description textarea
  const descriptionTextarea = document.querySelector('[data-functional-selector="dialog-information-kahoot__kahoot_description_textarea"]');
  
  if (!descriptionTextarea) throw "Kahoot description textarea not found in dialog";
  
  await humanType(descriptionTextarea, description);
  console.log("[ OK ] Description entered");
  await sleep(200);
  
  // Click the Done button
  const doneButton = document.querySelector('[data-functional-selector="dialog-information-kahoot__done-button"]');
  if (!doneButton) throw "Done button not found";
  
  doneButton.scrollIntoView({ block: "center" });
  doneButton.click();
  console.log("[ OK ] Title and description set, dialog closed");
  await sleep(5000);
  
  // Click the Save button
  const saveButton = document.querySelector('[data-functional-selector="top-bar__save-button"]');
  if (!saveButton) throw "Save button not found";
  
  saveButton.scrollIntoView({ block: "center" });
  saveButton.click();
  console.log("[ OK ] Kahoot saved");
  await sleep(500);
}

/***********************
 *  QUESTION BUILDER  *
 ***********************/
async function buildQuestion({ title, answers, correctIndex }) {
  // Title
  const titleEl = document.querySelector(
    '[data-functional-selector="question-title__input"]'
  );
  if (!titleEl) throw "Question title input not found";
  
  await humanType(titleEl, title);
  await sleep(50);
  
  // Answers
  const answerEls = document.querySelectorAll(
    '[data-functional-selector="question-answer__input"]'
  );
  for (let i = 0; i < answers.length; i++) {
    if (!answers[i]) continue; // skip null / ""
    if (!answerEls[i]) throw `Answer input ${i} not found`;
    await humanType(answerEls[i], answers[i]);
    await sleep(50);
  }
  
  // Correct answer
  selectCorrectAnswer(correctIndex);
  await sleep(50);
  
  // Trigger final form change to ensure React registers everything
  const form = document.querySelector('[data-functional-selector="question-form"]');
  if (form) {
    form.dispatchEvent(new Event("change", { bubbles: true }));
  }
  await sleep(100);
}
