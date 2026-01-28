
import React, { useState } from 'react';
import { ForwardRule } from '../types';

const Dashboard: React.FC = () => {
  const [rules, setRules] = useState<ForwardRule[]>([
    { id: '1', local_port: 8080, remote_ip: '1.2.3.4', remote_port: 80, protocol: 'tcp', is_enabled: true, description: '主站转发', expire_date: '2025-12-31' },
    { id: '2', local_port: 1080, remote_ip: '0.0.0.0', remote_port: 0, protocol: 'socks5', is_enabled: true, description: 'SOCKS5 代理', username: 'admin', password: 'password123', expire_date: '2025-06-01' },
    { id: '3', local_port: 443, remote_ip: '5.6.7.8', remote_port: 443, protocol: 'relay+tls', is_enabled: false, description: '加密隧道' },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [currentRule, setCurrentRule] = useState<ForwardRule | null>(null);
  
  const [newRule, setNewRule] = useState<Partial<ForwardRule>>({
    protocol: 'tcp',
    is_enabled: true,
    username: '',
    password: '',
    expire_date: ''
  });

  const getProtocolStyle = (protocol: string) => {
    switch (protocol.toLowerCase()) {
      case 'tcp': return 'from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'udp': return 'from-orange-500/20 to-amber-500/20 text-amber-400 border-amber-500/30';
      case 'socks5': return 'from-indigo-500/20 to-purple-500/20 text-indigo-400 border-indigo-500/30';
      case 'ss': return 'from-red-500/20 to-rose-500/20 text-rose-400 border-rose-500/30';
      default: return 'from-slate-500/20 to-slate-400/20 text-slate-400 border-slate-500/30';
    }
  };

  const generateShareLink = (rule: ForwardRule) => {
    const host = window.location.hostname;
    const auth = rule.username ? `${rule.username}:${rule.password}@` : "";
    if (rule.protocol === 'socks5') return `socks5://${auth}${host}:${rule.local_port}`;
    if (rule.protocol === 'ss') return `ss://${btoa('chacha20-ietf-poly1305:' + (rule.password || 'aurora'))}@${host}:${rule.local_port}#Aurora_Forward`;
    return `${rule.protocol}://${host}:${rule.local_port}`;
  };

  const handleApply = async () => {
    setIsApplying(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsApplying(false);
    alert('配置已下发至核心引擎。');
  };

  const openShare = (rule: ForwardRule) => {
    setCurrentRule(rule);
    setIsSharing(true);
  };

  const getRemainingDays = (dateStr?: string) => {
    if (!dateStr) return '永不过期';
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days > 0 ? `${days} 天` : '已过期';
  };

  const needsAuth = newRule.protocol === 'socks5' || newRule.protocol === 'ss';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center">
            转发管理
            <span className="ml-3 px-2 py-0.5 bg-orange-500/20 text-orange-400 text-[10px] font-bold rounded-md border border-orange-500/30 uppercase tracking-widest">Secure</span>
          </h2>
          <p className="text-slate-500 text-xs mt-1 font-bold uppercase">mini TUNNEL ENGINE</p>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={handleApply}
            disabled={isApplying}
            className={`flex-1 sm:flex-none px-6 py-3 rounded-2xl font-black text-sm transition-all border ${
              isApplying ? 'bg-slate-800 text-slate-500 border-white/5 cursor-not-allowed' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
          >
            {isApplying ? 'RELOADING...' : '重载引擎'}
          </button>
          <button
            onClick={() => setIsAdding(true)}
            className="flex-1 sm:flex-none bg-gradient-to-r from-orange-500 to-amber-600 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            + 新增规则
          </button>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto no-scrollbar">
          <table className="min-w-[950px] w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">监听</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">协议</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">目标 / 摘要</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">到期时间</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">状态</th>
                <th className="px-8 py-6 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rules.map((rule) => (
                <tr key={rule.id} className="group hover:bg-white/[0.03] transition-all">
                  <td className="px-8 py-6 font-black text-xl text-white">:{rule.local_port}</td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 bg-gradient-to-r rounded-lg border text-[10px] font-black uppercase ${getProtocolStyle(rule.protocol)}`}>
                      {rule.protocol}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-bold text-slate-200">{rule.remote_ip === '0.0.0.0' ? 'LOC_PROXY' : `${rule.remote_ip}:${rule.remote_port}`}</div>
                    <div className="text-[10px] text-slate-500 mt-1 uppercase font-bold">{rule.description || 'GEN_TUNNEL'}</div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${getRemainingDays(rule.expire_date).includes('已过期') ? 'text-rose-500' : 'text-slate-400'}`}>
                      {getRemainingDays(rule.expire_date)}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <button onClick={() => setRules(rules.map(r => r.id === rule.id ? {...r, is_enabled: !r.is_enabled} : r))}>
                      <div className={`w-10 h-5 rounded-full p-1 transition-all ${rule.is_enabled ? 'bg-orange-500/20' : 'bg-slate-800'}`}>
                        <div className={`w-3 h-3 rounded-full transition-all ${rule.is_enabled ? 'translate-x-5 bg-orange-400 shadow-[0_0_10px_rgba(249,115,22,1)]' : 'bg-slate-600'}`}></div>
                      </div>
                    </button>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openShare(rule)} className="p-2 bg-white/5 hover:bg-orange-500/20 text-slate-400 hover:text-orange-400 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                      </button>
                      <button onClick={() => setRules(rules.filter(r => r.id !== rule.id))} className="p-2 bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 新增规则模态框 */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-slate-900 border border-white/10 w-full max-w-xl rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-3xl font-black text-white mb-8 uppercase tracking-tighter">创建转发节点</h3>
            <form onSubmit={(e) => { e.preventDefault(); setIsAdding(false); }} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">监听端口</label>
                  <input type="number" required className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl outline-none focus:border-orange-500/50 text-white font-bold" placeholder="8080" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">协议类型</label>
                  <select className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl outline-none focus:border-orange-500/50 text-white font-bold"
                    onChange={(e) => setNewRule({...newRule, protocol: e.target.value})}>
                    <option value="tcp">TCP_RELAY</option>
                    <option value="socks5">SOCKS5</option>
                    <option value="ss">SHADOWSOCKS</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">到期时间</label>
                <input type="date" className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl outline-none focus:border-orange-500/50 text-white font-bold [color-scheme:dark]" />
              </div>

              {needsAuth && (
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl outline-none text-white font-bold" placeholder="认证用户" />
                  <input type="text" className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl outline-none text-white font-bold" placeholder="认证密码" />
                </div>
              )}

              <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white py-5 rounded-2xl font-black shadow-lg shadow-orange-500/20">部署核心规则</button>
              <button type="button" onClick={() => setIsAdding(false)} className="w-full text-slate-500 font-bold py-2">取消操作</button>
            </form>
          </div>
        </div>
      )}

      {/* 分享模态框 */}
      {isSharing && currentRule && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl text-center animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">节点连接信息</h3>
            
            <div className="bg-white p-4 rounded-3xl inline-block mb-6 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generateShareLink(currentRule))}`}
                alt="QR Code"
                className="w-48 h-48"
              />
            </div>

            <div className="bg-white/5 p-4 rounded-2xl mb-8 break-all">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">连接链接</p>
              <p className="text-xs font-mono text-orange-400 font-bold">{generateShareLink(currentRule)}</p>
            </div>

            <button 
              onClick={() => {
                navigator.clipboard.writeText(generateShareLink(currentRule));
                alert('链接已复制到剪贴板');
              }}
              className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-black mb-4 transition-all"
            >
              复制连接
            </button>
            <button onClick={() => setIsSharing(false)} className="text-slate-500 font-bold">关闭</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
