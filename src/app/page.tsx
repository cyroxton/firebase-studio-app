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
import {Switch} from "@/components/ui/switch";

type Task = {
  id: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [prioritySuggestion, setPrioritySuggestion] = useState<
    {priority: 'low' | 'medium' | 'high'; reasoning: string} | null
  >(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {toast} = useToast();
  const [darkMode, setDarkMode] = useState(false);

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
      };
      setTasks([...tasks, newTask]);
      setNewTaskDescription('');
      setPrioritySuggestion(null);
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-24">
      <h1 className="text-4xl font-semibold mb-6">
        <span className="gradient-text">Rappel de MAMAN CELI</span> 🥰
      </h1>

      <div className="w-full max-w-md">
        <div className="flex flex-col mb-4">
          <Textarea
            value={newTaskDescription}
            onChange={e => setNewTaskDescription(e.target.value)}
            placeholder="Enter task description"
            className="mb-2"
          />

          <div className="flex justify-between items-center">
            <Button onClick={addTask} className="bg-purple-a020f0 text-white">
              Add Task
            </Button>

            {prioritySuggestion && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">
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
                    <AlertDialogAction onClick={() => setIsDialogOpen(false)}>
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
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
              <div className="flex items-center space-x-2">
                <Switch
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={(checked) => {
                    setDarkMode(checked);
                  }}
                />
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

