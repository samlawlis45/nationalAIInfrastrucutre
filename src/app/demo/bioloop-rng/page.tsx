"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Play, Pause, FileText, Copy, CheckCircle2, Package, Factory, Users, Zap, Tractor, TrendingDown, Activity, ArrowRight } from 'lucide-react';

interface Receipt {
  id: string;
  stage: string;
  timestamp: string;
  metric: number;
  creditType: string;
  creditValue: string;
  hash: string;
  jsonSchema: any;
}

const stages = [
  {
    id: 'corn',
    name: 'Low-CI Corn',
    icon: Package,
    color: '#4ade80',
    description: 'Corn grown with verified low carbon intensity inputs',
    metric: 'Bushels Processed',
    metricKey: 'cornProcessed',
    unit: 'bu',
    creditType: '§45Z Feedstock Credit',
    creditRate: 0.15
  },
  {
    id: 'ethanol',
    name: 'Ethanol & DDGS',
    icon: Factory,
    color: '#60a5fa',
    description: 'Ethanol plant produces fuel plus distillers grains (DDGS)',
    metric: 'DDGS Produced',
    metricKey: 'ddgsProduced',
    unit: 'tons',
    creditType: '§45Z Production Credit',
    creditRate: 0.45
  },
  {
    id: 'cattle',
    name: 'Cattle Feeding',
    icon: Users,
    color: '#f97316',
    description: 'DDGS feeds cattle, manure collected for anaerobic digestion',
    metric: 'Cattle Fed',
    metricKey: 'cattleFed',
    unit: 'head',
    creditType: 'Feed Attribution',
    creditRate: 0
  },
  {
    id: 'rng',
    name: 'RNG Production',
    icon: Zap,
    color: '#a855f7',
    description: 'Anaerobic digesters convert manure to renewable natural gas',
    metric: 'RNG Generated',
    metricKey: 'rngGenerated',
    unit: 'MCF',
    creditType: 'Methane Avoidance Credit',
    creditRate: 2.50
  },
  {
    id: 'fuel',
    name: 'Farm Fuel',
    icon: Tractor,
    color: '#eab308',
    description: 'RNG powers farm equipment, closing the loop',
    metric: 'Farm Fuel Used',
    metricKey: 'farmFuelUsed',
    unit: 'GGE',
    creditType: 'Diesel Displacement Credit',
    creditRate: 0.85
  }
];

