import { Outlet, Link, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Map,
  Video,
  Plane,
  Camera,
  FileText,
  BarChart3,
  Settings,
  Menu,
  X,
  Search,
  Bell,
  CloudOff,
  Plus
} from 'lucide-react';
import { useState } from 'react';
import { useAuth, Role, MOCK_USERS } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ROLE_LABELS: Record<string, string> = {
  'admin': 'Administrateur',
  'hse_inspector': 'Inspecteur HSE',
  'site_director': 'Directrice de Chantier',
  'site_manager': 'Chef de Chantier',
  'auditor': 'Auditeur Externe'
};

import { CreateIncidentModal } from './CreateIncidentModal';
import { CreateReportModal } from './Modals';
const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Tableau de bord' },
  { path: '/map', icon: Map, label: 'Plan du site' },
  { path: '/cameras', icon: Video, label: 'Caméras' },
  { path: '/drones', icon: Plane, label: 'Drones' },
  { path: '/photos', icon: Camera, label: 'Inspection Photo' },
  { path: '/incidents', icon: FileText, label: 'Incidents' },
  { path: '/reports', icon: BarChart3, label: 'Rapports' },
  { path: '/config', icon: Settings, label: 'Configuration' },
];

const rolePermissions: Record<Role, string[]> = {
  admin: ['/', '/map', '/cameras', '/drones', '/photos', '/incidents', '/reports', '/config'],
  hse_inspector: ['/', '/map', '/cameras', '/drones', '/photos', '/incidents', '/reports'],
  site_director: ['/', '/map', '/incidents', '/reports'],
  site_manager: ['/', '/incidents', '/photos'],
  auditor: ['/', '/reports'],
};

