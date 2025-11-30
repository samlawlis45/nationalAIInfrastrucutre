"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Zap, Wind, Sun, Database, Globe, CheckCircle2, Copy, ChevronDown, Activity } from 'lucide-react';
import Link from 'next/link';

// Grid profiles type definition
type HourlyProfile = {
  solar: number[];
  wind: number[];
  gas: number[];
};

type GridProfile = {
  name: string;
  peakSolar: number[];
  peakWind: number[];
  hourlyProfile: HourlyProfile;
};

const gridProfiles: Record<string, GridProfile> = {
  'ERCOT': {
    name: 'ERCOT (Texas)',
    peakSolar: [11, 12, 13, 14, 15],
    peakWind: [2, 3, 4, 5, 22, 23],
    hourlyProfile: {
      solar: [0,0,0,0,0,5,15,25,35,40,42,45,45,42,38,30,20,10,2,0,0,0,0,0],
      wind: [30,32,35,38,35,30,25,22,20,18,15,12,10,12,15,18,22,25,28,30,32,35,38,35],
      gas: [50,48,45,42,45,48,45,40,35,32,33,33,35,36,37,42,48,55,58,55,50,47,42,45],
    }
  },
  'CAISO': {
    name: 'CAISO (California)',
    peakSolar: [10, 11, 12, 13, 14],
    peakWind: [18, 19, 20, 21],
    hourlyProfile: {
      solar: [0,0,0,0,0,8,20,35,45,52,55,58,55,50,42,30,15,5,0,0,0,0,0,0],
      wind: [12,10,8,8,10,12,10,8,6,5,5,6,8,10,12,15,18,22,25,22,18,15,14,13],
      gas: [60,62,64,64,62,55,48,38,32,28,25,22,23,26,32,42,55,62,65,68,70,68,65,62],
    }
  },
  'SPP': {
    name: 'SPP (Great Plains)',
    peakSolar: [12, 13, 14],
    peakWind: [0, 1, 2, 3, 4, 5, 22, 23],
    hourlyProfile: {
      solar: [0,0,0,0,0,3,10,18,25,30,32,35,35,32,28,20,12,5,0,0,0,0,0,0],
      wind: [40,42,45,48,45,42,38,32,28,25,22,20,18,20,22,25,28,32,35,38,40,42,44,42],
      gas: [45,43,40,37,40,43,42,42,40,38,40,40,42,43,45,50,55,58,60,57,52,48,45,43],
    }
  },
  'MISO': {
    name: 'MISO (Midwest)',
    peakSolar: [12, 13, 14],
    peakWind: [1, 2, 3, 4, 23],
    hourlyProfile: {
      solar: [0,0,0,0,0,2,8,15,22,28,30,32,32,30,25,18,10,3,0,0,0,0,0,0],
      wind: [18,20,22,24,22,20,18,15,12,10,8,8,10,12,14,16,18,20,22,24,22,20,19,18],
      gas: [55,53,50,48,50,53,55,58,58,55,55,55,53,52,55,60,65,70,72,68,62,58,55,55],
    }
  }
};

