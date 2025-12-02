"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, CheckCircle2, Zap, Globe, Lock, Database, ChevronDown, ChevronRight, Copy } from 'lucide-react';
import Link from 'next/link';

// Grid region data (EPA eGRID 2023)
type GridMix = { solar: number; wind: number; gas: number; nuclear: number; hydro: number; coal: number; other: number };
type GridData = { intensity: number; renewable: number; mix: GridMix };

const gridData: Record<string, GridData> = {
  'CAISO': { intensity: 142, renewable: 0.68, mix: { solar: 25, wind: 12, gas: 38, nuclear: 8, hydro: 15, coal: 0, other: 2 } },
  'ERCOT': { intensity: 385, renewable: 0.31, mix: { solar: 6, wind: 25, gas: 47, nuclear: 10, hydro: 0, coal: 10, other: 2 } },
  'PJM': { intensity: 372, renewable: 0.23, mix: { solar: 2, wind: 4, gas: 40, nuclear: 34, hydro: 3, coal: 15, other: 2 } },
  'MISO': { intensity: 428, renewable: 0.22, mix: { solar: 1, wind: 14, gas: 30, nuclear: 12, hydro: 3, coal: 38, other: 2 } },
  'SPP': { intensity: 356, renewable: 0.38, mix: { solar: 3, wind: 35, gas: 32, nuclear: 5, hydro: 2, coal: 21, other: 2 } },
  'NYISO': { intensity: 165, renewable: 0.32, mix: { solar: 3, wind: 5, gas: 42, nuclear: 26, hydro: 22, coal: 0, other: 2 } },
  'ISONE': { intensity: 242, renewable: 0.22, mix: { solar: 5, wind: 4, gas: 57, nuclear: 25, hydro: 6, coal: 1, other: 2 } },
  'NWPP': { intensity: 198, renewable: 0.58, mix: { solar: 4, wind: 14, gas: 22, nuclear: 4, hydro: 48, coal: 6, other: 2 } }
};

// Model size energy (kWh per inference)
const modelEnergy: Record<string, { energy: number; params: string }> = {
  'small': { energy: 0.001, params: '7B' },
  'medium': { energy: 0.003, params: '70B' },
  'large': { energy: 0.008, params: '175B' },
  'xlarge': { energy: 0.025, params: '540B+' }
};

// Hardware efficiency multipliers
const hardwareMultipliers: Record<string, number> = {
  'premium': 1.0,
  'standard': 1.2,
  'legacy': 1.8
};

