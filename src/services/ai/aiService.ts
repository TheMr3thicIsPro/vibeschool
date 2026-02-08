// Mock AI service for reviewing tasks and providing feedback
// In a real implementation, this would connect to an actual AI API

export interface TaskReviewResult {
  feedback: string;
  suggestions: string[];
  rating: number; // 1-5 scale
  improvementAreas: string[];
}

export const reviewPromptTask = async (prompt: string, lessonContext: string): Promise<TaskReviewResult> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // This is a mock implementation - in a real app, this would call an AI API
  const mockFeedback = `The prompt you provided is well-structured and clear. Here's my review:

**Strengths:**
- Clear objective and desired output
- Good use of context setting
- Appropriate constraints mentioned

**Suggestions for Improvement:**
- Consider adding more specific examples
- Define the target audience more clearly
- Add tone and style requirements

**Overall Rating: 4/5**`;
  
  return {
    feedback: mockFeedback,
    suggestions: [
      "Add more specific examples",
      "Define target audience more clearly",
      "Include tone and style requirements"
    ],
    rating: 4,
    improvementAreas: [
      "Examples",
      "Target audience definition",
      "Tone specification"
    ]
  };
};

export const reviewVibeCodingTask = async (prompt: string, codeOutput: string, lessonContext: string): Promise<TaskReviewResult> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // This is a mock implementation - in a real app, this would call an AI API
  const mockFeedback = `The code implementation shows good understanding of the concepts. Here's my review:

**Strengths:**
- Clean code structure
- Good use of appropriate patterns
- Clear variable naming

**Suggestions for Improvement:**
- Consider error handling for edge cases
- Add comments for complex logic
- Optimize for performance where possible

**Overall Rating: 4/5**`;
  
  return {
    feedback: mockFeedback,
    suggestions: [
      "Add error handling for edge cases",
      "Include comments for complex logic",
      "Optimize for performance"
    ],
    rating: 4,
    improvementAreas: [
      "Error handling",
      "Code documentation",
      "Performance optimization"
    ]
  };
};

// Function to get AI feedback for a submitted task
export const getTaskFeedback = async (
  submissionContent: string, 
  taskType: 'prompt-writing' | 'vibe-coding',
  lessonTitle: string,
  lessonDescription: string
): Promise<TaskReviewResult> => {
  const lessonContext = `Lesson: ${lessonTitle}\nDescription: ${lessonDescription}`;
  
  if (taskType === 'prompt-writing') {
    return reviewPromptTask(submissionContent, lessonContext);
  } else {
    // For vibe-coding tasks, we expect the submission to contain both prompt and code
    // For this mock, we'll just use the entire submission as the prompt
    return reviewVibeCodingTask(submissionContent, submissionContent, lessonContext);
  }
};