"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Database, Network, Share2, Shield, Copy, CheckCircle2, Activity, Zap, FileText, ChevronLeft, Waves, Satellite, GraduationCap, Dna, Hospital, Pill, Book, Plug, CloudSun, BarChart3, Globe } from 'lucide-react';
import Link from 'next/link';

// Scenario Data
const SCENARIOS = {
  climate: {
    name: 'Genesis Climate Model',
    modelName: ['Genesis', 'Climate Model'],
    sources: [
      { id: 'noaa', name: 'NOAA Weather Data', org: 'National Oceanic & Atmospheric Administration', icon: <Waves className="w-5 h-5 text-blue-400" />, color: '#3b82f6', contribution: 35 },
      { id: 'doe', name: 'DOE Energy Grid Data', org: 'Department of Energy', icon: <Zap className="w-5 h-5 text-amber-400" />, color: '#f59e0b', contribution: 25 },
      { id: 'nasa', name: 'NASA Satellite Imagery', org: 'National Aeronautics & Space Administration', icon: <Satellite className="w-5 h-5 text-violet-400" />, color: '#8b5cf6', contribution: 20 },
      { id: 'academic', name: 'University Research Corpus', org: 'Academic Consortium (12 institutions)', icon: <GraduationCap className="w-5 h-5 text-emerald-400" />, color: '#10b981', contribution: 20 }
    ]
  },
  medical: {
    name: 'Biomedical Research Model',
    modelName: ['Biomedical', 'Research Model'],
    sources: [
      { id: 'nih', name: 'NIH Genomics Database', org: 'National Institutes of Health', icon: <Dna className="w-5 h-5 text-pink-400" />, color: '#ec4899', contribution: 30 },
      { id: 'hospital', name: 'Hospital Clinical Records', org: 'Mayo Clinic Network (anonymized)', icon: <Hospital className="w-5 h-5 text-blue-400" />, color: '#3b82f6', contribution: 25, private: true },
      { id: 'pharma', name: 'Pharmaceutical Trial Data', org: 'Pfizer Research Division', icon: <Pill className="w-5 h-5 text-amber-400" />, color: '#f59e0b', contribution: 25, private: true },
      { id: 'pubmed', name: 'PubMed Literature', org: 'National Library of Medicine', icon: <Book className="w-5 h-5 text-emerald-400" />, color: '#10b981', contribution: 20 }
    ]
  },
  energy: {
    name: 'Grid Optimization Model',
    modelName: ['Grid', 'Optimization Model'],
    sources: [
      { id: 'caiso', name: 'CAISO Grid Operations', org: 'California ISO', icon: <Plug className="w-5 h-5 text-amber-400" />, color: '#f59e0b', contribution: 30 },
      { id: 'ercot', name: 'ERCOT Market Data', org: 'Electric Reliability Council of Texas', icon: <Zap className="w-5 h-5 text-blue-400" />, color: '#3b82f6', contribution: 25 },
      { id: 'weather', name: 'Weather Forecast Data', org: 'National Weather Service', icon: <CloudSun className="w-5 h-5 text-violet-400" />, color: '#8b5cf6', contribution: 25 },
      { id: 'utility', name: 'Utility Demand Curves', org: 'PG&E + Oncor (aggregated)', icon: <BarChart3 className="w-5 h-5 text-emerald-400" />, color: '#10b981', contribution: 20, private: true }
    ]
  }
};

