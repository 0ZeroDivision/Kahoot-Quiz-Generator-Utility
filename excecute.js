/***********************
 *  MAIN FUNCTION      *
 ***********************/
async function runAutomation(kahootTitle , kahootDescription) {
  console.log("Kahoot Automation Starting...");
  
  // Define all your questions
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
  
  // WAIT FOR USER CLICK FIRST
  await waitForUserClick();
  
  // Small delay after click to ensure the field is ready
  await sleep(300);
  
  // Loop through and create each question
  for (let i = 0; i < questions.length; i++) {
    console.log(`:: Creating question ${i + 1} of ${questions.length}...`);
    
    await buildQuestion(questions[i]);
    console.log(`[ OK ] Question ${i + 1} created!`);
    
    // If not the last question, add a new question
    if (i < questions.length - 1) {
      await sleep(50);
      clickAddQuestion();
      await sleep(50);
      await selectQuizQuestionType();
      await sleep(100);
    }
  }
  
  console.log("[ DONE ] All questions created successfully!");
  
  // Set the kahoot title, description, and save
  await sleep(500);
  await setKahootTitleAndDescription(kahootTitle, kahootDescription);
  
  console.log("[ COMPLETE ] Kahoot automation finished!");
}

// START THE AUTOMATION
// You can customize the title and description by passing them as parameters:
runAutomation(
  "General Knowledge Quiz", 
  "Test your knowledge with these fun questions about geography, math, science, literature, and more!"
);
