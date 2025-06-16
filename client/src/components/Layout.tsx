import { Link, useLocation } from "wouter";
import { useTheme } from "./ThemeProvider";
import { Button } from "@/components/ui/button";
import { 
  CalendarDays, CalendarCheck, CheckSquare, Key, Target, 
  TrendingUp, Heart, Moon, Sun, Menu, Settings, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();

  const navigation = [
    { name: "Daily Plan", href: "/", icon: CalendarCheck },
    { name: "Calendar", href: "/calendar", icon: CalendarDays },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Passwords", href: "/passwords", icon: Key },
    { name: "Goals", href: "/goals", icon: Target },
    { name: "Finance", href: "/finance", icon: TrendingUp },
    { name: "Health", href: "/health", icon: Heart },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 glass backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <CalendarCheck className="w-4 h-4 text-white" />
              </div>
              <h1 className="font-heading font-bold text-xl text-gray-900 dark:text-white">
                Daily Organizer
              </h1>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <a className={cn(
                      "nav-link flex items-center space-x-2 text-sm",
                      isActive(item.href) 
                        ? "nav-link active" 
                        : "text-gray-600 dark:text-gray-300 hover:text-primary"
                    )}>
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </a>
                  </Link>
                );
              })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="glass hover:bg-white/20 dark:hover:bg-gray-800/20"
              >
                {theme === "light" ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
              </Button>
              
              <Button
                variant="default"
                size="sm"
                className="gradient-primary text-white border-0 hover:opacity-90"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync Calendar
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="glass hover:bg-white/20 dark:hover:bg-gray-800/20 md:hidden"
              >
                <Menu className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Floating Action Button */}
      <Button
        size="icon"
        className="fixed bottom-6 right-6 w-14 h-14 gradient-primary text-white shadow-lg hover:scale-110 transition-all animate-pulse-gentle rounded-full"
      >
        <Settings className="w-6 h-6" />
      </Button>
    </div>
  );
}
