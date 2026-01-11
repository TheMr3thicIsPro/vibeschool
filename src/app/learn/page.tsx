'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/context/AuthContext';
import { getAllCourses, getModulesByCourse } from '@/services/courseService';
import { BookOpen, Play, Lock, CheckCircle, Circle } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AppShell from '@/components/layout/AppShell';

const LearnPage = () => {
  const { state } = useAuthStore();
  const user = state.user;
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchModules(selectedCourse.id);
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await getAllCourses();
      setCourses(data);
      if (data.length > 0) {
        setSelectedCourse(data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async (courseId: string) => {
    try {
      const data = await getModulesByCourse(courseId);
      setModules(data);
      if (data.length > 0) {
        setActiveModule(data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch modules:', err);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="flex items-center justify-center h-full">
            <div className="text-2xl font-bold text-accent-primary">Loading courses...</div>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="flex h-full">
          {/* Left side - Course and Module List */}
          <div className="w-1/3 bg-card-bg border-r border-card-border overflow-y-auto">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <BookOpen className="text-accent-primary" />
                Courses
              </h1>
              
              <div className="space-y-4">
                {courses.map(course => (
                  <div 
                    key={course.id}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedCourse?.id === course.id 
                        ? 'bg-accent-primary/10 border border-accent-primary' 
                        : 'bg-card-bg hover:bg-gray-800'
                    }`}
                    onClick={() => setSelectedCourse(course)}
                  >
                    <h2 className="font-semibold text-white">{course.title}</h2>
                    <p className="text-gray-400 text-sm mt-1">{course.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {selectedCourse && (
              <div className="p-6 border-t border-card-border">
                <h2 className="text-xl font-bold text-white mb-4">Modules</h2>
                <div className="space-y-3">
                  {modules.map(module => (
                    <div 
                      key={module.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        activeModule === module.id 
                          ? 'bg-accent-primary/10 border border-accent-primary' 
                          : 'bg-card-bg hover:bg-gray-800'
                      }`}
                      onClick={() => setActiveModule(module.id)}
                    >
                      <h3 className="font-medium text-white">{module.title}</h3>
                      <p className="text-gray-400 text-sm mt-1">{module.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right side - Lessons */}
          <div className="w-2/3 overflow-y-auto">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-white mb-6">
                {selectedCourse?.title || 'Select a Course'}
              </h1>
              
              {selectedCourse && modules.length > 0 && activeModule ? (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">
                    {modules.find(m => m.id === activeModule)?.title}
                  </h2>
                  
                  <div className="space-y-3">
                    {modules
                      .find(m => m.id === activeModule)
                      ?.lessons
                      ?.map((lesson: any) => (
                        <div 
                          key={lesson.id}
                          className="flex items-center p-4 bg-card-bg rounded-lg border border-card-border hover:border-accent-primary transition-colors"
                        >
                          <div className="mr-4">
                            {lesson.is_free ? (
                              <Play className="text-accent-primary" size={20} />
                            ) : (
                              <Lock className="text-gray-500" size={20} />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="font-medium text-white">{lesson.title}</h3>
                            <p className="text-gray-400 text-sm mt-1">{lesson.description}</p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {lesson.is_required && (
                              <span className="px-2 py-1 bg-red-900/30 text-red-400 text-xs rounded">
                                Required
                              </span>
                            )}
                            {lesson.is_recommended && (
                              <span className="px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded">
                                Recommended
                              </span>
                            )}
                            {lesson.is_free && (
                              <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded">
                                Free
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500">Select a course and module to see lessons</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
};

export default LearnPage;