
import React, { useState } from 'react';
import { 
  BACKEND_STRUCTURE, 
  MODELS_PY, 
  SCHEMAS_PY, 
  MAIN_PY,
  DATABASE_PY,
  DOCKERFILE,
  DOCKER_COMPOSE,
  CADDYFILE,
  ENV_TEMPLATE,
  INSTALL_SH,
  DEPLOY_GUIDE,
  ONE_CLICK_SETUP_SH
} from '../constants';

const CodeGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('guide');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('代码已复制！');
  };

  const tabs = [
    { id: 'guide', label: '📖 部署指南', content: DEPLOY_GUIDE, lang: 'markdown' },
    { id: 'setup', label: '🚀 一键初始化脚本', content: ONE_CLICK_SETUP_SH, lang: 'bash' },
    { id: 'install', label: 'install.sh (组件安装)', content: INSTALL_SH, lang: 'bash' },
    { id: 'compose', label: 'docker-compose.yml', content: DOCKER_COMPOSE, lang: 'yaml' },
    { id: 'env', label: '.env (环境变量)', content: ENV_TEMPLATE, lang: 'text' },
    { id: 'caddy', label: 'Caddyfile', content: CADDYFILE, lang: 'text' },
    { id: 'structure', label: '项目目录', content: BACKEND_STRUCTURE, lang: 'text' },
    { id: 'main', label: 'main.py', content: MAIN_PY, lang: 'python' },
    { id: 'database', label: 'database.py', content: DATABASE_PY, lang: 'python' },
    { id: 'models', label: 'models.py', content: MODELS_PY, lang: 'python' },
    { id: 'schemas', label: 'schemas.py', content: SCHEMAS_PY, lang: 'python' },
    { id: 'docker', label: 'Dockerfile', content: DOCKERFILE, lang: 'dockerfile' },
  ];

  const currentTab = tabs.find(t => t.id === activeTab);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-2">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">核心部署套件 (v2.8)</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">mini INFRASTRUCTURE AUTOMATION</p>
        </div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col h-[650px] shadow-2xl">
        <div className="flex bg-white/5 border-b border-white/5 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-[10px] font-black transition-all whitespace-nowrap border-b-2 uppercase tracking-widest ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-400 bg-white/5'
                  : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <div className="ml-auto flex items-center pr-4 shrink-0 bg-transparent sticky right-0">
            <button
              onClick={() => copyToClipboard(currentTab?.content || '')}
              className="px-4 py-2 text-[10px] bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-orange-500/20 uppercase tracking-widest"
            >
              复制内容
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-[#0d1117]/80 p-8 custom-scrollbar">
          {activeTab === 'guide' ? (
             <div className="prose prose-invert prose-sm max-w-none text-slate-300">
               <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-300">
                 {currentTab?.content}
               </pre>
             </div>
          ) : (
            <pre className="text-xs text-orange-400/90 font-mono leading-relaxed">
              <code>{currentTab?.content}</code>
            </pre>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-orange-500/5 border border-orange-500/10 rounded-3xl shadow-sm group hover:border-orange-500/30 transition-all">
          <div className="w-8 h-8 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-400 mb-4 group-hover:scale-110 transition-transform">
            <span className="font-black">1</span>
          </div>
          <h4 className="text-xs font-black text-orange-100 uppercase mb-2 tracking-widest">执行初始化</h4>
          <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
            使用一键脚本在 VPS 上生成 mini-panel 目录。解决文件夹找不到的问题。
          </p>
        </div>
        <div className="p-5 bg-amber-500/5 border border-amber-500/10 rounded-3xl shadow-sm group hover:border-amber-500/30 transition-all">
          <div className="w-8 h-8 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
            <span className="font-black">2</span>
          </div>
          <h4 className="text-xs font-black text-amber-100 uppercase mb-2 tracking-widest">配置 .env</h4>
          <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
            确保 .env 文件在 mini-panel 目录下，包含正确的域名和 Key。
          </p>
        </div>
        <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl shadow-sm group hover:border-emerald-500/30 transition-all">
          <div className="w-8 h-8 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
            <span className="font-black">3</span>
          </div>
          <h4 className="text-xs font-black text-emerald-100 uppercase mb-2 tracking-widest">启动引擎</h4>
          <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
            在目录内运行 docker-compose up -d --build，等待 SSL 证书申请完成。
          </p>
        </div>
      </div>
    </div>
  );
};

export default CodeGenerator;
