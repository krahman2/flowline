import {
  Calendar,
  FolderKanban,
  History,
  LayoutDashboard,
  Settings,
  Sun,
  Target,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
};

export const primaryNav: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/today', label: 'Today', icon: Sun },
  { to: '/projects', label: 'Flows', icon: FolderKanban },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
];

export const secondaryNav: NavItem[] = [
  { to: '/history', label: 'History', icon: History },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export const mobileNav: NavItem[] = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/today', label: 'Today', icon: Sun },
  { to: '/projects', label: 'Flows', icon: FolderKanban },
  { to: '/settings', label: 'Settings', icon: Settings },
];
