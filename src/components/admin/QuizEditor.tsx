'use client';

import { useState } from 'react';
import { QuizWithQuestions } from '@/types/quiz';

interface QuizEditorProps {
  quiz: QuizWithQuestions | null;
  onSave: (quiz: QuizWithQuestions) => void;
  onCancel: () => void;
}

export const QuizEditor = ({ quiz, onSave, onCancel }: QuizEditorProps) => {
  // Define a temporary question type for editing
  type EditingQuestion = {
    id: string;
    lesson_id: string;
    question_text: string;
    question_type: 'multiple_choice' | 'short_answer';
    order_index: number;
    is_required: boolean;
    created_at: string;
    updated_at: string;
    options?: {
      id: string;
      question_id: string;
      option_text: string;
      is_correct: boolean;
      order_index: number;
      created_at: string;
      updated_at: string;
    }[];
  };

  type EditingQuiz = Omit<QuizWithQuestions, 'questions'> & {
    questions: EditingQuestion[];
  };

  const [quizData, setQuizData] = useState<EditingQuiz>(
    quiz ? {
      ...quiz,
      questions: quiz.questions.map(q => ({
        ...q,
        lesson_id: quiz.lesson_id
      }))
    } : {
      id: '',
      lesson_id: '',
      title: 'Knowledge Check',
      description: 'Test your understanding of this lesson.',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      questions: []
    }
  );

  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    question_type: 'multiple_choice' as 'multiple_choice' | 'short_answer',
    is_required: true,
    order_index: 0,
    options: [{ option_text: '', is_correct: false, order_index: 0 }]
  });

  const handleAddQuestion = () => {
    const newQuestionObj: EditingQuestion = {
      id: `new-${Date.now()}`,
      lesson_id: quizData.lesson_id,
      question_text: newQuestion.question_text,
      question_type: newQuestion.question_type,
      is_required: newQuestion.is_required,
      order_index: quizData.questions.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      options: newQuestion.question_type === 'multiple_choice' ?
        newQuestion.options.map((opt, idx) => ({
          id: `opt-${Date.now()}-${idx}`,
          question_id: `new-${Date.now()}`,
          option_text: opt.option_text,
          is_correct: opt.is_correct,
          order_index: idx,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })) : undefined
    };

    setQuizData({
      ...quizData,
      questions: [...quizData.questions, newQuestionObj]
    });

    // Reset form
    setNewQuestion({
      question_text: '',
      question_type: 'multiple_choice',
      is_required: true,
      order_index: 0,
      options: [{ option_text: '', is_correct: false, order_index: 0 }]
    });
  };

  const handleRemoveQuestion = (index: number) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions.splice(index, 1);
    setQuizData({
      ...quizData,
      questions: updatedQuestions.map((q, i) => ({ ...q, order_index: i }))
    });
  };

  const handleAddOption = (questionIndex: number) => {
    const updatedQuestions = [...quizData.questions];
    const question = updatedQuestions[questionIndex];
    if (question.question_type === 'multiple_choice') {
      const options = question.options || [];
      question.options = [
        ...options,
        { 
          id: `opt-${Date.now()}-${Math.random()}`, 
          question_id: question.id,
          option_text: '', 
          is_correct: false, 
          order_index: options.length,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    }
    setQuizData({
      ...quizData,
      questions: updatedQuestions
    });
  };

  const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...quizData.questions];
    const question = updatedQuestions[questionIndex];
    if (question.question_type === 'multiple_choice' && question.options) {
      question.options.splice(optionIndex, 1);
      question.options = question.options.map((opt, i) => ({ ...opt, order_index: i }));
    }
    setQuizData({
      ...quizData,
      questions: updatedQuestions
    });
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, field: string, value: any) => {
    const updatedQuestions = [...quizData.questions];
    const question = updatedQuestions[questionIndex];
    if (question.question_type === 'multiple_choice' && question.options) {
      question.options[optionIndex] = {
        ...question.options[optionIndex],
        [field]: value
      };
    }
    setQuizData({
      ...quizData,
      questions: updatedQuestions
    });
  };

  const handleSave = () => {
    // Convert EditingQuiz back to QuizWithQuestions for saving
    const finalQuiz: QuizWithQuestions = {
      ...quizData,
      questions: quizData.questions.map(q => {
        const { lesson_id, ...rest } = q; // Remove lesson_id from question since it's in the parent
        return rest as any; // Type assertion since we're handling options properly
      })
    };
    onSave(finalQuiz as QuizWithQuestions);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">
              Edit Quiz
            </h2>
            <button 
              onClick={onCancel}
              className="text-gray-400 hover:text-white hover-lift"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Quiz Title
              </label>
              <input
                type="text"
                value={quizData.title}
                onChange={(e) => setQuizData({...quizData, title: e.target.value})}
                className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
                placeholder="Quiz title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Quiz Description
              </label>
              <textarea
                value={quizData.description}
                onChange={(e) => setQuizData({...quizData, description: e.target.value})}
                className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
                placeholder="Quiz description"
                rows={2}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={quizData.is_active}
                onChange={(e) => setQuizData({...quizData, is_active: e.target.checked})}
                className="h-4 w-4 text-accent-primary bg-gray-700 border-gray-600 rounded focus:ring-accent-primary"
              />
              <span className="ml-2 text-sm text-gray-300">
                Active (Quiz is available to students)
              </span>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">Questions</h3>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="px-3 py-1 bg-accent-primary text-black rounded text-sm hover:bg-accent-primary/90 hover-lift"
                >
                  Add Question
                </button>
              </div>

              {quizData.questions.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No questions added yet. Click "Add Question" to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {quizData.questions.map((question, qIndex) => (
                    <div key={qIndex} className="border border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={question.question_text}
                            onChange={(e) => {
                              const updatedQuestions = [...quizData.questions];
                              updatedQuestions[qIndex].question_text = e.target.value;
                              setQuizData({...quizData, questions: updatedQuestions});
                            }}
                            className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white mb-2"
                            placeholder="Question text"
                          />
                          
                          <div className="flex gap-4 mb-2">
                            <div className="flex items-center">
                              <input
                                type="radio"
                                id={`mc-${qIndex}`}
                                name={`type-${qIndex}`}
                                checked={question.question_type === 'multiple_choice'}
                                onChange={() => {
                                  const updatedQuestions = [...quizData.questions];
                                  updatedQuestions[qIndex].question_type = 'multiple_choice';
                                  updatedQuestions[qIndex].options = updatedQuestions[qIndex].options || [
                                    { 
                                      id: `opt-${Date.now()}-1`, 
                                      question_id: updatedQuestions[qIndex].id,
                                      option_text: '', 
                                      is_correct: false, 
                                      order_index: 0,
                                      created_at: new Date().toISOString(),
                                      updated_at: new Date().toISOString()
                                    }
                                  ];
                                  setQuizData({...quizData, questions: updatedQuestions});
                                }}
                                className="mr-2"
                              />
                              <label htmlFor={`mc-${qIndex}`} className="text-sm text-gray-300">Multiple Choice</label>
                            </div>
                            
                            <div className="flex items-center">
                              <input
                                type="radio"
                                id={`sa-${qIndex}`}
                                name={`type-${qIndex}`}
                                checked={question.question_type === 'short_answer'}
                                onChange={() => {
                                  const updatedQuestions = [...quizData.questions];
                                  updatedQuestions[qIndex].question_type = 'short_answer';
                                  updatedQuestions[qIndex].options = []; // Clear options for short answer
                                  setQuizData({...quizData, questions: updatedQuestions});
                                }}
                                className="mr-2"
                              />
                              <label htmlFor={`sa-${qIndex}`} className="text-sm text-gray-300">Short Answer</label>
                            </div>
                          </div>

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={question.is_required}
                              onChange={(e) => {
                                const updatedQuestions = [...quizData.questions];
                                updatedQuestions[qIndex].is_required = e.target.checked;
                                setQuizData({...quizData, questions: updatedQuestions});
                              }}
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-300">Required question</span>
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(qIndex)}
                          className="ml-2 text-red-500 hover:text-red-400"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>

                      {question.question_type === 'multiple_choice' && question.options && (
                        <div className="mt-3 space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-300">Options:</label>
                            <button
                              type="button"
                              onClick={() => handleAddOption(qIndex)}
                              className="px-2 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-600"
                            >
                              + Add Option
                            </button>
                          </div>
                          
                          {question.options.map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={option.is_correct}
                                onChange={(e) => handleOptionChange(qIndex, oIndex, 'is_correct', e.target.checked)}
                                className="mr-2"
                              />
                              <input
                                type="text"
                                value={option.option_text}
                                onChange={(e) => handleOptionChange(qIndex, oIndex, 'option_text', e.target.value)}
                                className="flex-1 p-2 rounded bg-gray-800 border border-gray-600 text-white text-sm"
                                placeholder="Option text"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveOption(qIndex, oIndex)}
                                className="text-red-500 hover:text-red-400"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-800 hover-lift"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-accent-primary hover:bg-accent-primary/90 text-black rounded-md font-medium hover-lift"
            >
              Save Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};