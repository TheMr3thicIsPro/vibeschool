'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/context/AuthContext';
import { QuizWithQuestions } from '@/types/quiz';
import { submitQuizAnswers, getUserQuizSubmission } from '@/services/quizService';
import { QuizQuestion } from './QuizQuestion';

interface QuizComponentProps {
  lessonId: string;
  quiz: QuizWithQuestions;
  onComplete?: (passed: boolean) => void;
}

export const QuizComponent = ({ lessonId, quiz, onComplete }: QuizComponentProps) => {
  const { state } = useAuthStore();
  const user = state.user;
  
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);


  // Check if user has already submitted this quiz
  useEffect(() => {
    const checkExistingSubmission = async () => {
      if (!user) return;
      
      try {
        const existingSubmission = await getUserQuizSubmission(user.id, lessonId);
        if (existingSubmission) {
          setScore(existingSubmission.score);
          setIsSubmitted(true);
        }
      } catch (error) {
        console.error('Error checking existing submission:', error);
      } finally {
        setLoading(false);
      }
    };

    checkExistingSubmission();
  }, [user, lessonId]);

  const handleAnswer = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      alert('Please log in to submit the quiz');
      return;
    }

    // Validate that all required questions are answered
    for (const question of quiz.questions) {
      if (question.is_required && !answers[question.id]) {
        alert(`Please answer the required question: "${question.question_text}"`);
        return;
      }
    }

    try {
      const answerArray = quiz.questions.map(question => ({
        question_id: question.id,
        ...(question.question_type === 'multiple_choice'
          ? { selected_option_id: answers[question.id] as string }
          : { answer_text: answers[question.id] as string })
      }));

      const result = await submitQuizAnswers(user.id, lessonId, answerArray);
      
      setScore(result.score);
      setIsSubmitted(true);
      
      // Check if user passed the quiz (assuming 70% is passing)
      const quizPassed = result.score >= 70;
      if (onComplete) {
        onComplete(quizPassed);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Error submitting quiz. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="mt-8 p-6 bg-card-bg rounded-lg border border-card-border">
        <div className="text-center py-8">
          <div className="text-lg text-gray-400">Loading quiz...</div>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="mt-8 p-6 bg-card-bg rounded-lg border border-card-border">
        <div className="text-center mb-6">
          <div className="text-2xl font-bold text-white mb-2">
            Quiz Complete!
          </div>
          <div className="text-3xl font-bold text-accent-primary mb-2">
            Score: {score}%
          </div>
          <div className="text-gray-400">
            You've completed this lesson's quiz.
          </div>
        </div>
        
        <div className="space-y-6">
          {quiz.questions.map((question) => (
            <QuizQuestion
              key={question.id}
              question={question}
              onAnswer={handleAnswer}
              selectedAnswer={typeof answers[question.id] === 'string' ? answers[question.id] as string : (answers[question.id] as string[])[0] || ''}
              isSubmitted={true}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 p-6 bg-card-bg rounded-lg border border-card-border">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">{quiz.title}</h3>
        <p className="text-gray-400">{quiz.description}</p>
      </div>
      
      <div className="space-y-6">
        {quiz.questions.map((question) => (
          <QuizQuestion
            key={question.id}
            question={question}
            onAnswer={handleAnswer}
            selectedAnswer={typeof answers[question.id] === 'string' ? answers[question.id] as string : (answers[question.id] as string[])[0] || ''}
            isSubmitted={false}
          />
        ))}
      </div>
      
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleSubmit}
          className="px-8 py-3 bg-accent-primary text-black font-bold rounded-lg hover:bg-accent-primary/90 transition-colors text-lg hover-lift"
        >
          Submit Quiz
        </button>
        <button
          onClick={() => {
            // Allow user to retake the quiz
            setIsSubmitted(false);
            setScore(null);
          }}
          className="px-8 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors text-lg hover-lift"
        >
          Retake Quiz
        </button>
      </div>
    </div>
  );
};