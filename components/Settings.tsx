
import React, { useState } from 'react';
import { updatePassword, restartService } from '../services/api';

const Settings: React.FC = () => {
  const [pwdData, setPwdData] = useState({ old: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdData.new !== pwdData.confirm) {
      setMessage({ type: 'error', text: '两次输入的新密码不一致' });
      return;
    }
    setLoading(true);
    try {
      const res = await updatePassword({ old_password: pwdData.old, new_password: pwdData.new });
      if (res.ok) {
        setMessage({ type: 'success', text: '密码修改成功' });
        setPwdData({ old: '', new: '', confirm: '' });
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.detail || '修改失败' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '网络请求异常' });
    }
    setLoading(false);
  };

  const handleRestart = async () => {
    if (confirm('确定要重启面板服务吗？这可能会导致短暂的连接中断。')) {
      try {
        await restartService();
        alert('重启指令已发送，请等待 10-20 秒后刷新页面。');
      } catch (e) {
        alert('发送重启指令失败');
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">系统设置</h2>
        <p className="text-slate-500 text-xs mt-1 font-bold uppercase">mini SYSTEM CONFIGURATION</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 安全中心 - 修改密码 */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-orange-500/10 transition-colors"></div>
          
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <div>
              <h3 className="text-xl font-black text-white">身份安全</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Update Admin Credentials</p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">当前密码</label>
              <input 
                type="password" 
                required 
                className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl outline-none focus:border-orange-500/50 text-white font-bold transition-all"
                value={pwdData.old}
                onChange={e => setPwdData({...pwdData, old: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">新密码</label>
              <input 
                type="password" 
                required 
                className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl outline-none focus:border-orange-500/50 text-white font-bold transition-all"
                value={pwdData.new}
                onChange={e => setPwdData({...pwdData, new: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">确认新密码</label>
              <input 
                type="password" 
                required 
                className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl outline-none focus:border-orange-500/50 text-white font-bold transition-all"
                value={pwdData.confirm}
                onChange={e => setPwdData({...pwdData, confirm: e.target.value})}
              />
            </div>

            {message.text && (
              <div className={`p-4 rounded-xl text-xs font-bold animate-in slide-in-from-top-1 ${message.type === 'error' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-500' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500'}`}>
                {message.text}
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              {loading ? '正在更新...' : '保存更改'}
            </button>
          </form>
        </div>

        {/* 系统维护 */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl flex flex-col justify-between overflow-hidden group">
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl -mr-16 -mb-16"></div>
          
          <div>
            <div className="flex items-center space-x-4 mb-8">
              <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
              </div>
              <div>
                <h3 className="text-xl font-black text-white">系统维护</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Advanced Core Operations</p>
              </div>
            </div>

            <div className="bg-rose-500/5 border border-rose-500/10 p-6 rounded-3xl mb-8">
              <h4 className="text-rose-500 text-xs font-black uppercase mb-2">危险区域</h4>
              <p className="text-slate-400 text-xs leading-relaxed font-bold">
                重启操作将终止当前所有 Gost 进程并重新初始化后端服务。通常在出现僵死进程或内核更新后使用。
              </p>
            </div>
          </div>

          <button 
            onClick={handleRestart}
            className="w-full bg-rose-500/10 border border-rose-500/20 text-rose-500 py-6 rounded-2xl font-black text-sm hover:bg-rose-500/20 active:scale-95 transition-all flex items-center justify-center space-x-3 group-hover:shadow-[0_0_20px_rgba(244,63,94,0.1)]"
          >
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,1)]"></div>
            <span>立即重启核心进程</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
