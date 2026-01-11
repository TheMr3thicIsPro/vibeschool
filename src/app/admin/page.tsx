'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/context/AuthContext';
import { 
  getAllCourses, 
  getModulesByCourse, 
  getLessonsByCourse, 
  createCourse, 
  createModule, 
  createLesson 
} from '@/services/courseService';
import { Users, BookOpen, FileText, Plus, Edit3, Trash2 } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppShell from '@/components/layout/AppShell';

const AdminPage = () => {
  const { state } = useAuthStore();
  const user = state.user;
  const [activeTab, setActiveTab] = useState<'courses' | 'modules' | 'lessons'>('courses');
  const [courses, setCourses] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [newCourse, setNewCourse] = useState({ title: '', description: '' });
  const [newModule, setNewModule] = useState({ title: '', description: '' });
  const [newLesson, setNewLesson] = useState({ 
    title: '', 
    description: '', 
    video_url: '', 
    content: '',
    is_free: false,
    is_required: false,
    is_recommended: false
  });
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);

  useEffect(() => {
    if (user) {
      loadCourses();
    }
  }, [user]);

  useEffect(() => {
    if (selectedCourse) {
      loadModulesAndLessons(selectedCourse);
    }
  }, [selectedCourse]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await getAllCourses();
      setCourses(data);
      if (data.length > 0 && !selectedCourse) {
        setSelectedCourse(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadModulesAndLessons = async (courseId: string) => {
    try {
      const modulesData = await getModulesByCourse(courseId);
      setModules(modulesData);
      
      const lessonsData = await getLessonsByCourse(courseId);
      setLessons(lessonsData);
    } catch (err) {
      console.error('Failed to load modules and lessons:', err);
    }
  };

  const handleCreateCourse = async () => {
    if (!newCourse.title.trim()) return;
    
    try {
      const createdCourse = await createCourse(newCourse);
      setCourses([...courses, createdCourse]);
      setNewCourse({ title: '', description: '' });
      setShowCourseForm(false);
      setSelectedCourse(createdCourse.id);
    } catch (err) {
      console.error('Failed to create course:', err);
    }
  };

  const handleCreateModule = async () => {
    if (!selectedCourse || !newModule.title.trim()) return;
    
    try {
      const createdModule = await createModule({
        course_id: selectedCourse,
        title: newModule.title,
        description: newModule.description,
        order_index: modules.length
      });
      setModules([...modules, createdModule]);
      setNewModule({ title: '', description: '' });
      setShowModuleForm(false);
    } catch (err) {
      console.error('Failed to create module:', err);
    }
  };

  const handleCreateLesson = async () => {
    if (!selectedCourse || !newLesson.title.trim()) return;
    
    // Find the first module for this course to add the lesson to
    const firstModule = modules.find(m => m.course_id === selectedCourse);
    if (!firstModule) {
      console.error('No modules found for this course');
      return;
    }
    
    try {
      const createdLesson = await createLesson({
        module_id: firstModule.id,
        title: newLesson.title,
        description: newLesson.description,
        video_url: newLesson.video_url || undefined,
        content: newLesson.content || undefined,
        order_index: lessons.filter(l => l.modules.id === firstModule.id).length,
        is_free: newLesson.is_free,
        is_required: newLesson.is_required,
        is_recommended: newLesson.is_recommended
      });
      
      setLessons([...lessons, createdLesson]);
      setNewLesson({ 
        title: '', 
        description: '', 
        video_url: '', 
        content: '',
        is_free: false,
        is_required: false,
        is_recommended: false
      });
      setShowLessonForm(false);
    } catch (err) {
      console.error('Failed to create lesson:', err);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="flex items-center justify-center h-full">
            <div className="text-2xl font-bold text-accent-primary">Loading admin panel...</div>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-400 mb-8">Manage courses, modules, and lessons</p>

            <div className="flex border-b border-gray-700 mb-8">
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'courses'
                    ? 'text-accent-primary border-b-2 border-accent-primary'
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveTab('courses')}
              >
                <div className="flex items-center gap-2">
                  <BookOpen size={16} />
                  Courses
                </div>
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'modules'
                    ? 'text-accent-primary border-b-2 border-accent-primary'
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveTab('modules')}
              >
                <div className="flex items-center gap-2">
                  <FileText size={16} />
                  Modules
                </div>
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === 'lessons'
                    ? 'text-accent-primary border-b-2 border-accent-primary'
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveTab('lessons')}
              >
                <div className="flex items-center gap-2">
                  <FileText size={16} />
                  Lessons
                </div>
              </button>
            </div>

            {/* Course Management */}
            {activeTab === 'courses' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">Courses</h2>
                  <button
                    onClick={() => setShowCourseForm(!showCourseForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors"
                  >
                    <Plus size={16} />
                    Add Course
                  </button>
                </div>

                {showCourseForm && (
                  <div className="card p-6 mb-6 border border-card-border">
                    <h3 className="text-lg font-semibold text-white mb-4">Create New Course</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Title</label>
                        <input
                          type="text"
                          value={newCourse.title}
                          onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                          className="w-full px-4 py-2 bg-card-bg border border-card-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
                          placeholder="Course title"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Description</label>
                        <textarea
                          value={newCourse.description}
                          onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                          className="w-full px-4 py-2 bg-card-bg border border-card-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
                          placeholder="Course description"
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleCreateCourse}
                          className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors"
                        >
                          Create Course
                        </button>
                        <button
                          onClick={() => setShowCourseForm(false)}
                          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map(course => (
                    <div key={course.id} className="card p-6 border border-card-border">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-white text-lg">{course.title}</h3>
                        <div className="flex gap-2">
                          <button className="p-1 text-gray-400 hover:text-accent-primary">
                            <Edit3 size={16} />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-red-500">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm mb-4">{course.description}</p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{course.modules?.length || 0} modules</span>
                        <span>{course.lessons?.length || 0} lessons</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Module Management */}
            {activeTab === 'modules' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">Modules</h2>
                  <div className="flex gap-3">
                    <select
                      value={selectedCourse || ''}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className="px-4 py-2 bg-card-bg border border-card-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
                    >
                      <option value="">Select a course</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.title}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => setShowModuleForm(!showModuleForm)}
                      disabled={!selectedCourse}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        selectedCourse
                          ? 'bg-accent-primary text-white hover:bg-accent-primary/90'
                          : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <Plus size={16} />
                      Add Module
                    </button>
                  </div>
                </div>

                {showModuleForm && selectedCourse && (
                  <div className="card p-6 mb-6 border border-card-border">
                    <h3 className="text-lg font-semibold text-white mb-4">Create New Module</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Title</label>
                        <input
                          type="text"
                          value={newModule.title}
                          onChange={(e) => setNewModule({...newModule, title: e.target.value})}
                          className="w-full px-4 py-2 bg-card-bg border border-card-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
                          placeholder="Module title"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Description</label>
                        <textarea
                          value={newModule.description}
                          onChange={(e) => setNewModule({...newModule, description: e.target.value})}
                          className="w-full px-4 py-2 bg-card-bg border border-card-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
                          placeholder="Module description"
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleCreateModule}
                          className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors"
                        >
                          Create Module
                        </button>
                        <button
                          onClick={() => setShowModuleForm(false)}
                          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {modules.map(module => (
                    <div key={module.id} className="card p-4 border border-card-border">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-white">{module.title}</h3>
                          <p className="text-gray-400 text-sm">{module.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Course: {courses.find(c => c.id === module.course_id)?.title || 'Unknown'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-1 text-gray-400 hover:text-accent-primary">
                            <Edit3 size={16} />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-red-500">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lesson Management */}
            {activeTab === 'lessons' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">Lessons</h2>
                  <div className="flex gap-3">
                    <select
                      value={selectedCourse || ''}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                      className="px-4 py-2 bg-card-bg border border-card-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
                    >
                      <option value="">Select a course</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.title}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => setShowLessonForm(!showLessonForm)}
                      disabled={!selectedCourse}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        selectedCourse
                          ? 'bg-accent-primary text-white hover:bg-accent-primary/90'
                          : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <Plus size={16} />
                      Add Lesson
                    </button>
                  </div>
                </div>

                {showLessonForm && selectedCourse && (
                  <div className="card p-6 mb-6 border border-card-border">
                    <h3 className="text-lg font-semibold text-white mb-4">Create New Lesson</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">Title</label>
                          <input
                            type="text"
                            value={newLesson.title}
                            onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                            className="w-full px-4 py-2 bg-card-bg border border-card-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
                            placeholder="Lesson title"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 text-sm font-medium mb-2">Module</label>
                          <select
                            className="w-full px-4 py-2 bg-card-bg border border-card-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
                            disabled
                          >
                            <option>{modules[0]?.title || 'Select a module'}</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Description</label>
                        <textarea
                          value={newLesson.description}
                          onChange={(e) => setNewLesson({...newLesson, description: e.target.value})}
                          className="w-full px-4 py-2 bg-card-bg border border-card-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
                          placeholder="Lesson description"
                          rows={2}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Video URL</label>
                        <input
                          type="text"
                          value={newLesson.video_url}
                          onChange={(e) => setNewLesson({...newLesson, video_url: e.target.value})}
                          className="w-full px-4 py-2 bg-card-bg border border-card-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
                          placeholder="https://example.com/video"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Content</label>
                        <textarea
                          value={newLesson.content}
                          onChange={(e) => setNewLesson({...newLesson, content: e.target.value})}
                          className="w-full px-4 py-2 bg-card-bg border border-card-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
                          placeholder="Lesson content (markdown supported)"
                          rows={4}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="is_free"
                            checked={newLesson.is_free}
                            onChange={(e) => setNewLesson({...newLesson, is_free: e.target.checked})}
                            className="mr-2"
                          />
                          <label htmlFor="is_free" className="text-gray-300">Free Lesson</label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="is_required"
                            checked={newLesson.is_required}
                            onChange={(e) => setNewLesson({...newLesson, is_required: e.target.checked})}
                            className="mr-2"
                          />
                          <label htmlFor="is_required" className="text-gray-300">Required</label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="is_recommended"
                            checked={newLesson.is_recommended}
                            onChange={(e) => setNewLesson({...newLesson, is_recommended: e.target.checked})}
                            className="mr-2"
                          />
                          <label htmlFor="is_recommended" className="text-gray-300">Recommended</label>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <button
                          onClick={handleCreateLesson}
                          className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors"
                        >
                          Create Lesson
                        </button>
                        <button
                          onClick={() => setShowLessonForm(false)}
                          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {lessons.map(lesson => (
                    <div key={lesson.id} className="card p-4 border border-card-border">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-white">{lesson.title}</h3>
                          <p className="text-gray-400 text-sm">{lesson.description}</p>
                          <div className="flex gap-3 mt-2">
                            {lesson.is_free && <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded">Free</span>}
                            {lesson.is_required && <span className="text-xs bg-red-900/30 text-red-400 px-2 py-1 rounded">Required</span>}
                            {lesson.is_recommended && <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-1 rounded">Recommended</span>}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Module: {lesson.modules?.title || 'Unknown'} • Course: {lesson.modules?.courses?.title || 'Unknown'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-1 text-gray-400 hover:text-accent-primary">
                            <Edit3 size={16} />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-red-500">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
};

export default AdminPage;