'use client';

import { useState, useEffect } from 'react';
import { Course } from '@/types/course';
import { listCourses, createCourse, updateCourse, deleteCourse, publishCourse } from '@/actions/courseActions';
import { PlusIcon, TrashIcon, EyeIcon, EyeOffIcon } from 'lucide-react';

interface CourseListProps {
  selectedCourseId: string | null;
  onSelectCourse: (courseId: string | null) => void;
  onCourseCreated: () => void;
  onCourseUpdated: () => void;
}

const CourseList = ({ 
  selectedCourseId, 
  onSelectCourse, 
  onCourseCreated,
  onCourseUpdated
}: CourseListProps) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    console.log('DEBUG: CourseList - Loading courses');
    setLoading(true);
    setError(null);
    try {
      const result = await listCourses();
      console.log('DEBUG: CourseList - listCourses result:', result);
      if (result.error) {
        console.error('DEBUG: CourseList - Error loading courses:', result.error);
        setError(result.error);
      } else if (result.data) {
        console.log('DEBUG: CourseList - Loaded courses:', result.data);
        setCourses(result.data);
      }
    } catch (err) {
      console.error('DEBUG: CourseList - Exception loading courses:', err);
      setError('Failed to load courses');
    } finally {
      console.log('DEBUG: CourseList - Finished loading courses, loading state:', false);
      setLoading(false);
    }
  };

  const handleCreateCourse = async () => {
    if (!newCourseTitle.trim()) {
      setError('Course title is required');
      return;
    }

    try {
      console.log('DEBUG: CourseList - Creating course:', newCourseTitle, newCourseDescription);
      const result = await createCourse(newCourseTitle, newCourseDescription);
      console.log('DEBUG: CourseList - Create course result:', result);
      if (result.error) {
        console.error('DEBUG: CourseList - Error creating course:', result.error);
        setError(result.error);
      } else if (result.data) {
        console.log('DEBUG: CourseList - Course created successfully:', result.data);
        setCourses([...courses, result.data]);
        setNewCourseTitle('');
        setNewCourseDescription('');
        setShowCreateForm(false);
        console.log('DEBUG: CourseList - Calling onCourseCreated callback');
        onCourseCreated();
      }
    } catch (err) {
      console.error('DEBUG: CourseList - Exception creating course:', err);
      setError('Failed to create course');
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course? This will also delete all modules and lessons.')) {
      return;
    }

    try {
      const result = await deleteCourse(id);
      if (result.error) {
        setError(result.error);
      } else {
        setCourses(courses.filter(course => course.id !== id));
        if (selectedCourseId === id) {
          onSelectCourse(null);
        }
        onCourseUpdated();
      }
    } catch (err) {
      setError('Failed to delete course');
    }
  };

  const handleTogglePublish = async (id: string, isPublished: boolean) => {
    try {
      const result = await publishCourse(id, !isPublished);
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setCourses(courses.map(course => 
          course.id === id ? result.data! : course
        ));
        onCourseUpdated();
        
        // After publish/unpublish, refresh the admin list and trigger public UI refresh
        if (result.data.is_published && !isPublished) {
          // Course was just published - make it visible to students immediately
          console.log('Course published - refreshing UI');
        } else if (!result.data.is_published && isPublished) {
          // Course was just unpublished - hide it from students
          console.log('Course unpublished - updating UI');
        }
      }
    } catch (err) {
      setError('Failed to update course publication status');
    }
  };

  return (
    <div className="border-r border-gray-700 h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Courses</h3>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-accent-primary hover:bg-accent-primary/90 text-black px-3 py-1 rounded-md text-sm font-medium transition-colors"
          >
            <PlusIcon size={16} />
          </button>
        </div>

        {showCreateForm && (
          <div className="mb-4 p-3 bg-gray-800 rounded-lg">
            <input
              type="text"
              value={newCourseTitle}
              onChange={(e) => setNewCourseTitle(e.target.value)}
              placeholder="Course title"
              className="w-full p-2 mb-2 rounded bg-gray-700 border border-gray-600 text-white"
            />
            <textarea
              value={newCourseDescription}
              onChange={(e) => setNewCourseDescription(e.target.value)}
              placeholder="Course description"
              className="w-full p-2 mb-2 rounded bg-gray-700 border border-gray-600 text-white"
              rows={2}
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateCourse}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewCourseTitle('');
                  setNewCourseDescription('');
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-2 bg-red-900/30 border border-red-700 rounded text-red-300 text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-400">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="p-4 text-center text-gray-400">No courses found</div>
        ) : (
          <ul className="divide-y divide-gray-700">
            {courses.map((course) => (
              <li 
                key={course.id}
                className={`p-3 cursor-pointer transition-colors ${
                  selectedCourseId === course.id 
                    ? 'bg-accent-primary/10 border-l-4 border-accent-primary' 
                    : 'hover:bg-gray-800/50'
                }`}
                onClick={() => onSelectCourse(course.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate">{course.title}</h4>
                    <p className="text-xs text-gray-400 truncate">{course.description}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        course.is_published 
                          ? 'bg-green-900/30 text-green-400 border border-green-800' 
                          : 'bg-yellow-900/30 text-yellow-400 border border-yellow-800'
                      }`}>
                        {course.is_published ? 'Published' : 'Draft'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(course.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePublish(course.id, course.is_published);
                      }}
                      className={`p-1 rounded ${
                        course.is_published 
                          ? 'text-green-400 hover:bg-green-900/20' 
                          : 'text-gray-400 hover:bg-gray-700'
                      }`}
                      title={course.is_published ? 'Unpublish' : 'Publish'}
                    >
                      {course.is_published ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCourse(course.id);
                      }}
                      className="p-1 rounded text-red-400 hover:bg-red-900/20"
                      title="Delete"
                    >
                      <TrashIcon size={14} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CourseList;