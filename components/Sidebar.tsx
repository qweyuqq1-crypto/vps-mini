
import React from 'react';
import { removeAuthToken } from '../services/api';

interface SidebarProps {
  activeMenu: string;
  onMenuChange: (menu: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeMenu, onMenuChange }) => {
  const menus = [
    { id: 'dashboard', label: '控制概览', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { id: 'rules', label: '转发管理', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
    { id: 'ai-architect', label: 'AI 架构师', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { id: 'settings', label: '系统设置', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  const handleLogout = () => {
    if (confirm('确定要退出当前管理面板吗？')) {
      removeAuthToken();
      window.location.reload();
    }
  };

  return (
    <aside className="w-20 md:w-64 bg-slate-900/40 backdrop-blur-2xl border-r border-white/5 flex flex-col transition-all duration-300">
      <div className="p-6 flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M16 11c0-2.209-1.791-4-4-4s-4 1.791-4 4c0 1.298.617 2.452 1.58 3.19C7.412 15.222 6 17.447 6 20a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1c0-2.553-1.412-4.778-3.58-5.81.963-.738 1.58-1.892 1.58-3.19z" />
            <path d="M12 7V3l-2 1.5L12 6l2-1.5L12 3v4zM10 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM14 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
          </svg>
        </div>
        <span className="hidden md:block text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">mini</span>
      </div>

      <nav className="flex-1 px-4 mt-6 space-y-2">
        {menus.map((menu) => (
          <button
            key={menu.id}
            onClick={() => onMenuChange(menu.id)}
            className={`w-full flex items-center px-4 py-4 rounded-2xl transition-all group relative ${
              activeMenu === menu.id
                ? 'bg-gradient-to-r from-orange-500/10 to-amber-500/10 text-orange-400 border border-orange-500/20 shadow-[inset_0_0_20px_rgba(249,115,22,0.05)]'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            {activeMenu === menu.id && (
              <div className="absolute left-0 w-1 h-6 bg-orange-500 rounded-r-full shadow-[0_0_10px_rgba(249,115,22,0.8)]"></div>
            )}
            <svg className={`w-5 h-5 shrink-0 ${activeMenu === menu.id ? 'text-orange-400' : 'group-hover:text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={menu.icon}></path>
            </svg>
            <span className="hidden md:block ml-4 font-bold tracking-wide">{menu.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 md:p-6 space-y-4">
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 hidden md:block">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 text-center">安全会话</p>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2 text-xs font-black text-rose-500 hover:text-rose-400 transition-colors uppercase tracking-widest group"
          >
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            <span>登出系统</span>
          </button>
        </div>
        
        <button 
          onClick={handleLogout}
          className="md:hidden w-full flex items-center justify-center p-4 text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
