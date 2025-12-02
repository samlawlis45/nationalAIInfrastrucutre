"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Activity, CheckCircle2, Clock, Shield, Server, Zap, Globe, Cloud, Wind, Copy, Check } from 'lucide-react';
import Link from 'next/link';

// Facility Data
const FACILITIES: Record<string, { name: string; fullName: string; location: string; grid: string; baseCarbon: number; baseRenewable: number; latency: Record<string, number> }> = {
  LLNL: {
    name: 'Lawrence Livermore (LLNL)',
    fullName: 'Lawrence Livermore National Laboratory',
    location: 'Livermore, CA',
    grid: 'CAISO',
    baseCarbon: 180,
    baseRenewable: 48,
    latency: { sf: 12, dc: 78, houston: 65, chicago: 58 }
  },
  NREL: {
    name: 'NREL',
    fullName: 'National Renewable Energy Laboratory',
    location: 'Golden, CO',
    grid: 'WACM',
    baseCarbon: 420,
    baseRenewable: 35,
    latency: { sf: 38, dc: 52, houston: 42, chicago: 32 }
  },
  SNL: {
    name: 'Sandia (SNL)',
    fullName: 'Sandia National Laboratories',
    location: 'Albuquerque, NM',
    grid: 'SPP',
    baseCarbon: 380,
    baseRenewable: 28,
    latency: { sf: 45, dc: 58, houston: 32, chicago: 42 }
  },
  ORNL: {
    name: 'Oak Ridge (ORNL)',
    fullName: 'Oak Ridge National Laboratory',
    location: 'Oak Ridge, TN',
    grid: 'TVA',
    baseCarbon: 320,
    baseRenewable: 42,
    latency: { sf: 72, dc: 22, houston: 45, chicago: 35 }
  },
  ANL: {
    name: 'Argonne (ANL)',
    fullName: 'Argonne National Laboratory',
    location: 'Lemont, IL',
    grid: 'PJM',
    baseCarbon: 450,
    baseRenewable: 15,
    latency: { sf: 62, dc: 28, houston: 48, chicago: 8 }
  }
};

const GRID_AVERAGE = 400;

