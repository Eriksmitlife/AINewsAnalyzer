import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Brain, Search, Bell, Settings, User, LogOut } from "lucide-react";

export default function Header() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log("Searching for:", search);
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "U";
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
              AutoNews.AI
            </span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search news, NFTs, or topics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 focus-ring"
              />
            </form>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center p-0">
                3
              </Badge>
            </Button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={user?.profileImageUrl || undefined} 
                      alt="Profile"
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold">
                      {getInitials(user?.firstName, user?.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                    {user?.firstName || user?.lastName 
                      ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
                      : 'User'
                    }
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm">
                  <div className="font-medium">{user?.firstName || 'User'}</div>
                  <div className="text-gray-500">{user?.email}</div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => window.location.href = "/api/logout"}
                  className="text-red-600 dark:text-red-400"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