export function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [isCreateIncidentOpen, setIsCreateIncidentOpen] = useState(false);
  const [isCreateReportOpen, setIsCreateReportOpen] = useState(false);
  const { currentUser, switchUser } = useAuth();
  const { addToast } = useToast();
  
  const allowedNavItems = navItems.filter(item => rolePermissions[currentUser.role]?.includes(item.path));

  return (
    <div className="h-screen flex bg-[#F4F7FC] font-sans">
      {/* Sidebar - Fix height to full screen with dark elegant color #0E1729 */}
      <aside
        className={`bg-[#0E1729] text-white transition-all duration-300 flex flex-col shrink-0 ${
          sidebarOpen ? 'w-[259px]' : 'w-0'
        } overflow-hidden z-20`}
      >
        {/* Sidebar Header with Logo */}
        <div className="flex items-center gap-3 px-6 h-[76px] border-b border-[#1a2540]">
          <div className="w-8 h-8 rounded-lg bg-[#F97215] flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 2L3 6v8l7 4 7-4V6L10 2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M10 2v12M3 6l7 4 7-4" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </div>
          {sidebarOpen && (
            <div className="flex items-baseline gap-1">
              <span className="text-[#B7BCC1] font-bold text-[23px] leading-none tracking-tight">SiteSafe</span>
              <span className="text-[#BB5C1C] font-bold text-[24px] leading-none">AI</span>
            </div>
          )}
        </div>

        {/* Navigation Elements */}
        <nav className="flex flex-col flex-1 py-4 gap-0.5 overflow-y-auto custom-scrollbar">
          {allowedNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-[14px] px-[26px] py-[13px] mx-2 rounded-[7px] transition-colors text-[14px] font-normal group focus-visible:ring-2 focus-visible:ring-site-orange focus-visible:outline-none ${
                  isActive
                    ? 'bg-[#262027] text-[#A04F22]'
                    : 'text-[#5F6D7B] hover:text-[#8A99A6] hover:bg-[#151F32]'
                }`}
              >
                <Icon 
                  size={17} 
                  className={`shrink-0 ${isActive ? 'text-[#F97215]' : 'text-current'}`} 
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#1a2540] to-transparent mx-4" />

        {/* Bottom Profile Area with Role Selector */}
        <div className="relative mt-auto">
          {/* Menu popup */}
          {roleMenuOpen && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-[#1a2540] border border-[#2d3b55] rounded-xl shadow-xl overflow-hidden z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
              <div className="px-3 py-2 bg-[#151F32] border-b border-[#2d3b55] text-xs font-semibold text-[#8A99A6] flex justify-between items-center">
                <span>Changer de rôle (Démo)</span>
                <button onClick={() => setRoleMenuOpen(false)} className="hover:text-white"><X size={14}/></button>
              </div>
              <div className="max-h-[280px] overflow-y-auto custom-scrollbar p-1">
                {MOCK_USERS.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      switchUser(user.id);
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left ${
                      currentUser.id === user.id ? 'bg-[#262027] border border-[#A04F22]/30' : 'hover:bg-[#2d3b55] border border-transparent'
                    }`}
                  >
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full bg-[#151F32]" />
                    <div className="flex-1 min-w-0">
                      <div className={`text-[13px] font-medium truncate ${currentUser.id === user.id ? 'text-[#F97215]' : 'text-white'}`}>
                        {user.name}
                      </div>
                      <div className="text-[11px] text-[#A3ABB0] truncate">{ROLE_LABELS[user.role] || user.role}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* User Profile Button */}
          <button 
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className={`w-full flex items-center gap-3 px-[18px] py-4 bg-[#151F32] border-t-4 ${roleMenuOpen ? 'border-[#F97215]' : 'border-[#0F172A]'} hover:bg-[#1a2540] transition-colors text-left`}
            title={currentUser.email}
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover shrink-0 border-2 border-[#2d3b55]"
            />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[#2A343D] leading-tight">{currentUser.name}</div>
              <p className="text-[#596976] text-[12px] leading-none truncate">{ROLE_LABELS[currentUser.role] || currentUser.role}</p>
            </div>
            <div className={`text-[#3d4f5e] transition-transform duration-200 shrink-0 ${roleMenuOpen ? 'rotate-180 text-[#F97215]' : ''}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header - White, Light, Clean */}
        <header className="h-[72px] bg-white border-b border-gray-200 px-8 flex items-center justify-between shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
              className="text-gray-400 hover:text-gray-600 transition-colors focus-visible:ring-2 focus-visible:ring-site-orange focus-visible:outline-none rounded-md"
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div className="hidden md:flex items-center text-sm font-medium text-gray-400 gap-2">
              <span>Accueil</span>
              <span>›</span>
              <span className="text-gray-800 font-semibold">
                {navItems.find(i => i.path === location.pathname)?.label || 'Tableau de bord'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
                    addToast(`Recherche pour "${e.currentTarget.value}" (Simulation)`, 'info');
                    e.currentTarget.value = '';
                  }
                }}
                className="pl-10 pr-4 py-2 w-[280px] bg-slate-50 border border-slate-200/60 rounded-lg text-[14px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-site-orange/40 focus:border-site-orange transition-all"
              />
            </div>
            
            {/* Offline Sync Indicator */}
            <div 
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors rounded-full text-xs font-semibold cursor-help" 
              title="Mode hors-ligne actif (réseau instable). 3 modifications en attente de synchronisation vers le serveur distant."
            >
              <CloudOff size={14} />
              <span className="hidden xl:inline">Hors-ligne (Sync en attente)</span>
            </div>

            <button 
              aria-label="Notifications"
              onClick={() => addToast("Vous n'avez aucune notification critique en attente.", 'info')}
              className="relative text-slate-400 hover:text-slate-700 transition-colors focus-visible:ring-2 focus-visible:ring-site-orange focus-visible:outline-none p-1 rounded-md group"
            >
              <Bell size={20} className="group-hover:animate-bounce" />
              <div className="absolute top-1 right-1 w-[9px] h-[9px] bg-site-orange rounded-full border-[1.5px] border-white translate-x-[2px] -translate-y-[2px]"></div>
            </button>

            <button 
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-[14px] font-medium hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-site-orange focus-visible:outline-none transition-colors shadow-sm"
              title="Créer et configurer un rapport d'inspection formel"
              onClick={() => setIsCreateReportOpen(true)}
            >
              <FileText size={15} />
              Créer Rapport d&apos;Inspection
            </button>

            <button 
              onClick={() => setIsCreateIncidentOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#F97215] text-white rounded-lg text-[14px] font-medium hover:bg-[#ea660c] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-site-orange focus-visible:outline-none transition-all shadow-sm"
            >
              <Plus size={16} /> <span className="hidden sm:inline">Nouvel Incident</span>
            </button>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-auto bg-[#F4F7FC]">
          <Outlet />
        </main>
      </div>

      <CreateIncidentModal isOpen={isCreateIncidentOpen} onClose={() => setIsCreateIncidentOpen(false)} />
      <CreateReportModal isOpen={isCreateReportOpen} onClose={() => setIsCreateReportOpen(false)} />
    </div>
  );
}
