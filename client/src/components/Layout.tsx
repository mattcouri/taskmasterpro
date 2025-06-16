import { Link, useLocation } from 'wouter';
import { Calendar, CheckSquare, Shield, Target, DollarSign, Heart, Moon, Sun, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();

  const navigation = [
    { name: 'Daily Plan', href: '/', icon: Calendar },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'To-Do Lists', href: '/todos', icon: CheckSquare },
    { name: 'Passwords', href: '/passwords', icon: Shield },
    { name: 'Goals & Habits', href: '/goals', icon: Target },
    { name: 'Financial', href: '/finance', icon: DollarSign },
    { name: 'Health Tracker', href: '/health', icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-pink-100 bg-white/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-6">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-pink-500 to-orange-500 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
              Daily Organizer
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white shadow-lg shadow-pink-500/25'
                      : 'text-gray-600 hover:bg-gradient-to-r hover:from-pink-100 hover:to-orange-100 hover:text-pink-600'
                  }`}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-lg hover:bg-pink-100"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-6 pb-12">
        <div className="px-6">
          {children}
        </div>
      </main>
    </div>
  );
}