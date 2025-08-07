// components/QuizComponent.jsx
import React, { useState, useEffect } from 'react';

const QuizComponent = ({ quizData, onQuizComplete }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});

  // This effect checks if the quiz is complete after every selection
  useEffect(() => {
    // Check if all questions have been answered
    if (quizData.length > 0 && Object.keys(selectedAnswers).length === quizData.length) {
      // If so, call the callback function after a short delay
      setTimeout(() => {
        onQuizComplete();
      }, 1500); // 1.5-second delay to let user see the result
    }
  }, [selectedAnswers, quizData, onQuizComplete]);


  const handleOptionSelect = (questionIndex, selectedOption) => {
    if (selectedAnswers[questionIndex] !== undefined) {
      return; // Already answered
    }
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: selectedOption,
    }));
  };

  return (
    // We remove the outer div to make it fit nicely inside the chat bubble
    <div className="space-y-6">
      <h3 className="font-bold text-xl mb-4">✨ Quiz Time! ✨</h3>
      {quizData.map((quiz, index) => {
        const hasAnswered = selectedAnswers[index] !== undefined;
        
        return (
          <div key={index}>
            <h2 className="font-semibold text-lg mb-4">{index + 1}. {quiz.question}</h2>
            <div className="space-y-2">
              {quiz.options.map((option, i) => {
                const isSelected = selectedAnswers[index] === option;
                const isCorrect = quiz.answer === option;

                let optionBgClass = 'bg-gray-800 hover:bg-gray-700'; // Default
                if (hasAnswered) {
                  if (isCorrect) {
                    optionBgClass = 'bg-green-500 text-white'; // Correct answer
                  } else if (isSelected) {
                    optionBgClass = 'bg-red-500 text-white'; // Incorrectly selected answer
                  } else {
                    optionBgClass = 'bg-gray-800 opacity-60'; // Dim other options
                  }
                }

                return (
                  <div
                    key={i}
                    onClick={() => handleOptionSelect(index, option)}
                    className={`p-3 border border-gray-600 rounded cursor-pointer transition ${optionBgClass}`}
                  >
                    {option}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QuizComponent;