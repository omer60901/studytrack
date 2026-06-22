import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/subjects', label: 'Subjects' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/planner', label: 'Planner' },
  { to: '/flashcards', label: 'Flashcards' },
  { to: '/notes', label: 'Notes' },
  { to: '/settings', label: 'Settings' }
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar = ({ open, onClose }: SidebarProps) => (
  <>
    {open && (
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        onClick={onClose}
      />
    )}

    <aside
      className={`fixed inset-y-0 left-0 z-50 w-72 flex-col border-r border-slate-800/70 bg-slate-950/98 px-6 py-8 text-slate-100 backdrop-blur transition-transform duration-300 lg:relative lg:translate-x-0 lg:flex ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="mb-10 rounded-[2rem] bg-slate-900/80 p-5 shadow-xl shadow-slate-950/30">
        <div className="inline-flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-violet-500/15 text-2xl text-violet-300">S</div>
          <div>
            <p className="text-lg font-semibold text-white">StudyTrack</p>
            <p className="mt-1 text-sm text-slate-400">Focus. Learn. Achieve.</p>
          </div>
        </div>
      </div>

      <nav className="space-y-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onClose}
            className={({ isActive }) =>
              `block rounded-2xl px-4 py-2.5 text-sm font-semibold transition duration-200 ${
                isActive ? 'bg-gradient-to-r from-sky-500 to-violet-500 text-white shadow-lg shadow-violet-500/20' : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-[2rem] border border-slate-800/70 bg-slate-900/90 p-4 text-xs text-slate-400">
        <p className="font-semibold text-slate-200">Shortcuts</p>
        <p className="mt-1">Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">G</kbd> then key to navigate</p>
        <p className="mt-0.5"><kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300">D</kbd> Dashboard, <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300">T</kbd> Tasks, etc.</p>
      </div>
    </aside>
  </>
);

export default Sidebar;
