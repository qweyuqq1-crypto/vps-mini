
import React from 'react';

const StatsHeader: React.FC = () => {
  return (
    <div className="px-4 md:px-8 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 border-b border-white/5 bg-slate-900/20 backdrop-blur-md">
      {/* CPU Usage */}
      <div className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:border-cyan-500/30 transition-all duration-300 group">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
            </div>
            <span className="text-sm font-bold text-slate-400">CPU 负载</span>
          </div>
          <span className="text-xl font-black text-cyan-400 group-hover:scale-110 transition-transform">12.4%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full w-[12.4%] bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
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
          <span className="text-xl font-black text-purple-400 group-hover:scale-110 transition-transform">458MB</span>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full w-[38%] bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
        </div>
      </div>

      {/* Network Traffic */}
      <div className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:border-emerald-500/30 transition-all duration-300 group sm:col-span-2 lg:col-span-1">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
            </div>
            <span className="text-sm font-bold text-slate-400">实时带宽</span>
          </div>
          <div className="flex space-x-4">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase">↑ UP</p>
              <p className="text-sm font-black text-emerald-400">2.4 MB/s</p>
            </div>
            <div className="text-right border-l border-white/5 pl-4">
              <p className="text-[10px] font-black text-slate-500 uppercase">↓ DL</p>
              <p className="text-sm font-black text-emerald-400">18.7 MB/s</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsHeader;