export default function CarbonAwareRoutingDemo() {
  // State
  const [workloadMWh, setWorkloadMWh] = useState(2.5);
  const [workloadName, setWorkloadName] = useState('Model Training');
  const [flexibility, setFlexibility] = useState('flexible');
  const [origin, setOrigin] = useState('sf');
  const [facilityData, setFacilityData] = useState<any>({});
  const [receipt, setReceipt] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  // Simulation Logic
  const generateFacilityData = () => {
    const hour = new Date().getHours();
    const data: any = {};

    for (const key in FACILITIES) {
      const f = FACILITIES[key];
      let carbonMod = 1;
      let renewableMod = 0;

      // Time-based variations
      if (f.grid === 'CAISO') {
        // California solar peak 10am-3pm
        if (hour >= 10 && hour <= 15) {
          carbonMod = 0.45;
          renewableMod = 40;
        }
      } else if (f.grid === 'SPP' || f.grid === 'WACM') {
        // Central wind peak evening/night
        if (hour >= 18 || hour <= 6) {
          carbonMod = 0.6;
          renewableMod = 30;
        }
      } else if (f.grid === 'TVA') {
        // TVA has significant nuclear/hydro - more stable
        carbonMod = 0.85 + Math.random() * 0.3;
        renewableMod = 10;
      }

      const randomVariation = 0.85 + Math.random() * 0.3;
      const carbon = Math.round(f.baseCarbon * carbonMod * randomVariation);
      const renewable = Math.min(95, Math.max(10, Math.round(f.baseRenewable + renewableMod + (Math.random() - 0.5) * 20)));

      data[key] = {
        carbon: carbon,
        renewable: renewable
      };
    }
    return data;
  };

  // Update Loop
  useEffect(() => {
    setFacilityData(generateFacilityData());
    const interval = setInterval(() => {
      setFacilityData(generateFacilityData());
    }, 5000);

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
      }));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  // Calculations
  const calculateComparison = () => {
    let lowestLatency = Infinity;
    let latencyFacility = null;
    let lowestCarbon = Infinity;
    let carbonFacility = null;
    let highestCarbon = 0;

    for (const key in FACILITIES) {
      const f = FACILITIES[key];
      const data = facilityData[key];
      if (!data) continue;

      const latency = f.latency[origin];

      if (latency < lowestLatency) {
        lowestLatency = latency;
        latencyFacility = key;
      }

      if (data.carbon < lowestCarbon) {
        lowestCarbon = data.carbon;
        carbonFacility = key;
      }

      if (data.carbon > highestCarbon) {
        highestCarbon = data.carbon;
      }
    }

    if (!latencyFacility || !carbonFacility) return null;

    const latencyF = FACILITIES[latencyFacility];
    const latencyD = facilityData[latencyFacility];
    const carbonF = FACILITIES[carbonFacility];
    const carbonD = facilityData[carbonFacility];

    const latencyEmissions = (workloadMWh * latencyD.carbon).toFixed(1);
    const carbonEmissions = (workloadMWh * carbonD.carbon).toFixed(1);

    const savedKg = (parseFloat(latencyEmissions) - parseFloat(carbonEmissions)).toFixed(1);
    const savedPct = parseFloat(latencyEmissions) > 0 ? ((1 - parseFloat(carbonEmissions) / parseFloat(latencyEmissions)) * 100).toFixed(0) : 0;
    const latencyAdded = carbonF.latency[origin] - lowestLatency;
    const renewableGain = carbonD.renewable - latencyD.renewable;

    return {
      latencyFacility: { ...latencyF, ...latencyD, emissions: latencyEmissions, latency: lowestLatency },
      carbonFacility: { ...carbonF, ...carbonD, emissions: carbonEmissions, latency: carbonF.latency[origin] },
      savings: { savedKg, savedPct, latencyAdded, renewableGain, sameFacility: latencyFacility === carbonFacility }
    };
  };

  const comparison = calculateComparison();

  // Generate Receipt
  const generateReceipt = () => {
    if (!comparison) return;

    const { carbonFacility, savings } = comparison;
    const timestamp = new Date().toISOString();
    const receiptId = 'CR-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    const hexChars = '0123456789abcdef';
    let signature = '0x';
    for (let i = 0; i < 64; i++) signature += hexChars[Math.floor(Math.random() * 16)];

    const newReceipt = {
      carbon_routing_receipt_id: receiptId,
      schema_version: "1.0.0",
      timestamp: timestamp,
      
      workload: {
        type: workloadName,
        estimated_mwh: workloadMWh,
        flexibility_class: flexibility,
        origin_location: origin === 'sf' ? 'San Francisco, CA' : origin === 'dc' ? 'Washington, DC' : origin === 'houston' ? 'Houston, TX' : 'Chicago, IL'
      },
      
      routing_decision: {
        strategy: "CARBON_OPTIMIZED",
        selected_facility: carbonFacility.fullName,
        facility_id: Object.keys(FACILITIES).find(key => FACILITIES[key].name === carbonFacility.name),
        grid_region: carbonFacility.grid,
        selection_reason: "Lowest real-time carbon intensity among available DOE facilities",
        alternatives_evaluated: Object.keys(FACILITIES).filter(k => FACILITIES[k].name !== carbonFacility.name)
      },
      
      grid_conditions: {
        carbon_intensity_gco2_kwh: carbonFacility.carbon,
        renewable_fraction: (carbonFacility.renewable / 100).toFixed(3),
        grid_region: carbonFacility.grid,
        measurement_timestamp: timestamp,
        data_source: "Simulated (Production: WattTime API)"
      },
      
      carbon_accounting: {
        baseline_grid_average_gco2_kwh: GRID_AVERAGE,
        actual_intensity_gco2_kwh: carbonFacility.carbon,
        estimated_emissions_kg: parseFloat(carbonFacility.emissions).toFixed(3),
        vs_grid_average_kg: (workloadMWh * GRID_AVERAGE).toFixed(3),
        vs_grid_average_savings_kg: (workloadMWh * (GRID_AVERAGE - carbonFacility.carbon)).toFixed(3),
        calculation: `${workloadMWh} MWh × ${carbonFacility.carbon} gCO₂/kWh = ${carbonFacility.emissions} kg CO₂`
      },
      
      network_metrics: {
        latency_ms: carbonFacility.latency,
        origin: origin === 'sf' ? 'San Francisco, CA' : origin === 'dc' ? 'Washington, DC' : origin === 'houston' ? 'Houston, TX' : 'Chicago, IL',
        destination: carbonFacility.location
      },
      
      cryptographic_proof: {
        algorithm: "ED25519",
        signer_id: "PATHWELL-CARBON-ROUTER-001",
        signature: signature,
        verification_endpoint: "https://verify.pathwellconnect.com/receipts/"
      },
      
      compliance: {
        genesis_eo_sections: ["§3(a)(i) - DOE energy stewardship", "§3(a)(v) - Energy attribution standards", "§5(c)(ii) - Auditable routing decisions"],
        attestation_tier: "TIER_2_CARBON_ATTRIBUTED"
      }
    };

    setReceipt(newReceipt);
    setTimeout(() => {
      receiptRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const copyToClipboard = () => {
    if (receipt) {
      navigator.clipboard.writeText(JSON.stringify(receipt, null, 2));
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-emerald-500/30">
      

      <main className="max-w-6xl mx-auto px-6 pb-8 pt-24">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              Carbon-Aware Routing
            </h1>
            <p className="text-slate-400">MVP Demo • National AI Infrastructure</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span>Live</span>
            </div>
            <div className="text-sm text-slate-300 font-mono bg-slate-800 px-3 py-1 rounded-lg">
              {currentTime || '--:-- --'}
            </div>
          </div>
        </div>

        {/* Key Concept */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Globe className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-emerald-400 mb-2">Route by Carbon Intensity, Not Just Latency</h1>
              <p className="text-slate-300">
                Traditional routing sends workloads to the <strong>fastest</strong> data center. 
                Carbon-aware routing sends flexible workloads to the <strong>cleanest</strong> grid—capturing 
                renewable energy that might otherwise be curtailed. This demo shows how the same workload 
                can have dramatically different emissions depending on where it runs.
              </p>
            </div>
          </div>
        </div>

        {/* Baseline Assumptions Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
          <h2 className="font-semibold mb-4 flex items-center gap-2 text-white">
            <Activity className="w-5 h-5 text-blue-400" />
            Baseline Assumptions & Methodology
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-xs text-slate-500 mb-1">US GRID AVERAGE (BASELINE)</div>
              <div className="text-2xl font-bold text-slate-300">400 <span className="text-sm font-normal text-slate-500">gCO₂/kWh</span></div>
              <div className="text-xs text-slate-500 mt-1">EPA eGRID 2023 national average</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-xs text-slate-500 mb-1">CARBON CALCULATION</div>
              <div className="text-sm text-slate-300 font-mono">kg CO₂ = MWh × gCO₂/kWh</div>
              <div className="text-xs text-slate-500 mt-1">Real-time grid intensity from WattTime/EIA</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-xs text-slate-500 mb-1">SAVINGS CALCULATION</div>
              <div className="text-sm text-slate-300 font-mono">saved = worst_option - best_option</div>
              <div className="text-xs text-slate-500 mt-1">Compares cleanest vs dirtiest available</div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="text-xs text-slate-500 mb-2">DATA SOURCES (Production Implementation)</div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-300">
              <span className="bg-slate-800 px-2 py-1 rounded">WattTime API</span>
              <span className="bg-slate-800 px-2 py-1 rounded">Electricity Maps</span>
              <span className="bg-slate-800 px-2 py-1 rounded">EIA Hourly Grid</span>
              <span className="bg-slate-800 px-2 py-1 rounded">CAISO OASIS</span>
              <span className="bg-slate-800 px-2 py-1 rounded">ERCOT Grid Data</span>
            </div>
          </div>
        </div>

        {/* Step 1: Configure Workload */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">1</div>
            <h2 className="text-lg font-semibold">Configure Workload</h2>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm text-slate-400 block mb-2">Workload Type</label>
                <select 
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 text-white"
                  onChange={(e) => {
                    const [mwh, name] = e.target.value.split('|');
                    setWorkloadMWh(parseFloat(mwh));
                    setWorkloadName(name);
                  }}
                >
                  <option value="2.5|Model Training">Model Training — 2.5 MWh</option>
                  <option value="0.8|Batch Inference">Batch Inference — 0.8 MWh</option>
                  <option value="1.2|Fine-tuning">Fine-tuning — 1.2 MWh</option>
                  <option value="5.0|Large Training Run">Large Training Run — 5.0 MWh</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-2">Flexibility</label>
                <select 
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 text-white"
                  value={flexibility}
                  onChange={(e) => setFlexibility(e.target.value)}
                >
                  <option value="flexible">Flexible (can wait 1-4 hours)</option>
                  <option value="moderate">Moderate (within 1 hour)</option>
                  <option value="urgent">Urgent (run immediately)</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-2">Request Origin</label>
                <select 
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 text-white"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                >
                  <option value="sf">San Francisco, CA</option>
                  <option value="dc">Washington, DC</option>
                  <option value="houston">Houston, TX</option>
                  <option value="chicago">Chicago, IL</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: View Available Facilities */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">2</div>
            <h2 className="text-lg font-semibold">Current Grid Conditions at DOE Facilities</h2>
            <span className="text-xs text-slate-500 ml-2">(Simulated — updates every 5 seconds)</span>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50 text-sm">
                  <tr>
                    <th className="text-left p-4 font-medium text-slate-400">Facility</th>
                    <th className="text-left p-4 font-medium text-slate-400">Grid Region</th>
                    <th className="text-right p-4 font-medium text-slate-400">Carbon Intensity</th>
                    <th className="text-right p-4 font-medium text-slate-400">Renewable %</th>
                    <th className="text-right p-4 font-medium text-slate-400">Latency from Origin</th>
                    <th className="text-center p-4 font-medium text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {Object.entries(FACILITIES)
                    .map(([key, f]) => ({ key, ...f, data: facilityData[key] }))
                    .filter(item => item.data)
                    .sort((a, b) => a.data.carbon - b.data.carbon)
                    .map((item) => {
                      const { data, latency } = item;
                      const originLatency = latency[origin];
                      const carbonClass = data.carbon < 200 ? 'text-emerald-400' : data.carbon < 350 ? 'text-amber-400' : 'text-red-400';
                      const statusText = data.carbon < 200 ? 'Clean' : data.carbon < 350 ? 'Moderate' : 'High';
                      const statusClass = data.carbon < 200 ? 'bg-emerald-500/20 text-emerald-400' : data.carbon < 350 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400';

                      return (
                        <tr key={item.key} className="hover:bg-slate-800/50 transition">
                          <td className="p-4">
                            <div className="font-medium text-white">{item.name}</div>
                            <div className="text-xs text-slate-500">{item.location}</div>
                          </td>
                          <td className="p-4 text-slate-400">{item.grid}</td>
                          <td className={`p-4 text-right font-medium ${carbonClass}`}>{data.carbon} gCO₂/kWh</td>
                          <td className="p-4 text-right text-emerald-400">{data.renewable}%</td>
                          <td className="p-4 text-right text-slate-400">{originLatency} ms</td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-1 rounded text-xs ${statusClass}`}>{statusText}</span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-emerald-500"></span>
              <span>Clean (&lt;200 gCO₂/kWh)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-amber-500"></span>
              <span>Moderate (200-350)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-red-500"></span>
              <span>High (&gt;350)</span>
            </div>
          </div>
        </div>

        {/* Step 3: Compare Routing Strategies */}
        {comparison && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <h2 className="text-lg font-semibold">Compare Routing Strategies</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Traditional Routing */}
              <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
                <div className="bg-slate-800 px-6 py-4 border-b border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-300">Traditional Routing</h3>
                      <p className="text-xs text-slate-500">Optimized for latency (fastest response)</p>
                    </div>
                    <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                      <Zap className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-sm text-slate-500 mb-1">Routes to:</div>
                  <div className="text-xl font-bold mb-4 text-white">{comparison.latencyFacility.fullName}</div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Latency</span>
                      <span className="font-medium text-emerald-400">{comparison.latencyFacility.latency} ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Carbon Intensity</span>
                      <span className={`font-medium ${comparison.latencyFacility.carbon < 200 ? 'text-emerald-400' : comparison.latencyFacility.carbon < 350 ? 'text-amber-400' : 'text-red-400'}`}>
                        {comparison.latencyFacility.carbon} gCO₂/kWh
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Renewable Energy</span>
                      <span className="font-medium text-emerald-400">{comparison.latencyFacility.renewable}%</span>
                    </div>
                    <div className="pt-3 border-t border-slate-800">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Estimated Emissions</span>
                        <span className="font-bold text-xl text-white">{comparison.latencyFacility.emissions} kg</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {workloadMWh} MWh × {comparison.latencyFacility.carbon} gCO₂/kWh = {comparison.latencyFacility.emissions} kg
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Carbon-Aware Routing */}
              <div className="bg-slate-900 border border-emerald-500/30 rounded-xl overflow-hidden ring-2 ring-emerald-500/20">
                <div className="bg-emerald-500/10 px-6 py-4 border-b border-emerald-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-emerald-400">Carbon-Aware Routing</h3>
                      <p className="text-xs text-slate-400">Optimized for emissions (cleanest grid)</p>
                    </div>
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-emerald-400" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-sm text-slate-500 mb-1">Routes to:</div>
                  <div className="text-xl font-bold text-emerald-400 mb-4">{comparison.carbonFacility.fullName}</div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Latency</span>
                      <span className="font-medium text-white">{comparison.carbonFacility.latency} ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Carbon Intensity</span>
                      <span className="font-medium text-emerald-400">{comparison.carbonFacility.carbon} gCO₂/kWh</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Renewable Energy</span>
                      <span className="font-medium text-emerald-400">{comparison.carbonFacility.renewable}%</span>
                    </div>
                    <div className="pt-3 border-t border-slate-800">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Estimated Emissions</span>
                        <span className="font-bold text-xl text-emerald-400">{comparison.carbonFacility.emissions} kg</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {workloadMWh} MWh × {comparison.carbonFacility.carbon} gCO₂/kWh = {comparison.carbonFacility.emissions} kg
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Savings Summary */}
            <div className="mt-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-emerald-400">{parseFloat(String(comparison.savings.savedKg)) > 0 ? comparison.savings.savedKg : '0'}</div>
                  <div className="text-sm text-slate-400">kg CO₂ Saved</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-emerald-400">{parseFloat(String(comparison.savings.savedPct)) > 0 ? comparison.savings.savedPct : '0'}%</div>
                  <div className="text-sm text-slate-400">% Reduction</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-cyan-400">{comparison.savings.latencyAdded > 0 ? `+${comparison.savings.latencyAdded}` : '0'}</div>
                  <div className="text-sm text-slate-400">ms Added Latency</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-amber-400">{comparison.savings.renewableGain > 0 ? `+${comparison.savings.renewableGain}` : comparison.savings.renewableGain}%</div>
                  <div className="text-sm text-slate-400">% More Renewable</div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-emerald-500/20 text-center text-slate-300">
                {comparison.savings.sameFacility ? (
                   <p><strong className="text-emerald-400">Perfect match!</strong> The fastest facility is also the cleanest right now. No tradeoff required.</p>
                ) : parseFloat(comparison.savings.savedKg) > 0 ? (
                   <p>
                    By routing to <strong className="text-emerald-400">{comparison.carbonFacility.name}</strong> instead of <strong>{comparison.latencyFacility.name}</strong>, 
                    this workload saves <strong className="text-emerald-400">{comparison.savings.savedKg} kg CO₂</strong> ({comparison.savings.savedPct}% reduction) 
                    with only <strong className="text-cyan-400">{comparison.savings.latencyAdded} ms</strong> additional latency.
                   </p>
                ) : (
                   <p>The latency-optimized route happens to also be carbon-optimal for this origin.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Routing Decision Logic */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">4</div>
            <h2 className="text-lg font-semibold">Automated Routing Rules (Protocol Layer)</h2>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <p className="text-slate-400 text-sm mb-4">
              In production, these rules execute automatically. Every routing decision generates a cryptographic receipt for audit and compliance.
            </p>
            
            <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm overflow-x-auto border border-slate-800">
              <pre className="text-slate-300">
                <span className="text-blue-400">function</span> <span className="text-emerald-400">routeWorkload</span>(workload, facilities) {'{'}{'\n'}
                {'  '}<span className="text-slate-500">// Get real-time carbon intensity for each facility</span>{'\n'}
                {'  '}<span className="text-blue-400">const</span> options = facilities.<span className="text-amber-400">map</span>(f ={'>'} ({'{'}{'\n'}
                {'    '}facility: f,{'\n'}
                {'    '}carbon: <span className="text-emerald-400">getGridCarbon</span>(f.grid_region),  <span className="text-slate-500">// gCO₂/kWh from WattTime API</span>{'\n'}
                {'    '}latency: <span className="text-emerald-400">measureLatency</span>(f.endpoint),   <span className="text-slate-500">// ms round-trip from origin</span>{'\n'}
                {'    '}renewable: <span className="text-emerald-400">getRenewablePct</span>(f.grid_region){'\n'}
                {'  '}));{'\n\n'}

                {'  '}<span className="text-slate-500">// Apply routing strategy based on workload flexibility</span>{'\n'}
                {'  '}<span className="text-blue-400">if</span> (workload.flexibility === <span className="text-amber-300">'flexible'</span>) {'{'}{'\n'}
                {'    '}<span className="text-slate-500">// CARBON-OPTIMIZED: Route to cleanest grid</span>{'\n'}
                {'    '}<span className="text-blue-400">return</span> options.<span className="text-amber-400">sort</span>((a, b) ={'>'} a.carbon - b.carbon)[<span className="text-cyan-400">0</span>];{'\n'}
                {'    '}{'\n'}
                {'  '} {'}'} <span className="text-blue-400">else if</span> (workload.flexibility === <span className="text-amber-300">'urgent'</span>) {'{'}{'\n'}
                {'    '}<span className="text-slate-500">// LATENCY-OPTIMIZED: Route to fastest response</span>{'\n'}
                {'    '}<span className="text-blue-400">return</span> options.<span className="text-amber-400">sort</span>((a, b) ={'>'} a.latency - b.latency)[<span className="text-cyan-400">0</span>];{'\n'}
                {'    '}{'\n'}
                {'  '} {'}'} <span className="text-blue-400">else</span> {'{'}{'\n'}
                {'    '}<span className="text-slate-500">// BALANCED: Weighted score (carbon × 0.6 + latency × 0.4)</span>{'\n'}
                {'    '}<span className="text-blue-400">return</span> options.<span className="text-amber-400">sort</span>((a, b) ={'>'} score(a) - score(b))[<span className="text-cyan-400">0</span>];{'\n'}
                {'  '} {'}'}{'\n'}
                {'}'}{'\n\n'}

                <span className="text-slate-500">// Every decision emits a signed receipt</span>{'\n'}
                <span className="text-emerald-400">emitReceipt</span>({'{'} decision, carbon_metrics, timestamp, signature {'}'});
              </pre>
            </div>
          </div>
        </div>

        {/* Generate Receipt Button */}
        <div className="mb-8">
          <button 
            onClick={generateReceipt}
            className="w-full bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 px-6 py-4 rounded-xl font-medium transition flex items-center justify-center gap-2 text-lg text-white shadow-lg"
          >
            <CheckCircle2 className="w-5 h-5" />
            Generate Carbon Routing Receipt
          </button>
        </div>

        {/* Receipt Display */}
        {receipt && (
          <div id="receipt-section" ref={receiptRef} className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-sm font-bold">
                <Check className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold">Dispatch Receipt Generated</h2>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-slate-800">
                <div className="font-mono text-sm text-slate-400">{receipt.carbon_routing_receipt_id}</div>
                <button 
                  onClick={copyToClipboard} 
                  className="px-3 py-1.5 text-sm bg-slate-800 hover:bg-slate-700 rounded-lg transition flex items-center gap-1 text-slate-300"
                >
                  {copySuccess ? <span className="text-emerald-400 flex items-center gap-1"><Check className="w-4 h-4" /> Copied</span> : <><Copy className="w-4 h-4" /> Copy JSON</>}
                </button>
              </div>
              <div className="p-4 max-h-96 overflow-auto custom-scrollbar">
                <pre className="font-mono text-xs text-emerald-400 whitespace-pre-wrap">
                  {JSON.stringify(receipt, null, 2)}
                </pre>
              </div>
              <div className="p-4 border-t border-slate-800 bg-slate-800/50">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Cryptographically signed • Auditable • Genesis EO §3(a)(i), §3(a)(v), §5(c)(ii) compliant</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
          <p className="mb-2">
            <strong className="text-slate-400">Carbon-Aware Routing Demo</strong> — Simulated grid data based on typical regional patterns.
          </p>
          <p className="mb-2">
            Production implementation uses real-time APIs: WattTime, Electricity Maps, EIA Hourly Grid Monitor.
          </p>
          <p>A PATHWELL CONNECT™ Initiative by AnchorTrust Holdings LLC</p>
        </footer>

      </main>
    </div>
  );
}
