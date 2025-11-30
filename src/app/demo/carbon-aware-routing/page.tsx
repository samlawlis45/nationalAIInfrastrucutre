"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Globe, Zap, Server, Activity, RefreshCw, CheckCircle2, Wind, Cloud, Clock, Shield } from 'lucide-react';
import Link from 'next/link';

// Lab Data
const LABS: Record<string, { name: string; grid: string; intensity: number; renewable: number; latency: Record<string, number> }> = {
  'PNNL': { name: 'Pacific Northwest (PNNL)', grid: 'NWPP', intensity: 125, renewable: 72, latency: { DC: 85, SF: 65, CHI: 70, DAL: 75 } },
  'LLNL': { name: 'Lawrence Livermore (LLNL)', grid: 'CAISO', intensity: 142, renewable: 68, latency: { DC: 80, SF: 45, CHI: 65, DAL: 60 } },
  'NREL': { name: 'NREL', grid: 'WAPA', intensity: 185, renewable: 58, latency: { DC: 60, SF: 55, CHI: 45, DAL: 50 } },
  'ORNL': { name: 'Oak Ridge (ORNL)', grid: 'TVA', intensity: 285, renewable: 45, latency: { DC: 35, SF: 75, CHI: 50, DAL: 55 } },
  'SNL': { name: 'Sandia (SNL)', grid: 'SPP', intensity: 298, renewable: 38, latency: { DC: 65, SF: 60, CHI: 55, DAL: 45 } },
  'ANL': { name: 'Argonne (ANL)', grid: 'PJM', intensity: 372, renewable: 23, latency: { DC: 40, SF: 70, CHI: 15, DAL: 50 } }
};

