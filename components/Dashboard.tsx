
import React, { useState, useEffect } from 'react';
import { ForwardRule } from '../types';
import { apiFetch } from '../services/api';

const Dashboard: React.FC = () => {
  const [rules, setRules] = useState<ForwardRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [currentRule, setCurrentRule] = useState<ForwardRule | null>(null);
  
  const [newRule, setNewRule] = useState<Partial<ForwardRule>>({
    local_port: 8080,
    remote_ip: '',
    remote_port: 80,
    protocol: 'tcp',
    is_enabled: true,
    description: ''
  });

  const fetchRules = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch('/api/rules');
      if (res.ok) {
        const data = await res.json();
        setRules(data);
      }
    } catch (e) {
      console.error("Failed to fetch rules");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleToggleStatus = async (rule: ForwardRule) => {
    try {
      const res = await apiFetch(`/api/rules/${rule.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_enabled: !rule.is_enabled })
      });
      if (res.ok) fetchRules();
    } catch (e) { console.error("Toggle failed"); }
  };

  // Fixed type mismatch: ruleId should be number to match the type defined in types.ts
  const handleDelete = async (ruleId: number) => {
    if (!confirm('确定要永久删除此转发规则吗？')) return;
    try {
      const res = await apiFetch(`/api/rules/${ruleId}`, { method: 'DELETE' });
      if (res.ok) fetchRules();
    } catch (e) { console.error("Delete failed"); }
  };

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsApplying(true);
    try {
      const res = await apiFetch('/api/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRule)
      });
      if (res.ok) {
        await fetchRules();
        setIsAdding(false);
      }
    } catch (e) { alert("添加失败，可能端口已被占用"); }
    setIsApplying(false);
  };

  const getProtocolStyle = (protocol: string) => {
    switch (protocol.toLowerCase()) {
      case 'tcp': return 'from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'udp': return 'from-orange-500/20 to-amber-500/20 text-amber-400 border-amber-500/30';
      case 'socks5': return 'from-indigo-500/20 to-purple-500/20 text-indigo-400 border-indigo-500/30';
      default: return 'from-slate-500/20 to-slate-400/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center">
            转发管理
            <span className="ml-3 px-2 py-0.5 bg-orange-500/20 text-orange-400 text-[10px] font-bold rounded-md border border-orange-500/30 uppercase tracking-widest">LIVE</span>
          </h2>
          <p className="text-slate-500 text-xs mt-1 font-bold uppercase">mini TUNNEL ENGINE</p>
        </div>
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={fetchRules}
            className="flex-1 sm:flex-none px-6 py-3 rounded-2xl font-black text-sm transition-all border bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
          >
            刷新
          </button>
          <button
            onClick={() => setIsAdding(true)}
            className="flex-1 sm:flex-none bg-gradient-to-r from-orange-500 to-amber-600 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            + 新增规则
          </button>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto no-scrollbar">
          <table className="min-w-[950px] w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">监听</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">协议</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">目标 / 摘要</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">状态</th>
                <th className="px-8 py-6 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rules.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-500 font-bold tracking-widest italic opacity-30">暂无活跃转发规则</td></tr>
              ) : rules.map((rule) => (
                <tr key={rule.id} className="group hover:bg-white/[0.03] transition-all">
                  <td className="px-8 py-6 font-black text-xl text-white tracking-tighter">:{rule.local_port}</td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 bg-gradient-to-r rounded-lg border text-[10px] font-black uppercase ${getProtocolStyle(rule.protocol)}`}>
                      {rule.protocol}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-bold text-slate-200">{rule.remote_ip}:{rule.remote_port}</div>
                    <div className="text-[10px] text-slate-500 mt-1 uppercase font-bold">{rule.description || 'GEN_TUNNEL'}</div>
                  </td>
                  <td className="px-8 py-6">
                    <button 
                      onClick={() => handleToggleStatus(rule)}
                      className={`w-10 h-5 rounded-full p-1 transition-all ${rule.is_enabled ? 'bg-orange-500/20' : 'bg-slate-800'}`}
                    >
                      <div className={`w-3 h-3 rounded-full transition-all ${rule.is_enabled ? 'translate-x-5 bg-orange-400 shadow-[0_0_10px_rgba(249,115,22,1)]' : 'bg-slate-600'}`}></div>
                    </button>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => { setCurrentRule(rule); setIsSharing(true); }} className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                      </button>
                      <button onClick={() => handleDelete(rule.id)} className="p-2.5 bg-rose-500/5 hover:bg-rose-500/20 text-rose-500/50 hover:text-rose-500 rounded-xl transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-slate-900 border border-white/10 w-full max-w-xl rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-3xl font-black text-white mb-8 uppercase tracking-tighter">创建转发规则</h3>
            <form onSubmit={handleAddRule} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">监听端口</label>
                  <input type="number" required className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl outline-none focus:border-orange-500/50 text-white font-bold" 
                    value={newRule.local_port} onChange={e => setNewRule({...newRule, local_port: parseInt(e.target.value)})}/>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">协议类型</label>
                  <select className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl outline-none focus:border-orange-500/50 text-white font-bold"
                    value={newRule.protocol} onChange={e => setNewRule({...newRule, protocol: e.target.value})}>
                    <option value="tcp">TCP 端口转发</option>
                    <option value="udp">UDP 端口转发</option>
                    <option value="socks5">SOCKS5 代理</option>
                    <option value="relay+tls">Relay+TLS</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">目标 IP</label>
                  <input type="text" required className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl outline-none focus:border-orange-500/50 text-white font-bold" 
                    placeholder="1.1.1.1" value={newRule.remote_ip} onChange={e => setNewRule({...newRule, remote_ip: e.target.value})}/>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">目标端口</label>
                  <input type="number" required className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl outline-none focus:border-orange-500/50 text-white font-bold" 
                    value={newRule.remote_port} onChange={e => setNewRule({...newRule, remote_port: parseInt(e.target.value)})}/>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">备注</label>
                <input type="text" className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl outline-none text-white font-bold" 
                   value={newRule.description} onChange={e => setNewRule({...newRule, description: e.target.value})}/>
              </div>

              <button type="submit" disabled={isApplying} className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white py-5 rounded-2xl font-black shadow-lg shadow-orange-500/20">
                {isApplying ? '部署中...' : '提交规则'}
              </button>
              <button type="button" onClick={() => setIsAdding(false)} className="w-full text-slate-500 font-bold py-2">放弃</button>
            </form>
          </div>
        </div>
      )}

      {isSharing && currentRule && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl text-center">
            <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">节点详情</h3>
            <div className="bg-white/5 p-4 rounded-2xl mb-8 break-all">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">连接链接</p>
              <p className="text-xs font-mono text-orange-400 font-bold">{currentRule.protocol}://{window.location.hostname}:{currentRule.local_port}</p>
            </div>
            <button onClick={() => setIsSharing(false)} className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-black tracking-widest">确认</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
