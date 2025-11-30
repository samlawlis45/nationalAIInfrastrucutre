"use client";

import React, { useState, useRef } from 'react';
import { ArrowRight, CheckCircle2, Database, Scale, Network, Activity, Share2, Copy, Shield, FileText, Zap } from 'lucide-react';
import Link from 'next/link';

export default function AttributionLineageDemo() {
  const [isTraining, setIsTraining] = useState(false);
  const [isInferencing, setIsInferencing] = useState(false);
  const [modelStatus, setModelStatus] = useState<'untrained' | 'training' | 'ready'>('untrained');
  const [royaltyPool, setRoyaltyPool] = useState(0);
  const [attributionLog, setAttributionLog] = useState<any[]>([]);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const datasets = [
    { id: 'DS-NIH-001', name: 'NIH Chest X-Ray', type: 'Public Health', royalty_share: 0.4, owner: 'NIH_PUB' },
    { id: 'DS-MAYO-092', name: 'Mayo Clinical Notes', type: 'Private Health', royalty_share: 0.35, owner: 'MAYO_CLINIC' },
    { id: 'DS-UCSF-114', name: 'UCSF Oncology', type: 'Research', royalty_share: 0.25, owner: 'UCSF_RES' }
  ];

  const runTraining = () => {
    setIsTraining(true);
    setModelStatus('training');
    setAttributionLog([]);
    
    // Simulate training process steps
    setTimeout(() => {
      const receipt = {
        id: `AUTH-${Date.now().toString(36).toUpperCase()}`,
        type: 'AUTH.OBJ',
        timestamp: new Date().toISOString(),
        action: 'MODEL_TRAINING_BINDING',
        model_id: 'MOD-MED-VISION-V1',
        datasets: datasets.map(d => d.id),
        cryptographic_proof: '0x7f83b...9a2c',
        status: 'VERIFIED'
      };
      setAttributionLog(prev => [receipt, ...prev]);
      setModelStatus('ready');
      setIsTraining(false);
    }, 2500);
  };

  const runInference = () => {
    if (modelStatus !== 'ready') return;
    
    setIsInferencing(true);
    
    setTimeout(() => {
      const cost = 0.05; // $0.05 per inference
      setRoyaltyPool(prev => prev + cost);
      
      const distribution = datasets.map(d => ({
        owner: d.owner,
        amount: cost * d.royalty_share,
        dataset_id: d.id
      }));

      const receipt = {
        id: `ECON-${Date.now().toString(36).toUpperCase()}`,
        type: 'ECON.ROY',
        timestamp: new Date().toISOString(),
        action: 'ROYALTY_DISTRIBUTION',
        inference_id: `INF-${Math.random().toString(36).slice(2,8).toUpperCase()}`,
        total_value_usd: cost,
        distribution: distribution,
        cryptographic_proof: '0x3c2a1...8b9d'
      };
      
      setAttributionLog(prev => [receipt, ...prev]);
      setIsInferencing(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-sm">
              <ArrowRight className="w-4 h-4 rotate-180" /> Back to Home
            </Link>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">Genesis EO §3(a)(v) & §5(c)(ii)</span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <Database className="w-6 h-6 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Attribution Lineage</h1>
          </div>
          <p className="text-slate-400 max-w-2xl">
            Demonstrating <span className="text-emerald-400 font-mono">AUTH.OBJ</span> (Provenance) and <span className="text-emerald-400 font-mono">ECON.ROY</span> (Royalty) protocols. 
            Track data contribution to model training and automate value distribution per inference.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Supply Chain Visualizer */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Data Layer */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Database className="w-4 h-4" /> Data Layer (Input)
                </h3>
                <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">3 Datasets Linked</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {datasets.map((ds) => (
                  <div key={ds.id} className={`p-4 rounded-lg border transition-all duration-300 ${modelStatus === 'training' ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700 bg-slate-800/50'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <Shield className="w-4 h-4 text-slate-500" />
                      <span className="text-[10px] font-mono text-slate-500">{ds.id}</span>
                    </div>
                    <div className="font-medium text-sm text-slate-200 mb-1">{ds.name}</div>
                    <div className="text-xs text-slate-500 mb-3">{ds.owner}</div>
                    <div className="flex items-center justify-between text-xs border-t border-slate-700 pt-2">
                      <span className="text-slate-400">Share:</span>
                      <span className="text-emerald-400 font-mono">{(ds.royalty_share * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Training Process */}
            <div className="relative">
              <div className="absolute left-1/2 -translate-x-1/2 -top-6 h-6 w-0.5 bg-slate-800"></div>
              <div className={`bg-slate-900/50 border rounded-xl p-8 text-center transition-all duration-500 ${
                isTraining ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.15)]' : 
                modelStatus === 'ready' ? 'border-emerald-500/30' : 'border-slate-800'
              }`}>
                {modelStatus === 'untrained' ? (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700">
                      <Network className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-300 mb-2">Model Untrained</h3>
                    <button 
                      onClick={runTraining}
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                    >
                      Initialize Training Run
                    </button>
                  </div>
                ) : isTraining ? (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 relative mb-4">
                      <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
                      <Activity className="absolute inset-0 m-auto w-6 h-6 text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">Training Model...</h3>
                    <p className="text-sm text-emerald-400 font-mono">Binding AUTH.OBJ receipts</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                     <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 border border-emerald-500/50">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Model Ready</h3>
                    <div className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1 rounded border border-slate-800 mb-4">
                      ID: MOD-MED-VISION-V1
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Inference & Value */}
            <div className="relative">
              <div className="absolute left-1/2 -translate-x-1/2 -top-6 h-6 w-0.5 bg-slate-800"></div>
              <div className={`bg-slate-900/50 border rounded-xl p-6 transition-all duration-300 ${modelStatus !== 'ready' ? 'opacity-50 grayscale' : 'border-slate-800'}`}>
                 <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <Share2 className="w-4 h-4" /> Application Layer (Output)
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Total Royalties:</span>
                    <span className="text-xl font-bold text-emerald-400 font-mono">${royaltyPool.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-slate-950 rounded-lg p-4 border border-slate-800">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Simulate Usage</h4>
                    <button 
                      onClick={runInference}
                      disabled={modelStatus !== 'ready' || isInferencing}
                      className="w-full py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg border border-slate-600 hover:border-emerald-500 transition-all flex items-center justify-center gap-2 group"
                    >
                      {isInferencing ? (
                        <Activity className="w-4 h-4 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform" />
                      )}
                      Run Inference ($0.05)
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {datasets.map((ds) => (
                      <div key={ds.id} className="flex items-center justify-between text-sm p-2 rounded bg-slate-800/50 border border-slate-700/50">
                        <span className="text-slate-400">{ds.owner}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 transition-all duration-500"
                              style={{ width: `${(royaltyPool > 0 ? 100 : 0)}%` }}
                            ></div>
                          </div>
                          <span className="font-mono text-emerald-400 min-w-[50px] text-right">
                            ${(royaltyPool * ds.royalty_share).toFixed(3)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Ledger / Logs */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full max-h-[800px]">
              <div className="p-4 border-b border-slate-800 bg-slate-950/50">
                <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" /> Governance Ledger
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {attributionLog.length === 0 && (
                  <div className="text-center py-12 text-slate-500 text-sm italic">
                    No transactions recorded.<br/>Start training to generate receipts.
                  </div>
                )}
                {attributionLog.map((log, i) => (
                  <div 
                    key={i}
                    onClick={() => setSelectedLog(log)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-slate-800 ${
                      log.type === 'AUTH.OBJ' ? 'bg-blue-900/10 border-blue-500/30' : 
                      'bg-emerald-900/10 border-emerald-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                         log.type === 'AUTH.OBJ' ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {log.type}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-xs font-medium text-slate-300 mb-1">{log.action}</div>
                    <div className="text-[10px] text-slate-500 font-mono truncate">{log.id}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Receipt Modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedLog(null)}>
            <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
                <div className="flex items-center gap-3">
                   <h3 className="font-semibold text-slate-200">{selectedLog.type} Receipt</h3>
                   <span className="text-xs font-mono text-slate-500">{selectedLog.id}</span>
                </div>
                <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-white transition-colors">✕</button>
              </div>
              <div className="p-6 overflow-x-auto bg-slate-950">
                <pre className="text-xs text-emerald-400 font-mono leading-relaxed">
                  {JSON.stringify(selectedLog, null, 2)}
                </pre>
              </div>
              <div className="p-4 bg-slate-900 border-t border-slate-800 text-xs text-slate-500 flex justify-between items-center">
                <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Cryptographically Signed</span>
                <button className="flex items-center gap-1 hover:text-white transition-colors">
                  <Copy className="w-3 h-3" /> Copy JSON
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

