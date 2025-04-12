'use client';

import {useState, useEffect} from 'react';
import {Icons} from '@/components/icons';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import TaskItem from '@/components/task-item';
import {Textarea} from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {suggestTaskPriority} from '@/ai/flows/suggest-task-priority';
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';
import {useToast} from '@/hooks/use-toast';
import {Switch} from '@/components/ui/switch';
import {cn} from '@/lib/utils';
import {Calendar} from '@/components/ui/calendar';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {CalendarIcon} from 'lucide-react';
import {format} from 'date-fns';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';

type Subtask = {
  id: string;
  description: string;
  completed: boolean;
};

type Task = {
  id: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  subtasks: Subtask[];
  dueDate?: Date;
  category: string;
};

const categories = ['Work', 'Personal', 'Home', 'Errands'];

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [prioritySuggestion, setPrioritySuggestion] = useState<
    {priority: 'low' | 'medium' | 'high'; reasoning: string} | null
  >(null);
  const [darkMode, setDarkMode] = useState(false);
  const [newSubtaskDescription, setNewSubtaskDescription] = useState('');
  const [selectedDueDate, setSelectedDueDate] = useState<Date | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  useEffect(() => {
    const storedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(storedDarkMode);
    if (storedDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    if (newTaskDescription) {
      getPrioritySuggestion(newTaskDescription);
    }
  }, [newTaskDescription]);

  const addTask = () => {
    if (newTaskDescription.trim() !== '') {
      const newTask: Task = {
        id: crypto.randomUUID(),
        description: newTaskDescription,
        priority: prioritySuggestion?.priority || 'medium',
        completed: false,
        subtasks: [],
        dueDate: selectedDueDate,
        category: selectedCategory,
      };
      setTasks([...tasks, newTask]);
      setNewTaskDescription('');
      setPrioritySuggestion(null);
      setSelectedDueDate(undefined);
      setNewSubtaskDescription('');
      toast({
        title: 'Task Added',
        description: 'Your task has been added to the list.',
      });
    }
  };

  const completeTask = (id: string) => {
    setTasks(
      tasks.map(task =>
        task.id === id ? {...task, completed: !task.completed} : task
      )
    );
  };

  const changeTaskPriority = (id: string, priority: 'low' | 'medium' | 'high') => {
    setTasks(
      tasks.map(task => (task.id === id ? {...task, priority: priority} : task))
    );
  };

  async function getPrioritySuggestion(description: string) {
    const suggestion = await suggestTaskPriority({taskDescription: description});
    if (suggestion) {
      setPrioritySuggestion({
        priority: suggestion.suggestedPriority,
        reasoning: suggestion.reasoning,
      });
    }
  }

  const onDragEnd = result => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTasks(items);
  };

  const toggleDarkMode = (checked: boolean) => {
    setDarkMode(checked);
    localStorage.setItem('darkMode', checked.toString());
    if (checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const addSubtask = (taskId: string) => {
    if (newSubtaskDescription.trim() !== '') {
      const newSubtask: Subtask = {
        id: crypto.randomUUID(),
        description: newSubtaskDescription,
        completed: false,
      };
      setTasks(
        tasks.map(task =>
          task.id === taskId ? {...task, subtasks: [...task.subtasks, newSubtask]} : task
        )
      );
      setNewSubtaskDescription('');
    }
  };

  const completeSubtask = (taskId: string, subtaskId: string) => {
    setTasks(
      tasks.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            subtasks: task.subtasks.map(subtask =>
              subtask.id === subtaskId ? {...subtask, completed: !subtask.completed} : subtask
            ),
          };
        }
        return task;
      })
    );
  };

  return (
    <main className={cn('flex min-h-screen flex-col items-center justify-start p-24', darkMode ? 'dark' : '')}>
      <h1 className="text-4xl font-semibold mb-6">
        <span className="gradient-text">Rappel de MAMAN CELI</span> 🥰
      </h1>

      <div className="w-full max-w-md">
        <div className="flex flex-col mb-4">
          <Textarea
            value={newTaskDescription}
            onChange={e => setNewTaskDescription(e.target.value)}
            placeholder="Enter task description"
            className="mb-2 shadow-depth"
          />

          <div className="flex justify-between items-center mb-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'justify-start text-left font-normal',
                    !selectedDueDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDueDate ? format(selectedDueDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDueDate}
                  onSelect={setSelectedDueDate}
                  disabled={date => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between items-center">
            <Button onClick={addTask} className="bg-purple-a020f0 text-white shadow-depth">
              Add Task
            </Button>

            {prioritySuggestion && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="shadow-depth">
                    AI Suggestion:{' '}
                    <span className={`task-priority ${prioritySuggestion.priority}`}>
                      {prioritySuggestion.priority}
                    </span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>AI Priority Suggestion</AlertDialogTitle>
                    <AlertDialogDescription>
                      The AI suggests a{' '}
                      <span className={`task-priority ${prioritySuggestion.priority}`}>
                        {prioritySuggestion.priority}
                      </span>{' '}
                      priority because: {prioritySuggestion.reasoning}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => {
                      setTasks(prevTasks => {
                        const newTask: Task = {
                          id: crypto.randomUUID(),
                          description: newTaskDescription,
                          priority: prioritySuggestion?.priority || 'medium',
                          completed: false,
                          subtasks: [],
                          dueDate: selectedDueDate,
                          category: selectedCategory,
                        };
                        return [...prevTasks, newTask];
                      });
                      setNewTaskDescription('');
                      setPrioritySuggestion(null);
                      setSelectedDueDate(undefined);
                    }}>
                      Accept
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="tasks">
            {provided => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {tasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {provided => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <TaskItem
                          key={task.id}
                          id={task.id}
                          description={task.description}
                          priority={task.priority}
                          completed={task.completed}
                          onComplete={completeTask}
                          onPriorityChange={changeTaskPriority}
                          subtasks={task.subtasks}
                          onCompleteSubtask={completeSubtask}
                          dueDate={task.dueDate}
                          category={task.category}
                        />
                        <div className="flex items-center mt-2">
                          <Input
                            type="text"
                            value={newSubtaskDescription}
                            onChange={e => setNewSubtaskDescription(e.target.value)}
                            placeholder="Add subtask"
                            className="mr-2 shadow-depth"
                          />
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => addSubtask(task.id)}
                            className="shadow-depth"
                          >
                            Add Subtask
                          </Button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <div className="flex items-center space-x-2 mt-4">
          <Switch id="dark-mode" checked={darkMode} onCheckedChange={toggleDarkMode} className="shadow-depth" />
          <label
            htmlFor="dark-mode"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Dark Mode
          </label>
        </div>
      </div>
    </main>
  );
}

