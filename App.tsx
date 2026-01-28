
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import StatsHeader from './components/StatsHeader';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import CodeGenerator from './components/CodeGenerator';
import { getAuthToken, setAuthToken, loginRequest } from './services/api';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!getAuthToken());
  const [activeMenu, setActiveMenu] = useState('rules');
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

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
        setLoginError(data.detail || '登录失败，请检查账号密码');
      }
    } catch (err) {
      setLoginError('连接服务器失败');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'rules':
        return <Dashboard />;
      case 'settings':
        return <Settings />;
      case 'dashboard':
        return <CodeGenerator />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-white/5 rounded-3xl text-slate-500 italic">
            <svg className="w-12 h-12 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
            </svg>
            此模块 ({activeMenu}) 正在开发中...
          </div>
        );
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#020617] bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 flex items-center justify-center p-4 selection:bg-orange-500/30">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/10 rounded-full blur-[120px]"></div>
        </div>

        <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50"></div>
            
            <div className="flex flex-col items-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-tr from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/20 mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M16 11c0-2.209-1.791-4-4-4s-4 1.791-4 4c0 1.298.617 2.452 1.58 3.19C7.412 15.222 6 17.447 6 20a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1c0-2.553-1.412-4.778-3.58-5.81.963-.738 1.58-1.892 1.58-3.19z" />
                  <path d="M12 7V3l-2 1.5L12 6l2-1.5L12 3v4zM10 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM14 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
                </svg>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tighter uppercase">mini LOGIN</h1>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Secure Access Protocol</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Identity</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    className="w-full bg-white/5 border border-white/5 p-4 pl-12 rounded-2xl outline-none focus:border-orange-500/50 text-white font-bold transition-all placeholder:text-slate-600"
                    placeholder="Username"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  />
                  <svg className="w-5 h-5 absolute left-4 top-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Security Key</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    className="w-full bg-white/5 border border-white/5 p-4 pl-12 rounded-2xl outline-none focus:border-orange-500/50 text-white font-bold transition-all placeholder:text-slate-600"
                    placeholder="Password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  />
                  <svg className="w-5 h-5 absolute left-4 top-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
              </div>

              {loginError && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-rose-500 text-xs font-bold animate-in slide-in-from-top-1">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-2"
              >
                {isLoggingIn ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span>AUTHENTICATE</span>
                )}
              </button>
            </form>
          </div>
          <p className="text-center mt-8 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
            Protected by mini Cyber-Shield v3.0
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-slate-200 flex font-sans selection:bg-orange-500/30">
      <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <StatsHeader />

        <main className="flex-grow p-4 md:p-8 overflow-y-auto no-scrollbar">
          <div className="max-w-7xl auto">
            {renderContent()}
          </div>
        </main>

        <footer className="p-6 text-center text-slate-600 text-[10px] font-bold tracking-[0.2em] uppercase opacity-50">
          Gost mini Management Interface // v2.5.0 build-final
        </footer>
      </div>
    </div>
  );
};

export default App;
