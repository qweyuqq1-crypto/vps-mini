
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import StatsHeader from './components/StatsHeader';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import CodeGenerator from './components/CodeGenerator';
import AIAssistant from './components/AIAssistant';
import { getAuthToken, setAuthToken, loginRequest, getBackendUrl, setBackendUrl } from './services/api';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!getAuthToken());
  const [activeMenu, setActiveMenu] = useState('rules');
  const [loginData, setLoginData] = useState({ 
    username: 'admin', 
    password: 'admin123',
    backendUrl: getBackendUrl() || ''
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    // 清理地址格式：去掉末尾斜杠
    let cleanUrl = loginData.backendUrl.trim().replace(/\/$/, '');
    if (!cleanUrl.startsWith('http')) {
      cleanUrl = 'http://' + cleanUrl;
    }
    
    setBackendUrl(cleanUrl);

    try {
      const formData = new URLSearchParams();
      formData.append('username', loginData.username);
      formData.append('password', loginData.password);

      const response = await loginRequest(formData);
      
      if (response.ok) {
        const data = await response.json();
        if (data.access_token) {
          setAuthToken(data.access_token);
          setIsLoggedIn(true);
        }
      } else {
        const err = await response.json().catch(() => ({}));
        setLoginError(err.detail || '登录失败：账号密码错误或后端拒绝连接');
      }
    } catch (err) {
      setLoginError('无法连接到后端。请检查：1. IP是否正确 2. 8000端口是否放行');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'rules': return <Dashboard />;
      case 'settings': return <Settings />;
      case 'dashboard': return <CodeGenerator />;
      case 'ai-architect': return <AIAssistant />;
      default: return null;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#020617] bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 flex items-center justify-center p-4">
        {/* 背景光晕 */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]"></div>

        <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700">
          <div className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-tr from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-2xl mb-6 shadow-orange-500/40">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M16 11c0-2.209-1.791-4-4-4s-4 1.791-4 4c0 1.298.617 2.452 1.58 3.19C7.412 15.222 6 17.447 6 20a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1c0-2.553-1.412-4.778-3.58-5.81.963-.738 1.58-1.892 1.58-3.19z" />
                </svg>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tighter uppercase">mini <span className="text-orange-500">Panel</span></h1>
              <p className="text-slate-500 text-[10px] font-bold mt-2 tracking-[0.2em] uppercase">极简转发管理系统</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">后端 API 地址</label>
                  <span className="text-[9px] text-orange-500/60 font-bold uppercase tracking-tighter">需包含 http:// 和 端口</span>
                </div>
                <input
                  type="text"
                  required
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-orange-500/50 text-white font-bold placeholder:text-slate-700 transition-all"
                  placeholder="http://1.2.3.4:8000"
                  value={loginData.backendUrl}
                  onChange={(e) => setLoginData({ ...loginData, backendUrl: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">管理账号</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none text-white font-bold"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">管理密码</label>
                  <input
                    type="password"
                    required
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none text-white font-bold"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  />
                </div>
              </div>

              {loginError && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-rose-500 text-[11px] font-bold leading-relaxed">
                   ⚠️ {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-orange-600/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                {isLoggingIn ? '正在建立连接...' : '连接并进入面板'}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
               <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                 安全提示：账号信息仅存储于浏览器本地
               </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex font-sans">
      <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <StatsHeader />
        <main className="flex-grow p-4 md:p-8 overflow-y-auto no-scrollbar">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
