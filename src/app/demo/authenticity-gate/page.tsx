"use client";

import React, { useState, useCallback } from 'react';
import { Shield, Mic, AlertTriangle, Radio, ChevronLeft, Lightbulb, Activity, Lock, FileText, CheckCircle2, XCircle, AlertOctagon, User } from 'lucide-react';
import Link from 'next/link';

// Persona credential definitions (full objects for popup)
const personaObjects: Record<string, any> = {
  GOV_TX_2025: {
    schema_version: "AUTH.OBJ.PERSONA.V1",
    object_id: "AUTH.OBJ.PERSONA.GOV_TX_2025",
    persona_id: "GOV_TX_2025",
    persona_type: "PUBLIC_OFFICIAL",
    display_name: "Governor of Texas",
    subject_jurisdiction: "US-TX",
    issuer: "STATE_OF_TEXAS_SECRETARY",
    issued_at: "2025-01-15T00:00:00Z",
    expires_at: "2027-01-15T00:00:00Z",
    consent_scope: ["EMERGENCY_BROADCAST", "OFFICIAL_STATEMENT", "PRESS_CONFERENCE"],
    capability_tokens: ["CAN_SPEAK_AS:GOV_TX_2025", "CAN_APPEAR_AS:GOV_TX_2025"],
    bound_devices: ["SECURE_PHONE_GOVTX_01", "SECURE_TERMINAL_GOVTX_02"],
    revocation_endpoint: "https://texas.gov/persona/revoke",
    signature: "ed25519:7f8a9b2c..."
  },
  DOE_SPOKESPERSON_01: {
    schema_version: "AUTH.OBJ.PERSONA.V1",
    object_id: "AUTH.OBJ.PERSONA.DOE_SANDIA_DIR",
    persona_id: "DOE_SPOKESPERSON_01",
    persona_type: "LAB_SPOKESPERSON",
    display_name: "DOE Lab Director",
    subject_jurisdiction: "US-FED",
    issuer: "DOE_NNSA_CREDENTIALING",
    issued_at: "2024-09-01T00:00:00Z",
    expires_at: "2026-09-01T00:00:00Z",
    consent_scope: ["LAB_ANNOUNCEMENT", "SCIENTIFIC_RESULTS", "CONGRESSIONAL_TESTIMONY"],
    capability_tokens: ["CAN_SPEAK_AS:DOE_SPOKESPERSON_01"],
    bound_devices: ["SANDIA_SECURE_TERMINAL_07"],
    revocation_endpoint: "https://doe.gov/persona/revoke",
    signature: "ed25519:3d4e5f6a..."
  }
};

// Caller profiles
const callerProfiles: Record<string, any> = {
  governor_legit: {
    actor_id: "OFFICE_GOV_TX",
    actor_role: "AGENCY",
    org_id: "STATE_OF_TEXAS",
    display_name: "Governor Greg Abbott",
    auth_level: "HARDWARE_ATTESTED",
    device_id: "SECURE_PHONE_GOVTX_01",
    device_attested: true,
    network_origin: "ON_NET",
    icon: <Building2 className="w-8 h-8" />,
    color: "text-blue-400"
  },
  attacker: {
    actor_id: "UNKNOWN",
    actor_role: "USER",
    org_id: null,
    display_name: "Unknown Caller",
    auth_level: "UNVERIFIED",
    device_id: "UNKNOWN_DEVICE",
    device_attested: false,
    network_origin: "FOREIGN_IX",
    icon: <User className="w-8 h-8" />,
    color: "text-slate-400"
  },
  lab_spokesperson: {
    actor_id: "DOE_SANDIA_COMMS",
    actor_role: "AGENCY",
    org_id: "DOE_SANDIA_LAB",
    display_name: "Dr. Sarah Chen, Lab Director",
    auth_level: "HARDWARE_ATTESTED",
    device_id: "SANDIA_SECURE_TERMINAL_07",
    device_attested: true,
    network_origin: "ON_NET",
    icon: <Activity className="w-8 h-8" />,
    color: "text-purple-400"
  }
};

// Persona definitions
const personas: Record<string, any> = {
  GOV_TX_2025: {
    persona_id: "GOV_TX_2025",
    persona_type: "PUBLIC_OFFICIAL",
    subject_jurisdiction: "US-TX",
    auth_obj_id: "AUTH.OBJ.PERSONA.GOV_TX_2025",
    label: "Governor of Texas",
    consent_scope: ["EMERGENCY_BROADCAST", "OFFICIAL_STATEMENT"]
  },
  DOE_SPOKESPERSON_01: {
    persona_id: "DOE_SPOKESPERSON_01",
    persona_type: "LAB_SPOKESPERSON",
    subject_jurisdiction: "US-FED",
    auth_obj_id: "AUTH.OBJ.PERSONA.DOE_SANDIA_DIR",
    label: "DOE Lab Director",
    consent_scope: ["LAB_ANNOUNCEMENT", "SCIENTIFIC_RESULTS"]
  }
};

