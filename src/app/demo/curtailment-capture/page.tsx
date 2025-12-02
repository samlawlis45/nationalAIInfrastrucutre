"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Zap, Activity, Copy, ArrowRight, ChevronLeft, Brain, Wrench, Check } from 'lucide-react';
import Link from 'next/link';

// Types for the Grid Data
type GridData = {
  carbonIntensity: number;
  renewablePct: number;
  curtailmentMW: number;
  pricePerMWh: number;
  status: 'curtailing' | 'normal';
};

type GridRegions = {
  [key: string]: GridData;
};

type RegionInfo = {
  name: string;
  abbrev: string;
  color: string;
};

const REGIONS: Record<string, RegionInfo> = {
  CAISO: { name: 'California (CAISO)', abbrev: 'CA', color: '#f59e0b' },
  ERCOT: { name: 'Texas (ERCOT)', abbrev: 'TX', color: '#10b981' },
  PJM: { name: 'Mid-Atlantic (PJM)', abbrev: 'PJM', color: '#3b82f6' },
};

const WORKLOAD_TYPES = [
  { id: 'training', name: 'Model Training', icon: <Brain className="w-6 h-6 text-purple-400" />, estimatedMWh: 2.5, flexible: true },
  { id: 'inference', name: 'Batch Inference', icon: <Zap className="w-6 h-6 text-yellow-400" />, estimatedMWh: 0.8, flexible: true },
  { id: 'finetune', name: 'Fine-tuning Job', icon: <Wrench className="w-6 h-6 text-slate-400" />, estimatedMWh: 1.2, flexible: true },
  { id: 'realtime', name: 'Real-time API', icon: <Activity className="w-6 h-6 text-red-400" />, estimatedMWh: 0.3, flexible: false },
];

