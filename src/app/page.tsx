"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, ChevronDown, Database, Globe, Shield, User, Zap, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const formId = process.env.NEXT_PUBLIC_FORMSPREE_ID || 'YOUR_FORM_ID';
      
      // Check if form ID is still placeholder
      if (formId === 'YOUR_FORM_ID') {
        setStatus('error');
        setErrorMessage('Formspree form ID not configured. Please set NEXT_PUBLIC_FORMSPREE_ID in your environment variables.');
        return;
      }

      const response = await fetch(`https://formspree.io/f/${formId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        const data = await response.json();
        setStatus('error');
        // Handle Formspree specific error messages
        if (data.error) {
          setErrorMessage(data.error);
        } else if (response.status === 404) {
          setErrorMessage('Form not found. Please check your Formspree form ID.');
        } else {
          setErrorMessage('Something went wrong. Please try again.');
        }
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Network error. Please check your connection and try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-500/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
            <span className="text-blue-300 text-sm">November 24, 2025: Executive Order launches Genesis Mission</span>
            <ArrowRight className="w-4 h-4 text-blue-400" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl">
            The Genesis Mission Needs a <span className="gradient-text">Governance Layer</span>
          </h1>
          
          <p className="text-xl text-slate-300 max-w-2xl mb-8 leading-relaxed">
            The Executive Order builds the compute substrate. We provide the constitutional 
            infrastructure that makes it trustworthy, accountable, and economically fair.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link href="/demo/well-to-inference" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 px-6 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 text-white">
              Try Well-to-Inference Calculator
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#genesis" className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-6 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 text-white">
              See Genesis Alignment
            </a>
          </div>

          {/* Key stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <div className="text-3xl font-bold text-blue-400">1,000+</div>
              <div className="text-slate-400 text-sm mt-1">Patent Claims Filed</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <div className="text-3xl font-bold text-cyan-400">31</div>
              <div className="text-slate-400 text-sm mt-1">Canonical Tiers</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <div className="text-3xl font-bold text-emerald-400">3</div>
              <div className="text-slate-400 text-sm mt-1">Provisional Families</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <div className="text-3xl font-bold text-amber-400 flex items-center"><Check className="w-8 h-8" /></div>
              <div className="text-slate-400 text-sm mt-1">Independent Architecture</div>
              <div className="text-slate-500 text-xs mt-0.5">No blocking art identified</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 px-6 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">The Governance Gap</h2>
              <p className="text-slate-400 max-w-2xl">
                The Genesis Mission creates infrastructure for AI-accelerated science. But infrastructure 
                without a governance layer creates liability, not value.
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="text-amber-400 font-mono text-sm mb-3">PROBLEM 01</div>
              <h3 className="text-xl font-semibold mb-2">Attribution Collapse</h3>
              <p className="text-slate-400 text-sm">
                When scientific foundation models are trained on federal datasets, who contributed what? 
                Current systems launder attribution through model weights. Creators get nothing.
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="text-amber-400 font-mono text-sm mb-3">PROBLEM 02</div>
              <h3 className="text-xl font-semibold mb-2">Governance Vacuum</h3>
              <p className="text-slate-400 text-sm">
                The EO requires "security requirements" and "cybersecurity standards" but provides no 
                enforcement mechanism. Policies live in PDFs, not at the execution boundary.
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="text-amber-400 font-mono text-sm mb-3">PROBLEM 03</div>
              <h3 className="text-xl font-semibold mb-2">Economic Injustice</h3>
              <p className="text-slate-400 text-sm">
                When models commercialize, who gets paid? The EO mandates "commercialization of IP" 
                without providing the economic rails to make it automatic and fair.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Genesis Alignment */}
      <section id="genesis" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Direct Alignment with Executive Order Requirements</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Every gap in the Genesis Mission maps to specific capabilities in our IP portfolio.
            </p>
          </div>

          {/* Governance Architecture */}
          <div id="technology" className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-12">
            <h3 className="text-xl font-semibold mb-6 text-center">The Governance Layer Architecture</h3>
            <p className="text-slate-400 text-center mb-8 max-w-2xl mx-auto">Five mandatory requirements before and during every execution. Not policies—protocol-layer enforcement.</p>
            
            <div className="grid md:grid-cols-5 gap-4">
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <div className="font-medium text-sm">Provable Actors</div>
                <div className="text-xs text-slate-500 mt-1">Every device, org, and agent cryptographically enrolled</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Database className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="font-medium text-sm">Lossless Lineage</div>
                <div className="text-xs text-slate-500 mt-1">What went in, what ran, what came out—with signatures</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Globe className="w-5 h-5 text-purple-400" />
                </div>
                <div className="font-medium text-sm">Portable Policy</div>
                <div className="text-xs text-slate-500 mt-1">Rules travel with the job and enforce wherever it executes</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="font-medium text-sm">Explanatory Receipts</div>
                <div className="text-xs text-slate-500 mt-1">Human-readable who/what/why for every decision</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-5 h-5 text-amber-400" />
                </div>
                <div className="font-medium text-sm">Economic Gates</div>
                <div className="text-xs text-slate-500 mt-1">No valid evidence → no payout (or no run at all)</div>
              </div>
            </div>
          </div>

          {/* Receipt Test */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-8">
            <h3 className="text-xl font-semibold mb-4">The Receipt Test: Four Questions for Genesis Procurement</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400 text-sm font-medium">1</span>
                </div>
                <p className="text-slate-300 text-sm">Can this facility prove, per job, which megawatts it consumed and when?</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400 text-sm font-medium">2</span>
                </div>
                <p className="text-slate-300 text-sm">Can it demonstrate that workloads routed to low-carbon windows when available?</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400 text-sm font-medium">3</span>
                </div>
                <p className="text-slate-300 text-sm">Can it show attribution chains for training data and model creation?</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400 text-sm font-medium">4</span>
                </div>
                <p className="text-slate-300 text-sm">Can it enforce jurisdictional policy at the execution boundary, not just in documentation?</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-800 text-center">
              <p className="text-slate-400 text-sm">
                If the answer to any is "no," that facility isn't ready to scale. Communities know it. 
                Regulators are learning it. Capital will follow.
              </p>
            </div>
          </div>

          {/* Permian Basin callout */}
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-200 mb-1">Regional Pilot: Permian Basin</h4>
                <p className="text-slate-400 text-sm">
                  Initial pilots focus on <span className="text-blue-400">West Texas and the Permian Basin</span>, 
                  where grid variability, renewable curtailment, and dense compute are converging. 
                  Exploring partnerships with regional universities and DOE-funded carbon initiatives 
                  to demonstrate energy attribution at scale.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demos Section */}
      <section id="demos" className="py-20 px-6 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Prototype Demonstrations</h2>
            <p className="text-slate-400 max-w-2xl mx-auto mb-2">
              These are the operational plays we are prototyping with partners—implementations of 
              the governance patterns Genesis Mission infrastructure will need.
            </p>
            <p className="text-slate-500 text-sm">
              Demos use simulated workloads with real grid data from CAISO, ERCOT, and public carbon APIs.
            </p>
          </div>

          {/* Featured: Well-to-Inference */}
          <div id="demo-wti" className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-2 border-blue-500/30 rounded-2xl p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 text-xs px-3 py-1 rounded-full mb-4">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                  Featured Demo
                </div>
                <h3 className="text-2xl font-bold mb-3">Well-to-Inference Calculator</h3>
                <p className="text-slate-300 mb-4">
                  Like "well-to-wheel" for vehicles, Well-to-Inference tracks AI's full carbon lifecycle: 
                  from power generation through transmission losses, data center overhead, to the final 
                  inference—with cryptographic receipts at every stage.
                </p>
                <div className="flex items-center gap-4 mb-6">
                  <Link href="/demo/well-to-inference" className="bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-lg font-medium transition flex items-center gap-2 text-white">
                    Launch Calculator
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <span className="text-xs text-slate-500">Genesis EO §3(a)(v), §5(c)(ii)</span>
                </div>
              </div>
              <div className="bg-slate-900/80 rounded-xl p-4 font-mono text-xs text-slate-400 overflow-x-auto">
                <pre>{`{
  "well_to_inference_receipt": {
    "receipt_id": "WTI-M2X7K-9FPL3Q",
    "stages": {
      "generation": { "region": "CAISO", "intensity": 142 },
      "transmission": { "loss_pct": 5.2 },
      "data_center": { "pue": 1.25 },
      "inference": { "count": 1000 }
    },
    "totals": {
      "emissions_per_inference_gco2": 0.56
    },
    "cryptographic_proof": { "hash": "a3f7..." }
  }
}`}</pre>
              </div>
            </div>
          </div>

          {/* Deep Dive Demos */}
          <h3 className="text-xl font-semibold mb-6">Deep Dive Demos</h3>
          <p className="text-slate-400 text-sm mb-6">Explore specific stages of the governance pipeline in detail</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
            {/* Curtailment Capture */}
            <Link href="/demo/curtailment-capture" id="demo-curtailment" className="demo-card block bg-slate-900 border border-emerald-500/30 rounded-xl p-6 transition hover:border-emerald-500/50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 font-medium">STAGE 1</span>
                <span className="text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-400">Live Demo</span>
              </div>
              <h4 className="font-semibold mb-2">Curtailment Capture</h4>
              <p className="text-slate-400 text-sm mb-3">Route workloads to renewable peaks with cryptographic receipts</p>
              <div className="grid grid-cols-3 gap-2 text-center mb-4 bg-slate-800/50 rounded-lg p-2">
                <div>
                  <div className="text-emerald-400 font-semibold text-sm">847 MWh</div>
                  <div className="text-slate-500 text-xs">Captured</div>
                </div>
                <div>
                  <div className="text-cyan-400 font-semibold text-sm">312 t</div>
                  <div className="text-slate-500 text-xs">CO₂e Avoided</div>
                </div>
                <div>
                  <div className="text-blue-400 font-semibold text-sm">94%</div>
                  <div className="text-slate-500 text-xs">Renewable</div>
                </div>
              </div>
              <div className="text-sm font-medium flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition">
                Launch Demo
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Carbon-Aware Routing */}
            <Link href="/demo/carbon-aware-routing" id="demo-carbon" className="demo-card block bg-slate-900 border border-blue-500/30 rounded-xl p-6 transition hover:border-blue-500/50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400 font-medium">STAGE 2</span>
                <span className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-400">Interactive</span>
              </div>
              <h4 className="font-semibold mb-2">Carbon-Aware Routing</h4>
              <p className="text-slate-400 text-sm mb-3">Multi-region dispatch by carbon intensity across DOE national labs</p>
              <p className="text-slate-500 text-xs mb-4">Compare latency vs carbon-optimized routing decisions</p>
              <div className="text-sm font-medium flex items-center gap-1 text-blue-400 hover:text-blue-300 transition">
                Launch Demo
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* GeoGate - NEW */}
            <Link href="/demo/geogate" id="demo-geogate" className="demo-card block bg-slate-900 border border-purple-500/30 rounded-xl p-6 transition hover:border-purple-500/50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-400 font-medium">STAGE 3a</span>
                <span className="text-xs px-2 py-1 rounded bg-purple-500/10 text-purple-400">Live</span>
              </div>
              <h4 className="font-semibold mb-2">GeoGate</h4>
              <p className="text-slate-400 text-sm mb-3">Constitutional front door for geolocation AI capabilities</p>
              <div className="text-xs text-slate-500 mb-4">
                <span className="text-red-400">Stalker → DENIED</span> • <span className="text-green-400">Missing Person → ALLOWED</span>
              </div>
              <div className="text-sm font-medium flex items-center gap-1 text-purple-400 hover:text-purple-300 transition">
                Launch Demo
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Authenticity Gate - NEW */}
            <Link href="/demo/authenticity-gate" id="demo-authenticity" className="demo-card block bg-slate-900 border border-amber-500/30 rounded-xl p-6 transition hover:border-amber-500/50 ring-2 ring-amber-500/20">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs px-2 py-1 rounded bg-amber-500/20 text-amber-400 font-medium">STAGE 3b</span>
                <span className="text-xs px-2 py-1 rounded bg-amber-500/10 text-amber-400">NEW</span>
              </div>
              <h4 className="font-semibold mb-2">Authenticity Gate</h4>
              <p className="text-slate-400 text-sm mb-3">Deepfake governance for critical channels</p>
              <div className="text-xs text-slate-500 mb-4">
                <span className="text-green-400">Governor + Token → ALLOW</span> • <span className="text-red-400">Spoof → DENY</span>
              </div>
              <div className="text-sm font-medium flex items-center gap-1 text-amber-400 hover:text-amber-300 transition">
                Launch Demo
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Attribution Lineage */}
            <Link href="/demo/attribution-lineage" id="demo-attribution" className="demo-card block bg-slate-900 border border-amber-500/30 rounded-xl p-6 transition hover:border-amber-500/50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs px-2 py-1 rounded bg-amber-500/20 text-amber-400 font-medium">STAGE 4</span>
                <span className="text-xs px-2 py-1 rounded bg-amber-500/10 text-amber-400">Interactive</span>
              </div>
              <h4 className="font-semibold mb-2">Attribution Lineage</h4>
              <p className="text-slate-400 text-sm mb-3">Visualize training provenance and royalty distribution across the inference chain</p>
              <p className="text-slate-500 text-xs mb-4">Enforces §3(a)(v) + §5(c)(ii) IP standards</p>
              <div className="text-sm font-medium flex items-center gap-1 text-amber-400 hover:text-amber-300 transition">
                Launch Demo
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Grid2Supply */}
            <Link href="/demo/grid2supply" id="demo-grid2supply" className="demo-card block bg-slate-900 border border-cyan-500/30 rounded-xl p-6 transition hover:border-cyan-500/50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs px-2 py-1 rounded bg-cyan-500/20 text-cyan-400 font-medium">SUPPLY CHAIN</span>
                <span className="text-xs px-2 py-1 rounded bg-cyan-500/10 text-cyan-400">Interactive</span>
              </div>
              <h4 className="font-semibold mb-2">Grid2Supply</h4>
              <p className="text-slate-400 text-sm mb-3">Three truths orchestration: Plan vs Digital vs Physical with ghost expedite detection</p>
              <div className="text-xs text-slate-500 mb-4">
                <span className="text-cyan-400">S&OP Commits</span> • <span className="text-emerald-400">Digital Bookings</span> • <span className="text-amber-400">Physical Scans</span>
              </div>
              <div className="text-sm font-medium flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition">
                Launch Demo
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* BIOLOOP-RNG */}
            <Link href="/demo/bioloop-rng" id="demo-bioloop-rng" className="demo-card block bg-slate-900 border border-emerald-500/30 rounded-xl p-6 transition hover:border-emerald-500/50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 font-medium">CIRCULAR LOOP</span>
                <span className="text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-400">Interactive</span>
              </div>
              <h4 className="font-semibold mb-2">BIOLOOP-RNG</h4>
              <p className="text-slate-400 text-sm mb-3">Circular attribution for agricultural carbon markets</p>
              <div className="text-xs text-slate-500 mb-4">
                <span className="text-emerald-400">Corn → DDGS → Cattle → RNG → Fuel</span>
              </div>
              <div className="text-sm font-medium flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition">
                Launch Demo
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Grid to Care */}
            <Link href="/demo/grid-to-care" id="demo-grid-to-care" className="demo-card block bg-slate-900 border border-red-500/30 rounded-xl p-6 transition hover:border-red-500/50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 font-medium">HEALTH MICROGRID</span>
                <span className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-400">Interactive</span>
              </div>
              <h4 className="font-semibold mb-2">Grid to Care</h4>
              <p className="text-slate-400 text-sm mb-3">Rural health microgrids with attribution and resilience</p>
              <div className="text-xs text-slate-500 mb-4">
                <span className="text-red-400">Outage → Backup</span> • <span className="text-cyan-400">Curtailment → Capture</span>
              </div>
              <div className="text-sm font-medium flex items-center gap-1 text-red-400 hover:text-red-300 transition">
                Launch Demo
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* AQUATREATY */}
            <Link href="/demo/aquatreaty" id="demo-aquatreaty" className="demo-card block bg-slate-900 border border-cyan-500/30 rounded-xl p-6 transition hover:border-cyan-500/50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs px-2 py-1 rounded bg-cyan-500/20 text-cyan-400 font-medium">WATER TREATY</span>
                <span className="text-xs px-2 py-1 rounded bg-cyan-500/10 text-cyan-400">Interactive</span>
              </div>
              <h4 className="font-semibold mb-2">AQUATREATY</h4>
              <p className="text-slate-400 text-sm mb-3">Constitutional control plane for shared water systems</p>
              <div className="text-xs text-slate-500 mb-4">
                <span className="text-cyan-400">Drought → Treaty</span> • <span className="text-red-400">Override → Compensation</span>
              </div>
              <div className="text-sm font-medium flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition">
                Launch Demo
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* AthleteGate */}
            <Link href="/demo/athletegate" id="demo-athletegate" className="demo-card block bg-slate-900 border border-blue-500/30 rounded-xl p-6 transition hover:border-blue-500/50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400 font-medium">NIL GOVERNANCE</span>
                <span className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-400">Interactive</span>
              </div>
              <h4 className="font-semibold mb-2">AthleteGate</h4>
              <p className="text-slate-400 text-sm mb-3">Constitutional NIL ledger for college athletics with three-layer governance</p>
              <div className="text-xs text-slate-500 mb-4">
                <span className="text-blue-400">Athlete View</span> • <span className="text-purple-400">Program View</span> • <span className="text-emerald-400">National View</span>
              </div>
              <div className="text-sm font-medium flex items-center gap-1 text-blue-400 hover:text-blue-300 transition">
                Launch Demo
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>

          {/* Coming Soon */}
          <h3 className="text-xl font-semibold mb-6">Coming Soon</h3>
          <p className="text-slate-400 text-sm mb-6">Additional governance patterns in development</p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 opacity-75">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Bot Elimination Gate</h4>
                <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-400">Q1 2026</span>
              </div>
              <p className="text-slate-400 text-sm mb-2">No-token-no-run enforcement at API ingress</p>
              <p className="text-slate-500 text-xs">Implements §3(b) security requirements</p>
            </div>
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 opacity-75">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Federated Policy</h4>
                <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-400">Q1 2026</span>
              </div>
              <p className="text-slate-400 text-sm mb-2">Policy travels with workload across DOE labs</p>
              <p className="text-slate-500 text-xs">Enables §5(c)(i) partnership frameworks</p>
            </div>
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 opacity-75">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Treaty Coordination</h4>
                <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-400">Q2 2026</span>
              </div>
              <p className="text-slate-400 text-sm mb-2">Multi-nation research without data export</p>
              <p className="text-slate-500 text-xs">Supports §5(d) international collaboration</p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Aligned with Genesis Mission Timeline</h2>
            <p className="text-slate-400">Our IP maps directly to the Executive Order's mandated deliverables.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="text-blue-400 font-mono text-sm mb-2">180 DAYS</div>
              <h4 className="font-semibold mb-2">Identify computing resources</h4>
              <p className="text-slate-400 text-sm">Hardware-Agnostic Attribution ensures governance works across DOE + cloud + partners</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="text-cyan-400 font-mono text-sm mb-2">1 YEAR</div>
              <h4 className="font-semibold mb-2">Initial data assets with provenance tracking</h4>
              <p className="text-slate-400 text-sm">Signed data assets and lineage receipts provide cryptographic provenance chain</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="text-emerald-400 font-mono text-sm mb-2">2 YEARS</div>
              <h4 className="font-semibold mb-2">AI-directed experimentation capabilities</h4>
              <p className="text-slate-400 text-sm">Constitutional enforcement ensures attribution survives autonomous discovery</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="text-amber-400 font-mono text-sm mb-2">3 YEARS</div>
              <h4 className="font-semibold mb-2">Initial operating capability</h4>
              <p className="text-slate-400 text-sm">Governance layer for national science challenge</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-20 px-6 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Build the Governance Layer Before It's Retrofitted</h2>
            <p className="text-slate-300 text-lg mb-8">
              AI is launching without governance substrate. The Genesis Mission is the opportunity to get it right 
              from the start. We have the IP. We have the architecture. Let's talk.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 space-y-6">
            {status === 'success' && (
              <div className="bg-emerald-900/20 border border-emerald-500/50 rounded-lg p-4 flex items-center gap-3 text-emerald-400">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>Message sent successfully! We'll get back to you soon.</span>
              </div>
            )}

            {status === 'error' && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3 text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{errorMessage || 'Failed to send message. Please try again.'}</span>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Your name"
                disabled={status === 'submitting'}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="your.email@example.com"
                disabled={status === 'submitting'}
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                placeholder="Message"
                disabled={status === 'submitting'}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'submitting' || status === 'success'}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed px-8 py-4 rounded-lg font-medium text-lg transition text-white"
            >
              {status === 'submitting' ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : status === 'success' ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Message Sent
                </>
              ) : (
                <>
                  Send Message
                  <Send className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* Note: Footer is handled by layout.tsx */}
    </div>
  );
}
