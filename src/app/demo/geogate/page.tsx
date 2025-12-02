"use client";

import React, { useState, useCallback } from 'react';
import { Shield, Globe, Search, Lock, AlertTriangle, CheckCircle2, XCircle, Map, FileText, Eye, Scale, ChevronLeft, Smartphone, Building2, Flag, Home, Target } from 'lucide-react';
import Link from 'next/link';

// Role definitions
const roles: Record<string, any> = {
  RandomUser: { 
    label: 'Random User', 
    icon: <Smartphone className="w-5 h-5" />, 
    color: 'text-slate-400',
    borderColor: 'border-slate-600',
    bgColor: 'bg-slate-800/50',
    authLevel: 'UNVERIFIED',
    capabilityMax: 'NONE',
    description: 'Anonymous internet user'
  },
  Journalist: { 
    label: 'Journalist', 
    icon: <FileText className="w-5 h-5" />, 
    color: 'text-yellow-400',
    borderColor: 'border-yellow-500',
    bgColor: 'bg-yellow-900/20',
    authLevel: 'VERIFIED',
    capabilityMax: 'REGION_ONLY',
    description: 'Verified press credentials'
  },
  LawEnforcement: { 
    label: 'Law Enforcement', 
    icon: <Shield className="w-5 h-5" />, 
    color: 'text-blue-400',
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-900/20',
    authLevel: 'HARDWARE_ATTESTED',
    capabilityMax: 'PRECISE_GEOLOCATE',
    description: 'Verified agency account'
  },
  TrustSafety: { 
    label: 'Platform Trust & Safety', 
    icon: <Lock className="w-5 h-5" />, 
    color: 'text-purple-400',
    borderColor: 'border-purple-500',
    bgColor: 'bg-purple-900/20',
    authLevel: 'VERIFIED',
    capabilityMax: 'NEIGHBORHOOD_GEOLOCATE',
    description: 'Platform abuse investigation'
  }
};

// Use case definitions
const useCases: Record<string, any> = {
  stalker: {
    label: 'Find where this influencer lives',
    icon: <Search className="w-4 h-4" />,
    caseType: 'PERSONAL_CURIOSITY',
    severity: 'NONE',
    warrantFlag: false,
    riskLevel: 'HIGH'
  },
  exPartner: {
    label: 'Locate my ex-partner',
    icon: <Eye className="w-4 h-4" />,
    caseType: 'DOMESTIC_SURVEILLANCE',
    severity: 'NONE',
    warrantFlag: false,
    riskLevel: 'CRITICAL'
  },
  missingPerson: {
    label: 'Missing person - active Amber Alert',
    icon: <AlertTriangle className="w-4 h-4" />,
    caseType: 'MISSING_PERSON',
    severity: 'CRITICAL',
    warrantFlag: true,
    riskLevel: 'HIGH'
  },
  harassment: {
    label: 'Platform harassment investigation',
    icon: <Flag className="w-4 h-4" />,
    caseType: 'HARASSMENT_INVESTIGATION',
    severity: 'HIGH',
    warrantFlag: false,
    riskLevel: 'MEDIUM'
  }
};

// Image classifications (simulated upstream AI)
const imageClassifications = [
  { id: 'HUMAN_PRESENT', label: 'Human Detected', color: 'text-orange-400', bg: 'bg-orange-900/20' },
  { id: 'PRIVATE_RESIDENCE', label: 'Private Residence', color: 'text-red-400', bg: 'bg-red-900/20' },
  { id: 'REFLECTIVE_SURFACE', label: 'Reflective Surface', color: 'text-yellow-400', bg: 'bg-yellow-900/20' }
];

