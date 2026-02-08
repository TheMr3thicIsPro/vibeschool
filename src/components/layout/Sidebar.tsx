'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { 
      href: '/dashboard', 
      icon: Home, 
      label: 'Home' 
    },
    { 
      href: '/courses', 
      icon: BookOpen, 
      label: 'Courses' 
    },
    { 
      href: '/social', 
      icon: MessageCircle, 
      label: 'Social' 
    },
    { 
      href: '/profile', 
      icon: User, 
      label: 'Profile' 
    },
  ];

  return (
    <div className="w-16 bg-sidebar-bg flex flex-col items-center py-4 space-y-6">
      <div className="flex-1 flex flex-col items-center space-y-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={cn(
                'p-2 rounded-lg transition-all duration-200 flex items-center justify-center hover-lift',
                'text-gray-400 hover:text-accent-primary hover:bg-gray-800',
                isActive 
                  ? 'text-accent-primary bg-gray-800 active-glow' 
                  : 'hover:glow-button'
              )}
              title={item.label}
            >
              <Icon size={24} />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;