import { useMutation } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { TaskForm, TaskFormValues } from "./task-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// New Task Dialog Component
type NewTaskDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export function NewTaskDialog({ isOpen, onOpenChange }: NewTaskDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: TaskFormValues) => {
      const res = await apiRequest("POST", "/api/tasks", {
        ...taskData,
        userId: user?.id,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      onOpenChange(false);
      toast({
        title: "Task created",
        description: "Your new task has been created successfully.",
        variant: "success",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: TaskFormValues) => {
    createTaskMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to your personal task list.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <TaskForm 
            onSubmit={handleSubmit}
            isPending={createTaskMutation.isPending}
          />
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createTaskMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={() => {
              document.querySelector('form')?.dispatchEvent(
                new Event('submit', { cancelable: true, bubbles: true })
              );
            }}
            disabled={createTaskMutation.isPending}
          >
            {createTaskMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Task"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Edit Task Dialog Component
type EditTaskDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  onUpdateTask: (taskData: TaskFormValues) => void;
  isPending: boolean;
};

export function EditTaskDialog({ 
  isOpen, 
  onOpenChange, 
  task, 
  onUpdateTask,
  isPending
}: EditTaskDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Make changes to your task here.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <TaskForm 
            defaultValues={{
              title: task.title,
              description: task.description || "",
              status: task.status as "pending" | "completed",
            }}
            onSubmit={onUpdateTask}
            isPending={isPending}
          />
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={() => {
              document.querySelector('form')?.dispatchEvent(
                new Event('submit', { cancelable: true, bubbles: true })
              );
            }}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Task"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Delete Task Dialog Component
type DeleteTaskDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
  isPending: boolean;
};

export function DeleteTaskDialog({ 
  isOpen, 
  onOpenChange, 
  onConfirmDelete,
  isPending
}: DeleteTaskDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this task? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirmDelete();
            }}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
