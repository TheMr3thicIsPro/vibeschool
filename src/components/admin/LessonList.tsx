'use client';

import { useState, useEffect } from 'react';
import { Lesson } from '@/types/course';
import { listLessons, createLesson, updateLesson, deleteLesson } from '@/actions/courseActions';
import { PlusIcon, TrashIcon, PlayIcon } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { reorderLessons } from '@/actions/courseActions';

interface LessonListProps {
  moduleId: string | null;
  selectedLessonId: string | null;
  onSelectLesson: (lessonId: string | null) => void;
  onLessonCreated: () => void;
  onLessonUpdated: () => void;
  onEditLesson: (lesson: Lesson) => void;
}

// Sortable Lesson Item Component
const SortableLessonItem = ({ 
  lesson, 
  isSelected, 
  onSelect,
  onDelete,
  onEdit
}: { 
  lesson: Lesson; 
  isSelected: boolean; 
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (lesson: Lesson) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`p-3 cursor-pointer transition-colors ${
        isSelected 
          ? 'bg-accent-primary/10 border-l-4 border-accent-primary' 
          : 'hover:bg-gray-800/50'
      } ${isDragging ? 'shadow-lg' : ''}`}
      onClick={() => onSelect(lesson.id)}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300 mt-0.5 hover-lift"
            onClick={(e) => e.stopPropagation()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="5" r="1"></circle>
              <circle cx="9" cy="12" r="1"></circle>
              <circle cx="9" cy="19" r="1"></circle>
              <circle cx="15" cy="5" r="1"></circle>
              <circle cx="15" cy="12" r="1"></circle>
              <circle cx="15" cy="19" r="1"></circle>
            </svg>
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {lesson.youtube_video_id && (
                <PlayIcon size={14} className="text-blue-400 flex-shrink-0" />
              )}
              <span className="font-medium text-white truncate">{lesson.title}</span>
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {lesson.is_preview && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-900/30 text-purple-400 border border-purple-800">
                  Preview
                </span>
              )}
              {!lesson.is_published && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-900/30 text-red-400 border border-red-800">
                  Draft
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(lesson);
            }}
            className="p-1 rounded text-blue-400 hover:bg-blue-900/20 flex-shrink-0 hover-lift"
            title="Edit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(lesson.id);
            }}
            className="p-1 rounded text-red-400 hover:bg-red-900/20 flex-shrink-0 hover-lift"
            title="Delete"
          >
            <TrashIcon size={14} />
          </button>
        </div>
      </div>
    </li>
  );
};

const LessonList = ({ 
  moduleId, 
  selectedLessonId, 
  onSelectLesson, 
  onLessonCreated,
  onLessonUpdated,
  onEditLesson
}: LessonListProps) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (moduleId) {
      loadLessons();
    } else {
      setLessons([]);
      setLoading(false);
    }
  }, [moduleId]);

  const loadLessons = async () => {
    console.log('DEBUG: LessonList - Loading lessons for module:', moduleId);
    if (!moduleId) return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await listLessons(moduleId);
      console.log('DEBUG: LessonList - listLessons result:', result);
      if (result.error) {
        console.error('DEBUG: LessonList - Error loading lessons:', result.error);
        setError(result.error);
      } else if (result.data) {
        console.log('DEBUG: LessonList - Loaded lessons:', result.data);
        // Sort by order_index
        const sortedLessons = [...result.data].sort((a, b) => a.order_index - b.order_index);
        setLessons(sortedLessons);
      }
    } catch (err) {
      console.error('DEBUG: LessonList - Exception loading lessons:', err);
      setError('Failed to load lessons');
    } finally {
      console.log('DEBUG: LessonList - Finished loading lessons, loading state:', false);
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) {
      return;
    }

    try {
      console.log('DEBUG: LessonList - Deleting lesson:', id);
      const result = await deleteLesson(id);
      console.log('DEBUG: LessonList - deleteLesson result:', result);
      if (result.error) {
        console.error('DEBUG: LessonList - Error deleting lesson:', result.error);
        setError(result.error);
      } else {
        console.log('DEBUG: LessonList - Lesson deleted successfully');
        setLessons(lessons.filter(lesson => lesson.id !== id));
        if (selectedLessonId === id) {
          onSelectLesson(null);
        }
        onLessonUpdated();
      }
    } catch (err) {
      console.error('DEBUG: LessonList - Exception deleting lesson:', err);
      setError('Failed to delete lesson');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Find the indices of the dragged and target items
      const oldIndex = lessons.findIndex(lesson => lesson.id === active.id);
      const newIndex = lessons.findIndex(lesson => lesson.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Update the local state optimistically
        const newLessons = arrayMove(lessons, oldIndex, newIndex);
        setLessons(newLessons);

        // Update the order on the server
        const lessonIds = newLessons.map(lesson => lesson.id);
        const result = await reorderLessons(moduleId!, lessonIds);
        if (result.error) {
          setError(result.error);
          // If reorder failed, revert the change
          loadLessons();
        } else {
          onLessonUpdated();
        }
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">Lessons</h3>
        {error && (
          <div className="mt-2 p-2 bg-red-900/30 border border-red-700 rounded text-red-300 text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-400">Loading lessons...</div>
        ) : lessons.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            {moduleId ? 'No lessons found' : 'Select a module to view lessons'}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={lessons.map(l => l.id)} strategy={verticalListSortingStrategy}>
              <ul className="divide-y divide-gray-700">
                {lessons.map((lesson) => (
                  <SortableLessonItem
                    key={lesson.id}
                    lesson={lesson}
                    isSelected={selectedLessonId === lesson.id}
                    onSelect={onSelectLesson}
                    onDelete={handleDeleteLesson}
                    onEdit={onEditLesson}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};

export default LessonList;