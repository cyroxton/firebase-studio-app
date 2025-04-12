import {useState} from 'react';
import {Icons} from '@/components/icons';
import {Button} from '@/components/ui/button';

interface TaskItemProps {
  id: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  onComplete: (id: string) => void;
  onPriorityChange: (id: string, priority: 'low' | 'medium' | 'high') => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  id,
  description,
  priority,
  completed,
  onComplete,
  onPriorityChange,
}) => {
  const [isCompleted, setIsCompleted] = useState(completed);

  const handleComplete = () => {
    setIsCompleted(!isCompleted);
    onComplete(id);
  };

  const handlePriorityChange = (newPriority: 'low' | 'medium' | 'high') => {
    onPriorityChange(id, newPriority);
  };

  return (
    <div className={`task-item ${isCompleted ? 'completed' : ''}`}>
      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={handleComplete}
            className="mr-2 h-5 w-5 accent-purple-a020f0"
          />
          <span>{description}</span>
        </label>

        <div>
          <select
            value={priority}
            onChange={e => handlePriorityChange(e.target.value as 'low' | 'medium' | 'high')}
            className="rounded-md border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
