"use client";

import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Shield, Scale, Zap, Globe, Lock, Database, FileText, ChevronRight } from 'lucide-react';
import { Section, Card } from './components/ui/Structure';
import Link from 'next/link';

export default function Home() {
  const [activeTab, setActiveTab] = useState('attribution');

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-bg-primary min-h-screen font-sans selection:bg-accent-blue selection:text-white">
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent-blue/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="inline-flex items-center gap-2 bg-accent-blue/10 border border-accent-blue/20 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-accent-blue rounded-full animate-pulse"></span>
            <span className="text-accent-blue text-sm">November 24, 2025: Executive Order launches Genesis Mission</span>
            <ChevronRight className="w-4 h-4 text-accent-blue" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl text-heading">
            The Genesis Mission Needs a <span className="text-white">Governance Layer</span>
          </h1>
          
          <p className="text-xl text-text-body max-w-2xl mb-8 leading-relaxed">
            The Executive Order builds the compute substrate. We provide the constitutional 
            infrastructure that makes it trustworthy, accountable, and economically fair.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link href="/demo/well-to-inference" className="bg-gradient-to-r from-accent-emerald to-accent-cyan hover:from-emerald-500 hover:to-cyan-400 px-6 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 text-white">
              Try Well-to-Inference Calculator
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button onClick={() => scrollToSection('genesis')} className="bg-bg-card hover:bg-slate-800 border border-border px-6 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 text-text-body">
              See Genesis Alignment
            </button>
          </div>
          
          {/* Key stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-bg-card border border-border rounded-xl p-6">
              <div className="text-3xl font-bold text-accent-blue">1,000+</div>
              <div className="text-text-muted text-sm mt-1">Patent Claims Filed</div>
            </div>
            <div className="bg-bg-card border border-border rounded-xl p-6">
              <div className="text-3xl font-bold text-accent-cyan">31</div>
              <div className="text-text-muted text-sm mt-1">Canonical Tiers</div>
            </div>
            <div className="bg-bg-card border border-border rounded-xl p-6">
              <div className="text-3xl font-bold text-accent-emerald">3</div>
              <div className="text-text-muted text-sm mt-1">Provisional Families</div>
            </div>
            <div className="bg-bg-card border border-border rounded-xl p-6">
              <div className="text-3xl font-bold text-accent-amber">✓</div>
              <div className="text-text-muted text-sm mt-1">Independent Architecture</div>
              <div className="text-slate-500 text-xs mt-0.5">No blocking art identified</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 px-6 bg-bg-secondary border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start gap-4 mb-8">
            <div className="w-12 h-12 bg-accent-amber/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Scale className="w-6 h-6 text-accent-amber" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2 text-heading">The Governance Gap</h2>
              <p className="text-text-muted max-w-2xl">
                The Genesis Mission creates infrastructure for AI-accelerated science. But infrastructure 
                without a governance layer creates liability, not value.
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-bg-card border border-border rounded-xl p-6">
              <div className="text-accent-amber font-mono text-sm mb-3">PROBLEM 01</div>
              <h3 className="text-xl font-semibold mb-2 text-heading">Attribution Collapse</h3>
              <p className="text-text-muted text-sm">
                When scientific foundation models are trained on federal datasets, who contributed what? 
                Current systems launder attribution through model weights. Creators get nothing.
              </p>
            </div>
            <div className="bg-bg-card border border-border rounded-xl p-6">
              <div className="text-accent-amber font-mono text-sm mb-3">PROBLEM 02</div>
              <h3 className="text-xl font-semibold mb-2 text-heading">Governance Vacuum</h3>
              <p className="text-text-muted text-sm">
                The EO requires "security requirements" and "cybersecurity standards" but provides no 
                enforcement mechanism. Policies live in PDFs, not at the execution boundary.
              </p>
            </div>
            <div className="bg-bg-card border border-border rounded-xl p-6">
              <div className="text-accent-amber font-mono text-sm mb-3">PROBLEM 03</div>
              <h3 className="text-xl font-semibold mb-2 text-heading">Economic Injustice</h3>
              <p className="text-text-muted text-sm">
                When models commercialize, who gets paid? The EO mandates "commercialization of IP" 
                without providing the economic rails to make it automatic and fair.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Genesis Alignment Interactive */}
      <section id="genesis" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-heading">Direct Alignment with Executive Order Requirements</h2>
            <p className="text-text-muted max-w-2xl mx-auto">
              Every gap in the Genesis Mission maps to specific capabilities in our IP portfolio. 
              Select each requirement to see how we solve it.
            </p>
          </div>

          {/* Tab navigation */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {[
              { id: 'attribution', label: '§3(a)(v) – IP & Data' },
              { id: 'privacy', label: '§5(c)(ii) – Trade Secrets' },
              { id: 'economics', label: '§5(c)(ii) – Commercialization' },
              { id: 'international', label: '§5(d) – International' },
              { id: 'security', label: '§3(b) – Security' },
              { id: 'hardware', label: '§3(a)(i) – Compute' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === tab.id 
                    ? 'bg-accent-blue text-white' 
                    : 'bg-bg-card text-text-body hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab contents */}
          <div className="bg-bg-card border border-border rounded-2xl p-8 max-w-4xl mx-auto min-h-[300px]">
            {activeTab === 'attribution' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-accent-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Database className="w-6 h-6 text-accent-blue" />
                  </div>
                  <div>
                    <div className="text-accent-blue font-mono text-sm mb-1">Executive Order §3(a)(v)</div>
                    <h3 className="text-xl font-semibold text-heading">"IP protections & data-management standards"</h3>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-status-error/5 border border-status-error/20 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-4 h-4 text-status-error" />
                      <span className="text-status-error font-medium text-sm">Without Governance Layer</span>
                    </div>
                    <p className="text-text-body text-sm">No mechanism to track which datasets contributed to model outputs</p>
                  </div>
                  <div className="bg-status-success/5 border border-status-success/20 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-4 h-4 text-status-success" />
                      <span className="text-status-success font-medium text-sm">With PATHWELL CONNECT™</span>
                    </div>
                    <p className="text-text-body text-sm">AUTH.OBJ cryptographic attribution binds datasets to training lineage</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-accent-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lock className="w-6 h-6 text-accent-blue" />
                  </div>
                  <div>
                    <div className="text-accent-blue font-mono text-sm mb-1">Executive Order §5(c)(ii)</div>
                    <h3 className="text-xl font-semibold text-heading">"Trade-secret protections for external partners"</h3>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-status-error/5 border border-status-error/20 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-4 h-4 text-status-error" />
                      <span className="text-status-error font-medium text-sm">Without Governance Layer</span>
                    </div>
                    <p className="text-text-body text-sm">Partners can't contribute IP without exposing it to competitors</p>
                  </div>
                  <div className="bg-status-success/5 border border-status-success/20 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-4 h-4 text-status-success" />
                      <span className="text-status-success font-medium text-sm">With PATHWELL CONNECT™</span>
                    </div>
                    <p className="text-text-body text-sm">GHOST.ATTR enables privacy-preserving attribution and monetization</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'economics' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-accent-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Scale className="w-6 h-6 text-accent-blue" />
                  </div>
                  <div>
                    <div className="text-accent-blue font-mono text-sm mb-1">Executive Order §5(c)(ii)</div>
                    <h3 className="text-xl font-semibold text-heading">"Commercialization of intellectual property"</h3>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-status-error/5 border border-status-error/20 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-4 h-4 text-status-error" />
                      <span className="text-status-error font-medium text-sm">Without Governance Layer</span>
                    </div>
                    <p className="text-text-body text-sm">No automatic compensation when models generate commercial value</p>
                  </div>
                  <div className="bg-status-success/5 border border-status-success/20 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-4 h-4 text-status-success" />
                      <span className="text-status-success font-medium text-sm">With PATHWELL CONNECT™</span>
                    </div>
                    <p className="text-text-body text-sm">ECON.ROY automatic royalty distribution based on training provenance</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'international' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-accent-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Globe className="w-6 h-6 text-accent-blue" />
                  </div>
                  <div>
                    <div className="text-accent-blue font-mono text-sm mb-1">Executive Order §5(d)</div>
                    <h3 className="text-xl font-semibold text-heading">"International scientific collaboration"</h3>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-status-error/5 border border-status-error/20 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-4 h-4 text-status-error" />
                      <span className="text-status-error font-medium text-sm">Without Governance Layer</span>
                    </div>
                    <p className="text-text-body text-sm">Data can't cross borders; rules don't follow workloads</p>
                  </div>
                  <div className="bg-status-success/5 border border-status-success/20 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-4 h-4 text-status-success" />
                      <span className="text-status-success font-medium text-sm">With PATHWELL CONNECT™</span>
                    </div>
                    <p className="text-text-body text-sm">TREATY.OBJ enables federated training without data export</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-accent-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-accent-blue" />
                  </div>
                  <div>
                    <div className="text-accent-blue font-mono text-sm mb-1">Executive Order §3(b)</div>
                    <h3 className="text-xl font-semibold text-heading">"Security requirements for national security mission"</h3>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-status-error/5 border border-status-error/20 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-4 h-4 text-status-error" />
                      <span className="text-status-error font-medium text-sm">Without Governance Layer</span>
                    </div>
                    <p className="text-text-body text-sm">Application-layer controls can be bypassed; policies live in PDFs</p>
                  </div>
                  <div className="bg-status-success/5 border border-status-success/20 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-4 h-4 text-status-success" />
                      <span className="text-status-success font-medium text-sm">With PATHWELL CONNECT™</span>
                    </div>
                    <p className="text-text-body text-sm">Fail-closed enforcement: no-token-no-run at protocol layer</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'hardware' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-accent-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-accent-blue" />
                  </div>
                  <div>
                    <div className="text-accent-blue font-mono text-sm mb-1">Executive Order §3(a)(i)</div>
                    <h3 className="text-xl font-semibold text-heading">"DOE supercomputers + cloud environments"</h3>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-status-error/5 border border-status-error/20 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-4 h-4 text-status-error" />
                      <span className="text-status-error font-medium text-sm">Without Governance Layer</span>
                    </div>
                    <p className="text-text-body text-sm">Attribution breaks across heterogeneous compute classes</p>
                  </div>
                  <div className="bg-status-success/5 border border-status-success/20 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-4 h-4 text-status-success" />
                      <span className="text-status-success font-medium text-sm">With PATHWELL CONNECT™</span>
                    </div>
                    <p className="text-text-body text-sm">Hardware-agnostic attribution works across GPUs, TPUs, quantum, neuromorphic</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Technology Overview */}
      <section id="technology" className="py-20 px-6 bg-bg-secondary border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-heading">The Governance Layer Architecture</h2>
            <p className="text-text-muted max-w-2xl mx-auto">
              Five mandatory requirements before and during every execution. Not policies—protocol-layer enforcement.
            </p>
          </div>
          
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { title: "Provable Actors", desc: "Every device, org, and agent cryptographically enrolled", icon: Shield },
              { title: "Lossless Lineage", desc: "What went in, what ran, what came out—with signatures", icon: Database },
              { title: "Portable Policy", desc: "Rules travel with the job and enforce wherever it executes", icon: FileText },
              { title: "Explanatory Receipts", desc: "Human-readable who/what/why for every decision", icon: FileText },
              { title: "Economic Gates", desc: "No valid evidence → no payout (or no run at all)", icon: Scale },
            ].map((item, i) => (
              <div key={i} className="bg-bg-card border border-border rounded-xl p-5 text-center">
                <div className="w-10 h-10 bg-accent-blue/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-5 h-5 text-accent-blue" />
                </div>
                <h3 className="font-semibold mb-2 text-heading">{item.title}</h3>
                <p className="text-text-muted text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-12 bg-bg-card border border-border rounded-2xl p-8">
            <h3 className="text-xl font-semibold mb-6 text-center text-heading">The Receipt Test: Four Questions for Genesis Procurement</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                "Can this facility prove, per job, which megawatts it consumed and when?",
                "Can it demonstrate that workloads routed to low-carbon windows when available?",
                "Can it show attribution chains for training data and model creation?",
                "Can it enforce jurisdictional policy at the execution boundary, not just in documentation?"
              ].map((q, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-accent-blue/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-accent-blue text-sm font-medium">{i + 1}</span>
                  </div>
                  <p className="text-text-body text-sm">{q}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-text-muted text-sm">
                If the answer to any is "no," that facility isn't ready to scale. Communities know it. 
                Regulators are learning it. Capital will follow.
              </p>
            </div>
          </div>
          
          {/* Texas testbed callout */}
          <div className="mt-8 bg-gradient-to-r from-accent-blue/10 to-accent-cyan/10 border border-accent-blue/20 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-accent-amber/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-accent-amber" />
              </div>
              <div>
                <h4 className="font-semibold text-heading mb-1">Regional Pilot: Permian Basin</h4>
                <p className="text-text-muted text-sm">
                  Initial pilots focus on <span className="text-accent-blue">West Texas and the Permian Basin</span>, 
                  where grid variability, renewable curtailment, and dense compute are converging. 
                  Exploring partnerships with regional universities and DOE-funded carbon initiatives 
                  to demonstrate energy attribution at scale.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Demos Section */}
      <section id="demos" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-heading">Prototype Demonstrations</h2>
            <p className="text-text-muted max-w-2xl mx-auto mb-2">
              These are the operational plays we are prototyping with partners - implementations of 
              the governance patterns Genesis Mission infrastructure will need.
            </p>
            <p className="text-slate-500 text-sm">
              Demos use simulated workloads with real grid data from CAISO, ERCOT, and public carbon APIs.
            </p>
          </div>

          {/* Featured Demo: Well-to-Inference */}
          <div className="bg-gradient-to-br from-bg-card to-emerald-950/30 border border-accent-emerald/30 rounded-2xl p-8 mb-8">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-accent-emerald/10 border border-accent-emerald/20 rounded-full px-4 py-2 mb-4">
                  <span className="w-2 h-2 bg-accent-emerald rounded-full animate-pulse"></span>
                  <span className="text-accent-emerald text-sm">Featured: DOE Methodology</span>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-heading">Well-to-Inference Calculator</h3>
                <p className="text-text-body mb-4">
                  Like "well-to-wheel" for vehicles, <strong className="text-accent-emerald">Well-to-Inference</strong> tracks 
                  AI's full carbon lifecycle: from power generation through transmission losses, data center overhead, 
                  to the final inference - with cryptographic receipts at every stage.
                </p>
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {[
                    { label: "Generation", val: "Grid Mix", color: "text-accent-amber" },
                    { label: "Transmission", val: "Line Loss", color: "text-accent-blue" },
                    { label: "Data Center", val: "PUE", color: "text-accent-indigo" },
                    { label: "Inference", val: "Compute", color: "text-accent-emerald" }
                  ].map((item, i) => (
                    <div key={i} className="bg-slate-800/50 rounded-lg p-3 text-center">
                      <div className={`${item.color} font-semibold text-sm`}>{item.label}</div>
                      <div className="text-slate-500 text-xs">{item.val}</div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <Link href="/demo/well-to-inference" className="bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 px-6 py-3 rounded-lg font-medium transition flex items-center gap-2 text-white">
                    Launch Calculator
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <span className="text-xs text-text-muted">Genesis EO S3(a)(v), S5(c)(ii)</span>
                </div>
              </div>
              <div className="bg-bg-secondary border border-border rounded-xl p-5">
                <div className="text-xs text-slate-500 mb-3 font-mono">SAMPLE RECEIPT OUTPUT</div>
                <pre className="text-xs text-text-muted overflow-x-auto">
                  {JSON.stringify({
                    well_to_inference_receipt: {
                      receipt_id: "WTI-M2X7K-9FPL3Q",
                      stages: {
                        generation: { region: "CAISO", intensity: 142 },
                        transmission: { loss_pct: 5.2 },
                        data_center: { pue: 1.25 },
                        inference: { count: 1000 }
                      },
                      totals: {
                        emissions_per_inference_gco2: 0.56
                      },
                      cryptographic_proof: { hash: "a3f7..." }
                    }
                  }, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          {/* Deep Dive Demos */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-text-body mb-2">Deep Dive Demos</h4>
            <p className="text-sm text-text-muted">Explore specific stages of the Well-to-Inference pipeline in detail</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Demo 1 */}
            <Link href="/demo/curtailment-capture" className="bg-bg-card border border-accent-amber/30 rounded-xl p-6 hover:border-accent-amber/50 transition group block">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-accent-amber/10 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-accent-amber" />
                  </div>
                  <span className="text-xs text-accent-amber font-mono">STAGE 1</span>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-accent-emerald/10 text-accent-emerald">Live Demo</span>
              </div>
              <h3 className="font-semibold mb-2 text-heading">Curtailment Capture</h3>
              <p className="text-text-muted text-sm mb-3">Route workloads to renewable peaks with cryptographic receipts</p>
              <div className="bg-slate-800/50 rounded-lg p-3 mb-4 grid grid-cols-3 gap-2 text-center">
                <div><div className="text-accent-emerald font-semibold text-sm">847 MWh</div><div className="text-slate-500 text-xs">Captured</div></div>
                <div><div className="text-accent-cyan font-semibold text-sm">312 t</div><div className="text-slate-500 text-xs">CO2e Avoided</div></div>
                <div><div className="text-accent-blue font-semibold text-sm">94%</div><div className="text-slate-500 text-xs">Renewable</div></div>
              </div>
              <div className="text-sm font-medium flex items-center gap-1 text-accent-amber group-hover:text-amber-300 transition">
                Launch Demo <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Demo 2 */}
            <Link href="/demo/carbon-aware-routing" className="bg-bg-card border border-accent-blue/30 rounded-xl p-6 hover:border-accent-blue/50 transition group block">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-accent-blue/10 rounded-lg flex items-center justify-center">
                    <Globe className="w-4 h-4 text-accent-blue" />
                  </div>
                  <span className="text-xs text-accent-blue font-mono">STAGE 2</span>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-accent-blue/10 text-accent-blue">Interactive</span>
              </div>
              <h3 className="font-semibold mb-2 text-heading">Carbon-Aware Routing</h3>
              <p className="text-text-muted text-sm mb-3">Multi-region dispatch by carbon intensity across DOE national labs</p>
              <p className="text-slate-500 text-xs mb-4">Compare latency vs carbon-optimized routing decisions</p>
              <div className="text-sm font-medium flex items-center gap-1 text-accent-blue group-hover:text-blue-300 transition">
                Launch Demo <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Demo 3 */}
            <Link href="/demo/attribution-lineage" className="bg-bg-card border border-accent-emerald/30 rounded-xl p-6 hover:border-accent-emerald/50 transition group block">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-accent-emerald/10 rounded-lg flex items-center justify-center">
                    <Database className="w-4 h-4 text-accent-emerald" />
                  </div>
                  <span className="text-xs text-accent-emerald font-mono">STAGE 4</span>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-accent-emerald/10 text-accent-emerald">Interactive</span>
              </div>
              <h3 className="font-semibold mb-2 text-heading">Attribution Lineage</h3>
              <p className="text-text-muted text-sm mb-3">Visualize training provenance (AUTH.OBJ) and royalty distribution (ECON.ROY)</p>
              <p className="text-slate-500 text-xs mb-4">Enforces S3(a)(v) + S5(c)(ii) IP standards</p>
              <div className="text-sm font-medium flex items-center gap-1 text-accent-emerald group-hover:text-emerald-300 transition">
                Launch Demo <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>

          {/* Future Demos */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-text-body mb-2">Coming Soon</h4>
            <p className="text-sm text-text-muted">Additional governance patterns in development</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Bot Elimination Gate", date: "Q1 2026", desc: "No-token-no-run enforcement at API ingress", sub: "Implements S3(b) security requirements" },
              { title: "Federated Policy", date: "Q1 2026", desc: "Policy travels with workload across DOE labs", sub: "Enables S5(c)(i) partnership frameworks" },
              { title: "Treaty Coordination", date: "Q2 2026", desc: "Multi-nation research without data export", sub: "Supports S5(d) international collaboration" },
            ].map((item, i) => (
              <div key={i} className="bg-bg-card border border-border rounded-xl p-6 hover:border-slate-700 transition group">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-heading">{item.title}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-text-muted">{item.date}</span>
                </div>
                <p className="text-text-muted text-sm mb-3">{item.desc}</p>
                <p className="text-slate-500 text-xs mb-4">{item.sub}</p>
                <div className="text-sm font-medium flex items-center gap-1 text-text-muted group-hover:text-text-body transition cursor-pointer" onClick={() => scrollToSection('contact')}>
                  Request Private Demo <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Alignment */}
      <section className="py-20 px-6 bg-bg-secondary border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-heading">Aligned with Genesis Mission Timeline</h2>
            <p className="text-text-muted max-w-2xl mx-auto">
              Our IP maps directly to the Executive Order's mandated deliverables.
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              { days: "90", date: "Feb 2026", title: "Identify computing resources", desc: "Hardware-Agnostic Attribution ensures governance works across DOE + cloud + partners" },
              { days: "120", date: "Mar 2026", title: "Initial data assets with provenance tracking", desc: "AUTH.OBJ + TRUST.VAULT provide cryptographic provenance chain" },
              { days: "240", date: "Jul 2026", title: "AI-directed experimentation capabilities", desc: "Constitutional enforcement ensures attribution survives autonomous discovery" },
              { days: "270", date: "Aug 2026", title: "Initial operating capability", desc: "Governance layer for national science challenge" },
            ].map((item, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-20 text-center">
                  <div className="text-2xl font-bold text-accent-blue">{item.days}</div>
                  <div className="text-xs text-slate-500">days</div>
                </div>
                <div className="flex-grow bg-bg-card border border-border rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-text-muted text-sm">{item.date}</span>
                    <span className="text-xs bg-accent-blue/10 text-accent-blue px-2 py-0.5 rounded">EO Deadline</span>
                  </div>
                  <h3 className="font-semibold mb-2 text-heading">{item.title}</h3>
                  <p className="text-text-muted text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-heading">
            Build the Governance Layer Before It's Retrofitted
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto mb-8">
            AI is launching without governance substrate. The Genesis Mission is the opportunity to 
            get it right from the start. We have the IP. We have the architecture. Let's talk.
          </p>
          
          <div className="max-w-xl mx-auto bg-bg-card p-8 rounded-xl border border-border mb-12">
              <form action="https://formspree.io/f/mvgezvyp" method="POST" className="space-y-6 text-left">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                          <label htmlFor="first-name" className="block text-sm font-medium text-text-body mb-2">First name</label>
                          <input type="text" name="first-name" id="first-name" required className="block w-full rounded-md bg-slate-950 border border-slate-700 text-white shadow-sm focus:border-accent-blue focus:ring-accent-blue sm:text-sm px-4 py-3" />
                      </div>
                      <div>
                          <label htmlFor="last-name" className="block text-sm font-medium text-text-body mb-2">Last name</label>
                          <input type="text" name="last-name" id="last-name" required className="block w-full rounded-md bg-slate-950 border border-slate-700 text-white shadow-sm focus:border-accent-blue focus:ring-accent-blue sm:text-sm px-4 py-3" />
                      </div>
                  </div>
                  <div>
                      <label htmlFor="email" className="block text-sm font-medium text-text-body mb-2">Email</label>
                      <input type="email" name="email" id="email" required className="block w-full rounded-md bg-slate-950 border border-slate-700 text-white shadow-sm focus:border-accent-blue focus:ring-accent-blue sm:text-sm px-4 py-3" />
                  </div>
                  <div>
                      <label htmlFor="message" className="block text-sm font-medium text-text-body mb-2">Message</label>
                      <textarea name="message" id="message" rows={4} required className="block w-full rounded-md bg-slate-950 border border-slate-700 text-white shadow-sm focus:border-accent-blue focus:ring-accent-blue sm:text-sm px-4 py-3"></textarea>
                  </div>
                  <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue transition-colors">
                      Send Message
                  </button>
              </form>
          </div>

          <div className="flex items-center justify-center gap-8 text-slate-500 text-sm flex-wrap">
            <span>DOE Partnership Inquiries</span>
            <span className="hidden sm:inline">•</span>
            <span>Federal Procurement</span>
            <span className="hidden sm:inline">•</span>
            <span>Infrastructure Investment</span>
          </div>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="py-12 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-lg font-semibold mb-3 text-text-body">Who's behind this?</h3>
          <p className="text-text-muted text-sm max-w-2xl mx-auto">
            National AI Infrastructure is a PATHWELL CONNECT™ initiative from AnchorTrust Holdings, 
            focused on attribution-first AI governance, energy-aware execution, and sovereign control 
            planes for critical infrastructure.
          </p>
        </div>
      </section>
    </div>
  );
}
