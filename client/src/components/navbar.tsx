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
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Left: Logo */}
          <div className="flex items-center">
            <ListTodo className="text-primary h-6 w-6 mr-2" />
            <h1 className="text-xl font-semibold text-slate-900">Task Manager</h1>
          </div>

          {/* Center: Username */}
          {user && (
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <span className="text-lg text-slate-700">{user.name}</span>
            </div>
          )}

          {/* Right: Logout */}
          <div className="flex items-center space-x-4">
            {user && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-200 hover:text-rose-700"
              >
                {logoutMutation.isPending ? "Logging out..." : "Log out"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
