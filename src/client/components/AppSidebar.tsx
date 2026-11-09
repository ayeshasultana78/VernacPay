import React from 'react';
import { 
  LayoutDashboard, 
  Mic, 
  ReceiptText, 
  FileText, 
  Truck, 
  ShieldCheck, 
  FileCheck, 
  ChevronLeft, 
  ChevronRight,
  X
} from 'lucide-react';
import { useAppStore, NavigationView } from '../store/useAppStore';

interface NavItem {
  id: NavigationView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'voice', label: 'Voice Studio', icon: Mic, badge: 'AI', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { id: 'transactions', label: 'Ledger', icon: ReceiptText },
  { id: 'audit', label: 'Audit Trail', icon: ShieldCheck },
  { id: 'compliance', label: 'Compliance', icon: FileCheck },
];

export const AppSidebar: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    sidebarCollapsed, 
    setSidebarCollapsed,
    toggleSidebar,
    stagedConfirmation
  } = useAppStore();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {!sidebarCollapsed && (
        <div 
          onClick={() => setSidebarCollapsed(true)}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity"
        />
      )}

      {/* The Sidebar */}
      <aside
        className={`fixed md:sticky top-0 inset-y-0 left-0 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] flex flex-col justify-between transition-all duration-200 z-40 select-none ${
          sidebarCollapsed 
            ? '-translate-x-full md:translate-x-0 md:w-16' 
            : 'translate-x-0 w-64 md:w-60 shadow-2xl md:shadow-none'
        }`}
      >
        {/* Top Header / Brand */}
        <div>
          <div className="h-16 px-4 flex items-center justify-between border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-3 overflow-hidden">
              {/* Logo Mark */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-black text-slate-950 text-sm shadow-sm shrink-0">
                VP
              </div>

              {(!sidebarCollapsed || window.innerWidth < 768) && (
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-sm tracking-tight text-[var(--text-primary)] truncate">
                    VernacPay
                  </span>
                  <span className="text-[10px] font-mono text-[var(--accent-emerald)] font-medium tracking-wide">
                    GLOBAL EXPORT
                  </span>
                </div>
              )}
            </div>

            {/* Mobile close button / Desktop collapse button */}
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)] transition-colors"
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <span className="md:hidden">
                <X className="w-4 h-4" />
              </span>
              <span className="hidden md:inline">
                {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              const hasPendingStaged = item.id === 'voice' && stagedConfirmation !== null;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    if (window.innerWidth < 768) {
                      setSidebarCollapsed(true);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all relative group ${
                    isActive
                      ? 'bg-[var(--bg-surface-highlight)] text-[var(--text-primary)] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)]'
                  }`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  {/* Active Indicator Bar */}
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[var(--accent-emerald)]" />
                  )}

                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[var(--accent-emerald)]' : 'group-hover:text-[var(--text-primary)]'}`} />

                  {(!sidebarCollapsed || window.innerWidth < 768) && (
                    <span className="truncate flex-1 text-left">{item.label}</span>
                  )}

                  {(!sidebarCollapsed || window.innerWidth < 768) && item.badge && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-semibold ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                      {item.badge}
                    </span>
                  )}

                  {hasPendingStaged && (
                    <span className="w-2 h-2 rounded-full bg-[var(--accent-amber)] animate-pulse shrink-0" title="1 Action Staged" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Merchant Context Card */}
        <div className="p-3 border-t border-[var(--border-subtle)]">
          <div
            className={`flex items-center gap-3 p-2.5 rounded-xl bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] overflow-hidden ${
              sidebarCollapsed ? 'md:justify-center md:p-2' : ''
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">
              🇮🇳
            </div>

            {(!sidebarCollapsed || window.innerWidth < 768) && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
                  Pochampally Weaves
                </span>
                <span className="text-[10px] text-[var(--text-secondary)] truncate">
                  Hyderabad, India · USD
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
