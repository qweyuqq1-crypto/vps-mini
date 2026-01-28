
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
  INSTALL_SH
} from '../constants';

const CodeGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('install');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('代码已复制！');
  };

  const tabs = [
    { id: 'install', label: 'install.sh (脚本)', content: INSTALL_SH, lang: 'bash' },
    { id: 'compose', label: 'docker-compose.yml', content: DOCKER_COMPOSE, lang: 'yaml' },
    { id: 'env', label: '.env (环境变量)', content: ENV_TEMPLATE, lang: 'text' },
    { id: 'caddy', label: 'Caddyfile', content: CADDYFILE, lang: 'text' },
    { id: 'structure', label: '项目目录', content: BACKEND_STRUCTURE, lang: 'text' },
    { id: 'main', label: 'main.py', content: MAIN_PY, lang: 'python' },
    { id: 'database', label: 'database.py', content: DATABASE_PY, lang: 'python' },
    { id: 'models', label: 'models.py (Owner)', content: MODELS_PY, lang: 'python' },
    { id: 'schemas', label: 'schemas.py', content: SCHEMAS_PY, lang: 'python' },
    { id: 'docker', label: 'Dockerfile', content: DOCKERFILE, lang: 'dockerfile' },
  ];

  const currentTab = tabs.find(t => t.id === activeTab);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-2">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">核心部署套件 (v2.5 Final)</h2>
          <p className="text-gray-500 text-sm">已针对 VPS 生产环境优化：自动 SSL + Host 网络 + 数据持久化</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden flex flex-col h-[600px]">
        <div className="flex bg-gray-50 border-b border-gray-100 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-4 text-xs font-bold transition-all whitespace-nowrap border-b-2 ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 bg-white'
                  : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <div className="ml-auto flex items-center pr-4 shrink-0 bg-gray-50 sticky right-0">
            <button
              onClick={() => copyToClipboard(currentTab?.content || '')}
              className="px-4 py-2 text-xs bg-indigo-600 text-white rounded-xl font-black hover:bg-indigo-700 shadow-md"
            >
              复制代码
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-[#0d1117] p-6">
          <pre className="text-xs text-gray-300 font-mono">
            <code>{currentTab?.content}</code>
          </pre>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <h4 className="text-xs font-black text-blue-800 uppercase mb-2">① 配置域名</h4>
          <p className="text-[10px] text-blue-700 leading-relaxed">
            将 A 记录指向 VPS IP，然后在 <code className="font-bold">.env</code> 中填入域名。
          </p>
        </div>
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
          <h4 className="text-xs font-black text-emerald-800 uppercase mb-2">② 运行脚本</h4>
          <p className="text-[10px] text-emerald-700 leading-relaxed">
            将 <code className="font-bold">install.sh</code> 赋予执行权限并运行，它会自动处理依赖。
          </p>
        </div>
        <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
          <h4 className="text-xs font-black text-purple-800 uppercase mb-2">③ 访问面板</h4>
          <p className="text-[10px] text-purple-700 leading-relaxed">
            脚本执行完毕后，直接通过 <code className="font-bold">https://你的域名</code> 即可安全管理。
          </p>
        </div>
      </div>
    </div>
  );
};

export default CodeGenerator;
