
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

const StatsHeader: React.FC = () => {
  const [stats, setStats] = useState({ cpu_usage: 0, mem_usage: 0, net_up: '0', net_down: '0' });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiFetch('/api/sys/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (e) {}
    };
    
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="px-4 md:px-8 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 border-b border-white/5 bg-slate-900/20 backdrop-blur-md">
      {/* CPU Usage */}
      <div className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:border-cyan-500/30 transition-all duration-300 group">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
            </div>
            <span className="text-sm font-bold text-slate-400">VPS CPU</span>
          </div>
          <span className="text-xl font-black text-cyan-400 group-hover:scale-110 transition-transform">{stats.cpu_usage}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all duration-500" style={{ width: `${stats.cpu_usage}%` }}></div>
        </div>
      </div>

      {/* RAM Usage */}
      <div className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:border-purple-500/30 transition-all duration-300 group">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <span className="text-sm font-bold text-slate-400">内存占用</span>
          </div>
          <span className="text-xl font-black text-purple-400 group-hover:scale-110 transition-transform">{stats.mem_usage}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-500" style={{ width: `${stats.mem_usage}%` }}></div>
        </div>
      </div>

      {/* Gost Service Status */}
      <div className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:border-emerald-500/30 transition-all duration-300 group">
        <div className="flex justify-between items-center h-full">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div>
              <span className="text-sm font-bold text-slate-400 block">Gost 引擎状态</span>
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Running (v2.11)</span>
            </div>
          </div>
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]"></div>
        </div>
      </div>
    </div>
  );
};

export default StatsHeader;
