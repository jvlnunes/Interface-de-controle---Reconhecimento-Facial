import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Acessos', icon: GridIcon, end: true }, 
  { to: '/funcionarios', label: 'Funcionários', icon: PeopleIcon, end: false },
];

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 shrink-0 bg-ink text-white flex flex-col">
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-white/10">
          <div className="w-8 h-8 rounded-md bg-accent/15 border border-accent/40 flex items-center justify-center">
            <ReticleIcon />
          </div>
          <div className="leading-tight">
            <div className="font-display font-semibold text-[15px] tracking-tight">Biometria</div>
            <div className="text-[11px] text-white/45 font-mono">cadastro facial</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* <div className="px-5 py-4 border-t border-white/10 text-[11px] text-white/35 font-mono">
          v1.0 · ambiente local
        </div> */}
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 shrink-0 bg-surface border-b border-line flex items-center justify-between px-8">
          <div className="text-sm text-text-muted font-mono">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          </div>
          <div className="flex items-center gap-3">
            {/* <div className="w-8 h-8 rounded-full bg-primary-soft text-primary-strong flex items-center justify-center text-xs font-semibold font-display">
              RH
            </div> */}
          </div>
        </header>
        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="2" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="10" y="2" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="2" y="10" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="10" y="10" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="7" cy="6" r="2.4" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2.5 15c0-2.4 2-4 4.5-4s4.5 1.6 4.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="13" cy="5.5" r="1.8" stroke="currentColor" strokeWidth="1.3" opacity="0.7" />
      <path d="M12 15c0-1.8 1-3.2 3-3.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

function ReticleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1 4V1h3M12 1h3v3M15 12v3h-3M4 15H1v-3" stroke="var(--color-accent)" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="8" cy="8" r="2" stroke="var(--color-accent)" strokeWidth="1.4" />
    </svg>
  );
}