import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getTasksByLesson, getUserTaskSubmission, submitTask } from '@/services/taskService';
import { getTaskFeedback } from '@/services/ai/aiService';
import { FileText, Code, Send, CheckCircle, MessageCircle, Star, Lightbulb } from 'lucide-react';

interface TaskComponentProps {
  lessonId: string;
}

const TaskComponent = ({ lessonId }: TaskComponentProps) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [currentTask, setCurrentTask] = useState<any>(null);
  const [submission, setSubmission] = useState('');
  const [userSubmission, setUserSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState<any>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  useEffect(() => {
    if (lessonId && user) {
      fetchTasks();
    }
  }, [lessonId, user]);

  useEffect(() => {
    if (currentTask && user) {
      fetchUserSubmission();
    }
  }, [currentTask, user]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await getTasksByLesson(lessonId);
      setTasks(data);
      if (data.length > 0) {
        setCurrentTask(data[0]);
      }
    } catch (err) {
      setError('Failed to load tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSubmission = async () => {
    if (!user || !currentTask) return;
    
    try {
      const data = await getUserTaskSubmission(user.id, currentTask.id);
      setUserSubmission(data);
      if (data) {
        setSubmission(data.content);
        setSubmitted(true);
        // If the submission has AI feedback, set it
        if (data.feedback) {
          setFeedback({
            feedback: data.feedback,
            // In a real implementation, we'd have more structured feedback data
            suggestions: [],
            rating: 0,
            improvementAreas: []
          });
        }
      }
    } catch (err) {
      console.error('Failed to load user submission:', err);
    }
  };

  const handleSubmit = async () => {
    if (!user || !currentTask || !submission.trim()) {
      setError('Please enter your submission');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const result = await submitTask(user.id, currentTask.id, submission);
      setUserSubmission(result);
      setSubmitted(true);
      
      // Get AI feedback
      setFeedbackLoading(true);
      try {
        const aiFeedback = await getTaskFeedback(
          submission,
          currentTask.task_type,
          currentTask.title,
          currentTask.description
        );
        setFeedback(aiFeedback);
        
        // In a real implementation, we would update the submission with feedback
        // For now, we'll just store it in state
      } catch (feedbackErr) {
        console.error('Failed to get AI feedback:', feedbackErr);
        // Still consider the submission successful even if AI feedback fails
      } finally {
        setFeedbackLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit task');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-gray-400">Loading tasks...</div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No tasks available for this lesson.</p>
      </div>
    );
  }

  const taskTypeIcon = currentTask?.task_type === 'prompt-writing' ? 
    <FileText className="text-accent-primary" size={20} /> : 
    <Code className="text-accent-primary" size={20} />;

  return (
    <div className="space-y-6">
      {/* Task List */}
      <div className="space-y-2">
        {tasks.map(task => (
          <div
            key={task.id}
            className={`p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-3 ${
              currentTask?.id === task.id
                ? 'bg-accent-primary/10 border border-accent-primary'
                : 'bg-card-bg hover:bg-gray-800'
            }`}
            onClick={() => setCurrentTask(task)}
          >
            <div className="flex-shrink-0">
              {task.task_type === 'prompt-writing' ? 
                <FileText className="text-accent-primary" size={16} /> : 
                <Code className="text-accent-primary" size={16} />}
            </div>
            <div>
              <p className="font-medium text-white">{task.title}</p>
              <p className="text-gray-400 text-sm">{task.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Current Task */}
      {currentTask && (
        <div className="bg-card-bg p-6 rounded-lg border border-card-border">
          <div className="flex items-start gap-3 mb-4">
            <div className="mt-1">
              {taskTypeIcon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{currentTask.title}</h3>
              <p className="text-gray-400 mt-1">{currentTask.description}</p>
            </div>
          </div>

          {/* Task Content */}
          <div className="mt-6">
            {currentTask.task_type === 'prompt-writing' ? (
              <div>
                <h4 className="font-semibold text-white mb-2">Prompt Writing Task</h4>
                <p className="text-gray-300 mb-4">
                  Write a prompt that would achieve the following objective. Focus on clarity, specificity, and effectiveness.
                </p>
              </div>
            ) : (
              <div>
                <h4 className="font-semibold text-white mb-2">Vibe Coding Task</h4>
                <p className="text-gray-300 mb-4">
                  Submit the prompt you used and the AI-generated code/output for this task. 
                  We'll review the structure and intent of your approach.
                </p>
              </div>
            )}

            {/* Submission Area */}
            <div className="mt-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Your Submission
              </label>
              <textarea
                value={submission}
                onChange={(e) => setSubmission(e.target.value)}
                className="w-full h-40 bg-gray-800 border border-gray-700 rounded-lg p-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
                placeholder={
                  currentTask.task_type === 'prompt-writing' 
                    ? 'Write your prompt here...' 
                    : 'Paste your prompt and AI output here...'
                }
                disabled={submitted}
              />
              
              {!submitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors disabled:opacity-50"
                >
                  <Send size={16} />
                  {submitting ? 'Submitting...' : 'Submit Task'}
                </button>
              ) : (
                <div className="mt-4 flex items-center gap-2 text-green-400">
                  <CheckCircle size={16} />
                  Task submitted successfully!
                </div>
              )}
              
              {error && (
                <div className="mt-2 text-red-400 text-sm">{error}</div>
              )}
              
              {/* AI Feedback Section */}
              {feedback && (
                <div className="mt-6 p-4 bg-gray-800 border border-gray-700 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageCircle className="text-accent-primary" size={20} />
                    <h4 className="font-semibold text-white">AI Feedback</h4>
                    {feedback.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="text-yellow-400" size={16} fill="currentColor" />
                        <span className="text-yellow-400 text-sm">{feedback.rating}/5</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-gray-300 whitespace-pre-line mb-4">
                    {feedback.feedback}
                  </div>
                  
                  {feedback.suggestions && feedback.suggestions.length > 0 && (
                    <div className="mb-3">
                      <h5 className="font-medium text-accent-primary flex items-center gap-1 mb-2">
                        <Lightbulb size={16} />
                        Suggestions
                      </h5>
                      <ul className="text-gray-300 text-sm space-y-1">
                        {feedback.suggestions.map((suggestion: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-accent-primary mt-1">•</span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {feedback.improvementAreas && feedback.improvementAreas.length > 0 && (
                    <div>
                      <h5 className="font-medium text-accent-primary mb-2">Areas for Improvement</h5>
                      <div className="flex flex-wrap gap-2">
                        {feedback.improvementAreas.map((area: string, idx: number) => (
                          <span key={idx} className="px-2 py-1 bg-accent-primary/20 text-accent-primary text-xs rounded">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {feedbackLoading && (
                <div className="mt-6 p-4 bg-gray-800 border border-gray-700 rounded-lg">
                  <div className="flex items-center gap-2 text-accent-primary">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-primary"></div>
                    <span>AI is reviewing your submission...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskComponent;