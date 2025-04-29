import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ListTodo } from "lucide-react";

export function Navbar() {
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <ListTodo className="text-primary h-6 w-6 mr-2" />
            <h1 className="text-xl font-semibold text-slate-900">TaskFlow</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              {user && (
                <>
                  <span className="text-sm text-slate-700 mr-3">{user.name}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    {logoutMutation.isPending ? "Logging out..." : "Log out"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