export default function AttributionLineageDemo() {
  const [currentScenario, setCurrentScenario] = useState<'climate' | 'medical' | 'energy'>('climate');
  const [revenue, setRevenue] = useState(100000);
  const [distributionResults, setDistributionResults] = useState<any | null>(null);
  const [currentReceipt, setCurrentReceipt] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const scenario = SCENARIOS[currentScenario];

  // SVG Lineage Graph Logic
  const renderLines = () => {
    const centerX = 150;
    const centerY = 140;
    const radius = 90;
    
    return scenario.sources.map((s, i) => {
      const angle = Math.PI + (Math.PI * 0.7) * (i / (scenario.sources.length - 1)) - (Math.PI * 0.35);
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      return (
        <g key={s.id}>
          <line 
            x1={x} y1={y} x2={centerX} y2={centerY} 
            stroke={s.color} strokeWidth="2" strokeDasharray="4 2" opacity="0.6"
            className="animate-[flow_1s_linear_infinite]"
          />
          <circle cx={x} cy={y} r="20" fill="#0f172a" stroke={s.color} strokeWidth="2" />
          <g transform={`translate(${x - 10}, ${y - 10})`}>
            {s.icon}
          </g>
        </g>
      );
    });
  };

  const triggerDistribution = () => {
    const fee = revenue * 0.02;
    const netAmount = revenue - fee;
    
    const distributions = scenario.sources.map(s => ({
      source: s,
      amount: netAmount * (s.contribution / 100)
    }));

    const settlementId = 'SETTLE-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    
    setDistributionResults({
      gross: revenue,
      fee,
      net: netAmount,
      distributions,
      settlementId
    });

    generateReceipt(revenue, fee, netAmount, distributions, settlementId);
  };

  const generateReceipt = (gross: number, fee: number, net: number, distributions: any[], settlementId: string) => {
    const timestamp = new Date().toISOString();
    const hexChars = '0123456789abcdef';
    let signature = '0x';
    for (let i = 0; i < 64; i++) signature += hexChars[Math.floor(Math.random() * 16)];
    let modelHash = '0x';
    for (let i = 0; i < 64; i++) modelHash += hexChars[Math.floor(Math.random() * 16)];

    const lineageRecords = distributions.map(d => {
      let sourceHash = '0x';
      for (let j = 0; j < 64; j++) sourceHash += hexChars[Math.floor(Math.random() * 16)];
      return {
        source_id: d.source.id.toUpperCase(),
        source_name: d.source.name,
        organization: d.source.org,
        contribution_weight: (d.source.contribution / 100).toFixed(4),
        auth_obj_hash: sourceHash,
        privacy_layer: ('private' in d.source && d.source.private) ? 'GHOST.ATTR' : 'PUBLIC',
        payout_usd: d.amount.toFixed(2),
        payout_method: 'ACH_TRANSFER'
      };
    });

    const receipt = {
      settlement_receipt_id: settlementId,
      schema_version: '1.0.0',
      timestamp,
      model: {
        name: scenario.name,
        auth_obj_hash: modelHash,
        training_completed: '2025-10-15T00:00:00Z',
        total_contributors: distributions.length
      },
      commercialization_event: {
        type: 'Enterprise License', // Simplified for demo state
        gross_revenue_usd: gross.toFixed(2),
        platform_fee_pct: '2.00',
        platform_fee_usd: fee.toFixed(2),
        net_distributable_usd: net.toFixed(2)
      },
      attribution_lineage: lineageRecords,
      settlement: {
        total_payouts: distributions.length,
        total_distributed_usd: net.toFixed(2),
        settlement_timestamp: timestamp,
        settlement_finality: 'CONFIRMED'
      },
      cryptographic_proof: {
        algorithm: 'ED25519',
        signer_id: 'PATHWELL-ROYALTY-ENGINE-001',
        signature,
        lineage_merkle_root: modelHash
      },
      compliance: {
        genesis_eo_sections: ['§3(a)(v) IP protections', '§5(c)(ii) Commercialization', '§5(c)(ii) Trade secrets'],
        attestation_tier: 'TIER_3_ECONOMICALLY_SETTLED'
      }
    };
    
    setCurrentReceipt(receipt);
  };

  const copyToClipboard = () => {
    if (currentReceipt) {
      navigator.clipboard.writeText(JSON.stringify(currentReceipt, null, 2));
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-violet-500/30 pt-20">
      
      <main className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/20 rounded-full text-violet-400 text-sm mb-4 border border-violet-500/30">
            <Network className="w-4 h-4" />
            PATHWELL CONNECT™ • Genesis EO §3(a)(v) & §5(c)(ii)
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">
            Attribution <span className="text-violet-400">Lineage</span>
          </h1>
          <p className="text-slate-400 text-lg">Simulated training provenance & royalty distribution</p>
        </div>
        
        {/* Key Concept */}
        <div className="bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-violet-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Share2 className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-violet-400 mb-2">Who Contributed What? Who Gets Paid?</h1>
              <p className="text-slate-300">
                When AI models train on data from multiple sources, <strong>attribution collapses</strong>—no one knows 
                who contributed what. When those models commercialize, <strong>economic injustice</strong> follows. 
                This demo shows how cryptographic provenance and automatic royalty distribution 
                solve both problems.
              </p>
            </div>
          </div>
        </div>

        {/* Scenario Selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            Select Training Scenario
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { id: 'climate', icon: <Globe className="w-6 h-6 text-blue-400" />, name: 'Genesis Climate Model', desc: 'NOAA + DOE + Academic', color: 'violet' },
              { id: 'medical', icon: <Dna className="w-6 h-6 text-pink-400" />, name: 'Biomedical Research', desc: 'NIH + Hospital + Pharma', color: 'slate' },
              { id: 'energy', icon: <Zap className="w-6 h-6 text-amber-400" />, name: 'Grid Optimization', desc: 'ISO + Utility + Weather', color: 'slate' }
            ].map((s) => (
              <button 
                key={s.id}
                onClick={() => {
                    setCurrentScenario(s.id as any);
                    setDistributionResults(null);
                }}
                className={`rounded-xl p-4 text-left transition border-2 ${
                  currentScenario === s.id 
                    ? 'bg-violet-500/20 border-violet-500' 
                    : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className={`font-semibold ${currentScenario === s.id ? 'text-violet-400' : 'text-slate-300'}`}>{s.name}</div>
                <div className="text-xs text-slate-400 mt-1">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Visualization */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          
          {/* Left: Data Sources */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">1</span>
              Data Sources (Provenance)
            </h3>
            <div className="space-y-3">
              {scenario.sources.map((s) => (
                <div key={s.id} className="bg-slate-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{s.icon}</span>
                      <div>
                        <div className="font-medium text-sm flex items-center gap-1">
                          {s.name}
                          {'private' in s && s.private && <span className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px] text-slate-400">GHOST.ATTR</span>}
                        </div>
                        <div className="text-xs text-slate-500">{s.org}</div>
                      </div>
                    </div>
                    <div className="text-lg font-bold" style={{ color: s.color }}>{s.contribution}%</div>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style={{ width: `${s.contribution}%`, backgroundColor: s.color }}></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800">
              <div className="text-xs text-slate-500">Total Training Contribution</div>
              <div className="text-2xl font-bold text-blue-400">100%</div>
            </div>
          </div>

          {/* Center: Model + Lineage Graph */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center text-xs font-bold">2</span>
              Training Lineage
            </h3>
            <div className="relative" style={{ height: '280px' }}>
              <svg viewBox="0 0 300 280" className="w-full h-full">
                {renderLines()}
                
                {/* Central Model Node */}
                <g>
                  <circle cx="150" cy="140" r="45" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="2"/>
                  <text x="150" y="135" textAnchor="middle" fill="#a78bfa" fontSize="10" fontWeight="600">{scenario.modelName[0]}</text>
                  <text x="150" y="150" textAnchor="middle" fill="#a78bfa" fontSize="10" fontWeight="600">{scenario.modelName[1]}</text>
                </g>

                {/* Output Arrow */}
                <line x1="150" y1="185" x2="150" y2="240" stroke="#475569" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                <text x="150" y="260" textAnchor="middle" fill="#64748b" fontSize="9">Model Output</text>
                
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#475569"/>
                  </marker>
                </defs>
              </svg>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 text-center">
              <div className="text-xs text-slate-500">Cryptographic Binding</div>
              <div className="text-sm text-violet-400 font-mono">Provenance: 0x7a3f...e91d</div>
            </div>
          </div>

          {/* Right: Commercialization */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-xs font-bold">3</span>
              Commercialization (Royalty Engine)
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 block mb-1">License Event</label>
                <select 
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                  onChange={(e) => setRevenue(parseInt(e.target.value))}
                  value={revenue}
                >
                  <option value="100000">Enterprise License — $100,000</option>
                  <option value="500000">Government Contract — $500,000</option>
                  <option value="1000000">Exclusive License — $1,000,000</option>
                  <option value="50000">Research License — $50,000</option>
                </select>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-xs text-slate-500 mb-2">Revenue to Distribute</div>
                <div className="text-3xl font-bold text-emerald-400">${revenue.toLocaleString()}</div>
              </div>
              <button 
                onClick={triggerDistribution}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 px-4 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Distribute Royalties
              </button>
            </div>
          </div>
        </div>

        {/* Distribution Results */}
        {distributionResults && (
          <div id="distribution-results" className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Automatic Royalty Distribution Complete
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Breakdown */}
              <div>
                <div className="text-xs text-slate-500 mb-3">DISTRIBUTION BY CONTRIBUTOR</div>
                <div className="space-y-2">
                  {distributionResults.distributions.map((d: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span>{d.source.icon}</span>
                        <div>
                          <div className="font-medium text-sm">{d.source.name}</div>
                          <div className="text-xs text-slate-500">{d.source.contribution}% contribution</div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-emerald-400">${d.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Summary */}
              <div className="bg-slate-800/50 rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-3">SETTLEMENT SUMMARY</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gross Revenue</span>
                    <span className="font-medium">${distributionResults.gross.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Platform Fee (2%)</span>
                    <span className="font-medium text-slate-500">-${distributionResults.fee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-700">
                    <span className="text-slate-400">Net Distributed</span>
                    <span className="font-bold text-emerald-400">${distributionResults.net.toLocaleString()}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <div className="text-xs text-slate-500 mb-1">Settlement ID</div>
                  <div className="text-sm font-mono text-violet-400">{distributionResults.settlementId}</div>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="mt-4 w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-lg text-sm transition"
            >
              View Full Settlement Receipt
            </button>
          </div>
        )}

        {/* How It Works */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
          <h3 className="font-semibold mb-4">How Attribution + Economics Work Together</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Database className="w-6 h-6 text-blue-400" />
              </div>
              <div className="font-medium text-blue-400 mb-1">Provenance Objects</div>
              <div className="text-sm text-slate-400">Cryptographically binds each data source to training lineage with immutable contribution weights</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-violet-400" />
              </div>
              <div className="font-medium text-violet-400 mb-1">Immutable Ledger</div>
              <div className="text-sm text-slate-400">Stores lineage receipts in tamper-evident ledger accessible to all parties</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="font-medium text-emerald-400 mb-1">Royalty Engine</div>
              <div className="text-sm text-slate-400">Automatically calculates and distributes royalties when commercialization events occur</div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-800">
            <div className="text-xs text-slate-500 mb-2">GENESIS EO ALIGNMENT</div>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400">§3(a)(v) IP protections</span>
              <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400">§5(c)(ii) Commercialization</span>
              <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400">§5(c)(ii) Trade secret protections</span>
              <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400">§5(d) International collaboration</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
          <p className="mb-2">
            <strong className="text-slate-400">Attribution Lineage Demo</strong> — Simulated training scenarios with automatic royalty distribution.
          </p>
          <p className="mb-2">
            Production implementation integrates with data registries, smart contracts, and payment rails.
          </p>
          <p>A PATHWELL CONNECT™ Initiative by AnchorTrust Holdings LLC</p>
        </footer>

      </main>

      {/* Receipt Modal */}
      {isModalOpen && currentReceipt && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div>
                <h3 className="font-semibold text-white">Settlement Receipt</h3>
                <p className="text-xs text-slate-400 font-mono">{currentReceipt.settlement_receipt_id}</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={copyToClipboard} 
                  className="px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 rounded-lg transition text-slate-300 flex items-center gap-1"
                >
                  {copySuccess ? <span className="text-emerald-400">✓ Copied</span> : <><Copy className="w-4 h-4" /> Copy JSON</>}
                </button>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 hover:bg-slate-800 rounded-lg transition text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            <div className="p-4 overflow-auto max-h-[60vh] custom-scrollbar">
              <pre className="font-mono text-xs text-emerald-400 whitespace-pre-wrap">
                {JSON.stringify(currentReceipt, null, 2)}
              </pre>
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-800/50">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Cryptographically signed • Immutable lineage • Genesis EO compliant</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
