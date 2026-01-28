import { supabase } from '@/lib/supabase';
import { QuizWithQuestions, QuizQuestion, QuizOption } from '@/types/quiz';

function isUuid(value: string | undefined | null) {
  if (!value) return false
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

// Get quiz for a lesson
export const getQuizByLessonId = async (lessonId: string): Promise<QuizWithQuestions | null> => {
  console.log('getQuizByLessonId: Fetching quiz for lesson:', lessonId);
  
  try {
    // First, get the quiz itself
    const { data: quizData, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('lesson_id', lessonId)
      .eq('is_active', true)
      .maybeSingle();

    if (quizError) {
      console.error('getQuizByLessonId: Error fetching quiz:', {
        name: quizError.name,
        message: quizError.message,
        details: quizError.details
      });
      throw quizError;
    }

  // If no quiz found for this lesson, return null
  if (!quizData) {
    return null;
  }

  // Then get the questions for this quiz
  console.log('getQuizByLessonId: Fetching questions for lesson:', lessonId);
  
  // First, let's check what's actually in the database for this lesson
  const { data: allQuestions, error: allQuestionsError } = await supabase
    .from('quiz_questions')
    .select('*')
    .limit(10);
  
  if (allQuestions) {
    console.log('getQuizByLessonId: All questions in DB:', allQuestions.map((q: any) => ({
      id: q.id,
      lesson_id: q.lesson_id,
      text: q.question_text?.substring(0, 30) + '...'
    })));
  }
  
  const { data: questionsData, error: questionsError } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('order_index', { ascending: true });

  if (questionsError) {
    console.error('getQuizByLessonId: Error fetching questions:', questionsError);
    throw questionsError;
  }

  console.log('getQuizByLessonId: Raw questions data:', questionsData?.length || 0, 'questions found');
  if (questionsData) {
    console.log('getQuizByLessonId: Questions sample:', questionsData.slice(0, 2).map((q: any) => ({
      id: q.id,
      text: q.question_text?.substring(0, 50) + '...'
    })));
  }

  // Sort questions by order_index
  const sortedQuestions = [...(questionsData || [])].sort((a, b) => a.order_index - b.order_index);
  console.log('getQuizByLessonId: Sorted questions count:', sortedQuestions.length);

  // Get options for each question
  const questionsWithOptions = [];
  console.log('getQuizByLessonId: Processing', sortedQuestions.length, 'questions');
  
  for (const [index, question] of sortedQuestions.entries()) {
    console.log(`getQuizByLessonId: Processing question ${index + 1}/${sortedQuestions.length}:`, {
      id: question.id,
      text: question.question_text?.substring(0, 50) + '...'
    });
    
    const { data: optionsData, error: optionsError } = await supabase
      .from('quiz_options')
      .select('*')
      .eq('question_id', question.id)
      .order('order_index', { ascending: true });
    
    if (optionsError) {
      console.error('getQuizByLessonId: Error fetching options for question:', question.id, optionsError);
      throw optionsError;
    }
    
    console.log(`getQuizByLessonId: Question ${question.id} has ${optionsData?.length || 0} options`);
    
    questionsWithOptions.push({
      ...question,
      options: optionsData || []
    });
  }
  
  console.log('getQuizByLessonId: Built questionsWithOptions array with', questionsWithOptions.length, 'questions');

  const quizWithQuestions: QuizWithQuestions = {
    ...quizData,
    questions: questionsWithOptions
  };

  console.log('getQuizByLessonId: Final result structure:', {
    quizId: quizWithQuestions.id,
    lessonId: quizWithQuestions.lesson_id,
    title: quizWithQuestions.title,
    questionsCount: quizWithQuestions.questions?.length || 0,
    questionsSample: quizWithQuestions.questions?.slice(0, 2).map(q => ({
      id: q.id,
      text: q.question_text?.substring(0, 50) + '...',
      optionsCount: q.options?.length || 0
    }))
  });
  
  return quizWithQuestions;
  } catch (error: any) {
    console.error('getQuizByLessonId: Unhandled error:', {
      name: error?.name || 'UnknownError',
      message: error?.message || 'Unknown error occurred',
      stack: error?.stack
    });
    
    // Enhanced error categorization
    if (error?.name === 'TypeError' && error?.message?.includes('Failed to fetch')) {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        throw new Error('Network error: You appear to be offline');
      } else {
        throw new Error('Network error: Unable to connect to database server');
      }
    }
    
    throw error;
  }
};

// Create or update quiz for a lesson
export const upsertQuiz = async (lessonId: string, quizData: {
  title: string;
  description: string;
  is_active: boolean;
  questions: {
    id?: string;
    question_text: string;
    question_type: 'multiple_choice' | 'short_answer';
    is_required: boolean;
    order_index: number;
    options?: {
      id?: string;
      option_text: string;
      is_correct: boolean;
      order_index: number;
    }[];
  }[];
}): Promise<void> => {
  console.log('upsertQuiz: Upserting quiz for lesson:', lessonId, 'data:', quizData);

  // Start a transaction-like approach
  // First, check if quiz already exists
  const { data: existingQuiz, error: fetchQuizError } = await supabase
    .from('quizzes')
    .select('id')
    .eq('lesson_id', lessonId)
    .maybeSingle();

  if (fetchQuizError) {
    console.error('upsertQuiz: Error checking existing quiz:', fetchQuizError);
    throw fetchQuizError;
  }

  let quizId: string;

  if (existingQuiz) {
    // Update existing quiz
    const { error: updateQuizError } = await supabase
      .from('quizzes')
      .update({
        title: quizData.title,
        description: quizData.description,
        is_active: quizData.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingQuiz.id);

    if (updateQuizError) {
      console.error('upsertQuiz: Error updating quiz:', updateQuizError);
      throw updateQuizError;
    }
    quizId = existingQuiz.id;
  } else {
    // Insert new quiz
    const { data: newQuiz, error: insertQuizError } = await supabase
      .from('quizzes')
      .insert({
        lesson_id: lessonId,
        title: quizData.title,
        description: quizData.description,
        is_active: quizData.is_active
      })
      .select('id')
      .single();

    if (insertQuizError) {
      console.error('upsertQuiz: Error inserting quiz:', insertQuizError);
      throw insertQuizError;
    }
    quizId = newQuiz.id;
  }

  // Process questions
  const questionIdMap: Record<string, string> = {};
  for (const question of quizData.questions) {
    let questionId: string;
    const shouldUpdate = isUuid(question.id);

    if (shouldUpdate && question.id) {
      // Update existing question
      console.log(`upsertQuiz: updating question (uuid ${question.id})`);
      const { error: updateQuestionError } = await supabase
        .from('quiz_questions')
        .update({
          question_text: question.question_text,
          question_type: question.question_type,
          is_required: question.is_required,
          order_index: question.order_index,
          updated_at: new Date().toISOString()
        })
        .eq('id', question.id);

      if (updateQuestionError) {
        console.error('upsertQuiz: update quiz_questions failed:', updateQuestionError);
        throw updateQuestionError;
      }
      questionId = question.id;
    } else {
      // Insert new question
      console.log(`upsertQuiz: inserting question (temp id ${question.id || 'undefined'})`);
      const { data: newQuestion, error: insertQuestionError } = await supabase
        .from('quiz_questions')
        .insert({
          lesson_id: lessonId,
          question_text: question.question_text,
          question_type: question.question_type,
          is_required: question.is_required,
          order_index: question.order_index
        })
        .select('id')
        .single();

      if (insertQuestionError) {
        console.error('upsertQuiz: insert quiz_questions failed:', insertQuestionError);
        throw insertQuestionError;
      }
      questionId = newQuestion.id;
    }

    // Map the temporary question ID to the real question ID
    if (question.id && !shouldUpdate) {
      questionIdMap[question.id] = questionId;
    }

    // Process options for this question (only for multiple choice)
    if (question.question_type === 'multiple_choice' && question.options) {
      // Replace all options strategy: delete all existing options first
      console.log(`upsertQuiz: replacing options for question ${questionId}`);
      const { error: deleteOptionsError } = await supabase
        .from('quiz_options')
        .delete()
        .eq('question_id', questionId);

      if (deleteOptionsError) {
        console.error('upsertQuiz: delete quiz_options failed:', deleteOptionsError);
        throw deleteOptionsError;
      }

      // Insert all current options fresh
      for (const [index, option] of question.options.entries()) {
        console.log(`upsertQuiz: inserting option ${index + 1} for question ${questionId}`);
        const { error: insertOptionError } = await supabase
          .from('quiz_options')
          .insert({
            question_id: questionId,
            option_text: option.option_text,
            is_correct: option.is_correct,
            order_index: index
          });

        if (insertOptionError) {
          console.error('upsertQuiz: insert quiz_options failed:', insertOptionError);
          throw insertOptionError;
        }
      }
    } else if (question.question_type === 'multiple_choice') {
      // If it's multiple choice but no options provided, delete existing options
      console.log(`upsertQuiz: deleting all options for question ${questionId} (no options provided)`);
      const { error: deleteAllOptionsError } = await supabase
        .from('quiz_options')
        .delete()
        .eq('question_id', questionId);

      if (deleteAllOptionsError) {
        console.error('upsertQuiz: delete all quiz_options failed:', deleteAllOptionsError);
        throw deleteAllOptionsError;
      }
    }
  }

  // Clean up deleted questions (if any)
  console.log('upsertQuiz: Cleaning up questions for lesson:', lessonId);
  console.log('upsertQuiz: Quiz data questions:', quizData.questions.map(q => ({
    id: q.id,
    isUuid: isUuid(q.id),
    text: q.question_text?.substring(0, 30) + '...'
  })));
  
  // Only clean up if there are existing questions to preserve
  if (quizData.questions.length > 0) {
    const existingQuestionIds = quizData.questions
      .filter(q => isUuid(q.id)) // Only include real UUIDs, not temporary IDs
      .map(q => q.id as string);
    
    console.log('upsertQuiz: Existing question IDs to preserve:', existingQuestionIds);
    
    if (existingQuestionIds.length > 0) {
      console.log('upsertQuiz: Deleting questions NOT in:', existingQuestionIds);
      const { error: deleteQuestionsError } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('lesson_id', lessonId)
        .not('id', 'in', `(${existingQuestionIds.join(',')})`);

      if (deleteQuestionsError) {
        console.error('upsertQuiz: Error deleting questions:', deleteQuestionsError);
      }
    } else {
      // If no existing questions to preserve, this means ALL questions are new
      // So we should NOT delete anything - all questions are meant to be kept
      console.log('upsertQuiz: All questions are new (temporary IDs), preserving all');
    }
  } else {
    // If no questions remain, delete all questions for this lesson
    console.log('upsertQuiz: No questions in quiz data, deleting all questions for lesson');
    const { error: deleteAllQuestionsError } = await supabase
      .from('quiz_questions')
      .delete()
      .eq('lesson_id', lessonId);

    if (deleteAllQuestionsError) {
      console.error('upsertQuiz: Error deleting all questions:', deleteAllQuestionsError);
    }
  }

  console.log('upsertQuiz: Successfully upserted quiz for lesson:', lessonId);
};

// Submit quiz answers
export const submitQuizAnswers = async (
  userId: string,
  lessonId: string,
  answers: {
    question_id: string;
    selected_option_id?: string; // For multiple choice
    answer_text?: string; // For short answer
  }[]
): Promise<{ score: number; total: number }> => {
  console.log('submitQuizAnswers: Submitting answers for user:', userId, 'lesson:', lessonId);

  // First, get the quiz questions with correct answers
  const quiz = await getQuizByLessonId(lessonId);
  if (!quiz) {
    throw new Error('Quiz not found for this lesson');
  }

  // Create a new submission
  const { data: submission, error: submissionError } = await supabase
    .from('quiz_submissions')
    .insert({
      user_id: userId,
      lesson_id: lessonId,
      score: 0, // Will update after grading
      total_questions: quiz.questions.length
    })
    .select('id')
    .single();

  if (submissionError) {
    console.error('submitQuizAnswers: Error creating submission:', submissionError);
    throw submissionError;
  }

  let correctAnswers = 0;

  // Process each answer
  for (const answer of answers) {
    const question = quiz.questions.find(q => q.id === answer.question_id);
    if (!question) {
      continue; // Skip if question doesn't exist
    }

    let isCorrect = false;

    if (question.question_type === 'multiple_choice') {
      // For multiple choice, check if the selected option is correct
      if (answer.selected_option_id) {
        const selectedOption = question.options?.find(opt => opt.id === answer.selected_option_id);
        if (selectedOption?.is_correct) {
          isCorrect = true;
          correctAnswers++;
        }
      }
    } else if (question.question_type === 'short_answer') {
      // For short answer, we'll just save the answer and let instructors grade manually
      // For now, we'll mark it as correct if an answer was provided
      if (answer.answer_text && answer.answer_text.trim().length > 0) {
        isCorrect = true;
        correctAnswers++;
      }
    }

    // Save the answer
    const { error: answerError } = await supabase
      .from('quiz_answers')
      .insert({
        submission_id: submission.id,
        question_id: answer.question_id,
        selected_option_id: answer.selected_option_id,
        answer_text: answer.answer_text,
        is_correct: isCorrect
      });

    if (answerError) {
      console.error('submitQuizAnswers: Error saving answer:', answerError);
      throw answerError;
    }
  }

  // Update the submission with the final score
  const finalScore = Math.round((correctAnswers / quiz.questions.length) * 100);
  const { error: updateScoreError } = await supabase
    .from('quiz_submissions')
    .update({
      score: finalScore,
      completed_at: new Date().toISOString()
    })
    .eq('id', submission.id);

  if (updateScoreError) {
    console.error('submitQuizAnswers: Error updating score:', updateScoreError);
    throw updateScoreError;
  }

  console.log('submitQuizAnswers: Successfully submitted answers for user:', userId, 'lesson:', lessonId, 'score:', finalScore);

  return {
    score: finalScore,
    total: quiz.questions.length
  };
};

// Get user's quiz submission for a lesson
export const getUserQuizSubmission = async (userId: string, lessonId: string) => {
  console.log('getUserQuizSubmission: Fetching submission for user:', userId, 'lesson:', lessonId);

  const { data, error } = await supabase
    .from('quiz_submissions')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('getUserQuizSubmission: Error fetching submission:', error);
    throw error;
  }

  return data;
};

// Get quiz submission by lesson ID for a user
export const getQuizSubmissionByLessonId = async (userId: string, lessonId: string) => {
  console.log('getQuizSubmissionByLessonId: Fetching submission for user:', userId, 'lesson:', lessonId);

  const { data, error } = await supabase
    .from('quiz_submissions')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('getQuizSubmissionByLessonId: Error fetching submission:', error);
    throw error;
  }

  return data;
};