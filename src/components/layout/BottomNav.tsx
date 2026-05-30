import { NavLink } from 'react-router-dom';
import { mobileNav } from './navItems';

export function BottomNav() {
  return (
    <nav className="bottom-nav-safe fixed inset-x-0 bottom-0 z-30 flex border-t border-neutral-200/70 bg-white/95 backdrop-blur-md lg:hidden">
      {mobileNav.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-medium transition-colors touch-manipulation ${
                isActive ? 'text-flow-600' : 'text-neutral-400'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
