import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { LucideIcon } from 'lucide-react';

interface SidebarNavItemProps {
  to: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

export const SidebarNavItem: React.FC<SidebarNavItemProps> = ({ to, icon: Icon, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        'flex items-center gap-3 rounded-lg mt-2 mb-2 px-3 py-2 text-neutral-400 transition-all hover:text-white hover:bg-red-800',
        isActive && 'bg-red-800 text-white'
      )}
    >
      <Icon className="h-5 w-5" />
      {children}
    </Link>
  );
}; 