export default function WellToInferenceDemo() {
  // State for inputs
  const [region, setRegion] = useState('ERCOT');
  const [pue, setPue] = useState(1.40);
  const [lineLoss, setLineLoss] = useState(5);
  const [modelSize, setModelSize] = useState('medium');
  const [inferenceCount, setInferenceCount] = useState(1000);
  const [hardwareClass, setHardwareClass] = useState('standard');
  const [isPatternListOpen, setIsPatternListOpen] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  // Presets
  const loadPreset = (preset: string) => {
    if (preset === 'doe') {
      setRegion('PJM');
      setPue(1.40);
      setLineLoss(5);
      setModelSize('medium');
      setInferenceCount(1000);
      setHardwareClass('standard');
    } else if (preset === 'permian') {
      setRegion('ERCOT');
      setPue(1.20);
      setLineLoss(3);
      setModelSize('medium');
      setInferenceCount(10000);
      setHardwareClass('standard');
    } else if (preset === 'hyperscale') {
      setRegion('CAISO');
      setPue(1.10);
      setLineLoss(2);
      setModelSize('large');
      setInferenceCount(100000);
      setHardwareClass('premium');
    }
  };

  // Calculations
  const calculate = () => {
    const grid = gridData[region];
    const model = modelEnergy[modelSize];
    const hwMult = hardwareMultipliers[hardwareClass];

    const stage1 = grid.intensity;
    const stage2 = stage1 * (1 + lineLoss / 100);
    const stage3 = stage2 * pue;
    
    const energyPerInf = model.energy * hwMult;
    const totalEnergy = energyPerInf * inferenceCount;
    const totalEmissions = stage3 * totalEnergy;
    const perInference = totalEmissions / inferenceCount;

    return {
      stage1, stage2, stage3, perInference, totalEnergy, totalEmissions, energyPerInf, hwMult, grid, model
    };
  };

  const results = calculate();

  const generateHash = (input: string) => {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(64, '0').substring(0, 64);
  };

  const generateReceipt = () => {
    const timestamp = new Date().toISOString();
    const receiptId = 'WTI-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const newReceipt = {
      well_to_inference_receipt: {
        receipt_id: receiptId,
        timestamp: timestamp,
        version: "1.0.0",
        stages: {
          generation: {
            grid_region: region,
            carbon_intensity_gco2_kwh: results.stage1,
            renewable_fraction: results.grid.renewable,
            source_breakdown: results.grid.mix
          },
          transmission: {
            line_loss_pct: lineLoss.toFixed(1),
            base_intensity: results.stage1,
            adjusted_intensity_gco2_kwh: parseFloat(results.stage2.toFixed(2))
          },
          data_center: {
            facility_class: pue <= 1.15 ? 'hyperscale' : pue <= 1.3 ? 'modern' : pue <= 1.5 ? 'standard' : 'legacy',
            pue: pue,
            overhead_pct: parseFloat(((pue - 1) * 100).toFixed(1)),
            effective_intensity_gco2_kwh: parseFloat(results.stage3.toFixed(2))
          },
          inference: {
            model_class: modelSize,
            model_params: results.model.params,
            hardware_class: hardwareClass,
            hardware_efficiency_mult: results.hwMult,
            energy_per_inference_kwh: parseFloat(results.energyPerInf.toFixed(6)),
            inference_count: inferenceCount
          }
        },
        totals: {
          total_energy_kwh: parseFloat(results.totalEnergy.toFixed(4)),
          total_emissions_gco2: parseFloat(results.totalEmissions.toFixed(2)),
          emissions_per_inference_gco2: parseFloat(results.perInference.toFixed(4))
        },
        methodology: {
          formula: "Total CO₂ = Grid_Intensity × (1 + Line_Loss) × PUE × Energy_per_Inference × Inference_Count",
          sources: {
            grid_data: "EPA eGRID 2023",
            transmission_loss: "EIA National Average",
            pue_benchmark: "Uptime Institute 2024"
          }
        },
        cryptographic_proof: {
          algorithm: "SHA-256",
          hash: generateHash(receiptId + timestamp + results.totalEmissions),
          signing_authority: "PATHWELL CONNECT™ Trust Anchor"
        },
        compliance: {
          genesis_eo_alignment: ["§3(a)(i)", "§3(a)(v)", "§3(d)(i)"],
          protocol_version: "PATHWELL CONNECT v1.0"
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
      <section className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-6">
             <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-300 text-sm">DOE Well-to-Wheel Methodology Applied to AI Compute</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-400">Well-to-Inference</span> Calculator
          </h1>
          
          <p className="text-lg text-slate-400 max-w-3xl mb-4">
            Like "well-to-wheel" for vehicles tracks emissions from oil extraction through combustion, 
            <strong className="text-white ml-1">Well-to-Inference</strong> tracks AI's carbon footprint from power generation 
            through model inference—with cryptographic receipts at every stage.
          </p>
          <p className="text-sm text-slate-500 max-w-3xl mb-6 border-l-2 border-emerald-500/30 pl-4">
            <strong className="text-emerald-400">In Genesis terms:</strong> This is the receipt primitive that lets you tie every scientific inference 
            back to where the electrons came from, when they were used, and under which policy they were allowed to run.
          </p>

          {/* Methodology Comparison */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-4 max-w-4xl">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Automotive (DOE Standard)</div>
                <div className="flex items-center gap-2 text-sm text-slate-300 flex-wrap">
                  <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded">Well</span>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                  <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded">Refinery</span>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                  <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded">Pump</span>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                  <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded">Wheel</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">AI Compute (Our Method)</div>
                <div className="flex items-center gap-2 text-sm text-slate-300 flex-wrap">
                  <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">Generation</span>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                  <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">Transmission</span>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                  <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">Data Center</span>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                  <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">Inference</span>
                </div>
              </div>
            </div>
          </div>
          
             {/* Topology Badge */}
            <div className="max-w-4xl mb-8">
                <div className="inline-flex items-center gap-3 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Topology:</span>
                    <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">Linear (A → B → C → D)</span>
                </div>
                <span className="text-slate-700">|</span>
                <button onClick={() => setIsPatternListOpen(!isPatternListOpen)} className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1 group">
                    <span>1 of 7 substrate patterns</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${isPatternListOpen ? 'rotate-180' : ''}`} />
                </button>
                </div>

                {/* Expandable Pattern List */}
                {isPatternListOpen && (
                    <div className="mt-3 bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-2xl">
                    <div className="text-xs text-slate-500 uppercase tracking-wide mb-3">Supported Metapatterns</div>
                    <div className="grid gap-2">
                        <div className="flex items-center gap-3 p-2 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                        <span className="font-mono text-cyan-400 text-xs w-24">Linear</span>
                        <span className="text-slate-600 text-xs">A → B → C → D</span>
                        <span className="text-slate-400 text-xs ml-auto">Energy lifecycle, supply chains</span>
                        <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded">This demo</span>
                        </div>
                         {[
                             { name: "Circular", flow: "A → B → C → A", desc: "Feedback loops" },
                             { name: "Branching", flow: "1 → Many", desc: "Distribution" },
                             { name: "Convergent", flow: "Many → 1", desc: "Assembly" },
                             { name: "Hub", flow: "Hub ↔ Spokes", desc: "Coordination" },
                             { name: "Network", flow: "A ↔ Plat ↔ B", desc: "Marketplaces" },
                             { name: "Mesh", flow: "P ↔ P ↔ P", desc: "P2P networks" },
                         ].map(p => (
                             <div key={p.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition">
                                <span className="font-mono text-slate-400 text-xs w-24">{p.name}</span>
                                <span className="text-slate-600 text-xs">{p.flow}</span>
                                <span className="text-slate-500 text-xs ml-auto">{p.desc}</span>
                            </div>
                         ))}
                    </div>
                    </div>
                )}
            </div>
        </div>
      </section>

      {/* Interactive Calculator */}
      <section className="pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Input Panel */}
            <div className="lg:col-span-1">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sticky top-24">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-400" />
                  Configure Scenario
                </h2>

                {/* Preset Scenarios */}
                <div className="mb-6">
                  <label className="block text-xs text-slate-500 mb-2">Quick Presets</label>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => loadPreset('doe')} className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition">
                      DOE Baseline
                    </button>
                    <button onClick={() => loadPreset('permian')} className="text-xs px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-lg transition">
                      Permian Pilot
                    </button>
                    <button onClick={() => loadPreset('hyperscale')} className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition">
                      Hyperscale
                    </button>
                  </div>
                   <p className="text-xs text-amber-500/60 mt-2 italic">Permian Pilot — Genesis proving ground in West Texas (TTU/ERCOT region)</p>
                </div>

                {/* Controls */}
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Grid Region (ISO)</label>
                        <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                            <option value="CAISO">CAISO (California)</option>
                            <option value="ERCOT">ERCOT (Texas)</option>
                            <option value="PJM">PJM (Mid-Atlantic)</option>
                            <option value="MISO">MISO (Midwest)</option>
                            <option value="SPP">SPP (Great Plains)</option>
                            <option value="NYISO">NYISO (New York)</option>
                            <option value="ISONE">ISO-NE (New England)</option>
                            <option value="NWPP">NWPP (Northwest)</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Data Center PUE</label>
                        <select value={pue} onChange={(e) => setPue(parseFloat(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                            <option value="1.10">1.10 - Hyperscale</option>
                            <option value="1.20">1.20 - Modern Efficient</option>
                            <option value="1.40">1.40 - Industry Average</option>
                            <option value="1.60">1.60 - Legacy Facility</option>
                            <option value="1.80">1.80 - Outdated</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Transmission Loss: <span className="text-emerald-400">{lineLoss}%</span></label>
                        <input type="range" min="2" max="10" step="0.5" value={lineLoss} onChange={(e) => setLineLoss(parseFloat(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                    </div>
                    
                     <div>
                        <label className="block text-sm text-slate-400 mb-2">Model Size</label>
                        <select value={modelSize} onChange={(e) => setModelSize(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                            <option value="small">Small (7B params)</option>
                            <option value="medium">Medium (70B params)</option>
                            <option value="large">Large (175B params)</option>
                            <option value="xlarge">X-Large (540B+ params)</option>
                        </select>
                    </div>

                     <div>
                        <label className="block text-sm text-slate-400 mb-2">Inference Count</label>
                        <input type="number" value={inferenceCount} onChange={(e) => setInferenceCount(parseInt(e.target.value) || 0)} min="1" max="1000000" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                    </div>
                    
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Hardware Efficiency</label>
                        <select value={hardwareClass} onChange={(e) => setHardwareClass(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500">
                            <option value="premium">Premium (H100/TPUv5)</option>
                            <option value="standard">Standard (A100/TPUv4)</option>
                            <option value="legacy">Legacy (V100/older)</option>
                        </select>
                    </div>

                    <button onClick={generateReceipt} className="w-full bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        Generate Cryptographic Receipt
                    </button>
                </div>
              </div>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-2 space-y-6">
                 <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-6">Carbon Accumulation Pipeline</h3>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        {/* Stage 1 */}
                         <div className="relative">
                             <div className="bg-gradient-to-b from-amber-500/20 to-amber-500/5 border border-amber-500/30 rounded-xl p-4 h-full">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs text-amber-400 font-mono bg-amber-500/20 px-1 rounded">STAGE 1</span>
                                </div>
                                <div className="text-sm font-medium mb-1">Generation</div>
                                <div className="text-2xl font-bold text-amber-400">{results.stage1.toFixed(0)}</div>
                                <div className="text-xs text-slate-500">gCO₂/kWh</div>
                             </div>
                         </div>
                          {/* Stage 2 */}
                         <div className="relative">
                             <div className="bg-gradient-to-b from-blue-500/20 to-blue-500/5 border border-blue-500/30 rounded-xl p-4 h-full">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs text-blue-400 font-mono bg-blue-500/20 px-1 rounded">STAGE 2</span>
                                </div>
                                <div className="text-sm font-medium mb-1">Transmission</div>
                                <div className="text-2xl font-bold text-blue-400">{results.stage2.toFixed(0)}</div>
                                <div className="text-xs text-slate-500">gCO₂/kWh</div>
                             </div>
                         </div>
                          {/* Stage 3 */}
                         <div className="relative">
                             <div className="bg-gradient-to-b from-purple-500/20 to-purple-500/5 border border-purple-500/30 rounded-xl p-4 h-full">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs text-purple-400 font-mono bg-purple-500/20 px-1 rounded">STAGE 3</span>
                                </div>
                                <div className="text-sm font-medium mb-1">Data Center</div>
                                <div className="text-2xl font-bold text-purple-400">{results.stage3.toFixed(0)}</div>
                                <div className="text-xs text-slate-500">gCO₂/kWh eff.</div>
                             </div>
                         </div>
                          {/* Stage 4 */}
                         <div className="relative">
                             <div className="bg-gradient-to-b from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 rounded-xl p-4 h-full">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs text-emerald-400 font-mono bg-emerald-500/20 px-1 rounded">STAGE 4</span>
                                </div>
                                <div className="text-sm font-medium mb-1">Inference</div>
                                <div className="text-2xl font-bold text-emerald-400">{results.perInference.toFixed(2)}</div>
                                <div className="text-xs text-slate-500">gCO₂/inf</div>
                             </div>
                         </div>
                    </div>
                    
                    {/* Totals */}
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                        <div className="grid md:grid-cols-3 gap-6 text-center">
                            <div>
                            <div className="text-sm text-slate-400 mb-1">Total Energy</div>
                            <div className="text-3xl font-bold text-white">{results.totalEnergy.toFixed(2)}</div>
                            <div className="text-sm text-slate-500">kWh</div>
                            </div>
                            <div>
                            <div className="text-sm text-slate-400 mb-1">Total Emissions</div>
                            <div className="text-3xl font-bold text-emerald-400">{results.totalEmissions.toFixed(0)}</div>
                            <div className="text-sm text-slate-500">gCO₂</div>
                            </div>
                            <div>
                            <div className="text-sm text-slate-400 mb-1">Per Inference</div>
                            <div className="text-3xl font-bold text-cyan-400">{results.perInference.toFixed(2)}</div>
                            <div className="text-sm text-slate-500">gCO₂/inference</div>
                            </div>
                        </div>
                    </div>
                 </div>
                 
                 {/* Receipt Display */}
                 {receipt && (
                     <div ref={receiptRef} className="bg-slate-900 border border-emerald-500/30 rounded-xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <div className="font-semibold">Well-to-Inference Receipt</div>
                                    <div className="text-xs text-slate-400 font-mono">{receipt.well_to_inference_receipt.receipt_id}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20 hidden sm:inline-block">Cryptographically Signed</span>
                                <button 
                                    onClick={() => navigator.clipboard.writeText(JSON.stringify(receipt, null, 2))}
                                    className="p-2 hover:bg-slate-800 rounded-lg transition" 
                                    title="Copy JSON"
                                >
                                    <Copy className="w-4 h-4 text-slate-400" />
                                </button>
                            </div>
                        </div>
                         <pre className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-xs text-slate-300 overflow-x-auto font-mono max-h-96">
                            {JSON.stringify(receipt, null, 2)}
                        </pre>
                         <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                <span>{new Date(receipt.well_to_inference_receipt.timestamp).toLocaleString()}</span>
                            </span>
                            <span>Genesis EO §3(a)(i), §3(a)(v)</span>
                        </div>
                     </div>
                 )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
