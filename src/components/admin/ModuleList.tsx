'use client';

import { useState, useEffect } from 'react';
import { Module } from '@/types/course';
import { listModules, createModule, updateModule, deleteModule } from '@/actions/courseActions';
import { PlusIcon, TrashIcon } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { reorderModules } from '@/actions/courseActions';

interface ModuleListProps {
  courseId: string | null;
  selectedModuleId: string | null;
  onSelectModule: (moduleId: string | null) => void;
  onModuleCreated: () => void;
  onModuleUpdated: () => void;
}

// Sortable Module Item Component
const SortableModuleItem = ({ 
  module, 
  isSelected, 
  onSelect,
  onDelete
}: { 
  module: Module; 
  isSelected: boolean; 
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id });

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
      onClick={() => onSelect(module.id)}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300 hover-lift"
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
          <span className="font-medium text-white">{module.title}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(module.id);
          }}
          className="p-1 rounded text-red-400 hover:bg-red-900/20 hover-lift"
          title="Delete"
        >
          <TrashIcon size={14} />
        </button>
      </div>
    </li>
  );
};

const ModuleList = ({ 
  courseId, 
  selectedModuleId, 
  onSelectModule, 
  onModuleCreated,
  onModuleUpdated
}: ModuleListProps) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (courseId) {
      loadModules();
    } else {
      setModules([]);
      setLoading(false);
    }
  }, [courseId]);

  const loadModules = async () => {
    console.log('DEBUG: ModuleList - Loading modules for course:', courseId);
    if (!courseId) return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await listModules(courseId);
      console.log('DEBUG: ModuleList - listModules result:', result);
      if (result.error) {
        console.error('DEBUG: ModuleList - Error loading modules:', result.error);
        setError(result.error);
      } else if (result.data) {
        console.log('DEBUG: ModuleList - Loaded modules:', result.data);
        // Sort by order_index
        const sortedModules = [...result.data].sort((a, b) => a.order_index - b.order_index);
        setModules(sortedModules);
      }
    } catch (err) {
      console.error('DEBUG: ModuleList - Exception loading modules:', err);
      setError('Failed to load modules');
    } finally {
      console.log('DEBUG: ModuleList - Finished loading modules, loading state:', false);
      setLoading(false);
    }
  };

  const handleCreateModule = async () => {
    if (!newModuleTitle.trim()) {
      setError('Module title is required');
      return;
    }

    if (!courseId) {
      setError('No course selected');
      return;
    }

    try {
      const result = await createModule(courseId, newModuleTitle);
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setModules([...modules, result.data]);
        setNewModuleTitle('');
        setShowCreateForm(false);
        onModuleCreated();
      }
    } catch (err) {
      setError('Failed to create module');
    }
  };

  const handleDeleteModule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this module? This will also delete all lessons in this module.')) {
      return;
    }

    try {
      const result = await deleteModule(id);
      if (result.error) {
        setError(result.error);
      } else {
        setModules(modules.filter(module => module.id !== id));
        if (selectedModuleId === id) {
          onSelectModule(null);
        }
        onModuleUpdated();
      }
    } catch (err) {
      setError('Failed to delete module');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Find the indices of the dragged and target items
      const oldIndex = modules.findIndex(module => module.id === active.id);
      const newIndex = modules.findIndex(module => module.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Update the local state optimistically
        const newModules = arrayMove(modules, oldIndex, newIndex);
        setModules(newModules);

        // Update the order on the server
        const moduleIds = newModules.map(module => module.id);
        const result = await reorderModules(courseId!, moduleIds);
        if (result.error) {
          setError(result.error);
          // If reorder failed, revert the change
          loadModules();
        } else {
          onModuleUpdated();
        }
      }
    }
  };

  return (
    <div className="border-r border-gray-700 h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Modules</h3>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            disabled={!courseId}
            className={`hover-lift ${
              courseId 
                ? 'bg-accent-primary hover:bg-accent-primary/90 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            } px-3 py-1 rounded-md text-sm font-medium transition-colors`}
          >
            <PlusIcon size={16} />
          </button>
        </div>

        {showCreateForm && courseId && (
          <div className="mb-4 p-3 bg-gray-800 rounded-lg">
            <input
              type="text"
              value={newModuleTitle}
              onChange={(e) => setNewModuleTitle(e.target.value)}
              placeholder="Module title"
              className="w-full p-2 mb-2 rounded bg-gray-700 border border-gray-600 text-white"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateModule}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm hover-lift"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewModuleTitle('');
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm hover-lift"
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
          <div className="p-4 text-center text-gray-400">Loading modules...</div>
        ) : modules.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            {courseId ? 'No modules found' : 'Select a course to view modules'}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={modules.map(m => m.id)} strategy={verticalListSortingStrategy}>
              <ul className="divide-y divide-gray-700">
                {modules.map((module) => (
                  <SortableModuleItem
                    key={module.id}
                    module={module}
                    isSelected={selectedModuleId === module.id}
                    onSelect={onSelectModule}
                    onDelete={handleDeleteModule}
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

export default ModuleList;