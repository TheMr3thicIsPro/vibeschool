import { useState } from 'react';
import { QuizQuestion as QuizQuestionType, QuizOption } from '@/types/quiz';

interface QuizQuestionProps {
  question: QuizQuestionType & {
    options?: QuizOption[];
  };
  onAnswer: (questionId: string, answer: string | string[]) => void;
  selectedAnswer?: string | string[];
  isSubmitted?: boolean;
}

export const QuizQuestion = ({ 
  question, 
  onAnswer, 
  selectedAnswer, 
  isSubmitted 
}: QuizQuestionProps) => {
  const [shortAnswer, setShortAnswer] = useState<string>(
    typeof selectedAnswer === 'string' ? selectedAnswer : ''
  );

  const handleMultipleChoiceChange = (optionId: string) => {
    if (!isSubmitted) {
      onAnswer(question.id, optionId);
    }
  };

  const handleShortAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isSubmitted) {
      const value = e.target.value;
      setShortAnswer(value);
      onAnswer(question.id, value);
    }
  };

  return (
    <div className="mb-8 p-6 bg-card-bg rounded-lg border border-card-border">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0 mt-1">
          <div className="w-6 h-6 rounded-full bg-accent-primary/20 flex items-center justify-center">
            <span className="text-xs font-bold text-accent-primary">{question.order_index + 1}</span>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-white text-lg mb-3">{question.question_text}</h3>
          
          {question.question_type === 'multiple_choice' ? (
            <div className="space-y-3">
              {question.options?.map((option) => (
                <div 
                  key={option.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSubmitted 
                      ? option.is_correct 
                        ? 'border-green-500 bg-green-900/20' 
                        : selectedAnswer === option.id && !option.is_correct
                          ? 'border-red-500 bg-red-900/20'
                          : 'border-card-border'
                      : selectedAnswer === option.id
                        ? 'border-accent-primary bg-accent-primary/10'
                        : 'border-card-border hover:border-accent-primary/50'
                  }`}
                  onClick={() => handleMultipleChoiceChange(option.id)}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${
                      isSubmitted 
                        ? option.is_correct 
                          ? 'border-green-500 bg-green-500' 
                          : selectedAnswer === option.id && !option.is_correct
                            ? 'border-red-500 bg-red-500'
                            : 'border-gray-500'
                        : selectedAnswer === option.id
                          ? 'border-accent-primary bg-accent-primary'
                          : 'border-gray-500'
                    }`}>
                      {isSubmitted && option.is_correct && (
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {isSubmitted && selectedAnswer === option.id && !option.is_correct && (
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className={
                      isSubmitted && option.is_correct 
                        ? 'text-green-400' 
                        : isSubmitted && selectedAnswer === option.id && !option.is_correct
                          ? 'text-red-400'
                          : 'text-gray-300'
                    }>
                      {option.option_text}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <textarea
                value={isSubmitted ? (selectedAnswer ?? '') : shortAnswer}
                onChange={handleShortAnswerChange}
                disabled={isSubmitted}
                placeholder="Type your answer here..."
                className={`w-full p-3 rounded-lg border bg-card-bg text-white ${
                  isSubmitted 
                    ? 'border-gray-600 bg-gray-800/50' 
                    : 'border-card-border focus:border-accent-primary focus:ring-1 focus:ring-accent-primary'
                }`}
                rows={4}
              />
              {isSubmitted && selectedAnswer && (
                <div className="mt-2 text-sm text-green-400">
                  ✓ Your answer has been recorded
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {isSubmitted && question.question_type === 'multiple_choice' && (
        <div className="mt-3 text-sm">
          {selectedAnswer && typeof selectedAnswer === 'string' && !question.options?.some(o => o.id === selectedAnswer) && (
            <div className="text-yellow-400">You didn't select an answer for this question.</div>
          )}
        </div>
      )}
    </div>
  );
};