import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Heart, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navigation() {
  const { user } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { path: '/', label: 'Patient Portal' },
    { path: '/resources', label: 'Resources' },
    { path: '/team', label: 'Our Team' },
  ];

  // Add admin panel for admin users
  if ((user as any)?.role === 'admin') {
    navItems.splice(1, 0, { path: '/admin', label: 'Admin Panel' });
  }

  return (
    <nav className="glass-effect border-b border-white/20 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Heart className="text-gradient text-2xl mr-3 pulse-glow" />
            <h1 className="text-xl font-bold text-gradient">SmileCare Dental</h1>
          </div>
          
          {/* Navigation Tabs */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'text-white bg-gradient-primary shadow-lg transform -translate-y-0.5'
                      : 'text-gray-700 hover:text-white hover:bg-gradient-primary hover:shadow-md hover:transform hover:-translate-y-0.5'
                  }`}
                >
                  {item.label}
                </button>
              </Link>
            ))}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img 
                src={(user as any)?.profileImageUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150'} 
                alt="User Profile" 
                className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/50 hover:ring-blue-500 transition-all"
              />
              <span className="text-sm font-medium text-gray-700">
                {(user as any)?.firstName || 'User'}
              </span>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hover:bg-red-100 hover:text-red-600 transition-colors">
                  <LogOut className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => window.location.href = '/api/logout'}
                  className="text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="px-4 py-2 space-y-1">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <button
                className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