export default function GeoGateDemo() {
  const [selectedRole, setSelectedRole] = useState('RandomUser');
  const [selectedUseCase, setSelectedUseCase] = useState('stalker');
  const [warrantOverride, setWarrantOverride] = useState(false);
  const [dataSubjectJurisdiction, setDataSubjectJurisdiction] = useState('US');
  const [scenario, setScenario] = useState<'idle' | 'running' | 'complete'>('idle');
  const [decision, setDecision] = useState<any | null>(null);
  const [receipt, setReceipt] = useState<any | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [geoResult, setGeoResult] = useState<any | null>(null);

  // Capability hierarchy for clamping
  const capabilityHierarchy = ['NONE', 'REGION_ONLY', 'NEIGHBORHOOD_GEOLOCATE', 'PRECISE_GEOLOCATE'];
  
  const clampCapability = (requested: string, max: string) => {
    const requestedIdx = capabilityHierarchy.indexOf(requested);
    const maxIdx = capabilityHierarchy.indexOf(max);
    if (maxIdx === -1 || requestedIdx === -1) return 'NONE';
    return capabilityHierarchy[Math.min(requestedIdx, maxIdx)];
  };

  // Policy evaluation engine
  const evaluatePolicy = useCallback((role: string, useCase: string, hasWarrant: boolean, jurisdiction: string) => {
    const roleConfig = roles[role];
    const caseConfig = useCases[useCase];
    
    // Rule 0: EU data subjects - cap at REGION_ONLY regardless of role
    const isEU = jurisdiction === 'EU';
    
    // Rule 1: Deny private residence + human for untrusted roles
    if ((role === 'RandomUser' || role === 'Journalist') && 
        imageClassifications.some(c => c.id === 'PRIVATE_RESIDENCE') &&
        imageClassifications.some(c => c.id === 'HUMAN_PRESENT')) {
      return {
        decision: 'DENY',
        reason: 'ROLE_NOT_AUTHORIZED_FOR_PRIVATE_RESIDENCE',
        capability: 'NONE',
        ruleApplied: 'RULE_DENY_PRIVATE_RESIDENCE_FOR_UNTRUSTED',
        euDowngraded: false
      };
    }

    // Rule 2: Law enforcement with warrant for missing person
    if (role === 'LawEnforcement' && 
        caseConfig.caseType === 'MISSING_PERSON' && 
        hasWarrant) {
      let capability = 'NEIGHBORHOOD_GEOLOCATE';
      // Clamp against role max
      capability = clampCapability(capability, roleConfig.capabilityMax);
      // EU downgrade
      const euDowngraded = isEU && capability !== 'REGION_ONLY' && capability !== 'NONE';
      if (isEU) capability = clampCapability(capability, 'REGION_ONLY');
      
      return {
        decision: 'ALLOW',
        reason: isEU ? 'MISSING_PERSON_CASE_EU_CAPPED' : 'MISSING_PERSON_CASE_WITH_WARRANT',
        capability: capability,
        ruleApplied: isEU ? 'RULE_EU_SUBJECT_REGION_CAP' : 'RULE_ALLOW_LE_WITH_WARRANT_FOR_MISSING_PERSON',
        euDowngraded: euDowngraded
      };
    }

    // Rule 3: Trust & Safety for harassment with severity
    if (role === 'TrustSafety' && 
        caseConfig.caseType === 'HARASSMENT_INVESTIGATION' &&
        caseConfig.severity === 'HIGH') {
      let capability = 'REGION_ONLY';
      // Clamp against role max
      capability = clampCapability(capability, roleConfig.capabilityMax);
      
      return {
        decision: 'ALLOW',
        reason: 'PLATFORM_SAFETY_INVESTIGATION',
        capability: capability,
        ruleApplied: 'RULE_ALLOW_TRUST_SAFETY_REGION',
        euDowngraded: false
      };
    }

    // Rule 4: LE without warrant - deny
    if (role === 'LawEnforcement' && !hasWarrant) {
      return {
        decision: 'DENY',
        reason: 'WARRANT_REQUIRED_FOR_PRIVATE_RESIDENCE',
        capability: 'NONE',
        ruleApplied: 'RULE_DENY_LE_WITHOUT_WARRANT',
        euDowngraded: false
      };
    }

    // Default deny
    return {
      decision: 'DENY',
      reason: 'NO_MATCHING_POLICY_RULE',
      capability: 'NONE',
      ruleApplied: 'RULE_DEFAULT_DENY',
      euDowngraded: false
    };
  }, []);

  // Generate receipt
  const generateReceipt = useCallback((role: string, useCase: string, hasWarrant: boolean, jurisdiction: string, policyResult: any) => {
    const roleConfig = roles[role];
    const caseConfig = useCases[useCase];
    const receiptId = `geo-${Date.now().toString(36).toUpperCase()}`;
    
    // Branch sovereign_policy_id by role + useCase
    const getSovereignPolicy = () => {
      if (policyResult.decision === 'DENY') return 'SOV.GEO.DEFAULT.2025';
      if (role === 'LawEnforcement' && useCase === 'missingPerson') return 'SOV.GEO.LE_MISSING_PERSON.2025';
      if (role === 'TrustSafety') return 'SOV.GEO.TRUSTSAFETY.2025';
      return 'SOV.GEO.DEFAULT.2025';
    };
    
    // Branch billing_code by role + useCase
    const getBillingCode = () => {
      if (policyResult.decision === 'DENY') return 'GEO.DENIED.UNAUTHORIZED';
      if (role === 'LawEnforcement' && useCase === 'missingPerson') return 'GEO.LEGIT_USE.MISSING_PERSON';
      if (role === 'TrustSafety' && useCase === 'harassment') return 'GEO.LEGIT_USE.HARASSMENT_INVESTIGATION';
      return 'GEO.LEGIT_USE.GENERAL';
    };
    
    return {
      schema_version: "PATHWELL_GEO_RECEIPT_V1",
      receipt_id: receiptId,
      timestamp: new Date().toISOString(),
      decision: policyResult.decision,
      decision_reason: policyResult.reason,
      precision: policyResult.decision === 'ALLOW' ? 
        (policyResult.capability === 'NEIGHBORHOOD_GEOLOCATE' ? 'NEIGHBORHOOD' : 'REGION') : 'NONE',
      caller: {
        actor_id: role === 'RandomUser' ? `ANON-USER-${Math.random().toString(36).slice(2, 7).toUpperCase()}` :
                  role === 'LawEnforcement' ? 'AGENCY_TX_RANGER_042' :
                  role === 'TrustSafety' ? 'PLATFORM_TRUST_OFFICER_17' :
                  'PRESS_VERIFIED_291',
        display_name: role === 'LawEnforcement' ? 'Det. Maria Lopez' : 
                      role === 'TrustSafety' ? 'Trust & Safety Analyst' : null,
        role: role,
        org_id: role === 'LawEnforcement' ? 'TX_RANGERS' :
                role === 'TrustSafety' ? 'PLATFORM_X_TRUST' : null,
        auth_level: roleConfig.authLevel,
        case_id: policyResult.decision === 'ALLOW' ? 
          (role === 'LawEnforcement' ? `TX-AMBER-2025-${Date.now().toString().slice(-4)}` :
           role === 'TrustSafety' ? `HARASS-${Date.now().toString().slice(-6)}` : null) : null
      },
      capability: {
        requested_capability: 'PRECISE_GEOLOCATE',
        granted_capability: policyResult.capability,
        role_capability_max: roleConfig.capabilityMax,
        policy_pack_id: 'GEOSPY_POLICY_V1',
        policy_version: '1.0.0',
        rule_ids_applied: [policyResult.ruleApplied],
        eu_downgrade_applied: policyResult.euDowngraded || false
      },
      image_context: {
        image_hash: `sha256:${Array.from({length: 16}, () => Math.random().toString(16).slice(2, 4)).join('')}`,
        content_classification: imageClassifications.map(c => c.id),
        risk_level: caseConfig.riskLevel,
        source_platform: 'PLATFORM_SOCIAL_X'
      },
      geo_output: policyResult.decision === 'ALLOW' ? {
        region: 'East Austin, TX, USA',
        precision_level: policyResult.capability === 'NEIGHBORHOOD_GEOLOCATE' ? 'NEIGHBORHOOD' : 'REGION',
        center_lat: 30.2801,
        center_lon: -97.7305,
        radius_meters: policyResult.capability === 'NEIGHBORHOOD_GEOLOCATE' ? 350 : 5000
      } : {
        region: null,
        precision_level: 'NONE',
        center_lat: 0,
        center_lon: 0,
        radius_meters: 0
      },
      sovereign_context: {
        jurisdiction: jurisdiction === 'EU' ? 'EU' : 'US-TX',
        data_subject_jurisdiction: jurisdiction,
        sovereign_policy_id: getSovereignPolicy(),
        treaty_object_id: jurisdiction === 'EU' ? 'TREATY.OBJ.GDPR_GEO_2024' : null,
        sovereign_override_applied: false,
        sovereign_override_reason: null,
        eu_precision_cap_applied: policyResult.euDowngraded || false
      },
      economic_context: {
        econ_policy_id: 'ECON.ESC.GEO_MISUSE_POOL.V1',
        billing_code: getBillingCode(),
        estimated_cost_usd: policyResult.decision === 'ALLOW' ? 0.42 : 0,
        misuse_penalty_usd: 0
      },
      audit: {
        gate_id: `GEOGATE_EDGE_${String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')}`,
        gate_attestation_hash: `sha256:${Array.from({length: 16}, () => Math.random().toString(16).slice(2, 4)).join('')}`,
        geo_engine_id: 'GEOSPY_V1',
        geo_engine_version: '1.3.2',
        hardware_attested: roleConfig.authLevel === 'HARDWARE_ATTESTED',
        trace_id: `trace-${Math.random().toString(36).slice(2, 10)}`
      }
    };
  }, []);

  // Run scenario
  const runScenario = useCallback((scenarioType: string) => {
    setScenario('running');
    setDecision(null);
    setReceipt(null);
    setGeoResult(null);
    setShowReceipt(false);

    let role, useCase, warrant, jurisdiction;

    if (scenarioType === 'stalker') {
      role = 'RandomUser';
      useCase = 'stalker';
      warrant = false;
      jurisdiction = 'US';
      setSelectedRole(role);
      setSelectedUseCase(useCase);
      setWarrantOverride(warrant);
      setDataSubjectJurisdiction(jurisdiction);
    } else if (scenarioType === 'missingPerson') {
      role = 'LawEnforcement';
      useCase = 'missingPerson';
      warrant = true;
      jurisdiction = 'US';
      setSelectedRole(role);
      setSelectedUseCase(useCase);
      setWarrantOverride(warrant);
      setDataSubjectJurisdiction(jurisdiction);
    } else {
      // Defaults to safe fallback if unknown
      role = selectedRole;
      useCase = selectedUseCase;
      warrant = warrantOverride;
      jurisdiction = dataSubjectJurisdiction;
    }

    setTimeout(() => {
      const policyResult = evaluatePolicy(role, useCase, warrant, jurisdiction);
      const newReceipt = generateReceipt(role, useCase, warrant, jurisdiction, policyResult);
      
      setDecision(policyResult);
      setReceipt(newReceipt);
      
      if (policyResult.decision === 'ALLOW') {
        setGeoResult({
          region: 'East Austin, TX',
          detail: 'Residential neighborhood near Mueller',
          lat: 30.2801,
          lon: -97.7305,
          radius: policyResult.capability === 'NEIGHBORHOOD_GEOLOCATE' ? 350 : 5000,
          euCapped: policyResult.euDowngraded
        });
      }
      
      setScenario('complete');
    }, 1500);
  }, [evaluatePolicy, generateReceipt, selectedRole, selectedUseCase, warrantOverride, dataSubjectJurisdiction]);

  // Manual query
  const runManualQuery = useCallback(() => {
    setScenario('running');
    setDecision(null);
    setReceipt(null);
    setGeoResult(null);
    setShowReceipt(false);

    setTimeout(() => {
      const policyResult = evaluatePolicy(selectedRole, selectedUseCase, warrantOverride, dataSubjectJurisdiction);
      const newReceipt = generateReceipt(selectedRole, selectedUseCase, warrantOverride, dataSubjectJurisdiction, policyResult);
      
      setDecision(policyResult);
      setReceipt(newReceipt);
      
      if (policyResult.decision === 'ALLOW') {
        setGeoResult({
          region: 'East Austin, TX',
          detail: 'Residential neighborhood near Mueller',
          lat: 30.2801,
          lon: -97.7305,
          radius: policyResult.capability === 'NEIGHBORHOOD_GEOLOCATE' ? 350 : 5000,
          euCapped: policyResult.euDowngraded
        });
      }
      
      setScenario('complete');
    }, 1500);
  }, [selectedRole, selectedUseCase, warrantOverride, dataSubjectJurisdiction, evaluatePolicy, generateReceipt]);

  return (
    <div className="min-h-screen bg-[#0f0a1a] text-white font-sans">
        <style jsx global>{`
            @keyframes scan-line {
                0% { transform: translateY(-100%); }
                100% { transform: translateY(100%); }
            }
            .animate-scan-line::after {
                content: '';
                position: absolute;
                inset: 0;
                background: linear-gradient(180deg, transparent 0%, rgba(139, 92, 246, 0.1) 50%, transparent 100%);
                animation: scan-line 2s linear infinite;
            }
            .grid-pattern { 
                background-image: radial-gradient(circle at 1px 1px, rgba(139, 92, 246, 0.05) 1px, transparent 0);
                background-size: 20px 20px;
            }
        `}</style>

      <div className="grid-pattern min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-full text-purple-400 text-sm mb-4">
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
              PATHWELL CONNECT™ AI Governance Demo
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">
              <span className="text-purple-400">GEO</span><span className="text-pink-400">GATE</span>
            </h1>
            <p className="text-slate-400 text-lg">Constitutional Front Door for Geolocation AI</p>
            <p className="text-slate-500 text-sm mt-2 max-w-2xl mx-auto">
              Same image. Different roles. Completely different outcomes. No-token-no-run enforcement with cryptographic receipts.
            </p>
          </div>

          {/* Scenario Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button
              onClick={() => runScenario('stalker')}
              disabled={scenario === 'running'}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                scenario === 'running'
                  ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                  : 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white shadow-lg hover:shadow-red-900/20'
              }`}
            >
              <Target className="w-5 h-5" />
              {scenario === 'running' ? 'Processing...' : 'Run "Stalker Attempt" Scenario'}
            </button>
            <button
              onClick={() => runScenario('missingPerson')}
              disabled={scenario === 'running'}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                scenario === 'running'
                  ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg hover:shadow-blue-900/20'
              }`}
            >
              <Shield className="w-5 h-5" />
              {scenario === 'running' ? 'Processing...' : 'Run "Missing Person" Scenario'}
            </button>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Query Panel */}
            <div className="bg-slate-800/30 rounded-2xl border border-slate-700 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="text-purple-400">📋</span> Query Configuration
              </h2>

              {/* Role Selector */}
              <div className="mb-4">
                <label className="text-sm text-slate-400 mb-2 block">Caller Role</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(roles).map(([key, role]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedRole(key)}
                      className={`p-3 rounded-lg border transition-all text-left ${
                        selectedRole === key 
                          ? `border-purple-500 bg-purple-500/20` 
                          : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-xl ${role.color}`}>{role.icon}</span>
                        <div>
                          <div className="text-sm font-medium text-slate-200">{role.label}</div>
                          <div className="text-[10px] text-slate-500">{role.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Use Case Selector */}
              <div className="mb-4">
                <label className="text-sm text-slate-400 mb-2 block">Use Case / Intent</label>
                <div className="grid grid-cols-1 gap-2">
                    {Object.entries(useCases).map(([key, uc]) => (
                        <button
                            key={key}
                            onClick={() => setSelectedUseCase(key)}
                            className={`p-3 rounded-lg border text-left flex items-center gap-3 transition-all ${
                                selectedUseCase === key
                                ? 'border-purple-500 bg-purple-500/10'
                                : 'border-slate-600 bg-slate-800 hover:border-slate-500'
                            }`}
                        >
                            <div className="text-slate-400">{uc.icon}</div>
                            <span className="text-sm text-slate-200">{uc.label}</span>
                        </button>
                    ))}
                </div>
              </div>

              {/* Warrant Toggle */}
              {selectedRole === 'LawEnforcement' && (
                <div className="mb-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={warrantOverride}
                      onChange={(e) => setWarrantOverride(e.target.checked)}
                      className="w-5 h-5 rounded bg-slate-700 border-slate-500 accent-purple-500"
                    />
                    <span className="text-sm text-slate-300">Warrant / Legal Basis Present</span>
                    {warrantOverride && <span className="text-xs bg-green-900/50 text-green-400 px-2 py-1 rounded border border-green-500/20">VERIFIED</span>}
                  </label>
                </div>
              )}

              {/* Data Subject Jurisdiction */}
              <div className="mb-4">
                <label className="text-sm text-slate-400 mb-2 block">Data Subject Jurisdiction</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDataSubjectJurisdiction('US')}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      dataSubjectJurisdiction === 'US'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <Flag className="w-4 h-4" /> US
                  </button>
                  <button
                    onClick={() => setDataSubjectJurisdiction('EU')}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      dataSubjectJurisdiction === 'EU'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <Globe className="w-4 h-4" /> EU (GDPR)
                  </button>
                </div>
                {dataSubjectJurisdiction === 'EU' && (
                  <div className="mt-2 text-xs text-yellow-400 bg-yellow-900/20 px-3 py-2 rounded-lg border border-yellow-800 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>EU subjects: max precision capped at REGION per GDPR treaty</span>
                  </div>
                )}
              </div>

              {/* Image Preview */}
              <div className="mb-4">
                <label className="text-sm text-slate-400 mb-2 block">Target Image</label>
                <div className="relative bg-slate-900/50 rounded-xl border border-slate-600 p-4 overflow-hidden">
                  {/* Mock image representation */}
                  <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center relative animate-scan-line overflow-hidden">
                    <div className="text-center z-10 flex flex-col items-center">
                      <Home className="w-16 h-16 text-slate-500 mb-2" />
                      <div className="text-sm text-slate-400">Selfie with residence visible</div>
                      <div className="text-xs text-slate-500 mt-1">Reflective surface detected</div>
                    </div>
                  </div>
                  
                  {/* Classification Badges */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {imageClassifications.map(c => (
                      <span 
                        key={c.id}
                        className={`text-xs px-2 py-1 rounded-full font-medium ${c.bg} ${c.color}`}
                      >
                        {c.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Policy Pack Info */}
              <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700 flex items-center justify-between">
                <div>
                    <div className="text-xs text-slate-500 mb-1">Active Policy Pack</div>
                    <div className="font-medium text-purple-400 font-mono">GEOSPY_POLICY_V1</div>
                </div>
                <div className="text-xs text-slate-500 text-right">
                    Constitutional rules for<br/>geolocation AI
                </div>
              </div>

              {/* Manual Query Button */}
              <button
                onClick={runManualQuery}
                disabled={scenario === 'running'}
                className={`w-full mt-4 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  scenario === 'running'
                    ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20'
                }`}
              >
                {scenario === 'running' ? <><Scale className="w-4 h-4 animate-pulse" /> Evaluating Policy...</> : <><Search className="w-4 h-4" /> Submit Query</>}
              </button>
            </div>

            {/* Right: Response Panel */}
            <div className="bg-slate-800/30 rounded-2xl border border-slate-700 p-6 flex flex-col h-full">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="text-purple-400">⚡</span> Gate Response
              </h2>

              {/* Decision Banner */}
              {decision && (
                <div className={`rounded-xl p-4 mb-4 border-2 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                  decision.decision === 'DENY' 
                    ? 'bg-red-900/30 border-red-500/50' 
                    : 'bg-green-900/30 border-green-500/50'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-full ${decision.decision === 'DENY' ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                        {decision.decision === 'DENY' ? <XCircle className={`w-6 h-6 ${decision.decision === 'DENY' ? 'text-red-400' : 'text-green-400'}`} /> : <CheckCircle2 className={`w-6 h-6 ${decision.decision === 'DENY' ? 'text-red-400' : 'text-green-400'}`} />}
                    </div>
                    <div>
                      <div className={`text-xl font-bold ${decision.decision === 'DENY' ? 'text-red-400' : 'text-green-400'}`}>
                        {decision.decision === 'DENY' ? 'QUERY DENIED' : 'QUERY APPROVED'}
                      </div>
                      <div className="text-sm text-slate-300">
                        {decision.decision === 'DENY' 
                          ? 'Geolocation request blocked by policy'
                          : `Precision: ${decision.capability.replace('_GEOLOCATE', '').replace('_', ' ')}`
                        }
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-400 mt-2 bg-slate-900/50 p-2 rounded border border-slate-700/50">
                    <span className="font-medium text-slate-300">Reason:</span> {decision.reason.replace(/_/g, ' ')}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 font-mono px-1">
                    Rule: {decision.ruleApplied}
                  </div>
                </div>
              )}

              {/* No decision yet */}
              {!decision && scenario !== 'running' && (
                <div className="rounded-xl p-12 border border-slate-700 bg-slate-900/30 text-center flex-1 flex flex-col items-center justify-center">
                  <Lock className="w-16 h-16 text-slate-600 mb-4" />
                  <div className="text-slate-400 text-lg">Awaiting query submission</div>
                  <div className="text-sm text-slate-500 mt-1">Select a scenario or configure a custom query</div>
                </div>
              )}

              {/* Processing */}
              {scenario === 'running' && (
                <div className="rounded-xl p-12 border border-purple-700/50 bg-purple-900/10 text-center flex-1 flex flex-col items-center justify-center animate-pulse">
                  <Scale className="w-16 h-16 text-purple-500 mb-4" />
                  <div className="text-purple-300 text-lg">Evaluating policy...</div>
                  <div className="text-sm text-slate-500 mt-1">Checking capability tokens, role, and case context</div>
                </div>
              )}

              {/* Geo Result (if allowed) */}
              {geoResult && (
                <div className="rounded-xl p-4 mb-4 border border-cyan-700/50 bg-cyan-900/10 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-cyan-400 font-medium flex items-center gap-2">
                        <Map className="w-4 h-4" /> Location Result (Bounded)
                    </div>
                    {geoResult.euCapped && (
                      <span className="text-xs bg-yellow-900/50 text-yellow-400 px-2 py-1 rounded border border-yellow-700/50">
                        🇪🇺 EU Precision Cap Applied
                      </span>
                    )}
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                    <div className="text-lg font-medium text-white">{geoResult.region}</div>
                    <div className="text-sm text-slate-400">{geoResult.detail}</div>
                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-xs text-slate-500">Precision</div>
                        <div className="text-cyan-400 font-medium">{geoResult.radius}m radius</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Coordinates</div>
                        <div className="font-mono text-xs text-slate-300">{geoResult.lat}, {geoResult.lon}</div>
                      </div>
                    </div>
                    {/* Mock map */}
                    <div className="mt-3 h-32 bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700 relative overflow-hidden group">
                      <div className="absolute inset-0 opacity-20 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Line_Control_Map.svg/1200px-Line_Control_Map.svg.png')] bg-cover bg-center grayscale"></div>
                      <div className="text-center z-10 relative">
                        <div className="text-2xl mb-1"><Map className="w-8 h-8 text-slate-400 mx-auto" /></div>
                        <div className="text-xs text-slate-400 px-4">
                          {geoResult.euCapped ? 'Region-level only (EU GDPR)' : 'Neighborhood-level bounding box'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Storytelling Line */}
              {decision && (
                <div className="rounded-lg p-4 bg-slate-900/50 border border-slate-700 mb-4">
                  <div className="text-sm text-slate-300 italic">
                    {decision.decision === 'DENY' 
                      ? '"Even though the model could find this house, the gate refuses to run it for this actor. There isn\'t even an internal \'just for us\' result — it literally fails closed."'
                      : '"The same tool runs, but only because the actor, case, and legal basis match the policy pack. If this officer abuses it, the receipts point straight back to them."'
                    }
                  </div>
                </div>
              )}

              {/* Receipt Card */}
              {receipt && (
                <div className="rounded-xl border border-slate-700 bg-slate-900/30 overflow-hidden mt-auto">
                  <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/20">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-400" />
                      <span className="font-medium text-sm text-slate-300">PATHWELL Receipt</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${
                        receipt.decision === 'DENY' 
                            ? 'bg-red-900/20 text-red-400 border-red-500/20' 
                            : 'bg-green-900/20 text-green-400 border-green-500/20'
                      }`}>
                        {receipt.decision}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowReceipt(!showReceipt)}
                      className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition-colors border border-slate-700"
                    >
                      {showReceipt ? 'Hide JSON' : 'View Full Receipt'}
                    </button>
                  </div>
                  
                  {/* Receipt Summary */}
                  {!showReceipt && (
                    <div className="p-4 grid grid-cols-2 gap-3 text-xs">
                        <div>
                        <div className="text-slate-500">Receipt ID</div>
                        <div className="font-mono text-slate-300 truncate" title={receipt.receipt_id}>{receipt.receipt_id}</div>
                        </div>
                        <div>
                        <div className="text-slate-500">Actor</div>
                        <div className="text-slate-300 truncate" title={receipt.caller.actor_id}>{receipt.caller.actor_id}</div>
                        </div>
                        <div>
                        <div className="text-slate-500">Policy Pack</div>
                        <div className="font-mono text-purple-400 truncate">{receipt.capability.policy_pack_id}</div>
                        </div>
                        <div>
                        <div className="text-slate-500">Gate</div>
                        <div className="font-mono text-slate-300 truncate">{receipt.audit.gate_id}</div>
                        </div>
                    </div>
                  )}

                  {/* Full JSON */}
                  {showReceipt && (
                    <pre className="p-4 bg-slate-950 text-[10px] text-slate-300 overflow-x-auto border-t border-slate-700 font-mono max-h-64 overflow-y-auto custom-scrollbar">
                        {JSON.stringify(receipt, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Policy Pack Card */}
          <div className="mt-6 bg-gradient-to-r from-slate-800/50 to-purple-900/20 rounded-2xl border border-purple-500/30 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Shield className="w-32 h-32 text-purple-500" />
            </div>
            <div className="flex items-start justify-between relative z-10">
              <div>
                <div className="text-xs text-purple-400 font-medium mb-1 uppercase tracking-wider">Active Policy Pack</div>
                <div className="text-xl font-bold text-white font-mono">GEOSPY_POLICY_V1</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Constitutional rules for geolocation AI</div>
                <div className="text-xs text-purple-500 font-mono mt-1">6 rules compiled</div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-6 text-sm relative z-10">
              <div>
                <div className="text-xs text-slate-500 mb-2">Capability Classes</div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-red-900/30 text-red-400 border border-red-500/20">NONE</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-900/30 text-yellow-400 border border-yellow-500/20">REGION</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-green-900/30 text-green-400 border border-green-500/20">NEIGHBORHOOD</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-2">Protected Contexts</div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-red-900/30 text-red-400 border border-red-500/20">Private Residence</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-orange-900/30 text-orange-400 border border-orange-500/20">Human Present</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-2">Override Paths</div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-900/30 text-blue-400 border border-blue-500/20">LE + Warrant</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-900/30 text-purple-400 border border-purple-500/20">T&S Investigation</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-2">Jurisdiction Rules</div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-900/30 text-yellow-400 border border-yellow-500/20 flex items-center gap-1"><Globe className="w-3 h-3" /> EU → REGION max</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-2">Economic Gates</div>
                <div className="text-slate-300 font-mono text-xs bg-slate-800/50 px-2 py-1 rounded inline-block">Geo Misuse Escrow Pool</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-slate-500 text-sm">
            <p className="font-medium text-slate-400">GEOGATE™ — Constitutional Front Door for Geolocation AI</p>
            <p className="mt-2">
              <span className="text-purple-400">No-token-no-run</span> + <span className="text-pink-400">Policy Packs</span> + <span className="text-cyan-400">Cryptographic Receipts</span>
            </p>
            <p className="mt-2 text-slate-600 italic max-w-xl mx-auto">
              "GeoSpy proves you can locate anyone from a reflection. GeoGate proves you don't have to let just anyone do that."
            </p>
            <p className="mt-6 text-slate-700 text-xs">© 2025 AnchorTrust Holdings LLC — PATHWELL CONNECT™</p>
          </div>
        </div>
      </div>
    </div>
  );
}