export default function CurtailmentCaptureDemo() {
  // State
  const [gridData, setGridData] = useState<GridRegions>({});
  const [completedJobs, setCompletedJobs] = useState<any[]>([]);
  const [currentReceipt, setCurrentReceipt] = useState<any>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({
    totalMWh: 847.3,
    co2Avoided: 312.4,
    curtailmentCaptured: 723.8,
    avgRenewable: 94.2,
    jobsCompleted: 156,
  });

  // Generate Grid Conditions (Simulation Logic)
  const generateGridConditions = useCallback(() => {
    const hour = new Date().getHours();
    const isSolarPeak = hour >= 10 && hour <= 15;
    const isWindPeak = hour >= 18 || hour <= 6;

    return {
      CAISO: {
        carbonIntensity: isSolarPeak ? 85 + Math.random() * 30 : 280 + Math.random() * 80,
        renewablePct: isSolarPeak ? 75 + Math.random() * 20 : 25 + Math.random() * 15,
        curtailmentMW: isSolarPeak ? 800 + Math.random() * 1200 : Math.random() * 100,
        pricePerMWh: isSolarPeak ? -5 + Math.random() * 15 : 35 + Math.random() * 25,
        status: (isSolarPeak ? 'curtailing' : 'normal') as 'curtailing' | 'normal',
      },
      ERCOT: {
        carbonIntensity: isWindPeak ? 120 + Math.random() * 40 : 350 + Math.random() * 100,
        renewablePct: isWindPeak ? 55 + Math.random() * 25 : 20 + Math.random() * 15,
        curtailmentMW: isWindPeak ? 400 + Math.random() * 800 : Math.random() * 50,
        pricePerMWh: isWindPeak ? 8 + Math.random() * 12 : 45 + Math.random() * 30,
        status: (isWindPeak ? 'curtailing' : 'normal') as 'curtailing' | 'normal',
      },
      PJM: {
        carbonIntensity: 320 + Math.random() * 120,
        renewablePct: 12 + Math.random() * 18,
        curtailmentMW: Math.random() * 30,
        pricePerMWh: 42 + Math.random() * 20,
        status: 'normal' as 'curtailing' | 'normal',
      },
    };
  }, []);

  // Initialize and Interval
  useEffect(() => {
    setGridData(generateGridConditions());
    const interval = setInterval(() => {
      setGridData(generateGridConditions());
    }, 5000);
    return () => clearInterval(interval);
  }, [generateGridConditions]);

  // Helper: Find Optimal Region
  const findOptimalRegion = () => {
    let bestRegion = null;
    let bestScore = Infinity;

    for (const region in gridData) {
      const data = gridData[region];
      const score = data.status === 'curtailing'
        ? data.carbonIntensity * 0.5 - data.curtailmentMW * 0.1
        : data.carbonIntensity;

      if (score < bestScore) {
        bestScore = score;
        bestRegion = region;
      }
    }
    return bestRegion || 'CAISO';
  };

  // Helper: Generate Receipt
  const generateReceipt = (workload: any, region: string, regionData: GridData) => {
    const timestamp = new Date().toISOString();
    const receiptId = 'DR-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    const hexChars = '0123456789abcdef';
    let signature = '0x';
    let merkleRoot = '0x';
    for (let i = 0; i < 64; i++) {
      signature += hexChars[Math.floor(Math.random() * 16)];
      merkleRoot += hexChars[Math.floor(Math.random() * 16)];
    }

    return {
      dispatch_receipt_id: receiptId,
      schema_version: "1.0.0",
      timestamp: timestamp,
      workload: {
        workload_id: workload.id,
        type: workload.type,
        estimated_mwh: workload.estimatedMWh,
        flexibility_class: workload.flexible ? 'deferrable' : 'time_critical',
        submitter_org_id: "ORG-DEMO-001",
      },
      routing_decision: {
        selected_region: region,
        selection_reason: regionData.status === 'curtailing'
          ? 'CURTAILMENT_CAPTURE'
          : 'LOWEST_CARBON_INTENSITY',
        alternatives_evaluated: Object.keys(REGIONS).filter(r => r !== region),
        decision_timestamp: timestamp,
      },
      energy_attribution: {
        grid_region: region,
        carbon_intensity_gco2_kwh: Math.round(regionData.carbonIntensity),
        renewable_fraction: (regionData.renewablePct / 100).toFixed(3),
        curtailment_captured_mwh: regionData.status === 'curtailing'
          ? (workload.estimatedMWh * 0.85).toFixed(3)
          : "0.000",
        grid_price_usd_mwh: regionData.pricePerMWh.toFixed(2),
      },
      carbon_accounting: {
        baseline_emissions_kg: Math.round(workload.estimatedMWh * 400 * 1000) / 1000,
        actual_emissions_kg: Math.round(workload.estimatedMWh * regionData.carbonIntensity) / 1000,
        avoided_emissions_kg: Math.round(workload.estimatedMWh * (400 - regionData.carbonIntensity)) / 1000,
      },
      cryptographic_proof: {
        algorithm: "ED25519",
        signer_id: "PATHWELL-DISPATCH-001",
        signature: signature,
        merkle_root: merkleRoot,
      },
      compliance: {
        genesis_eo_alignment: ["§3(a)(v)", "§3(a)(i)"],
        attestation_tier: "TIER_2_ENERGY_ATTRIBUTED",
      }
    };
  };

  // Submit Workload
  const submitWorkload = (workloadId: string) => {
    if (isRouting) return;

    const workloadType = WORKLOAD_TYPES.find(w => w.id === workloadId);
    if (!workloadType) return;

    setIsRouting(true);

    setTimeout(() => {
      const optimalRegion = findOptimalRegion();
      const regionData = gridData[optimalRegion];

      const receipt = generateReceipt({
        id: 'WL-' + Date.now(),
        type: workloadType.id,
        estimatedMWh: workloadType.estimatedMWh,
        flexible: workloadType.flexible,
      }, optimalRegion, regionData);

      const completedJob = {
        id: 'WL-' + Date.now(),
        name: workloadType.name,
        icon: workloadType.icon,
        region: optimalRegion,
        receipt: receipt,
      };

      setCompletedJobs(prev => [completedJob, ...prev].slice(0, 10));

      // Update Stats
      setStats(prev => ({
        totalMWh: prev.totalMWh + workloadType.estimatedMWh,
        co2Avoided: prev.co2Avoided + receipt.carbon_accounting.avoided_emissions_kg / 1000,
        curtailmentCaptured: prev.curtailmentCaptured + parseFloat(receipt.energy_attribution.curtailment_captured_mwh),
        avgRenewable: (prev.avgRenewable * prev.jobsCompleted + regionData.renewablePct) / (prev.jobsCompleted + 1),
        jobsCompleted: prev.jobsCompleted + 1,
      }));

      setIsRouting(false);
    }, 2000);
  };

  // Modal Logic
  const openModal = (receipt: any) => {
    setCurrentReceipt(receipt);
    setIsModalOpen(true);
    setCopySuccess(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentReceipt(null);
  };

  const copyToClipboard = () => {
    if (currentReceipt) {
      navigator.clipboard.writeText(JSON.stringify(currentReceipt, null, 2));
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-emerald-500/30">
      

      <main className="max-w-7xl mx-auto px-6 pb-8 pt-24">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              Curtailment Capture
            </h1>
            <p className="text-slate-400">MVP Demo • National AI Infrastructure</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            Live Grid Data
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-emerald-400">{stats.totalMWh.toFixed(1)}</div>
            <div className="text-xs text-slate-400">Total MWh Processed</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-cyan-400">{stats.co2Avoided.toFixed(1)}t</div>
            <div className="text-xs text-slate-400">CO₂e Avoided</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-amber-400">{stats.curtailmentCaptured.toFixed(1)}</div>
            <div className="text-xs text-slate-400">Curtailment MWh</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-400">{stats.avgRenewable.toFixed(1)}%</div>
            <div className="text-xs text-slate-400">Avg Renewable</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-slate-300">{stats.jobsCompleted}</div>
            <div className="text-xs text-slate-400">Jobs Completed</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Grid Status & Completed Jobs */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Grid Status */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Real-Time Grid Status
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {Object.entries(gridData).map(([key, data]) => {
                  const region = REGIONS[key];
                  const isCurtailing = data.status === 'curtailing';
                  
                  let carbonClass = 'bg-red-500/20 text-red-400';
                  if (data.carbonIntensity < 150) {
                    carbonClass = 'bg-emerald-500/20 text-emerald-400';
                  } else if (data.carbonIntensity < 300) {
                    carbonClass = 'bg-amber-500/20 text-amber-400';
                  }

                  return (
                    <div key={key} className="relative p-4 rounded-xl border border-slate-700 bg-slate-900 hover:border-slate-600 transition">
                      {isCurtailing && (
                        <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-emerald-500 text-xs font-bold rounded-full animate-pulse">
                          CURTAILING
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: region.color }}></div>
                          <span className="font-semibold">{region.abbrev}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded ${carbonClass}`}>
                          {Math.round(data.carbonIntensity)} gCO₂/kWh
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Renewable</span>
                          <span className="text-emerald-400 font-medium">{Math.round(data.renewablePct)}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500" 
                            style={{ width: `${data.renewablePct}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Curtailment</span>
                          <span className={isCurtailing ? 'text-emerald-400' : 'text-slate-500'}>
                            {Math.round(data.curtailmentMW)} MW
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Price</span>
                          <span className={data.pricePerMWh < 20 ? 'text-emerald-400' : 'text-slate-400'}>
                            ${data.pricePerMWh.toFixed(2)}/MWh
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Completed Jobs */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                Recent Dispatches
              </h2>
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="divide-y divide-slate-800">
                  {completedJobs.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                      <p>No dispatches yet. Submit a workload to see receipts here.</p>
                    </div>
                  ) : (
                    completedJobs.map((job, index) => {
                      const regionInfo = REGIONS[job.region];
                      return (
                        <div key={index} className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 flex items-center justify-center">{job.icon}</div>
                            <div>
                              <div className="font-medium text-slate-200">{job.name}</div>
                              <div className="text-xs text-slate-400 font-mono">{job.receipt.dispatch_receipt_id}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                              <div className="text-sm">
                                <span className="text-slate-400">→</span> 
                                <span style={{ color: regionInfo.color }} className="ml-1">{regionInfo.abbrev}</span>
                              </div>
                              <div className="text-xs text-emerald-400">
                                -{job.receipt.carbon_accounting.avoided_emissions_kg.toFixed(1)} kg CO₂
                              </div>
                            </div>
                            <button 
                              onClick={() => openModal(job.receipt)} 
                              className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 rounded-lg transition text-slate-300"
                            >
                              View Receipt
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Submit Workload */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Submit Workload
            </h2>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              {WORKLOAD_TYPES.map((workload) => (
                <button
                  key={workload.id}
                  onClick={() => submitWorkload(workload.id)}
                  disabled={isRouting}
                  className={`w-full p-4 rounded-lg border text-left transition flex items-center justify-between group ${
                    isRouting
                      ? 'opacity-50 cursor-not-allowed border-slate-700 bg-slate-800'
                      : 'border-slate-700 bg-slate-800 hover:border-blue-500 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center">{workload.icon}</div>
                    <div>
                      <div className="font-medium text-slate-200">{workload.name}</div>
                      <div className="text-xs text-slate-400">
                        ~{workload.estimatedMWh} MWh • {workload.flexible ? 'Flexible' : 'Time-critical'}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className={`w-5 h-5 text-slate-500 group-hover:text-blue-500 transition ${isRouting ? 'hidden' : ''}`} />
                </button>
              ))}
            </div>

            {/* Routing Indicator */}
            {isRouting && (
              <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 animate-in fade-in duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  <div>
                    <div className="font-medium text-blue-400">Routing workload...</div>
                    <div className="text-xs text-slate-400">Evaluating grid conditions</div>
                  </div>
                </div>
              </div>
            )}

            {/* How It Works */}
            <div className="mt-6 bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <h3 className="text-sm font-semibold mb-3 text-slate-300">How It Works</h3>
              <ol className="space-y-2 text-xs text-slate-400">
                <li className="flex gap-2">
                  <span className="text-blue-400 font-bold">1.</span>
                  Submit workload with flexibility class
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-400 font-bold">2.</span>
                  System evaluates real-time grid conditions
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-400 font-bold">3.</span>
                  Routes to region with curtailment or lowest carbon
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-400 font-bold">4.</span>
                  Generates cryptographic dispatch receipt
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-400 font-bold">5.</span>
                  Receipt proves compliance with Genesis EO §3(a)(v)
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
          <p>Demo uses simulated workloads with realistic grid patterns based on CAISO, ERCOT, and PJM data.</p>
          <p className="mt-2">A PATHWELL CONNECT™ Initiative by AnchorTrust Holdings LLC</p>
        </footer>
      </main>

      {/* Receipt Modal */}
      {isModalOpen && currentReceipt && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={closeModal}>
          <div 
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div>
                <h3 className="font-semibold text-white">Dispatch Receipt</h3>
                <p className="text-xs text-slate-400 font-mono">{currentReceipt.dispatch_receipt_id}</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={copyToClipboard}
                  className="px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 rounded-lg transition text-slate-300 flex items-center gap-1"
                >
                  {copySuccess ? (
                    <span className="text-green-400 flex items-center gap-1"><Check className="w-4 h-4" /> Copied</span>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copy JSON
                    </>
                  )}
                </button>
                <button 
                  onClick={closeModal}
                  className="p-1.5 hover:bg-slate-800 rounded-lg transition text-slate-400 hover:text-white"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4 overflow-auto max-h-[60vh]">
              <pre className="font-mono text-xs text-emerald-400 whitespace-pre-wrap">
                {JSON.stringify(currentReceipt, null, 2)}
              </pre>
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-800/50">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Cryptographically signed • Genesis EO §3(a)(v) compliant • Tier 2 attestation</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