export default function CurtailmentCaptureDemo() {
  const [region, setRegion] = useState('ERCOT');
  const [time, setTime] = useState(14);
  const [receipt, setReceipt] = useState<any>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const currentProfile = gridProfiles[region];
  const solar = currentProfile.hourlyProfile.solar[time];
  const wind = currentProfile.hourlyProfile.wind[time];
  const gas = currentProfile.hourlyProfile.gas[time];
  const other = Math.max(0, 100 - solar - wind - gas);
  
  const renewable = solar + wind;
  const isCurtailment = renewable > 55;
  const curtailmentMW = isCurtailment ? Math.round((renewable - 55) * 20 + (Math.random() * 200)) : 0;
  const primarySource = solar > wind ? 'Solar' : 'Wind';

  const captureWorkload = () => {
    const receiptId = 'CC-' + Date.now().toString(36).toUpperCase();
    const timestamp = new Date().toISOString();
    
    const newReceipt = {
      curtailment_capture_receipt: {
        receipt_id: receiptId,
        timestamp: timestamp,
        grid_region: region,
        capture_window: {
          start: time.toString().padStart(2, '0') + ':00:00Z',
          end: (time + 1).toString().padStart(2, '0') + ':00:00Z',
          curtailed_mw: Math.round((solar + wind - 55) * 20 + Math.random() * 200)
        },
        generation_mix: {
          solar_pct: solar,
          wind_pct: wind,
          renewable_total_pct: solar + wind
        },
        workloads_captured: [
          { id: 'WL-001', type: 'climate_model', energy_kwh: 2.4, carbon_avoided_g: 924 },
          { id: 'WL-002', type: 'protein_folding', energy_kwh: 5.1, carbon_avoided_g: 1964 },
          { id: 'WL-003', type: 'llm_finetune', energy_kwh: 18.7, carbon_avoided_g: 7202 }
        ],
        totals: {
          energy_captured_kwh: 26.2,
          carbon_avoided_gco2: 10090,
          effective_carbon_intensity: 0
        },
        cryptographic_proof: {
          algorithm: 'SHA-256',
          hash: Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join(''),
          signing_authority: 'PATHWELL CONNECT™ Trust Anchor'
        },
        compliance: {
          genesis_eo_alignment: ['§3(a)(i)', 'Energy Dominance Mandate'],
          protocol_version: 'PATHWELL CONNECT v1.0'
        }
      }
    };
    setReceipt(newReceipt);
    setTimeout(() => {
        receiptRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      {/* Hero */}
      <section className="pt-12 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-2 mb-6">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 text-sm">Stage 1: Generation — Capture Wasted Renewable Energy</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-400">Curtailment Capture</span> Demo
          </h1>
          
          <p className="text-lg text-slate-400 max-w-3xl mb-4">
            When solar and wind generate more electricity than the grid can absorb, that energy is <strong className="text-white">curtailed</strong> — 
            essentially thrown away. This demo shows how AI workloads can be dynamically routed to capture this free, zero-carbon energy.
          </p>

          <p className="text-sm text-slate-500 max-w-3xl mb-8 border-l-2 border-amber-500/30 pl-4">
            <strong className="text-amber-400">Genesis alignment:</strong> Curtailment capture turns wasted renewable energy into productive compute, 
            directly supporting the "secure energy dominance" mandate while reducing AI's marginal carbon footprint to near-zero during peak renewable periods.
          </p>
        </div>
      </section>

      {/* Main Demo */}
      <section className="pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left Panel: Live Grid Status */}
            <div className="lg:col-span-1">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sticky top-24">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-amber-400" />
                  Live Grid Status
                </h3>
                
                <div className="space-y-6">
                  {/* Region Selector */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Grid Region</label>
                    <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500">
                      <option value="ERCOT">ERCOT (Texas)</option>
                      <option value="CAISO">CAISO (California)</option>
                      <option value="SPP">SPP (Great Plains)</option>
                      <option value="MISO">MISO (Midwest)</option>
                    </select>
                  </div>

                  {/* Time of Day */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Time of Day: <span className="text-amber-400">{time.toString().padStart(2, '0')}:00</span></label>
                    <input type="range" min="0" max="23" value={time} onChange={(e) => setTime(parseInt(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>00:00</span>
                      <span>12:00</span>
                      <span>23:00</span>
                    </div>
                  </div>

                  {/* Current Status */}
                  <div className="pt-4 border-t border-slate-800">
                    <div className="text-sm text-slate-400 mb-2">Current Status</div>
                    <div className={`border rounded-lg p-4 transition-all duration-300 ${isCurtailment ? 'bg-amber-500/10 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'bg-slate-800 border-slate-700'}`}>
                       {isCurtailment ? (
                           <>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
                                <span className="text-amber-400 font-semibold">CURTAILMENT ACTIVE</span>
                            </div>
                            <div className="text-2xl font-bold text-white">{curtailmentMW} MW</div>
                            <div className="text-xs text-slate-400">available for capture</div>
                           </>
                       ) : (
                           <>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
                                <span className="text-slate-400 font-semibold">NO CURTAILMENT</span>
                            </div>
                            <div className="text-lg text-slate-500">Grid balanced</div>
                            <div className="text-xs text-slate-500">Workloads queued for next window</div>
                           </>
                       )}
                    </div>
                  </div>

                  {/* Generation Mix */}
                  <div className="pt-4 border-t border-slate-800">
                    <div className="text-sm text-slate-400 mb-3">Generation Mix</div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 flex items-center gap-1"><Sun className="w-3 h-3" /> Solar</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-400 rounded-full transition-all duration-500" style={{ width: `${solar}%` }}></div>
                          </div>
                          <span className="text-xs text-yellow-400 w-8 text-right">{solar}%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-xs text-slate-400 flex items-center gap-1"><Wind className="w-3 h-3" /> Wind</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-400 rounded-full transition-all duration-500" style={{ width: `${wind}%` }}></div>
                          </div>
                          <span className="text-xs text-cyan-400 w-8 text-right">{wind}%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Gas</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-400 rounded-full transition-all duration-500" style={{ width: `${gas}%` }}></div>
                          </div>
                          <span className="text-xs text-orange-400 w-8 text-right">{gas}%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Other</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-slate-400 rounded-full transition-all duration-500" style={{ width: `${other}%` }}></div>
                          </div>
                          <span className="text-xs text-slate-400 w-8 text-right">{other}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: Workload Routing */}
            <div className="lg:col-span-2">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold mb-6">Workload Routing Decision</h3>
                
                {/* Visual Flow */}
                <div className="relative bg-slate-800/50 rounded-xl p-6 mb-6 overflow-hidden group">
                   {/* Animated background gradient representing flow */}
                   <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(245,158,11,0.1),transparent)] bg-[length:200%_100%] animate-[flow_3s_linear_infinite]"></div>
                   
                  <div className="relative grid grid-cols-3 gap-4 items-center z-10">
                    {/* Source */}
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto bg-amber-500/20 rounded-xl flex items-center justify-center mb-2 border border-amber-500/30">
                        <Zap className="w-8 h-8 text-amber-400" />
                      </div>
                      <div className="text-sm font-medium text-white">Renewable Peak</div>
                      <div className="text-xs text-slate-400">{region} {primarySource}</div>
                    </div>

                    {/* Arrow */}
                    <div className="text-center flex flex-col items-center">
                      <div className="flex items-center justify-center gap-2 w-full">
                        <div className="h-0.5 flex-1 bg-gradient-to-r from-amber-500 to-emerald-500"></div>
                        <ChevronDown className="w-6 h-6 text-emerald-400 -rotate-90" />
                      </div>
                      <div className="text-xs text-slate-400 mt-2 bg-slate-900/80 px-2 py-1 rounded-full border border-slate-700">Route workload to</div>
                    </div>

                    {/* Destination */}
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto bg-emerald-500/20 rounded-xl flex items-center justify-center mb-2 border border-emerald-500/30">
                         <Database className="w-8 h-8 text-emerald-400" />
                      </div>
                      <div className="text-sm font-medium text-white">Edge Data Center</div>
                      <div className="text-xs text-slate-400">Permian Basin Node</div>
                    </div>
                  </div>
                </div>

                {/* Workload Queue */}
                <div className="mb-6">
                  <div className="text-sm text-slate-400 mb-3">Pending Workloads (Curtailment-Eligible)</div>
                  <div className="space-y-2">
                    {[
                        { name: "Climate model ensemble run", type: "Batch", est: "2.4 kWh", color: "emerald" },
                        { name: "Protein folding simulation", type: "Batch", est: "5.1 kWh", color: "emerald" },
                        { name: "LLM fine-tuning job", type: "Deferrable", est: "18.7 kWh", color: "amber" },
                    ].map((job, i) => (
                        <div key={i} className={`bg-slate-800 border border-${job.color === 'emerald' ? 'emerald' : 'amber'}-500/30 rounded-lg p-3 flex items-center justify-between`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 bg-${job.color === 'emerald' ? 'emerald' : 'amber'}-400 rounded-full`}></div>
                                <span className="text-sm text-slate-200">{job.name}</span>
                                <span className={`text-xs bg-${job.color === 'emerald' ? 'emerald' : 'amber'}-500/10 text-${job.color === 'emerald' ? 'emerald' : 'amber'}-400 px-2 py-0.5 rounded`}>{job.type}</span>
                            </div>
                            <div className="text-xs text-slate-400">Est. {job.est}</div>
                        </div>
                    ))}
                  </div>
                </div>

                {/* Capture Button */}
                <button 
                    onClick={captureWorkload}
                    disabled={!isCurtailment}
                    className={`w-full py-4 rounded-xl font-semibold text-lg transition flex items-center justify-center gap-2 ${
                        isCurtailment 
                        ? 'bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-white shadow-lg shadow-amber-900/20 cursor-pointer' 
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    }`}
                >
                    {isCurtailment ? (
                        <>
                            <Zap className="w-5 h-5" />
                            Route Workloads to Curtailment Window
                        </>
                    ) : (
                        <>
                            <Zap className="w-5 h-5" />
                            Waiting for Curtailment Event...
                        </>
                    )}
                </button>
              </div>

              {/* Receipt Output */}
              {receipt && (
                <div ref={receiptRef} className="bg-slate-900 border border-amber-500/30 rounded-xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                       <CheckCircle2 className="w-5 h-5 text-amber-400" />
                      Curtailment Capture Receipt
                    </h3>
                    <span className="text-xs text-slate-400">{new Date(receipt.curtailment_capture_receipt.timestamp).toLocaleString()}</span>
                  </div>
                  
                  <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs overflow-x-auto mb-4 border border-slate-800">
                    <pre className="text-emerald-400">
                        {JSON.stringify(receipt, null, 2)}
                    </pre>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                     <p className="text-xs text-slate-500 italic">
                        Demo mode: Receipt simulated. Production integrates with ISO real-time curtailment APIs.
                    </p>
                     <button 
                        onClick={() => navigator.clipboard.writeText(JSON.stringify(receipt, null, 2))}
                        className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition"
                    >
                        <Copy className="w-3 h-3" /> Copy JSON
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 px-6 bg-slate-900/50 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-xl font-semibold mb-8 text-center">How Curtailment Capture Works</h3>
          <div className="grid md:grid-cols-4 gap-6">
            {[
                { step: "1", title: "Monitor Grid", desc: "Real-time feeds from ISO (ERCOT, CAISO) detect when renewable generation exceeds demand" },
                { step: "2", title: "Queue Workloads", desc: "Batch and deferrable jobs are tagged as curtailment-eligible based on latency requirements" },
                { step: "3", title: "Route & Execute", desc: "When curtailment detected, workloads route to nearest edge node in the renewable-rich region" },
                { step: "4", title: "Generate Receipt", desc: "Cryptographic receipt proves workload executed during curtailment window with near-zero marginal carbon" },
            ].map((item, i) => (
                <div key={i} className="text-center group hover:transform hover:scale-105 transition-transform duration-300">
                    <div className="w-12 h-12 mx-auto bg-amber-500/10 rounded-xl flex items-center justify-center mb-4 border border-amber-500/20 group-hover:border-amber-500/50 transition-colors">
                        <span className="text-2xl font-bold text-amber-400">{item.step}</span>
                    </div>
                    <div className="font-medium mb-2 text-white">{item.title}</div>
                    <p className="text-sm text-slate-400">{item.desc}</p>
                </div>
            ))}
          </div>
        </div>
      </section>

      {/* Genesis Alignment */}
      <section className="py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-400" />
            Genesis EO Alignment
            <span className="text-xs text-slate-500 font-normal ml-2">Executive Order, November 24, 2025</span>
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-blue-500/30 rounded-lg p-5">
              <div className="text-xs text-blue-400 font-mono mb-2">§3(a)(i)</div>
              <div className="font-semibold mb-2 text-white">Compute Resource Integration</div>
              <p className="text-sm text-slate-400">Curtailment capture extends DOE compute infrastructure to edge nodes co-located with renewable generation, maximizing utilization of national laboratory resources.</p>
            </div>
            <div className="bg-slate-900 border border-blue-500/30 rounded-lg p-5">
              <div className="text-xs text-blue-400 font-mono mb-2">Energy Dominance</div>
              <div className="font-semibold mb-2 text-white">Secretary Wright's Mandate</div>
              <p className="text-sm text-slate-400">Converts wasted renewable energy into productive scientific compute, directly supporting "secure energy dominance" while demonstrating AI-grid symbiosis.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

