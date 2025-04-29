import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Task } from "@shared/schema";
import { Pencil, Trash, RefreshCw, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type TaskCardProps = {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onStatusToggle: () => void;
};

export function TaskCard({ task, onEdit, onDelete, onStatusToggle }: TaskCardProps) {
  const isCompleted = task.status === "completed";
  
  return (
    <Card className="shadow-sm hover:shadow-md transition-all">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-medium text-slate-900 text-base">{task.title}</h3>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-slate-500 hover:text-primary" 
              onClick={onEdit}
              title="Edit task"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-slate-500 hover:text-red-600" 
              onClick={onDelete}
              title="Delete task"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <p className="text-sm text-slate-600 mb-4">
          {task.description || "No description"}
        </p>
        
        <div className="flex items-center justify-between">
          <Badge variant={isCompleted ? "success" : "pending"}>
            {isCompleted ? "Completed" : "Pending"}
          </Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`text-xs flex items-center ${
              isCompleted 
                ? "text-slate-600 hover:text-amber-600" 
                : "text-slate-600 hover:text-emerald-600"
            }`}
            onClick={onStatusToggle}
          >
            {isCompleted ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1" /> Mark pending
              </>
            ) : (
              <>
                <CheckCircle className="h-3 w-3 mr-1" /> Mark completed
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