export default function CarbonAwareRoutingDemo() {
  const [workloadType, setWorkloadType] = useState('batch');
  const [latencyReq, setLatencyReq] = useState('flexible');
  const [origin, setOrigin] = useState('DC');
  const [priority, setPriority] = useState('carbon');
  const [energy, setEnergy] = useState(2.5);
  
  const [selectedLab, setSelectedLab] = useState<string | null>(null);
  const [routingStats, setRoutingStats] = useState({ emissions: 0, saved: 0, worstEmissions: 0 });
  const [labScores, setLabScores] = useState<any[]>([]);
  
  const [receipt, setReceipt] = useState<any | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  // Update routing logic whenever inputs change
  useEffect(() => {
    const scores = [];
    for (const [id, lab] of Object.entries(LABS)) {
      const latency = lab.latency[origin];
      const carbon = lab.intensity;
      
      let eligible = true;
      if (latencyReq === 'strict' && latency > 50) eligible = false;
      if (latencyReq === 'moderate' && latency > 80) eligible = false;
      
      let score;
      if (priority === 'carbon') {
        score = 1000 - carbon;
      } else if (priority === 'latency') {
        score = 1000 - latency * 10;
      } else {
        score = (1000 - carbon) * 0.6 + (1000 - latency * 10) * 0.4;
      }
      
      scores.push({ id, lab, score, eligible, latency, carbon });
    }
    
    scores.sort((a, b) => b.score - a.score);
    const eligible = scores.filter(s => s.eligible);
    const selected = eligible.length > 0 ? eligible[0] : scores[0];
    
    const emissions = Math.round(selected.carbon * energy);
    const worstEmissions = Math.round(Math.max(...Object.values(LABS).map(l => l.intensity)) * energy);
    const saved = Math.round((1 - emissions / worstEmissions) * 100);

    setLabScores(scores);
    setSelectedLab(selected.id);
    setRoutingStats({ emissions, saved, worstEmissions });
  }, [latencyReq, origin, priority, energy]);

  const executeRouting = () => {
    if (!selectedLab) return;
    const lab = LABS[selectedLab];
    
    const receiptId = 'DR-' + Date.now().toString(36).toUpperCase();
    const timestamp = new Date().toISOString();
    
    const newReceipt = {
      dispatch_receipt: {
        receipt_id: receiptId,
        timestamp: timestamp,
        routing_decision: {
          origin: origin,
          destination: selectedLab,
          destination_grid: lab.grid,
          reason_codes: ['CARBON_OPTIMIZATION', 'RENEWABLE_ENERGY_PREFERENCE']
        },
        carbon_metrics: {
          grid_intensity_gco2_kwh: lab.intensity,
          renewable_fraction: lab.renewable / 100,
          energy_kwh: energy,
          total_emissions_gco2: Math.round(lab.intensity * energy)
        },
        alternatives_evaluated: Object.entries(LABS).map(([id, l]) => ({
          lab: id,
          intensity: l.intensity,
          would_emit_gco2: Math.round(l.intensity * energy)
        })),
        optimization_result: {
          emissions_vs_worst_pct: -Math.round((1 - lab.intensity / Math.max(...Object.values(LABS).map(l => l.intensity))) * 100),
          emissions_vs_average_pct: -Math.round((1 - lab.intensity / (Object.values(LABS).reduce((a, l) => a + l.intensity, 0) / Object.keys(LABS).length)) * 100)
        },
        cryptographic_proof: {
          algorithm: 'SHA-256',
          hash: Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join(''),
          signing_authority: 'PATHWELL CONNECT™ Trust Anchor'
        },
        compliance: {
          genesis_eo_alignment: ['§3(a)(v)', '§6(a)(ii)'],
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
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      {/* Hero */}
      <section className="pt-12 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 text-sm">Stage 2: Transmission — Route to Cleanest Available Compute</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">Carbon-Aware Routing</span> Demo
          </h1>
          
          <p className="text-lg text-slate-400 max-w-3xl mb-4">
            DOE national labs span multiple grid regions with vastly different carbon intensities. 
            This demo shows how workloads can be dynamically routed to the <strong className="text-white">cleanest available compute</strong> 
            while respecting latency and policy constraints.
          </p>

          <p className="text-sm text-slate-500 max-w-3xl mb-8 border-l-2 border-blue-500/30 pl-4">
            <strong className="text-blue-400">Genesis alignment:</strong> The national lab network becomes a carbon-optimized compute fabric. 
            Same scientific workload, dramatically different emissions depending on where and when it runs.
          </p>
        </div>
      </section>

      {/* Main Demo */}
      <section className="pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Left Panel: Workload Config */}
            <div className="lg:col-span-1">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sticky top-24">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                  <Server className="w-5 h-5 text-blue-400" />
                  Workload Configuration
                </h3>
                
                <div className="space-y-4">
                  {/* Workload Type */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Workload Type</label>
                    <select 
                      value={workloadType}
                      onChange={(e) => setWorkloadType(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                      <option value="batch">Batch Training Job</option>
                      <option value="inference">Inference Request</option>
                      <option value="simulation">Scientific Simulation</option>
                    </select>
                  </div>

                  {/* Latency Requirement */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Latency Tolerance</label>
                    <select 
                      value={latencyReq}
                      onChange={(e) => setLatencyReq(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                      <option value="flexible">Flexible (hours)</option>
                      <option value="moderate">Moderate (&lt;30 min)</option>
                      <option value="strict">Strict (&lt;100ms)</option>
                    </select>
                  </div>

                  {/* Origin */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Request Origin</label>
                    <select 
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                      <option value="DC">Washington, DC</option>
                      <option value="SF">San Francisco, CA</option>
                      <option value="CHI">Chicago, IL</option>
                      <option value="DAL">Dallas, TX</option>
                    </select>
                  </div>

                  {/* Optimization Priority */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Optimization Priority</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="priority" 
                          value="carbon" 
                          checked={priority === 'carbon'} 
                          onChange={(e) => setPriority(e.target.value)}
                          className="text-blue-500 focus:ring-blue-500 bg-slate-800 border-slate-700" 
                        />
                        <span className="text-sm text-slate-300">Minimize Carbon</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="priority" 
                          value="latency" 
                          checked={priority === 'latency'} 
                          onChange={(e) => setPriority(e.target.value)}
                          className="text-blue-500 focus:ring-blue-500 bg-slate-800 border-slate-700" 
                        />
                        <span className="text-sm text-slate-300">Minimize Latency</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="priority" 
                          value="balanced" 
                          checked={priority === 'balanced'} 
                          onChange={(e) => setPriority(e.target.value)}
                          className="text-blue-500 focus:ring-blue-500 bg-slate-800 border-slate-700" 
                        />
                        <span className="text-sm text-slate-300">Balanced</span>
                      </label>
                    </div>
                  </div>

                  {/* Estimated Energy */}
                  <div className="pt-4 border-t border-slate-800">
                    <label className="block text-sm text-slate-400 mb-2">Estimated Energy: <span className="text-blue-400">{energy.toFixed(1)} kWh</span></label>
                    <input 
                      type="range" 
                      min="0.5" 
                      max="50" 
                      value={energy} 
                      step="0.5" 
                      onChange={(e) => setEnergy(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>0.5 kWh</span>
                      <span>50 kWh</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: Lab Network */}
            <div className="lg:col-span-2">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold mb-6 text-white">DOE Lab Network — Live Carbon Status</h3>
                
                {/* Lab Cards */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {labScores.map((item) => (
                    <div 
                      key={item.id} 
                      className={`bg-slate-800 border-2 rounded-xl p-4 transition-all duration-300 ${
                        selectedLab === item.id ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'border-slate-700 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-semibold text-white">{item.lab.name}</div>
                          <div className="text-xs text-slate-400">{item.lab.grid} Grid</div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xl font-bold ${
                            item.carbon < 200 ? 'text-emerald-400' : 
                            item.carbon < 350 ? 'text-yellow-400' : 
                            'text-red-400'
                          }`}>
                            {item.carbon}
                          </div>
                          <div className="text-xs text-slate-400">gCO₂/kWh</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`px-2 py-0.5 rounded ${
                          item.lab.renewable > 50 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'
                        }`}>
                          {item.lab.renewable}% renewable
                        </span>
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> ~{item.latency}ms
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Routing Decision */}
                <div className="bg-slate-800/50 border border-blue-500/30 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-5 h-5 text-blue-400" />
                    <span className="font-semibold text-white">Routing Decision</span>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Selected Destination</div>
                      <div className="text-lg font-bold text-blue-400">{selectedLab}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Estimated Emissions</div>
                      <div className="text-lg font-bold text-emerald-400">{routingStats.emissions}g CO₂</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">vs. Worst Option</div>
                      <div className="text-lg font-bold text-amber-400">-{routingStats.saved}% saved</div>
                    </div>
                  </div>
                </div>

                {/* Route Button */}
                <button 
                  onClick={executeRouting}
                  className="w-full mt-6 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 py-4 rounded-xl font-semibold text-lg transition flex items-center justify-center gap-2 text-white shadow-lg hover:shadow-xl"
                >
                  <Zap className="w-5 h-5" />
                  Execute Carbon-Optimized Routing
                </button>
              </div>

              {/* Receipt Output */}
              {receipt && (
                <div ref={receiptRef} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-slate-900 border border-blue-500/30 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
                        <CheckCircle2 className="w-5 h-5 text-blue-400" />
                        Dispatch Receipt
                      </h3>
                      <span className="text-xs text-slate-400">{new Date(receipt.dispatch_receipt.timestamp).toLocaleString()}</span>
                    </div>
                    
                    <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs overflow-x-auto mb-4 border border-slate-800 custom-scrollbar">
                      <pre className="text-blue-400 leading-relaxed">
                        {JSON.stringify(receipt, null, 2)}
                      </pre>
                    </div>

                    <p className="text-xs text-slate-500 italic">
                      Demo mode: Receipt simulated. Production integrates with WattTime API for real-time marginal emissions and DOE lab orchestration layer.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-12 px-6 bg-slate-900/50 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-xl font-semibold mb-8 text-center text-white">Carbon Impact: Same Workload, Different Destinations</h3>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="text-sm text-slate-400 mb-4 text-center">{energy} kWh workload routed to different labs</div>
            <div className="space-y-3">
              {labScores.map((item) => {
                const currentEmission = Math.round(item.carbon * energy);
                const maxEmission = routingStats.worstEmissions;
                const percent = (currentEmission / maxEmission) * 100;
                
                let colorClass = 'bg-emerald-500';
                if (item.carbon >= 350) colorClass = 'bg-red-500';
                else if (item.carbon >= 200) colorClass = 'bg-orange-500';
                else if (item.carbon >= 150) colorClass = 'bg-yellow-500';

                return (
                  <div key={item.id} className="flex items-center gap-4">
                    <span className="w-20 text-xs text-slate-400">{item.id}</span>
                    <div className="flex-1 h-6 bg-slate-800 rounded-full overflow-hidden relative">
                      <div 
                        className={`h-full ${colorClass} rounded-full flex items-center justify-end pr-2 transition-all duration-500`} 
                        style={{ width: `${Math.max(percent, 5)}%` }}
                      >
                        <span className="text-xs font-medium text-slate-900 px-1">{currentEmission}g</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-400 text-center mt-4">
              Routing to {selectedLab} instead of ANL saves <strong className="text-emerald-400">{routingStats.saved}% emissions</strong> for identical compute
            </p>
          </div>
        </div>
      </section>

      {/* Genesis Alignment */}
      <section className="py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-white">
            <Shield className="w-5 h-5 text-blue-400" />
            Genesis EO Alignment
            <span className="text-xs text-slate-500 font-normal ml-2">Executive Order, November 24, 2025</span>
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-blue-500/30 rounded-lg p-5">
              <div className="text-xs text-blue-400 font-mono mb-2">§3(a)(v)</div>
              <div className="font-semibold mb-2 text-white">Secure Data Access</div>
              <p className="text-sm text-slate-400">Carbon-aware routing respects data locality and security requirements while optimizing for emissions — workloads only route to authorized facilities.</p>
            </div>
            <div className="bg-slate-900 border border-blue-500/30 rounded-lg p-5">
              <div className="text-xs text-blue-400 font-mono mb-2">§6(a)(ii)</div>
              <div className="font-semibold mb-2 text-white">Cross-Lab Integration</div>
              <p className="text-sm text-slate-400">"Progress toward integration across DOE national laboratories... including shared access to computing resources" — carbon routing enables intelligent resource sharing.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