export default function BioloopRNGDemo() {
  const [activeStage, setActiveStage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [expandedReceipt, setExpandedReceipt] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({
    cornProcessed: 0,
    ddgsProduced: 0,
    cattleFed: 0,
    manureCollected: 0,
    rngGenerated: 0,
    farmFuelUsed: 0,
    totalCredits: 0
  });

  // Auto-rotate stages
  useEffect(() => {
    if (!isAnimating) return;
    const interval = setInterval(() => {
      setActiveStage(prev => (prev + 1) % stages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isAnimating]);

  // Simulate metrics accumulation
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        cornProcessed: prev.cornProcessed + Math.floor(Math.random() * 50 + 100),
        ddgsProduced: prev.ddgsProduced + Math.floor(Math.random() * 2 + 3),
        cattleFed: prev.cattleFed + Math.floor(Math.random() * 5 + 10),
        manureCollected: prev.manureCollected + Math.floor(Math.random() * 10 + 20),
        rngGenerated: prev.rngGenerated + Math.floor(Math.random() * 100 + 200),
        farmFuelUsed: prev.farmFuelUsed + Math.floor(Math.random() * 20 + 30),
        totalCredits: prev.totalCredits + Math.floor(Math.random() * 50 + 75)
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const generateReceipt = (stage: typeof stages[0]) => {
    const receiptId = `BIO-${Date.now().toString(36).toUpperCase()}`;
    const batchId = `BATCH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newReceipt: Receipt = {
      id: receiptId,
      stage: stage.name,
      timestamp: new Date().toISOString(),
      metric: metrics[stage.metricKey as keyof typeof metrics],
      creditType: stage.creditType,
      creditValue: (metrics[stage.metricKey as keyof typeof metrics] * stage.creditRate).toFixed(2),
      hash: `0x${Array.from({length: 16}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      jsonSchema: {
        receipt_id: receiptId,
        schema_version: "PATHWELL_RECEIPT_V1",
        genesis_eo_alignment: ["§3(d)(i)"],
        policy_profile_id: "BIOLOOP-RNG-GENESIS-DEMO-V1",
        stage_id: stage.id,
        feedstock_batch_id: batchId,
        gco2e_per_mj: (12 + (43 / (1 + metrics.rngGenerated * 0.0005))).toFixed(2),
        metric_value: metrics[stage.metricKey as keyof typeof metrics],
        metric_unit: stage.unit,
        credit_schedule_ref: `45Z-2025-${stage.id.toUpperCase()}`,
        credit_value_usd: (metrics[stage.metricKey as keyof typeof metrics] * stage.creditRate).toFixed(2),
        signing_authority: "PATHWELL_GENESIS_NODE",
        attestation_type: "CIRCULAR_LOOP_ATTRIBUTION",
        upstream_refs: stage.id === 'corn' ? [] : [stages[stages.findIndex(s => s.id === stage.id) - 1]?.id || 'fuel'].map(id => `BIO-${id.toUpperCase()}-REF`),
        timestamp_utc: new Date().toISOString()
      }
    };
    setReceipts(prev => [newReceipt, ...prev].slice(0, 5));
  };

  // Asymptotic CI reduction: starts at 55, floors at ~12 gCO2e/MJ as RNG scales
  const lifecycleCI = 12 + (43 / (1 + metrics.rngGenerated * 0.0005));
  
  // Helper function for CI bar visualization (100% = worst at 55, 0% = best at 12)
  const ciToPercent = (ci: number) => Math.max(0, Math.min(100, ((55 - ci) / 43) * 100));

  const copyToClipboard = (text: string, receiptId: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(receiptId);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="pt-24 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/" className="text-slate-400 hover:text-white text-sm flex items-center gap-1 transition">
              <ChevronLeft className="w-4 h-4" />
              Back to Genesis Overview
            </Link>
          </div>
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              BIOLOOP-RNG<span className="text-green-400">™</span>
            </h1>
            <p className="text-slate-400 text-lg">
              DDGS → Cattle → RNG → Farm Fuel Loop
            </p>
            <div className="mt-2 inline-flex items-center gap-2 px-4 py-1 bg-green-900/30 rounded-full border border-green-500/30">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-green-400 text-sm">Live Attribution Tracking</span>
            </div>
            <p className="mt-3 text-slate-500 text-sm italic">
              Simulated flow and credits for illustration — wired to the same receipt schema proposed for real deployments.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Circular Loop Visualization */}
        <div className="lg:col-span-2 bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Circular Loop</h2>
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                isAnimating 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-slate-600 hover:bg-slate-500'
              }`}
            >
              {isAnimating ? (
                <>
                  <Pause className="w-4 h-4" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" /> Play
                </>
              )}
            </button>
          </div>
          
          {/* EO Alignment Badge */}
          <div className="mb-2 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-900/30 rounded-lg border border-blue-500/30 text-xs">
            <span className="text-blue-400 font-medium">Genesis EO §3(d)(i)</span>
            <span className="text-slate-400">— lifecycle metadata & provenance tracking for agricultural carbon loops</span>
          </div>
          <div className="mb-4 text-xs text-slate-500">
            Modeled as a West Texas corn–cattle–RNG loop that TTU could operate as a living lab for stacked §45Z + methane credits.
          </div>

          {/* Loop Diagram */}
          <div className="relative h-80 flex items-center justify-center">
            {/* Center Circle */}
            <div className="absolute w-24 h-24 bg-slate-900 rounded-full border-4 border-slate-600 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {lifecycleCI.toFixed(1)}
                </div>
                <div className="text-xs text-slate-400">gCO₂e/MJ</div>
              </div>
            </div>

            {/* Stage Nodes */}
            {stages.map((stage, index) => {
              const angle = (index * 72 - 90) * (Math.PI / 180);
              const radius = 120;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              const isActive = index === activeStage;
              const IconComponent = stage.icon;

              return (
                <div
                  key={stage.id}
                  onClick={() => {
                    setActiveStage(index);
                    setIsAnimating(false);
                    generateReceipt(stage);
                  }}
                  className={`absolute cursor-pointer transition-all duration-500 ${
                    isActive ? 'scale-110 z-20' : 'scale-100 z-10'
                  }`}
                  style={{
                    transform: `translate(${x}px, ${y}px) ${isActive ? 'scale(1.1)' : 'scale(1)'}`,
                  }}
                >
                  <div
                    className={`w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 transition-all ${
                      isActive ? 'border-white shadow-lg' : 'border-transparent'
                    }`}
                    style={{ 
                      backgroundColor: `${stage.color}20`,
                      borderColor: isActive ? stage.color : `${stage.color}50`
                    }}
                  >
                    <IconComponent className="w-8 h-8" style={{ color: stage.color }} />
                    <span className="text-xs mt-1 font-medium" style={{ color: stage.color }}>
                      {stage.name.split(' ')[0]}
                    </span>
                  </div>
                  
                  {/* Connecting Arrow */}
                  {isActive && (
                    <div className="absolute -right-6 top-1/2 transform -translate-y-1/2">
                      <ArrowRight className="w-6 h-6 animate-pulse" style={{ color: stage.color }} />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Animated Flow Ring */}
            <svg className="absolute w-72 h-72" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="2"
                strokeDasharray="10 5"
                className="animate-spin"
                style={{ animationDuration: '30s' }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4ade80" />
                  <stop offset="25%" stopColor="#60a5fa" />
                  <stop offset="50%" stopColor="#f97316" />
                  <stop offset="75%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#eab308" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          {/* CI Explanation */}
          <div className="text-center mt-2 mb-2">
            <p className="text-xs text-slate-500 italic">
              As more manure converts to RNG and loops close, lifecycle CI falls toward low-teens gCO₂e/MJ.
            </p>
          </div>

          {/* Active Stage Details */}
          <div 
            className="mt-6 p-4 rounded-xl border transition-all"
            style={{ 
              backgroundColor: `${stages[activeStage].color}10`,
              borderColor: `${stages[activeStage].color}30`
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div style={{ color: stages[activeStage].color }}>
                {React.createElement(stages[activeStage].icon, { className: "w-8 h-8" })}
              </div>
              <div>
                <h3 className="font-bold text-lg" style={{ color: stages[activeStage].color }}>
                  {stages[activeStage].name}
                </h3>
                <p className="text-slate-400 text-sm">{stages[activeStage].description}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="text-slate-400 text-xs">{stages[activeStage].metric}</div>
                <div className="text-2xl font-bold">
                  {metrics[stages[activeStage].metricKey as keyof typeof metrics].toLocaleString()}
                  <span className="text-sm text-slate-400 ml-1">{stages[activeStage].unit}</span>
                </div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="text-slate-400 text-xs">{stages[activeStage].creditType}</div>
                <div className="text-2xl font-bold text-green-400">
                  ${(metrics[stages[activeStage].metricKey as keyof typeof metrics] * stages[activeStage].creditRate).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Metrics & Receipts */}
        <div className="space-y-6">
          {/* Credit Stacking */}
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold mb-4">Credit Stacking</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-900/20 rounded-lg border border-green-500/20">
                <span className="text-green-400">§45Z Fuel Credits</span>
                <span className="font-bold">${(metrics.ddgsProduced * 0.45).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-900/20 rounded-lg border border-purple-500/20">
                <span className="text-purple-400">Methane Avoidance</span>
                <span className="font-bold">${(metrics.rngGenerated * 2.5).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-900/20 rounded-lg border border-yellow-500/20">
                <span className="text-yellow-400">Diesel Displacement</span>
                <span className="font-bold">${(metrics.farmFuelUsed * 0.85).toLocaleString()}</span>
              </div>
              <div className="border-t border-slate-600 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Value</span>
                  <span className="text-2xl font-bold text-green-400">
                    ${metrics.totalCredits.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Attribution Receipts */}
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold mb-4">Attribution Receipts</h2>
            <p className="text-slate-400 text-sm mb-4">Click any stage to generate a receipt</p>
            
            {receipts.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-2 text-slate-600" />
                <p>No receipts yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                {receipts.map((receipt) => (
                  <div 
                    key={receipt.id}
                    className="p-3 bg-slate-900/50 rounded-lg border border-slate-600 text-sm"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-green-400">{receipt.id}</span>
                      <span className="text-slate-500 text-xs">
                        {new Date(receipt.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-slate-300">{receipt.stage}</div>
                    <div className="flex justify-between mt-1">
                      <span className="text-slate-400">{receipt.creditType}</span>
                      <span className="text-green-400">${receipt.creditValue}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-700">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-xs font-mono truncate flex-1 mr-2">{receipt.hash}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-600">Schema: PATHWELL_RECEIPT_V1</span>
                          <button
                            onClick={() => setExpandedReceipt(expandedReceipt === receipt.id ? null : receipt.id)}
                            className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 whitespace-nowrap transition"
                          >
                            {expandedReceipt === receipt.id ? 'Hide JSON' : 'View JSON'}
                          </button>
                        </div>
                      </div>
                      {expandedReceipt === receipt.id && (
                        <div className="mt-3 relative">
                          <pre className="p-3 bg-slate-950 rounded-lg text-xs text-slate-300 overflow-x-auto border border-slate-600">
                            {JSON.stringify(receipt.jsonSchema, null, 2)}
                          </pre>
                          <button
                            onClick={() => copyToClipboard(JSON.stringify(receipt.jsonSchema, null, 2), receipt.id)}
                            className="mt-2 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 rounded-lg transition text-slate-300 flex items-center gap-1"
                          >
                            {copySuccess === receipt.id ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-green-400" />
                                <span className="text-green-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                Copy JSON
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lifecycle Metrics */}
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold mb-2">Lifecycle Metrics</h2>
            <p className="text-xs text-slate-500 mb-4 italic">Modeled values for illustration — real deployments feed from metered data.</p>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Carbon Intensity</span>
                  <span>{lifecycleCI.toFixed(1)} gCO₂e/MJ</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all"
                    style={{ width: `${ciToPercent(lifecycleCI)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Methane Capture</span>
                  <span>94.2%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-purple-400 w-[94%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">Loop Closure</span>
                  <span>87.6%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 w-[87.6%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pb-12 text-center text-slate-500 text-sm px-6">
        <p>BIOLOOP-RNG™ — Circular Attribution for Agricultural Carbon Markets</p>
        <p className="mt-1">This is the <span className="text-green-400">circular loop metapattern</span> — the same receipt schema can govern linear pipelines, hubs, and networks.</p>
        <p className="mt-1 text-slate-600">PATHWELL tracks feed receipts through cattle IDs to manure batches to RNG production to fuel consumption.</p>
        <p className="mt-4 text-slate-600 text-xs">© 2025 AnchorTrust Holdings LLC — PATHWELL CONNECT™</p>
      </div>
    </div>
  );
}

