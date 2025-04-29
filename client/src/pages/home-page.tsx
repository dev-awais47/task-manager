import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Navbar } from "@/components/navbar";
import { TaskCard } from "@/components/task-card";
import { Filters } from "@/components/filters";
import { 
  NewTaskDialog, 
  EditTaskDialog, 
  DeleteTaskDialog 
} from "@/components/task-modals";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { toast } = useToast();
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "completed">("all");
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);
  const [isDeleteTaskOpen, setIsDeleteTaskOpen] = useState(false);

  // Fetch tasks
  const { data: tasks, isLoading, isError } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, taskData }: { taskId: number; taskData: Partial<Task> }) => {
      const res = await apiRequest("PUT", `/api/tasks/${taskId}`, taskData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setIsEditTaskOpen(false);
      toast({
        title: "Task updated",
        description: "Your task has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      await apiRequest("DELETE", `/api/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setIsDeleteTaskOpen(false);
      toast({
        title: "Task deleted",
        description: "Your task has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter tasks based on status
  const filteredTasks = tasks?.filter(task => {
    if (filterStatus === "all") return true;
    return task.status === filterStatus;
  }) || [];

  // Handle task edit
  const handleEditTask = (task: Task) => {
    setEditTask(task);
    setIsEditTaskOpen(true);
  };

  // Handle task delete confirmation
  const handleDeleteTask = (task: Task) => {
    setDeleteTask(task);
    setIsDeleteTaskOpen(true);
  };

  // Handle task status toggle
  const handleToggleStatus = (task: Task) => {
    const newStatus = task.status === "pending" ? "completed" : "pending";
    updateTaskMutation.mutate({
      taskId: task.id,
      taskData: { ...task, status: newStatus },
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">My Tasks</h2>
              <p className="text-sm text-slate-500 mt-1">Manage all your tasks in one place</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Filters currentFilter={filterStatus} onFilterChange={setFilterStatus} />
              
              <Button 
                onClick={() => setIsNewTaskOpen(true)}
                className="flex items-center justify-center"
              >
                <Plus className="h-5 w-5 mr-1" /> New Task
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <p className="text-red-500">Failed to load tasks. Please try again.</p>
            </div>
          ) : filteredTasks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map(task => (
                <TaskCard 
                  key={task.id}
                  task={task}
                  onEdit={() => handleEditTask(task)}
                  onDelete={() => handleDeleteTask(task)}
                  onStatusToggle={() => handleToggleStatus(task)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">No tasks found</h3>
              <p className="text-sm text-slate-500 mb-4">
                {filterStatus !== "all" 
                  ? `You don't have any ${filterStatus} tasks.` 
                  : "You don't have any tasks yet. Create your first task to get started."}
              </p>
              <Button onClick={() => setIsNewTaskOpen(true)}>
                <Plus className="h-5 w-5 mr-1" /> New Task
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Task Modals */}
      <NewTaskDialog 
        isOpen={isNewTaskOpen} 
        onOpenChange={setIsNewTaskOpen} 
      />
      
      {editTask && (
        <EditTaskDialog 
          isOpen={isEditTaskOpen}
          onOpenChange={setIsEditTaskOpen}
          task={editTask}
          onUpdateTask={(taskData) => {
            updateTaskMutation.mutate({
              taskId: editTask.id,
              taskData
            });
          }}
          isPending={updateTaskMutation.isPending}
        />
      )}
      
      {deleteTask && (
        <DeleteTaskDialog 
          isOpen={isDeleteTaskOpen}
          onOpenChange={setIsDeleteTaskOpen}
          onConfirmDelete={() => {
            deleteTaskMutation.mutate(deleteTask.id);
          }}
          isPending={deleteTaskMutation.isPending}
        />
      )}
    </div>
  );
}
