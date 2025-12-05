import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './KanbanBoard.css';

function KanbanCard({ task, onToggle, onDelete, onEdit, onUpdatePriority, onUpdateStatus }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleEdit = () => {
    if (editText.trim() && editText !== task.text) {
      onEdit(task.id, editText);
    }
    setIsEditing(false);
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#3498db';
      default: return '#95a5a6';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="kanban-card">
      {isEditing ? (
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleEdit();
            if (e.key === 'Escape') {
              setEditText(task.text);
              setIsEditing(false);
            }
          }}
          className="kanban-card-edit"
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div 
          className="kanban-card-text"
          onDoubleClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
        >
          {task.text}
        </div>
      )}

      <div className="kanban-card-meta">
        {task.category && (
          <span className="kanban-card-category">
            <i className="fas fa-tag"></i> {task.category}
          </span>
        )}
        {task.dueDate && (
          <span className="kanban-card-date">
            <i className="fas fa-calendar"></i> {formatDate(task.dueDate)}
            {task.dueTime && <span> {formatTime(task.dueTime)}</span>}
          </span>
        )}
      </div>

      <div className="kanban-card-footer">
        <div className="kanban-card-actions">
          <span 
            className="kanban-priority-dot" 
            style={{ backgroundColor: getPriorityColor(task.priority) }}
            title={task.priority}
          ></span>
          
          {/* Move buttons */}
          <div className="kanban-move-buttons">
            {(task.status === 'in-progress' || task.status === 'done') && (
              <button
                className="kanban-move-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateStatus(task.id, null);
                }}
                title="Move to To Do"
              >
                <i className="fas fa-arrow-left"></i>
              </button>
            )}
            
            {(task.status === null || task.status === 'done' || !task.status) && !task.completed && (
              <button
                className="kanban-move-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateStatus(task.id, 'in-progress');
                }}
                title="Move to In Progress"
              >
                <i className="fas fa-play"></i>
              </button>
            )}
            
            {task.status !== 'done' && !task.completed && (
              <button
                className="kanban-move-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateStatus(task.id, 'done');
                }}
                title="Move to Done"
              >
                <i className="fas fa-check"></i>
              </button>
            )}
          </div>
        </div>
        
        <button 
          className="kanban-card-delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
        >
          <i className="fas fa-trash"></i>
        </button>
      </div>
    </div>
  );
}

function KanbanColumn({ title, tasks, status, onToggle, onDelete, onEdit, onUpdatePriority, onUpdateStatus }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status}`
  });

  return (
    <div 
      className={`kanban-column ${isOver ? 'column-over' : ''}`} 
      ref={setNodeRef}
    >
      <div className="kanban-column-header">
        <h3>{title}</h3>
        <span className="kanban-column-count">{tasks.length}</span>
      </div>
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="kanban-column-content">
          {tasks.length === 0 ? (
            <div className="kanban-empty">Drop tasks here</div>
          ) : (
            tasks.map(task => (
              <KanbanCard
                key={task.id}
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
                onEdit={onEdit}
                onUpdatePriority={onUpdatePriority}
                onUpdateStatus={onUpdateStatus}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

function KanbanBoard({ tasks, onToggle, onDelete, onEdit, onUpdatePriority, onUpdateStatus }) {
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const todoTasks = tasks.filter(t => !t.completed && !t.status);
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  const doneTasks = tasks.filter(t => t.completed || t.status === 'done');

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    console.log('Drag ended - Active:', active.id, 'Over:', over?.id);
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeTask = tasks.find(t => t.id === active.id);
    if (!activeTask) {
      setActiveId(null);
      return;
    }
    
    let newStatus = null;
    
    // Check if dropped on a column
    if (over.id.startsWith('column-')) {
      const columnStatus = over.id.replace('column-', '');
      console.log('Dropped on column:', columnStatus);
      
      if (columnStatus === 'todo' || columnStatus === 'null') {
        newStatus = null;
      } else if (columnStatus === 'in-progress') {
        newStatus = 'in-progress';
      } else if (columnStatus === 'done') {
        newStatus = 'done';
      }
    } else {
      // Dropped on a task - determine which column the target task is in
      const overTask = tasks.find(t => t.id === over.id);
      if (overTask) {
        newStatus = overTask.status;
        console.log('Dropped on task with status:', newStatus);
      }
    }

    // Get current status for comparison
    const currentStatus = activeTask.completed ? 'done' : (activeTask.status || null);
    console.log('Current status:', currentStatus, 'New status:', newStatus);
    
    // Update if status changed
    if (newStatus !== currentStatus && newStatus !== undefined) {
      console.log('Updating status to:', newStatus);
      onUpdateStatus(active.id, newStatus);
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="kanban-board">
        <KanbanColumn
          title="📋 To Do"
          tasks={todoTasks}
          status="todo"
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
          onUpdatePriority={onUpdatePriority}
          onUpdateStatus={onUpdateStatus}
        />
        
        <KanbanColumn
          title="⚡ In Progress"
          tasks={inProgressTasks}
          status="in-progress"
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
          onUpdatePriority={onUpdatePriority}
          onUpdateStatus={onUpdateStatus}
        />
        
        <KanbanColumn
          title="✅ Done"
          tasks={doneTasks}
          status="done"
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
          onUpdatePriority={onUpdatePriority}
          onUpdateStatus={onUpdateStatus}
        />
      </div>
    </DndContext>
  );
}

export default KanbanBoard;