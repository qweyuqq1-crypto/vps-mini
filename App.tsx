
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
    backendUrl: getBackendUrl() || (window.location.port === '8000' ? '' : `http://${window.location.hostname}:8000`)
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    // 保存后端地址
    let cleanUrl = loginData.backendUrl.replace(/\/$/, '');
    setBackendUrl(cleanUrl);

    try {
      const formData = new URLSearchParams();
      formData.append('username', loginData.username);
      formData.append('password', loginData.password);

      const response = await loginRequest(formData);
      const data = await response.json();

      if (response.ok && data.access_token) {
        setAuthToken(data.access_token);
        setIsLoggedIn(true);
      } else {
        setLoginError(data.detail || '登录失败，请检查账号密码或后端地址');
      }
    } catch (err) {
      setLoginError('连接后端服务器失败，请检查 IP/端口 是否开放');
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
      <div className="min-h-screen bg-[#020617] bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-2xl mb-6">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M16 11c0-2.209-1.791-4-4-4s-4 1.791-4 4c0 1.298.617 2.452 1.58 3.19C7.412 15.222 6 17.447 6 20a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1c0-2.553-1.412-4.778-3.58-5.81.963-.738 1.58-1.892 1.58-3.19z" />
                </svg>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tighter uppercase">mini LOGIN</h1>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">后端 API 地址</label>
                <input
                  type="text"
                  required
                  className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl outline-none focus:border-orange-500/50 text-white font-bold"
                  placeholder="http://你的VPS_IP:8000"
                  value={loginData.backendUrl}
                  onChange={(e) => setLoginData({ ...loginData, backendUrl: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">账号</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl outline-none text-white font-bold"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">密码</label>
                  <input
                    type="password"
                    required
                    className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl outline-none text-white font-bold"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  />
                </div>
              </div>

              {loginError && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-rose-500 text-[10px] font-bold uppercase">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl"
              >
                {isLoggingIn ? '认证中...' : '进入面板'}
              </button>
            </form>
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