// Channel definitions
const channels: Record<string, any> = {
  EMERGENCY_COMMS: {
    id: "EMERGENCY_COMMS",
    label: "Emergency Grid Alert",
    icon: <AlertTriangle className="w-6 h-6" />,
    policy_pack: "AUTH_GATE_EMERGENCY_V1",
    requires_attestation: true
  },
  LAB_ANNOUNCEMENT: {
    id: "LAB_ANNOUNCEMENT", 
    label: "Official Lab Results",
    icon: <Radio className="w-6 h-6" />,
    policy_pack: "GENESIS_SCIENCE_COMMS_V1",
    requires_attestation: true
  }
};

import { Building2 } from 'lucide-react';

export default function AuthenticityGateDemo() {
  const [scenario, setScenario] = useState<'running' | 'complete' | null>(null);
  const [scenarioType, setScenarioType] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [decision, setDecision] = useState<any | null>(null);
  const [receipt, setReceipt] = useState<any | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showPersonaObj, setShowPersonaObj] = useState(false);
  const [callerData, setCallerData] = useState<any | null>(null);
  const [personaData, setPersonaData] = useState<any | null>(null);
  const [channelData, setChannelData] = useState<any | null>(null);
  const [mediaData, setMediaData] = useState<any | null>(null);
  const [signals, setSignals] = useState<any | null>(null);

  // Generate receipt
  const generateReceipt = useCallback((caller: any, persona: any, channel: any, media: any, policyResult: any, signalsData: any) => {
    const receiptId = `auth-${Date.now().toString(36).toUpperCase()}`;
    
    return {
      schema_version: "PATHWELL_AUTHENTICITY_RECEIPT_V1",
      receipt_id: receiptId,
      timestamp: new Date().toISOString(),
      decision: policyResult.decision,
      decision_reason: policyResult.reason,
      caller: {
        actor_id: caller.actor_id,
        actor_role: caller.actor_role,
        org_id: caller.org_id,
        display_name: caller.display_name,
        auth_level: caller.auth_level
      },
      persona: {
        persona_id: persona.persona_id,
        persona_type: persona.persona_type,
        subject_jurisdiction: persona.subject_jurisdiction,
        auth_obj_id: persona.auth_obj_id,
        consent_status: policyResult.decision === 'ALLOW' ? 'EXPLICIT' : 'NONE',
        consent_scope: policyResult.decision === 'ALLOW' ? persona.consent_scope : []
      },
      media: {
        media_type: media.type,
        channel: channel.id,
        media_hash: `sha256:${Array.from({length: 16}, () => Math.random().toString(16).slice(2, 4)).join('')}`,
        duration_seconds: media.duration,
        source_hint: media.source
      },
      generation_pipeline: policyResult.decision === 'ALLOW' ? {
        pipeline_id: "GENESIS_EMERGENCY_TTS_V1",
        model_id: "xai_voice_2025_09",
        model_owner: "XAI",
        input_modalities: ["PROMPT_TEXT", "REFERENCE_VOICE_EMBED"],
        training_data_refs: ["AUTH.OBJ.DATASET.GOV_SPEECH_ARCHIVE_V3"],
        inference_energy: {
          kwh: 0.18,
          grams_co2e_per_kwh: 40,
          grid_region: "ERCOT_WEST",
          renewable_fraction: 0.82
        }
      } : {
        pipeline_id: "UNREGISTERED_PIPELINE",
        model_id: "UNKNOWN",
        model_owner: "UNKNOWN",
        input_modalities: [],
        training_data_refs: [],
        inference_energy: { kwh: 0, grams_co2e_per_kwh: 0, grid_region: null, renewable_fraction: 0 }
      },
      policy: {
        policy_pack_id: channel.policy_pack,
        policy_version: "1.0.0",
        rule_ids_applied: policyResult.rules,
        sovereign_policy_id: `SOV.MEDIA.${channel.id}.US.2025`,
        treaty_object_id: "TREATY.OBJ.NAT_EMERGENCY_MEDIA.2025",
        sovereign_override_applied: false,
        sovereign_override_reason: null
      },
      signals: {
        deepfake_model_score: signalsData.deepfake_score,
        device_attested: caller.device_attested,
        device_id: caller.device_id,
        network_origin: caller.network_origin,
        anomaly_flags: signalsData.anomaly_flags
      },
      outcome: {
        effective_channel_action: policyResult.decision === 'ALLOW' ? 'DELIVERED' : 'BLOCKED',
        user_facing_labels: policyResult.decision === 'ALLOW' 
          ? ['OFFICIAL_MESSAGE', 'AI_GENERATED_VOICE'] 
          : [],
        routing_actions: policyResult.decision === 'ALLOW'
          ? ['LOG_TO_IMMUTABLE_LEDGER']
          : ['LOG_TO_IMMUTABLE_LEDGER', 'NOTIFY_SECURITY_TEAM', 'ESCALATE_TO_SOC']
      },
      economic_context: {
        econ_policy_id: "ECON.ESC.MEDIA_MISUSE_POOL.V1",
        billing_code: policyResult.decision === 'ALLOW' ? 'AUTH.LEGIT_EMERGENCY' : 'AUTH.BLOCKED_IMPERSONATION',
        settlement_usd: 0,
        misuse_penalty_usd: 0
      },
      audit: {
        gate_id: "AUTH_GATE_DC_AUSTIN_01",
        gate_attestation_hash: `sha256:${Array.from({length: 16}, () => Math.random().toString(16).slice(2, 4)).join('')}`,
        hardware_attested: true,
        trace_id: `trace-${Math.random().toString(36).slice(2, 10)}`
      }
    };
  }, []);

  // Run Governor Legit scenario
  const runGovernorLegit = useCallback(() => {
    setScenario('running');
    setScenarioType('governor_legit');
    setStep(1);
    setDecision(null);
    setReceipt(null);
    setShowReceipt(false);

    const caller = callerProfiles.governor_legit;
    const persona = personas.GOV_TX_2025;
    const channel = channels.EMERGENCY_COMMS;
    const media = { type: 'AUDIO', duration: 37, source: 'SYNTHETIC' };

    setCallerData(caller);
    setPersonaData(persona);
    setChannelData(channel);
    setMediaData(media);

    // Step 1: Caller arrives
    setTimeout(() => setStep(2), 800);
    
    // Step 2: Persona token check
    setTimeout(() => setStep(3), 1600);
    
    // Step 3: Device attestation
    setTimeout(() => {
      setSignals({
        deepfake_score: 0.87,
        anomaly_flags: []
      });
      setStep(4);
    }, 2400);
    
    // Step 4: Policy evaluation
    setTimeout(() => setStep(5), 3200);
    
    // Step 5: Decision
    setTimeout(() => {
      const policyResult = {
        decision: 'ALLOW',
        reason: 'Persona token + device attestation + policy conditions satisfied for emergency channel.',
        rules: [
          'RULE_REQUIRE_PERSONA_TOKEN_FOR_EMERGENCY_CHANNEL',
          'RULE_ALLOW_SYNTHETIC_IF_CONSENT_SCOPE_INCLUDES_EMERGENCY'
        ]
      };
      const signalsData = { deepfake_score: 0.87, anomaly_flags: [] };
      
      setDecision(policyResult);
      setReceipt(generateReceipt(caller, persona, channel, media, policyResult, signalsData));
      setScenario('complete');
    }, 4000);
  }, [generateReceipt]);

  // Run Deepfake Attack scenario
  const runDeepfakeAttack = useCallback(() => {
    setScenario('running');
    setScenarioType('deepfake_attack');
    setStep(1);
    setDecision(null);
    setReceipt(null);
    setShowReceipt(false);

    const caller = callerProfiles.attacker;
    const persona = personas.GOV_TX_2025;
    const channel = channels.EMERGENCY_COMMS;
    const media = { type: 'AUDIO', duration: 29, source: 'UNKNOWN' };

    setCallerData(caller);
    setPersonaData(persona);
    setChannelData(channel);
    setMediaData(media);

    // Step 1: Caller arrives
    setTimeout(() => setStep(2), 800);
    
    // Step 2: Persona token check - FAILS
    setTimeout(() => setStep(3), 1600);
    
    // Step 3: Device attestation - FAILS
    setTimeout(() => {
      setSignals({
        deepfake_score: 0.99,
        anomaly_flags: ['UNREGISTERED_MODEL', 'NO_PERSONA_TOKEN', 'UNVERIFIED_DEVICE', 'FOREIGN_NETWORK']
      });
      setStep(4);
    }, 2400);
    
    // Step 4: Policy evaluation
    setTimeout(() => setStep(5), 3200);
    
    // Step 5: Decision - DENY
    setTimeout(() => {
      const policyResult = {
        decision: 'DENY',
        reason: 'No persona token for GOV_TX_2025, device not attested, deepfake score critical (0.99).',
        rules: [
          'RULE_REQUIRE_PERSONA_TOKEN_FOR_EMERGENCY_CHANNEL',
          'RULE_BLOCK_UNVERIFIED_DEVICE',
          'RULE_BLOCK_HIGH_RISK_SCORE'
        ]
      };
      const signalsData = { 
        deepfake_score: 0.99, 
        anomaly_flags: ['UNREGISTERED_MODEL', 'NO_PERSONA_TOKEN', 'UNVERIFIED_DEVICE', 'FOREIGN_NETWORK'] 
      };
      
      setDecision(policyResult);
      setReceipt(generateReceipt(caller, persona, channel, media, policyResult, signalsData));
      setScenario('complete');
    }, 4000);
  }, [generateReceipt]);

  // Run Lab Results scenario
  const runLabResults = useCallback(() => {
    setScenario('running');
    setScenarioType('lab_results');
    setStep(1);
    setDecision(null);
    setReceipt(null);
    setShowReceipt(false);
    setShowPersonaObj(false);

    const caller = callerProfiles.lab_spokesperson;
    const persona = personas.DOE_SPOKESPERSON_01;
    const channel = channels.LAB_ANNOUNCEMENT;
    const media = { type: 'VIDEO', duration: 120, source: 'SYNTHETIC' };

    setCallerData(caller);
    setPersonaData(persona);
    setChannelData(channel);
    setMediaData(media);

    // Step 1: Caller arrives
    setTimeout(() => setStep(2), 800);
    
    // Step 2: Persona token check
    setTimeout(() => setStep(3), 1600);
    
    // Step 3: Device attestation
    setTimeout(() => {
      setSignals({
        deepfake_score: 0.82,
        anomaly_flags: []
      });
      setStep(4);
    }, 2400);
    
    // Step 4: Policy evaluation
    setTimeout(() => setStep(5), 3200);
    
    // Step 5: Decision
    setTimeout(() => {
      const policyResult = {
        decision: 'ALLOW',
        reason: 'DOE Lab Director persona token valid, device attested on SANDIA secure terminal, policy GENESIS_SCIENCE_COMMS_V1 satisfied.',
        rules: [
          'RULE_REQUIRE_PERSONA_TOKEN_FOR_LAB_ANNOUNCEMENT',
          'RULE_ALLOW_SYNTHETIC_IF_CONSENT_SCOPE_INCLUDES_SCIENTIFIC_RESULTS',
          'RULE_REQUIRE_GENESIS_PROVENANCE_FOR_OFFICIAL_RESULTS'
        ]
      };
      const signalsData = { deepfake_score: 0.82, anomaly_flags: [] };
      
      setDecision(policyResult);
      setReceipt(generateReceipt(caller, persona, channel, media, policyResult, signalsData));
      setScenario('complete');
    }, 4000);
  }, [generateReceipt]);

  // Reset
  const resetDemo = useCallback(() => {
    setScenario(null);
    setScenarioType(null);
    setStep(0);
    setDecision(null);
    setReceipt(null);
    setShowReceipt(false);
    setShowPersonaObj(false);
    setCallerData(null);
    setPersonaData(null);
    setChannelData(null);
    setMediaData(null);
    setSignals(null);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f0a1a] text-white font-sans">
      <style jsx global>{`
        @keyframes waveform {
          0%, 100% { height: 20%; }
          50% { height: 80%; }
        }
        .animate-waveform-bar { animation: waveform 0.5s ease-in-out infinite; }
        
        @keyframes scan-voice {
          0% { left: 0%; }
          100% { left: 100%; }
        }
        .animate-scan-voice::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(180deg, transparent, #eab308, transparent);
          animation: scan-voice 2s linear infinite;
        }
        
        .grid-pattern { 
          background-image: radial-gradient(circle at 1px 1px, rgba(234, 179, 8, 0.05) 1px, transparent 0);
          background-size: 20px 20px;
        }
      `}</style>

      <div className="grid-pattern min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 rounded-full text-amber-400 text-sm mb-4">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              PATHWELL CONNECT™ AI Governance Demo
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">
              <span className="text-amber-400">AUTHENTICITY</span> <span className="text-orange-400">GATE</span>
            </h1>
            <p className="text-slate-400 text-lg">Deepfake Governance for Critical Channels</p>
            <p className="text-slate-500 text-sm mt-2 max-w-2xl mx-auto">
              No-token-no-speak for high-impact personas. Every impersonation attempt must present a persona token, 
              pass policy checks, and emit receipts — or it never reaches the operator.
            </p>
          </div>

          {/* Concept Explainer */}
          <div className="bg-slate-800/30 border border-amber-500/30 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-slate-800 rounded-lg text-amber-400">
                <Mic className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-slate-200">The Problem with Synthetic Voices</h3>
                <p className="text-slate-400 text-sm mb-3">
                  AI can clone any voice from a few seconds of audio. A spoofed "Governor" ordering grid load-shed, 
                  a fake "Lab Director" announcing false results — in critical channels, a single deepfake can 
                  move markets or endanger lives.
                </p>
                <p className="text-slate-400 text-sm">
                  <strong className="text-amber-400">Authenticity Gate</strong> turns synthetic media from an ungoverned 
                  weapon into a governed capability. Same voice model, different outcomes based on <em>who holds the 
                  persona token</em> and <em>whether the device is attested</em>.
                </p>
              </div>
            </div>
          </div>

          {/* Scenario Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={runGovernorLegit}
              disabled={scenario === 'running'}
              className={`p-6 rounded-xl border-2 text-left transition-all ${
                scenario === 'running'
                  ? 'bg-slate-800/50 border-slate-700 cursor-not-allowed opacity-50'
                  : scenarioType === 'governor_legit' && scenario === 'complete'
                    ? 'bg-green-900/20 border-green-500'
                    : 'bg-slate-800/30 border-slate-700 hover:border-green-500/50'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded bg-slate-800 text-green-400">
                    <Radio className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold text-lg text-slate-200">Governor Emergency Call</div>
                  <div className="text-slate-400 text-xs">Legitimate AI-generated alert</div>
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-3">
                Governor uses authorized TTS pipeline to issue multilingual grid emergency alert. 
                Persona token present, device attested, policy satisfied.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-1 rounded bg-green-900/50 text-green-400 border border-green-500/20">Expected: ALLOW</span>
                <span className="text-[10px] text-slate-500">Hardware attested • Persona token valid</span>
              </div>
            </button>

            <button
              onClick={runDeepfakeAttack}
              disabled={scenario === 'running'}
              className={`p-6 rounded-xl border-2 text-left transition-all ${
                scenario === 'running'
                  ? 'bg-slate-800/50 border-slate-700 cursor-not-allowed opacity-50'
                  : scenarioType === 'deepfake_attack' && scenario === 'complete'
                    ? 'bg-red-900/20 border-red-500'
                    : 'bg-slate-800/30 border-slate-700 hover:border-red-500/50'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded bg-slate-800 text-red-400">
                    <AlertOctagon className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold text-lg text-slate-200">Spoofed Governor Deepfake</div>
                  <div className="text-slate-400 text-xs">Foreign attacker with cloned voice</div>
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-3">
                Attacker plays cloned "Governor" voice into emergency channel from unregistered device. 
                No persona token, no attestation, high deepfake score.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-1 rounded bg-red-900/50 text-red-400 border border-red-500/20">Expected: DENY</span>
                <span className="text-[10px] text-slate-500">No token • Unverified • Foreign origin</span>
              </div>
            </button>

            <button
              onClick={runLabResults}
              disabled={scenario === 'running'}
              className={`p-6 rounded-xl border-2 text-left transition-all ${
                scenario === 'running'
                  ? 'bg-slate-800/50 border-slate-700 cursor-not-allowed opacity-50'
                  : scenarioType === 'lab_results' && scenario === 'complete'
                    ? 'bg-purple-900/20 border-purple-500'
                    : 'bg-slate-800/30 border-slate-700 hover:border-purple-500/50'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded bg-slate-800 text-purple-400">
                    <Activity className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold text-lg text-slate-200">Lab Results Announcement</div>
                  <div className="text-slate-400 text-xs">DOE Lab Director official video</div>
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-3">
                DOE Lab Director uses AI-generated video to announce scientific discovery. 
                Genesis-compliant pipeline with full provenance chain.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-1 rounded bg-purple-900/50 text-purple-400 border border-purple-500/20">Expected: ALLOW</span>
                <span className="text-[10px] text-slate-500">Genesis provenance • Attested terminal</span>
              </div>
            </button>
          </div>

          {/* Processing Pipeline */}
          {scenario && (
            <div className="bg-slate-800/30 rounded-xl border border-slate-700 p-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-slate-200">
                <span className="text-amber-400">⚡</span> Authentication Pipeline
              </h3>
              
              <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
                {[
                  { num: 1, label: 'Caller Arrives', icon: <User className="w-6 h-6" /> },
                  { num: 2, label: 'Persona Token', icon: <FileText className="w-6 h-6" /> },
                  { num: 3, label: 'Device Attest', icon: <Lock className="w-6 h-6" /> },
                  { num: 4, label: 'Deepfake Check', icon: <Activity className="w-6 h-6" /> },
                  { num: 5, label: 'Gate Decision', icon: <Shield className="w-6 h-6" /> }
                ].map((s, i) => (
                  <React.Fragment key={s.num}>
                    <div className={`flex-shrink-0 text-center transition-all duration-500 ${step >= s.num ? 'opacity-100 transform scale-105' : 'opacity-40'}`}>
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 text-xl transition-all duration-300 ${
                        step > s.num 
                          ? (scenarioType === 'deepfake_attack' && s.num >= 2 ? 'bg-red-600 shadow-lg shadow-red-900/50' : 'bg-green-600 shadow-lg shadow-green-900/50')
                          : step === s.num 
                            ? 'bg-amber-600 animate-pulse shadow-lg shadow-amber-900/50' 
                            : 'bg-slate-700'
                      }`}>
                        {step > s.num 
                          ? (scenarioType === 'deepfake_attack' && s.num >= 2 ? <XCircle className="w-6 h-6 text-white" /> : <CheckCircle2 className="w-6 h-6 text-white" />)
                          : <span className="text-white">{s.icon}</span>
                        }
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{s.label}</div>
                    </div>
                    {i < 4 && (
                      <div className={`flex-shrink-0 w-full h-0.5 transition-all duration-500 ${
                        step > s.num 
                          ? (scenarioType === 'deepfake_attack' && s.num >= 2 ? 'bg-red-600' : 'bg-green-600')
                          : 'bg-slate-700'
                      }`} style={{ minWidth: '2rem' }}></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          {scenario && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Left: Caller & Media Context */}
              <div className="space-y-4">
                {/* Caller Card */}
                {callerData && (
                  <div className={`bg-slate-800/30 rounded-xl border p-5 animate-in slide-in-from-left-4 duration-500 ${
                    scenarioType === 'deepfake_attack' ? 'border-red-500/50' : 'border-green-500/50'
                  }`}>
                    <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Caller Identity</h4>
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 rounded-full bg-slate-800 ${callerData.color}`} style={{ filter: scenarioType === 'deepfake_attack' ? 'grayscale(1)' : 'none' }}>
                        {callerData.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-lg text-white">{callerData.display_name}</div>
                        <div className="text-sm text-slate-400">{callerData.org_id || 'Unknown Organization'}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-slate-900/50 p-2 rounded border border-slate-700/50">
                        <div className="text-slate-500 text-[10px] uppercase mb-1">Auth Level</div>
                        <div className={`font-medium ${callerData.auth_level === 'HARDWARE_ATTESTED' ? 'text-green-400' : 'text-red-400'}`}>
                          {callerData.auth_level}
                        </div>
                      </div>
                      <div className="bg-slate-900/50 p-2 rounded border border-slate-700/50">
                        <div className="text-slate-500 text-[10px] uppercase mb-1">Device</div>
                        <div className={`font-medium ${callerData.device_attested ? 'text-green-400' : 'text-red-400'}`}>
                          {callerData.device_attested ? <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Attested</span> : <span className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Not Attested</span>}
                        </div>
                      </div>
                      <div className="bg-slate-900/50 p-2 rounded border border-slate-700/50">
                        <div className="text-slate-500 text-[10px] uppercase mb-1">Network Origin</div>
                        <div className={`font-medium ${callerData.network_origin === 'ON_NET' ? 'text-green-400' : 'text-red-400'}`}>
                          {callerData.network_origin}
                        </div>
                      </div>
                      <div className="bg-slate-900/50 p-2 rounded border border-slate-700/50">
                        <div className="text-slate-500 text-[10px] uppercase mb-1">Device ID</div>
                        <div className="text-slate-300 font-mono text-xs truncate" title={callerData.device_id}>{callerData.device_id}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Persona Claim Card */}
                {personaData && (
                  <div className="bg-slate-800/30 rounded-xl border border-slate-700 p-5 animate-in slide-in-from-left-4 duration-500 delay-100">
                    <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Claimed Persona</h4>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-semibold text-white">{personaData.label}</div>
                        <div className="text-xs text-slate-500 font-mono">{personaData.persona_id}</div>
                      </div>
                      <div className={`text-[10px] px-2 py-1 rounded border flex items-center gap-1 ${
                        scenarioType === 'deepfake_attack' 
                          ? 'bg-red-900/50 text-red-400 border-red-500/30' 
                          : 'bg-green-900/50 text-green-400 border-green-500/30'
                      }`}>
                        {scenarioType === 'deepfake_attack' ? <><XCircle className="w-3 h-3" /> NO TOKEN</> : <><CheckCircle2 className="w-3 h-3" /> TOKEN VALID</>}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 mb-2 flex items-center gap-2">
                      <span>Persona Credential:</span>
                      <button 
                        onClick={() => setShowPersonaObj(!showPersonaObj)}
                        className="font-mono text-amber-400 hover:text-amber-300 underline decoration-dotted transition-colors"
                      >
                        {personaData.auth_obj_id}
                      </button>
                    </div>
                    {scenarioType !== 'deepfake_attack' && (
                      <>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {personaData.consent_scope.map((scope: string) => (
                            <span key={scope} className="text-[10px] px-2 py-0.5 rounded bg-blue-900/30 text-blue-400 border border-blue-500/20">
                              {scope}
                            </span>
                          ))}
                        </div>
                        <div className="text-xs text-slate-500 bg-slate-900/50 p-2 rounded border border-slate-700/50">
                          Capability: <span className="font-mono text-green-400">CAN_SPEAK_AS:{personaData.persona_id}</span>
                        </div>
                      </>
                    )}
                    
                    {/* Persona Object JSON Popup */}
                    {showPersonaObj && personaObjects[personaData.persona_id] && (
                      <div className="mt-3 bg-slate-900/90 border border-amber-500/30 rounded-lg p-3 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-amber-400 flex items-center gap-1"><FileText className="w-3 h-3" /> Persona Credential Object</span>
                          <button 
                            onClick={() => setShowPersonaObj(false)}
                            className="text-slate-500 hover:text-white text-xs p-1 hover:bg-slate-800 rounded"
                          >✕</button>
                        </div>
                        <pre className="text-[10px] text-slate-400 overflow-x-auto max-h-48 font-mono custom-scrollbar">
{JSON.stringify(personaObjects[personaData.persona_id], null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Channel Card */}
                {channelData && (
                  <div className="bg-slate-800/30 rounded-xl border border-slate-700 p-5 animate-in slide-in-from-left-4 duration-500 delay-200">
                    <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Target Channel</h4>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-amber-400">{channelData.icon}</div>
                      <div>
                        <div className="font-semibold text-slate-200">{channelData.label}</div>
                        <div className="text-xs text-slate-500">High-impact emergency broadcast</div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 bg-slate-900/50 p-2 rounded border border-slate-700/50">
                      Policy Pack: <span className="font-mono text-amber-400">{channelData.policy_pack}</span>
                    </div>
                  </div>
                )}

                {/* Media Preview */}
                {mediaData && (
                  <div className="bg-slate-800/30 rounded-xl border border-slate-700 p-5 animate-in slide-in-from-left-4 duration-500 delay-300">
                    <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Media Sample</h4>
                    <div className="relative bg-slate-900/50 rounded-lg p-4 overflow-hidden animate-scan-voice border border-slate-700/50">
                      {/* Waveform visualization */}
                      <div className="flex items-center justify-center gap-1 h-16">
                        {[...Array(20)].map((_, i) => (
                          <div 
                            key={i}
                            className={`w-1 bg-amber-400 rounded-full animate-waveform-bar`}
                            style={{ 
                              height: `${20 + Math.random() * 60}%`,
                              animationDelay: `${i * 0.05}s`,
                              opacity: scenario === 'running' ? 1 : 0.3
                            }}
                          ></div>
                        ))}
                      </div>
                      <div className="text-center mt-2 text-xs text-slate-500 font-mono">
                        {mediaData.duration}s • {mediaData.type}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className={`text-[10px] px-2 py-1 rounded border ${
                        mediaData.source === 'SYNTHETIC' 
                          ? 'bg-blue-900/30 text-blue-400 border-blue-500/20' 
                          : 'bg-red-900/30 text-red-400 border-red-500/20'
                      }`}>
                        Source: {mediaData.source}
                      </span>
                      {scenarioType === 'deepfake_attack' && (
                        <span className="text-[10px] px-2 py-1 rounded bg-red-900/30 text-red-400 border border-red-500/20">
                          Unregistered Pipeline
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Gate Decision & Signals */}
              <div className="space-y-4">
                {/* Signals Card */}
                {signals && step >= 4 && (
                  <div className={`bg-slate-800/30 rounded-xl border p-5 animate-in slide-in-from-right-4 duration-500 ${
                    signals.anomaly_flags.length > 0 ? 'border-red-500/50' : 'border-green-500/50'
                  }`}>
                    <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Detection Signals</h4>
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-300">Deepfake Risk Score</span>
                        <span className={`font-bold font-mono ${
                          signals.deepfake_score > 0.95 ? 'text-red-400' : 
                          signals.deepfake_score > 0.8 ? 'text-amber-400' : 'text-green-400'
                        }`}>
                          {(signals.deepfake_score * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            signals.deepfake_score > 0.95 ? 'bg-red-500' : 
                            signals.deepfake_score > 0.8 ? 'bg-amber-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${signals.deepfake_score * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-xs mt-3 bg-slate-900/50 p-3 rounded border border-slate-700/50">
                        {signals.deepfake_score > 0.95 ? (
                          <span className="text-red-400 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            Critical synthetic probability — blocked without valid persona token
                          </span>
                        ) : signals.deepfake_score > 0.8 && scenarioType !== 'deepfake_attack' ? (
                          <span className="text-green-400">
                            <span className="flex items-center gap-1 mb-1"><CheckCircle2 className="w-3 h-3" /> High synthetic probability — <strong>accepted</strong></span>
                            <span className="text-slate-500 block pl-4">Persona token + device attestation valid. Detector is advisory; gate is authoritative.</span>
                          </span>
                        ) : signals.deepfake_score > 0.8 ? (
                          <span className="text-amber-400 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            High synthetic probability — requires valid persona token to proceed
                          </span>
                        ) : (
                          <span className="text-slate-400 flex items-center gap-2">
                            <CheckCircle2 className="w-3 h-3" /> Normal range for authorized synthesis pipelines
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {signals.anomaly_flags.length > 0 && (
                      <div>
                        <div className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Anomaly Flags</div>
                        <div className="flex flex-wrap gap-2">
                          {signals.anomaly_flags.map((flag: string) => (
                            <span key={flag} className="text-[10px] px-2 py-1 rounded bg-red-900/30 text-red-400 border border-red-500/20 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> {flag.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Decision Banner */}
                {decision && (
                  <div className={`rounded-xl p-6 animate-in slide-in-from-bottom-4 duration-500 ${
                    decision.decision === 'ALLOW' 
                      ? 'bg-green-900/20 border-2 border-green-500/50' 
                      : 'bg-red-900/20 border-2 border-red-500/50'
                  }`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 rounded-full ${decision.decision === 'ALLOW' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                        {decision.decision === 'ALLOW' ? <CheckCircle2 className="w-8 h-8 text-green-400" /> : <XCircle className="w-8 h-8 text-red-400" />}
                      </div>
                      <div>
                        <div className={`text-2xl font-bold ${decision.decision === 'ALLOW' ? 'text-green-400' : 'text-red-400'}`}>
                          {decision.decision}
                        </div>
                        <div className="text-slate-300 text-sm">
                          {decision.decision === 'ALLOW' 
                            ? 'Authentic persona, authorized pipeline'
                            : 'Deepfake impersonation blocked'
                          }
                        </div>
                      </div>
                    </div>
                    
                    <div className={`p-4 rounded-lg text-sm border ${
                      decision.decision === 'ALLOW' ? 'bg-green-900/20 border-green-500/20' : 'bg-red-900/20 border-red-500/20'
                    }`}>
                      <strong className={decision.decision === 'ALLOW' ? 'text-green-400' : 'text-red-400'}>
                        {decision.decision === 'ALLOW' ? 'Why it succeeded:' : 'Why it failed:'}
                      </strong>
                      <p className="text-slate-300 mt-1">{decision.reason}</p>
                      {decision.decision === 'DENY' && (
                        <p className="text-red-400 mt-3 font-medium border-t border-red-500/20 pt-2 flex items-center gap-2">
                          <Lock className="w-4 h-4" /> Gate failed closed: no persona token ⇒ <span className="underline">no-token-no-speak</span> for {personaData?.persona_id}
                        </p>
                      )}
                    </div>

                    {/* Outcome */}
                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                      <div className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Channel Action</div>
                      <div className={`font-semibold text-sm flex items-center gap-2 ${decision.decision === 'ALLOW' ? 'text-green-400' : 'text-red-400'}`}>
                        {decision.decision === 'ALLOW' 
                          ? <><Radio className="w-4 h-4" /> DELIVERED to grid operators with "Official + AI Voice" labels</>
                          : <><Shield className="w-4 h-4" /> BLOCKED — Message never reaches operators; SOC notified</>
                        }
                      </div>
                    </div>

                    {/* Rules Applied */}
                    <div className="mt-4">
                      <div className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Rules Applied</div>
                      <div className="space-y-1">
                        {decision.rules.map((rule: string) => (
                          <div key={rule} className="text-[10px] font-mono text-slate-400 bg-slate-800/50 px-2 py-1 rounded border border-slate-700/50">
                            {rule}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* View Receipt Button */}
                {receipt && (
                  <div className="animate-in fade-in duration-500">
                    <button
                      onClick={() => setShowReceipt(!showReceipt)}
                      className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-sm font-medium transition flex items-center justify-center gap-2 text-slate-200"
                    >
                      <FileText className="w-4 h-4" />
                      {showReceipt ? 'Hide' : 'View'} Authenticity Receipt
                    </button>
                  </div>
                )}

                {/* Receipt JSON */}
                {showReceipt && receipt && (
                  <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4 animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-slate-300 font-mono text-xs">PATHWELL_AUTHENTICITY_RECEIPT_V1</h4>
                      <span className="text-[10px] text-slate-500 font-mono">{receipt.receipt_id}</span>
                    </div>
                    <pre className="text-[10px] text-slate-400 overflow-x-auto max-h-96 font-mono custom-scrollbar">
                      {JSON.stringify(receipt, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reset Button */}
          {scenario === 'complete' && (
            <div className="text-center mb-8 animate-in fade-in duration-500">
              <button
                onClick={resetDemo}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-600 px-6 py-3 rounded-lg font-medium transition text-slate-300"
              >
                Reset Demo
              </button>
            </div>
          )}

          {/* Policy Pack Reference */}
          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6 mb-8">
            <h3 className="font-semibold mb-4 text-slate-200 flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                Policy Pack: AUTH_GATE_EMERGENCY_V1
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Persona Requirements</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400"><CheckCircle2 className="w-4 h-4" /></span>
                    <span className="text-slate-300">Valid persona capability token</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400"><CheckCircle2 className="w-4 h-4" /></span>
                    <span className="text-slate-300">Consent scope includes channel</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400"><CheckCircle2 className="w-4 h-4" /></span>
                    <span className="text-slate-300">Hardware-attested device</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Blocking Conditions</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-red-400"><XCircle className="w-4 h-4" /></span>
                    <span className="text-slate-300">Missing persona token</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-400"><XCircle className="w-4 h-4" /></span>
                    <span className="text-slate-300">Unverified device</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-400"><XCircle className="w-4 h-4" /></span>
                    <span className="text-slate-300">Deepfake score &gt; 0.95 without token</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Genesis EO Alignment</h4>
                <div className="space-y-2">
                  <div className="text-[10px] px-2 py-1 rounded bg-blue-900/30 text-blue-400 border border-blue-500/20 inline-block w-full">
                    §3(b) Secure access for AI systems
                  </div>
                  <div className="text-[10px] px-2 py-1 rounded bg-purple-900/30 text-purple-400 border border-purple-500/20 inline-block w-full">
                    §3(a)(v) Information integrity
                  </div>
                  <div className="text-[10px] px-2 py-1 rounded bg-amber-900/30 text-amber-400 border border-amber-500/20 inline-block w-full">
                    §5 National media standards
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Insight */}
          <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 border border-amber-500/30 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400">
                <Lightbulb className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-amber-400">The Constitutional Pattern</h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  This is the same architecture as GeoGate (geolocation) and AquaTreaty (water rights). 
                  The policy pack is pure deterministic rules — no AI in the gate. The "intelligence" is in 
                  the policy object, not a model. The gate just enforces it.
                </p>
                <p className="text-slate-400 text-sm mt-3 border-l-2 border-amber-500/30 pl-4 italic">
                  "Grid2Care protects hospitals from unsafe AI workloads. GeoGate protects locations. 
                  <strong className="text-amber-400 not-italic"> Authenticity Gate protects voices and faces</strong> in 
                  channels where a single deepfake can move markets or grids."
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-slate-500 text-xs border-t border-slate-800 pt-8">
            <p className="font-medium mb-2">AUTHENTICITY GATE™ — Constitutional Front Door for Synthetic Media</p>
            <p className="mb-4">
              <span className="text-amber-400">Persona Tokens</span> + <span className="text-orange-400">Device Attestation</span> + <span className="text-cyan-400">Cryptographic Receipts</span>
            </p>
            <p className="text-slate-600">
              "AI can clone any voice. Authenticity Gate ensures only authorized voices reach critical channels."
            </p>
            <p className="mt-4 text-slate-700">© 2025 AnchorTrust Holdings LLC — PATHWELL CONNECT™</p>
          </div>
        </div>
      </div>
    </div>
  );
}

