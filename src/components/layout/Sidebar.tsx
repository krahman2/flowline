import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Plus } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { useUI } from '../../store/UIContext';
import { getWeeklyFocusMinutes } from '../../store/gamification';
import { GoalProgressCard } from '../ui/GoalProgressCard';
import { FlowlineMark } from '../illustrations/FlowlineMark';
import { primaryNav, secondaryNav, type NavItem } from './navItems';

function NavRow({ item }: { item: NavItem }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isActive ? 'text-neutral-900' : 'text-neutral-500 hover:bg-neutral-100/70 hover:text-neutral-800'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="sidebar-active"
              className="absolute inset-0 -z-0 rounded-lg bg-neutral-100"
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            />
          )}
          <Icon
            className={`relative z-10 h-[18px] w-[18px] ${
              isActive ? 'text-flow-600' : 'text-neutral-400 group-hover:text-neutral-600'
            }`}
          />
          <span className="relative z-10">{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

export function Sidebar() {
  const { stats, sessions } = useApp();
  const { openNewProject } = useUI();
  const weeklyMinutes = getWeeklyFocusMinutes(sessions);

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-neutral-200/70 bg-white/60 px-3 py-4 lg:flex">
      <div className="flex items-center gap-2.5 px-2 pb-4">
        <FlowlineMark />
        <span className="text-[15px] font-semibold tracking-tight text-neutral-900">Flowline</span>
      </div>

      <button onClick={openNewProject} className="btn-primary mx-1 mb-4 py-2 text-sm">
        <Plus className="h-4 w-4" />
        New flow
      </button>

      <nav className="space-y-0.5">
        {primaryNav.map((item) => (
          <NavRow key={item.to} item={item} />
        ))}
      </nav>

      <div className="my-3 border-t border-neutral-100" />

      <nav className="space-y-0.5">
        {secondaryNav.map((item) => (
          <NavRow key={item.to} item={item} />
        ))}
      </nav>

      <div className="mt-auto px-1 pt-4">
        <GoalProgressCard
          compact
          focusMinutes={weeklyMinutes}
          goalMinutes={stats.weeklyFocusGoalMinutes}
        />
        <div className="mt-3 flex items-center justify-between px-0.5 text-[11px] text-neutral-400">
          <span className="inline-flex items-center gap-1">
            <Flame className="h-3 w-3 text-orange-500" />
            {stats.streakDays} day streak
          </span>
          <span className="font-medium text-flow-600">{stats.totalXp} XP</span>
        </div>
      </div>
    </aside>
  );
}

