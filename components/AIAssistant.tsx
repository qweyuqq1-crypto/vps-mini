
import React, { useState } from 'react';
import { explainGostProtocol, suggestGostConfig } from '../services/geminiService';
import { PROTOCOLS } from '../constants';

const AIAssistant: React.FC = () => {
  const [target, setTarget] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState(PROTOCOLS[0]);
  const [protocolExplanation, setProtocolExplanation] = useState('');

  const handleGetSuggestion = async () => {
    if (!target) return;
    setLoading(true);
    const result = await suggestGostConfig(target);
    setSuggestion(result);
    setLoading(false);
  };

  const handleExplain = async () => {
    setLoading(true);
    const result = await explainGostProtocol(selectedProtocol);
    setProtocolExplanation(result);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">AI Tunnel Architect</h2>
        <p className="mt-2 text-lg text-gray-500">Let Gemini optimize your VPS traffic forwarding strategy.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Config Suggester */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg mr-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </span>
            Config Suggester
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">What is your destination?</label>
              <input
                type="text"
                placeholder="e.g., A game server in Tokyo at 45.32.1.2:7777"
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
            </div>
            <button
              onClick={handleGetSuggestion}
              disabled={loading || !target}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? 'Thinking...' : 'Generate Suggestion'}
            </button>
            {suggestion && (
              <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <p className="text-xs font-bold text-indigo-800 uppercase mb-2">Gemini Recommends:</p>
                <div className="text-sm text-indigo-900 leading-relaxed whitespace-pre-wrap">{suggestion}</div>
              </div>
            )}
          </div>
        </div>

        {/* Protocol Explorer */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span className="bg-emerald-100 text-emerald-600 p-2 rounded-lg mr-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            </span>
            Protocol Explorer
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select a Protocol</label>
              <select
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                value={selectedProtocol}
                onChange={(e) => setSelectedProtocol(e.target.value)}
              >
                {PROTOCOLS.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
              </select>
            </div>
            <button
              onClick={handleExplain}
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Explain Protocol'}
            </button>
            {protocolExplanation && (
              <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-xs font-bold text-emerald-800 uppercase mb-2">Protocol Details:</p>
                <div className="text-sm text-emerald-900 leading-relaxed">{protocolExplanation}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
