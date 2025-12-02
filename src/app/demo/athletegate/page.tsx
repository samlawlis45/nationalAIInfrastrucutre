"use client";

import React, { useState, useCallback } from 'react';
import { ChevronLeft, Shield, CheckCircle2, XCircle, FileText, Briefcase, Clock, Wallet, Building2, Flag, Users, Activity, Trophy, Utensils, DollarSign, RotateCcw, ArrowRight, Check, AlertTriangle, Scale } from 'lucide-react';
import Link from 'next/link';

export default function AthleteGateDemo() {
  const [activeView, setActiveView] = useState<'athlete' | 'program' | 'national'>('athlete');
  
  // Athlete View State
  const [walletBalance, setWalletBalance] = useState({ available: 8000, pending: 12000 });
  const [agentFee, setAgentFee] = useState(5);
  const [contractBlocked, setContractBlocked] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [proofSubmitted, setProofSubmitted] = useState(false);
  const [showAthleteReceipt, setShowAthleteReceipt] = useState(false);
  const [contractSigned, setContractSigned] = useState(false);
  const [hoursWorked, setHoursWorked] = useState(2);
  
  // Program View State
  const [showTitleIXReceipt, setShowTitleIXReceipt] = useState(false);
  const [selectedSportId, setSelectedSportId] = useState('football_m');
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);
  const [showSportReceipt, setShowSportReceipt] = useState(false);
  
  // Sports data for drill-down
  const sports = [
    { id: 'football_m', name: 'Football', gender: 'M', athletes: 85, totalSupport: 18000000, nilTotal: 12400000, avgSupport: 211765 },
    { id: 'mbb_m', name: "Men's Basketball", gender: 'M', athletes: 15, totalSupport: 4200000, nilTotal: 3100000, avgSupport: 280000 },
    { id: 'wbb_f', name: "Women's Basketball", gender: 'F', athletes: 15, totalSupport: 3800000, nilTotal: 1200000, avgSupport: 253333 },
    { id: 'softball_f', name: 'Softball', gender: 'F', athletes: 22, totalSupport: 3200000, nilTotal: 280000, avgSupport: 145455 },
    { id: 'wsoccer_f', name: "Women's Soccer", gender: 'F', athletes: 28, totalSupport: 2100000, nilTotal: 150000, avgSupport: 75000 },
    { id: 'track_mf', name: 'Track & Field', gender: 'M/F', athletes: 65, totalSupport: 2800000, nilTotal: 95000, avgSupport: 43077 },
  ];
  
  // Sample athletes per sport
  const sportAthletes: Record<string, any[]> = {
    football_m: [
      { id: 'fb1', name: 'Athlete 72', position: 'OL', year: 'Jr', totalSupport: 260000, fromNil: 160000, fromScholarship: 100000, hours: 48, flags: [] },
      { id: 'fb2', name: 'Athlete 11', position: 'QB', year: 'Sr', totalSupport: 340000, fromNil: 240000, fromScholarship: 100000, hours: 35, flags: [] },
      { id: 'fb3', name: 'Athlete 24', position: 'RB', year: 'Fr', totalSupport: 145000, fromNil: 45000, fromScholarship: 100000, hours: 12, flags: ['blocked_deal'] },
      { id: 'fb4', name: 'Athlete 88', position: 'WR', year: 'So', totalSupport: 180000, fromNil: 80000, fromScholarship: 100000, hours: 28, flags: [] },
    ],
    mbb_m: [
      { id: 'mbb1', name: 'Athlete 1', position: 'PG', year: 'Jr', totalSupport: 320000, fromNil: 220000, fromScholarship: 100000, hours: 42, flags: [] },
      { id: 'mbb2', name: 'Athlete 23', position: 'SF', year: 'Sr', totalSupport: 280000, fromNil: 180000, fromScholarship: 100000, hours: 38, flags: [] },
    ],
    wbb_f: [
      { id: 'wbb1', name: 'Athlete 3', position: 'G', year: 'Sr', totalSupport: 255000, fromNil: 155000, fromScholarship: 100000, hours: 52, flags: [] },
      { id: 'wbb2', name: 'Athlete 15', position: 'C', year: 'Jr', totalSupport: 210000, fromNil: 110000, fromScholarship: 100000, hours: 44, flags: [] },
    ],
    softball_f: [
      { id: 'sb1', name: 'Athlete 5', position: 'P', year: 'Jr', totalSupport: 145000, fromNil: 45000, fromScholarship: 100000, hours: 40, flags: [] },
      { id: 'sb2', name: 'Athlete 9', position: 'C', year: 'So', totalSupport: 135000, fromNil: 35000, fromScholarship: 100000, hours: 32, flags: [] },
      { id: 'sb3', name: 'Athlete 22', position: 'SS', year: 'Fr', totalSupport: 115000, fromNil: 15000, fromScholarship: 100000, hours: 18, flags: [] },
    ],
    wsoccer_f: [
      { id: 'ws1', name: 'Athlete 10', position: 'MF', year: 'Sr', totalSupport: 95000, fromNil: 20000, fromScholarship: 75000, hours: 24, flags: [] },
      { id: 'ws2', name: 'Athlete 7', position: 'FW', year: 'Jr', totalSupport: 85000, fromNil: 15000, fromScholarship: 70000, hours: 20, flags: [] },
    ],
    track_mf: [
      { id: 'tr1', name: 'Athlete 44', position: 'Sprints', year: 'Sr', totalSupport: 55000, fromNil: 10000, fromScholarship: 45000, hours: 15, flags: [] },
      { id: 'tr2', name: 'Athlete 31', position: 'Distance', year: 'Jr', totalSupport: 48000, fromNil: 8000, fromScholarship: 40000, hours: 12, flags: [] },
    ],
  };
  
  const selectedSport = sports.find(s => s.id === selectedSportId);
  const selectedSportAthletes = sportAthletes[selectedSportId] || [];
  const selectedAthlete = selectedSportAthletes.find(a => a.id === selectedAthleteId) || null;
  
  // National View State
  const [showNationalReceipt, setShowNationalReceipt] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState('all');
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  // Handle agent fee change
  const handleAgentFeeChange = useCallback((value: number) => {
    setAgentFee(value);
    setContractBlocked(value > 5);
    setContractSigned(false); // Reset if fee changes
  }, []);

  // Handle contract signing
  const handleSignContract = useCallback(() => {
    if (!contractBlocked) {
      setContractSigned(true);
      setTimeout(() => {
        setWalletBalance(prev => ({
          available: prev.available,
          pending: prev.pending + 25000
        }));
      }, 300);
    }
  }, [contractBlocked]);

  // Handle check-in
  const handleCheckIn = useCallback(() => {
    setCheckedIn(true);
  }, []);

  // Handle proof submission
  const handleProofSubmit = useCallback(() => {
    setProofSubmitted(true);
    const payout = hoursWorked * 1000; // $1000 per hour
    setTimeout(() => {
      setWalletBalance(prev => ({
        available: prev.available + payout,
        pending: prev.pending - payout
      }));
    }, 500);
  }, [hoursWorked]);

  // Reset athlete scenario
  const resetAthleteScenario = useCallback(() => {
    setCheckedIn(false);
    setProofSubmitted(false);
    setAgentFee(5);
    setContractBlocked(false);
    setContractSigned(false);
    setHoursWorked(2);
    setWalletBalance({ available: 8000, pending: 12000 });
    setShowAthleteReceipt(false);
  }, []);

  // Generate Proof of Work Receipt
  const generateProofOfWorkReceipt = () => ({
    schema_version: "NIL_PROOF_OF_WORK_RECEIPT_V1",
    receipt_id: `nil-pow-${Date.now().toString(36).toUpperCase()}`,
    athlete_id: "ATHLETE_INST_A_72",
    contract_id: "NIL-COLLECTIVE-2026-001",
    event_id: "CHARITY_FOOD_BANK_03",
    timestamp: new Date().toISOString(),
    work_reported_hours: hoursWorked,
    location: {
      lat: 33.5779,
      lon: -101.8552,
      geofence_id: "PARTNER_FOOD_BANK_01",
      geofence_verified: true
    },
    verifications: {
      device_attested: true,
      operator_check: "AUTO",
      photo_upload: false,
      witness_signature: null
    },
    payout: {
      amount_usd: hoursWorked * 1000,
      released_at: new Date().toISOString(),
      destination: "ATHLETE_WALLET_INST_A_72"
    },
    policy: {
      policy_pack_id: "NIL_COMPLIANCE_CONF1_V1",
      rules_applied: [
        "REQUIRE_GEOFENCE_VERIFICATION",
        "REQUIRE_MIN_1_HOUR",
        "AUTO_RELEASE_ON_VERIFICATION"
      ]
    },
    audit: {
      ledger_node: "INSTITUTION_A_LEDGER_01",
      merkle_root: `0x${Array.from({length: 16}, () => Math.random().toString(16).slice(2, 4)).join('')}`,
      block_height: 847291
    }
  });

  // Generate Title IX Receipt
  const generateTitleIXReceipt = () => ({
    schema_version: "TITLEIX_SUMMARY_RECEIPT_V1",
    receipt_id: `t9-${Date.now().toString(36).toUpperCase()}`,
    institution_id: "INSTITUTION_A",
    fiscal_year: "2026",
    reporting_period: "Q1",
    sports: [
      { sport: "Football", gender: "M", athletes: 85, total_support_usd: 18000000, nil_total_usd: 12400000 },
      { sport: "Men's Basketball", gender: "M", athletes: 15, total_support_usd: 4200000, nil_total_usd: 3100000 },
      { sport: "Women's Basketball", gender: "F", athletes: 15, total_support_usd: 3800000, nil_total_usd: 1200000 },
      { sport: "Softball", gender: "F", athletes: 22, total_support_usd: 3200000, nil_total_usd: 280000 },
      { sport: "Women's Soccer", gender: "F", athletes: 28, total_support_usd: 2100000, nil_total_usd: 150000 },
      { sport: "Track & Field", gender: "M/F", athletes: 65, total_support_usd: 2800000, nil_total_usd: 95000 },
      { sport: "Swimming", gender: "M/F", athletes: 42, total_support_usd: 1900000, nil_total_usd: 45000 }
    ],
    equity_metrics: {
      total_male_athletes: 142,
      total_female_athletes: 130,
      per_male_athlete_usd: 156338,
      per_female_athlete_usd: 152307,
      gender_ratio: 0.974,
      compliance_status: "WITHIN_TOLERANCE",
      tolerance_threshold: 0.95
    },
    nil_compliance: {
      total_nil_contracts: 847,
      verified_work_pct: 93,
      pending_pct: 5,
      blocked_escrowed_pct: 2,
      avg_agent_fee_pct: 4.2
    },
    policy: {
      policy_pack_id: "TITLEIX_CONF1_V1",
      rules_applied: [
        "GENDER_EQUITY_FLOOR_95PCT",
        "OLYMPIC_SPORTS_PRESERVATION",
        "NIL_TRANSPARENCY_REQUIREMENT"
      ]
    },
    audit: {
      merkle_root: `0x${Array.from({length: 16}, () => Math.random().toString(16).slice(2, 4)).join('')}`,
      generated_by_node: "INSTITUTION_A_LEDGER_01",
      timestamp: new Date().toISOString()
    }
  });

  // Generate Sport Support Summary Receipt
  const generateSportSummaryReceipt = (sport: any) => ({
    schema_version: "SPORT_SUPPORT_SUMMARY_RECEIPT_V1",
    receipt_id: `sport-${sport.id}-${Date.now().toString(36).toUpperCase()}`,
    institution_id: "INSTITUTION_A",
    sport: sport.name,
    sport_code: sport.id.toUpperCase(),
    gender: sport.gender,
    athletes: sport.athletes,
    financials: {
      total_support_usd: sport.totalSupport,
      nil_total_usd: sport.nilTotal,
      scholarship_total_usd: sport.totalSupport - sport.nilTotal,
      per_athlete_avg_usd: sport.avgSupport,
      nil_share_pct: Math.round((sport.nilTotal / sport.totalSupport) * 100)
    },
    compliance: {
      nil_contracts_count: Math.floor(sport.athletes * 0.8),
      verified_work_pct: 93,
      blocked_deals: sport.id === 'football_m' ? 2 : 0,
      community_hours_total: sport.athletes * 25
    },
    title_ix_contribution: {
      included_in_summary: true,
      gender_category: sport.gender === 'F' ? 'female' : sport.gender === 'M' ? 'male' : 'mixed',
      equity_weight: sport.totalSupport
    },
    underlying_receipts: {
      nil_contracts: Math.floor(sport.athletes * 0.8),
      proof_of_work: Math.floor(sport.athletes * 25),
      payouts: Math.floor(sport.athletes * 0.8 * 4),
      merkle_root: `0x${Array.from({length: 16}, () => Math.random().toString(16).slice(2, 4)).join('')}`
    },
    audit: {
      generated_by_node: "INSTITUTION_A_LEDGER_01",
      timestamp: new Date().toISOString()
    }
  });

  // Generate National Contract Receipt (uses selectedRow if available)
  const generateNationalReceipt = () => {
    const inst = selectedRow || { institution: "Institution A", conference: "Conf 1", contracts: 847 };
    const instId = inst.institution.toUpperCase().replace(/\s+/g, '_');
    const confId = inst.conference.toUpperCase().replace(/\s+/g, '_');
    return {
      schema_version: "NIL_CONTRACT_RECEIPT_V1",
      receipt_id: `nil-nat-${Date.now().toString(36).toUpperCase()}`,
      contract_id: `NIL-${instId}-2026-${Math.floor(Math.random() * 999).toString().padStart(3, '0')}`,
      institution_id: instId,
      conference_id: confId,
      athlete_id: `REDACTED_HASH_${Array.from({length: 8}, () => Math.random().toString(16).slice(2, 3)).join('')}`,
      sport: "Football",
      position: "Offensive Line",
      class_year: "Junior",
      agent: {
        agent_id: `AGENT_CERT_${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`,
        certification_status: "VERIFIED",
        certification_body: "NATIONAL_AGENT_REGISTRY"
      },
      financials: {
        total_amount_usd: 20000,
        agent_fee_percent: 5,
        agent_fee_usd: 1000,
        athlete_net_usd: 19000,
        payment_schedule: "PER_DELIVERABLE"
      },
      deliverables: [
        { type: "CHARITY_APPEARANCE", count: 10, per_unit_usd: 2000 }
      ],
      work_status: {
        completed: 4,
        remaining: 6,
        next_event: "2026-03-28T14:00:00Z"
      },
      policy: {
        policy_pack_id: "FED_NIL_STANDARD_V1",
        conference_policy_id: "CONF1_NIL_V1",
        institution_policy_id: "INST_A_NIL_V1",
        rules_applied: [
          "AGENT_FEE_CAP_5PCT",
          "REQUIRE_PROOF_OF_WORK",
          "REQUIRE_CERTIFIED_AGENT",
          "AUTO_ESCROW_ON_SIGNING"
        ]
      },
      privacy: {
        pseudonymization: true,
        pii_fields_redacted: ["name", "address", "ssn"],
        audit_access_only: ["institution_compliance", "conference_office", "federal_audit"]
      },
      audit: {
        contract_hash: `0x${Array.from({length: 16}, () => Math.random().toString(16).slice(2, 4)).join('')}`,
        ledger_node: `${instId}_LEDGER_01`,
        federal_mirror: "NATIONAL_NIL_LEDGER_01",
        timestamp: new Date().toISOString()
      }
    };
  };

  // Blocked contracts data for Program View
  const blockedContracts = [
    { sport: "Football", position: "RB", class: "Freshman", reason: "Agent fee 22%", amount: 45000, resolution: "Re-signed at 5%" },
    { sport: "Football", position: "WR", class: "Transfer", reason: "Uncertified agent", amount: 28000, resolution: "Escrowed pending certification" },
    { sport: "Basketball", position: "G", class: "Sophomore", reason: "No proof of work", amount: 15000, resolution: "Work requirement added" },
  ];

  // National audit data
  const nationalData = [
    { institution: "Institution A", conference: "Conf 1", contracts: 847, verified: "93%", blocked: "$690K", titleix: "✓" },
    { institution: "Institution B", conference: "Conf 1", contracts: 612, verified: "91%", blocked: "$420K", titleix: "✓" },
    { institution: "Institution C", conference: "Conf 2", contracts: 534, verified: "89%", blocked: "$580K", titleix: "⚠" },
    { institution: "Institution D", conference: "Conf 2", contracts: 723, verified: "94%", blocked: "$310K", titleix: "✓" },
    { institution: "Institution E", conference: "Conf 3", contracts: 445, verified: "87%", blocked: "$720K", titleix: "⚠" },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans">
      <style jsx global>{`
        @keyframes blocked-flash {
          0%, 100% { background-color: rgba(239, 68, 68, 0.1); }
          50% { background-color: rgba(239, 68, 68, 0.3); }
        }
        .animate-blocked-flash { animation: blocked-flash 0.5s ease-out 3; }
        
        @keyframes success-flash {
          0%, 100% { background-color: rgba(34, 197, 94, 0.1); }
          50% { background-color: rgba(34, 197, 94, 0.3); }
        }
        .animate-success-flash { animation: success-flash 0.5s ease-out 2; }
        
        .grid-pattern { 
          background-image: radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.05) 1px, transparent 0);
          background-size: 24px 24px;
        }
      `}</style>

      <div className="grid-pattern min-h-screen pt-20">
        {/* View Tabs */}
        <div className="sticky top-16 z-40 bg-[#0f172a]/90 backdrop-blur-sm border-b border-slate-800/50 mb-8">
          <div className="max-w-7xl mx-auto px-4 py-3 flex justify-center">
            <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1 overflow-x-auto">
              <button
                onClick={() => setActiveView('athlete')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${
                  activeView === 'athlete' 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Activity className="w-4 h-4" /> Athlete
              </button>
              <button
                onClick={() => setActiveView('program')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${
                  activeView === 'program' 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Building2 className="w-4 h-4" /> Program
              </button>
              <button
                onClick={() => setActiveView('national')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${
                  activeView === 'national' 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Flag className="w-4 h-4" /> National
              </button>
            </div>
          </div>
        </div>

        {/* Hero */}
        <section className="py-12 px-4 border-b border-slate-800">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full text-blue-400 text-sm mb-4">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              PATHWELL CONNECT™ Governance Demo
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-blue-400">Athlete</span><span className="text-cyan-400">Gate</span>
            </h1>
            <p className="text-xl text-slate-300 mb-2">Constitutional NIL Ledger for College Athletics</p>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Legislation sets the rules. AthleteGate provides the rails: signed identities, portable policies, 
              and receipts for every dollar that flows through college sports.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          
          {/* ==================== ATHLETE VIEW ==================== */}
          {activeView === 'athlete' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2 text-slate-200">Athlete View</h2>
                <p className="text-slate-400">Do the work. Get paid instantly. Every transaction verified, every dollar tracked.</p>
              </div>
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Left Column - Wallet & Contracts */}
                <div className="space-y-4">
                  {/* Athlete Card */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-3xl shadow-lg shadow-blue-900/20">
                        <Trophy className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-lg text-white">Student Athlete #72</div>
                        <div className="text-slate-400 text-sm">Football • Offensive Line • Junior</div>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Verified Athlete
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            Eligible
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 cursor-help" title="If you transfer, your NIL receipts travel with you">
                            📋 Portable History
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Wallet Balance */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                    <h3 className="text-sm text-slate-400 mb-3 flex items-center gap-2"><Wallet className="w-4 h-4" /> Sovereign Athlete Wallet</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                        <div className="text-xs text-green-400 mb-1 uppercase font-semibold">Available Now</div>
                        <div className="text-2xl font-bold text-green-400">${walletBalance.available.toLocaleString()}</div>
                      </div>
                      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                        <div className="text-xs text-yellow-400 mb-1 uppercase font-semibold">Pending</div>
                        <div className="text-2xl font-bold text-yellow-400">${walletBalance.pending.toLocaleString()}</div>
                        <div className="text-[10px] text-slate-500 mt-1">Events remaining across contracts</div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-3 italic">Payments release automatically when work is verified.</p>
                  </div>

                  {/* Active Contracts */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                    <h3 className="text-sm text-slate-400 mb-3 flex items-center gap-2"><FileText className="w-4 h-4" /> Active NIL Contracts</h3>
                    <div className="space-y-2">
                      <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-600">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-slate-200">Regional Collective</div>
                            <div className="text-xs text-slate-500">Local Charity Program</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-400">$20,000</div>
                            <div className="text-xs text-slate-500">10 appearances</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{width: '40%'}}></div>
                          </div>
                          <span className="text-xs text-slate-400">4/10 complete</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sign New Deal */}
                  <div className={`bg-slate-800/50 border rounded-xl p-5 transition-colors duration-300 ${
                    contractBlocked ? 'border-red-500/50 animate-blocked-flash' : 'border-slate-700'
                  }`}>
                    <h3 className="text-sm text-slate-400 mb-3 flex items-center gap-2"><Briefcase className="w-4 h-4" /> Sign New NIL Deal</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Collective / Brand</label>
                        <select className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition">
                          <option>Regional Collective – Charity Program</option>
                          <option>Local Auto Dealer – Appearances</option>
                          <option>Sports Drink Brand – Social Media</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-slate-500 mb-1 block">Total Amount</label>
                          <input type="text" value="$25,000" readOnly className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-300 cursor-not-allowed" />
                        </div>
                        <div>
                          <label className="text-xs text-slate-500 mb-1 block">Appearances</label>
                          <input type="text" value="12" readOnly className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-300 cursor-not-allowed" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 mb-1 block">Agent Fee: <span className={agentFee > 5 ? 'text-red-400 font-bold' : 'text-white'}>{agentFee}%</span></label>
                        <input 
                          type="range" 
                          min="0" 
                          max="25" 
                          value={agentFee}
                          onChange={(e) => handleAgentFeeChange(parseInt(e.target.value))}
                          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                          <span>0%</span>
                          <span className="text-green-400 font-medium">5% cap</span>
                          <span>25%</span>
                        </div>
                      </div>

                      {/* Compliance Status */}
                      {contractSigned ? (
                        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 animate-success-flash">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 text-sm font-medium">Contract Signed!</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 ml-6">$25,000 added to pending. 12 appearances scheduled.</p>
                        </div>
                      ) : !contractBlocked ? (
                        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 text-sm font-medium">Compliant</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 ml-6">Agent fee within 5% standard. Contract can proceed.</p>
                        </div>
                      ) : (
                        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-red-400" />
                            <span className="text-red-400 text-sm font-medium">Blocked</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 ml-6">
                            Agent fee ({agentFee}%) exceeds 5% cap. Adjust terms to proceed.
                          </p>
                          <p className="text-xs text-red-400 mt-2 font-medium ml-6 border-t border-red-500/20 pt-2">
                            🔒 Economic gate failed closed: no-compliance-no-payment
                          </p>
                        </div>
                      )}

                      <button 
                        onClick={handleSignContract}
                        disabled={contractBlocked || contractSigned}
                        className={`w-full py-3 rounded-lg font-medium transition-all transform active:scale-[0.98] ${
                          contractBlocked 
                            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            : contractSigned
                            ? 'bg-green-600 text-white cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                        }`}
                      >
                        {contractBlocked ? 'Contract Blocked' : contractSigned ? '✓ Contract Signed' : 'Sign Contract'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column - Do the Work */}
                <div className="space-y-4">
                  {/* Upcoming Work */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                    <h3 className="text-sm text-slate-400 mb-3 flex items-center gap-2"><Clock className="w-4 h-4" /> Next Scheduled Event</h3>
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-blue-500/30 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-10">
                        <Briefcase className="w-24 h-24 text-blue-500" />
                      </div>
                      <div className="flex items-center gap-3 mb-3 relative z-10">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-2xl border border-blue-500/30">
                          <Utensils className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                          <div className="font-medium text-white">Community Food Bank Appearance</div>
                          <div className="text-sm text-slate-400">Saturday, March 28 • 2:00 PM</div>
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 mb-4 relative z-10 flex items-center gap-2">
                        <span className="bg-slate-800 px-2 py-1 rounded">📍 Partner Food Bank</span>
                        <span className="bg-slate-800 px-2 py-1 rounded">2 hours required</span>
                        <span className="bg-green-900/20 text-green-400 px-2 py-1 rounded border border-green-500/20">$2,000 payout</span>
                      </div>
                      
                      {!checkedIn ? (
                        <button 
                          onClick={handleCheckIn}
                          className="w-full bg-blue-600 hover:bg-blue-500 py-2 rounded-lg font-medium transition text-white relative z-10 shadow-lg shadow-blue-900/20"
                        >
                          📍 Check In & Log Hours
                        </button>
                      ) : !proofSubmitted ? (
                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300 relative z-10">
                          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-green-400 text-sm">
                              <CheckCircle2 className="w-4 h-4" /> Location verified: Inside event geofence
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-slate-500 mb-1 block">Hours Worked</label>
                            <div className="flex items-center gap-3">
                              <input 
                                type="range" 
                                min="1" 
                                max="4" 
                                value={hoursWorked}
                                onChange={(e) => setHoursWorked(parseInt(e.target.value))}
                                className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500" 
                              />
                              <span className="text-lg font-bold text-white w-16 text-right">{hoursWorked} hrs</span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1 text-right">Payout: <span className="text-green-400">${(hoursWorked * 1000).toLocaleString()}</span></div>
                          </div>
                          <button 
                            onClick={handleProofSubmit}
                            className="w-full bg-green-600 hover:bg-green-500 py-2 rounded-lg font-medium transition text-white shadow-lg shadow-green-900/20"
                          >
                            ✓ Submit Proof of Work
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3 animate-success-flash rounded-lg p-3 relative z-10">
                          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 text-center flex flex-col items-center">
                            <DollarSign className="w-8 h-8 text-green-400 mb-2" />
                            <div className="text-green-400 font-bold text-lg">${(hoursWorked * 1000).toLocaleString()} Released!</div>
                            <div className="text-slate-400 text-sm mt-1">Proof-of-Work Receipt issued</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Receipt Viewer */}
                  {proofSubmitted && (
                    <div className="animate-in fade-in duration-500">
                      <button
                        onClick={() => setShowAthleteReceipt(!showAthleteReceipt)}
                        className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-sm font-medium transition flex items-center justify-center gap-2 text-slate-300 hover:text-white"
                      >
                        <FileText className="w-4 h-4" />
                        {showAthleteReceipt ? 'Hide' : 'View'} Proof-of-Work Receipt
                      </button>
                      
                      {showAthleteReceipt && (
                        <div className="mt-4 bg-slate-900/80 border border-slate-700 rounded-xl p-4 animate-in zoom-in-95 duration-200">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-blue-400 font-mono">NIL_PROOF_OF_WORK_RECEIPT_V1</span>
                          </div>
                          <pre className="text-[10px] text-slate-400 overflow-x-auto max-h-64 font-mono custom-scrollbar">
{JSON.stringify(generateProofOfWorkReceipt(), null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Key Message */}
                  <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-xl p-5">
                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-400">
                      <Shield className="w-4 h-4" /> The Constitutional Difference
                    </h4>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      If athletes do the charity work, they get paid instantly under a clean 5% cap. 
                      If an agent tries to take 20% or the work never happens, the fabric blocks the money 
                      instead of hoping compliance catches it later.
                    </p>
                  </div>

                  {/* Reset Button */}
                  <button 
                    onClick={resetAthleteScenario}
                    className="w-full text-slate-500 hover:text-white text-sm transition flex items-center justify-center gap-2 py-2"
                  >
                    <RotateCcw className="w-4 h-4" /> Reset scenario
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== PROGRAM VIEW ==================== */}
          {activeView === 'program' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2 text-slate-200">Program View</h2>
                <p className="text-slate-400">Athletic Director / University Governance — prove compliance to the Board with real-time data.</p>
              </div>

              {/* Row 1 - System Health */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                  <div className="text-sm text-slate-400 mb-2">Athletics Operating Health</div>
                  <div className="text-2xl font-bold text-yellow-400 mb-1">-$5.8M</div>
                  <div className="text-xs text-slate-500 mb-3">Current deficit (was $20M national avg)</div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full" style={{width: '71%'}}></div>
                  </div>
                  <div className="text-xs text-slate-500 mt-2 flex justify-between">
                    <span>Current</span>
                    <span>Target: balanced by 2028</span>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 border border-green-500/30 rounded-xl p-5">
                  <div className="text-sm text-slate-400 mb-2">Sports Sustainability</div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300">Women's sports funding</span>
                        <span className="text-green-400 font-bold">104%</span>
                      </div>
                      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{width: '100%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300">Olympic sports funding</span>
                        <span className="text-yellow-400 font-bold">97%</span>
                      </div>
                      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500 rounded-full" style={{width: '97%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 border border-green-500/30 rounded-xl p-5">
                  <div className="text-sm text-slate-400 mb-2">External Debt / PE Exposure</div>
                  <div className="text-3xl font-bold text-green-400 mb-1">0%</div>
                  <div className="text-xs text-slate-500">Private equity liens on media rights</div>
                  <div className="mt-3 text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded border border-green-500/20 inline-block">
                    Avoided 16% implied interest vs PE deals
                  </div>
                </div>
              </div>

              {/* Row 2 - NIL & Compliance */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                  <div className="text-sm text-slate-400 mb-3">NIL Flow & Compliance</div>
                  <div className="text-2xl font-bold text-white mb-3">$63.2M <span className="text-sm font-normal text-slate-500">this season</span></div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-green-900/20 rounded-lg p-3 text-center border border-green-500/20">
                      <div className="text-xl font-bold text-green-400">93%</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wide mt-1">Verified Work</div>
                    </div>
                    <div className="bg-yellow-900/20 rounded-lg p-3 text-center border border-yellow-500/20">
                      <div className="text-xl font-bold text-yellow-400">5%</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wide mt-1">Pending</div>
                    </div>
                    <div className="bg-red-900/20 rounded-lg p-3 text-center border border-red-500/20">
                      <div className="text-xl font-bold text-red-400">2%</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wide mt-1">Blocked</div>
                    </div>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-500 text-xs border-b border-slate-700/50">
                        <th className="text-left pb-2 font-medium">Reason</th>
                        <th className="text-right pb-2 font-medium">Count</th>
                        <th className="text-right pb-2 font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-300">
                      <tr className="border-b border-slate-800/50"><td className="py-2">Excess agent fee</td><td className="text-right py-2">17</td><td className="text-right text-red-400 py-2">$480K</td></tr>
                      <tr className="border-b border-slate-800/50"><td className="py-2">No proof of work</td><td className="text-right py-2">9</td><td className="text-right text-red-400 py-2">$210K</td></tr>
                      <tr><td className="py-2">Pay-for-play flag</td><td className="text-right py-2">3</td><td className="text-right text-red-400 py-2">$600K</td></tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                  <div className="text-sm text-slate-400 mb-3">Agent Practices</div>
                  
                  <div className="flex items-center gap-6 mb-4">
                    <div className="w-24 h-24 relative">
                      <svg viewBox="0 0 36 36" className="w-24 h-24 transform -rotate-90">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none" stroke="#334155" strokeWidth="3" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray="78, 100" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold text-white">78%</span>
                      </div>
                    </div>
                    <div className="text-sm flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                          <span className="text-slate-300">Certified agents</span>
                        </div>
                        <span className="font-medium text-white">78%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 bg-slate-600 rounded-full"></span>
                          <span className="text-slate-400">Uncertified</span>
                        </div>
                        <span className="font-medium text-slate-400">22%</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-semibold">Recent blocked contracts</div>
                  <div className="space-y-2">
                    {blockedContracts.map((c, i) => (
                      <div key={i} className="bg-slate-900/50 rounded-lg p-3 text-xs border border-slate-700 hover:border-slate-600 transition-colors">
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-300 font-medium">{c.sport} – {c.position} – {c.class}</span>
                          <span className="text-red-400 font-mono">${(c.amount/1000).toFixed(0)}K</span>
                        </div>
                        <div className="text-slate-500 flex items-center gap-1">
                          <span>{c.reason}</span>
                          <ArrowRight className="w-3 h-3" />
                          <span className="text-green-400">{c.resolution}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 3 - Sport → Athlete Drill-down */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-slate-400 font-medium">Program → Sport → Athlete Provenance</div>
                  <div className="text-xs text-slate-500">
                    Drill down from sport-level support into individual athletes and their receipts
                  </div>
                </div>
                <div className="grid xl:grid-cols-3 gap-4">
                  {/* Left: Sports List */}
                  <div className="space-y-2">
                    <div className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-semibold">Sports Overview</div>
                    {sports.map(sport => (
                      <button
                        key={sport.id}
                        onClick={() => { setSelectedSportId(sport.id); setSelectedAthleteId(null); setShowSportReceipt(false); }}
                        className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-all duration-200 ${
                          sport.id === selectedSportId
                            ? 'border-blue-500/60 bg-blue-900/20 text-white shadow-md shadow-blue-900/10'
                            : 'border-slate-700 bg-slate-900/40 text-slate-300 hover:border-slate-500 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${sport.gender === 'F' ? 'bg-pink-500' : sport.gender === 'M' ? 'bg-blue-500' : 'bg-purple-500'}`}></span>
                              {sport.name}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {sport.athletes} athletes
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-slate-200">${(sport.totalSupport / 1_000_000).toFixed(1)}M</div>
                            <div className="text-[10px] text-green-400 font-mono">${(sport.nilTotal / 1_000_000).toFixed(1)}M NIL</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Middle: Athlete Table */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                        {selectedSport ? `${selectedSport.name} – Athletes` : 'Select a sport'}
                      </div>
                      {selectedSport && (
                        <div className="text-xs text-slate-500">
                          Avg: <span className="text-white font-mono">${Math.round(selectedSport.avgSupport).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    <div className="bg-slate-900/60 rounded-lg border border-slate-700 overflow-hidden custom-scrollbar max-h-[300px] overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-900/90 text-slate-500 sticky top-0 z-10 backdrop-blur-sm">
                          <tr>
                            <th className="text-left px-3 py-2 font-medium">Athlete</th>
                            <th className="text-right px-3 py-2 font-medium">Total</th>
                            <th className="text-right px-3 py-2 font-medium">NIL</th>
                            <th className="text-right px-3 py-2 font-medium">Hrs</th>
                            <th className="text-right px-3 py-2 font-medium">Flag</th>
                          </tr>
                        </thead>
                        <tbody className="text-slate-300">
                          {selectedSportAthletes.map(a => (
                            <tr
                              key={a.id}
                              onClick={() => setSelectedAthleteId(a.id)}
                              className={`cursor-pointer hover:bg-slate-800/80 transition border-b border-slate-800/50 last:border-0 ${
                                a.id === selectedAthleteId ? 'bg-slate-800/80 border-l-2 border-l-blue-500' : 'border-l-2 border-l-transparent'
                              }`}
                            >
                              <td className="px-3 py-2">
                                <div className="font-medium text-slate-200">{a.name}</div>
                                <div className="text-[10px] text-slate-500">{a.position} • {a.year}</div>
                              </td>
                              <td className="px-3 py-2 text-right font-mono text-slate-400">${(a.totalSupport/1000).toFixed(0)}K</td>
                              <td className="px-3 py-2 text-right text-green-400 font-mono">${(a.fromNil/1000).toFixed(0)}K</td>
                              <td className="px-3 py-2 text-right">{a.hours}</td>
                              <td className="px-3 py-2 text-right">
                                {a.flags.includes('blocked_deal') && (
                                  <span className="px-1.5 py-0.5 text-[9px] rounded bg-red-900/40 text-red-300 border border-red-500/40">
                                    blocked
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                          {selectedSportAthletes.length === 0 && (
                            <tr><td colSpan={5} className="px-3 py-8 text-center text-slate-500 italic">No sample athletes for this sport.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    <div className="text-[10px] text-slate-500 italic text-center mt-1">
                      Click an athlete to see how their receipts roll up into Title IX summaries.
                    </div>
                  </div>

                  {/* Right: Sport Summary + Receipt */}
                  <div className="space-y-3">
                    <div className="bg-slate-900/60 rounded-lg border border-slate-700 p-4 h-full">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Sport Summary</div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Included in Title IX
                        </span>
                      </div>
                      {selectedSport && (
                        <>
                          <div className="font-semibold text-sm mb-3 flex items-center gap-2 text-white">
                            <span className={`w-2 h-2 rounded-full ${selectedSport.gender === 'F' ? 'bg-pink-500' : selectedSport.gender === 'M' ? 'bg-blue-500' : 'bg-purple-500'}`}></span>
                            {selectedSport.name}
                          </div>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between text-slate-400 p-1.5 rounded hover:bg-slate-800/50">
                              <span>Total support</span>
                              <span className="text-white font-mono">${selectedSport.totalSupport.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-slate-400 p-1.5 rounded hover:bg-slate-800/50">
                              <span>Athletes</span>
                              <span className="text-white font-mono">{selectedSport.athletes}</span>
                            </div>
                            <div className="flex justify-between text-slate-400 p-1.5 rounded hover:bg-slate-800/50">
                              <span>Avg per athlete</span>
                              <span className="text-white font-mono">${Math.round(selectedSport.avgSupport).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-slate-400 p-1.5 rounded hover:bg-slate-800/50">
                              <span>NIL share</span>
                              <span className="text-green-400 font-mono font-medium">{Math.round((selectedSport.nilTotal / selectedSport.totalSupport) * 100)}%</span>
                            </div>
                          </div>
                          
                          {/* Selected athlete detail */}
                          {selectedAthlete && (
                            <div className="mt-4 pt-4 border-t border-slate-700 animate-in fade-in duration-300">
                              <div className="text-xs text-slate-500 mb-2 font-medium">Selected: <span className="text-white">{selectedAthlete.name}</span></div>
                              <div className="space-y-1.5 text-xs">
                                <div className="flex justify-between p-1.5 rounded bg-slate-800/30">
                                  <span className="text-slate-400">Total support</span>
                                  <span className="text-slate-200 font-mono">${selectedAthlete.totalSupport.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between p-1.5 rounded bg-slate-800/30">
                                  <span className="text-slate-400">From NIL</span>
                                  <span className="text-green-400 font-mono">${selectedAthlete.fromNil.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between p-1.5 rounded bg-slate-800/30">
                                  <span className="text-slate-400">From scholarship</span>
                                  <span className="text-slate-200 font-mono">${selectedAthlete.fromScholarship.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between p-1.5 rounded bg-slate-800/30">
                                  <span className="text-slate-400">Community hours</span>
                                  <span className="text-slate-200 font-mono">{selectedAthlete.hours}</span>
                                </div>
                                {selectedAthlete.flags.includes('blocked_deal') && (
                                  <div className="mt-2 bg-red-900/20 border border-red-500/30 rounded p-2 text-red-300 flex items-start gap-2">
                                    <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    <span>Had a blocked deal (22% agent fee) — re-signed at 5%</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Receipt buttons */}
                    {selectedSport && (
                      <div className="space-y-2">
                        <button
                          onClick={() => setShowSportReceipt(!showSportReceipt)}
                          className="w-full bg-slate-800 hover:bg-slate-700 text-xs py-2.5 rounded-lg border border-slate-600 flex items-center justify-between px-3 transition-colors text-slate-300 hover:text-white hover:border-slate-500"
                        >
                          <span className="flex items-center gap-2">
                            <FileText className="w-3 h-3" />
                            {showSportReceipt ? 'Hide' : 'View'} Sport Receipt
                          </span>
                          <span className="text-slate-500">{selectedSport.name}</span>
                        </button>
                        
                        {showSportReceipt && (
                          <div className="bg-slate-900/90 border border-slate-700 rounded-lg p-3 animate-in zoom-in-95 duration-200">
                            <div className="text-[10px] text-cyan-400 font-mono mb-2">SPORT_SUPPORT_SUMMARY_RECEIPT_V1</div>
                            <pre className="text-[10px] text-slate-400 overflow-x-auto max-h-48 font-mono custom-scrollbar">
{JSON.stringify(generateSportSummaryReceipt(selectedSport), null, 2)}
                            </pre>
                          </div>
                        )}
                        
                        <div className="text-[10px] text-slate-500 text-center pt-1 italic">
                          ↑ This receipt rolls up into the Title IX Summary below
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 4 - Title IX */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-slate-400 font-medium flex items-center gap-2">
                    <Scale className="w-4 h-4" /> Title IX Equity Dashboard
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Within Tolerance
                  </span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-xs text-slate-500 mb-3 uppercase tracking-wider font-semibold">Support per Athlete by Gender</div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-300">Male athletes (142)</span>
                          <span className="text-slate-200 font-mono font-medium">$156,338 avg</span>
                        </div>
                        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{width: '100%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-300">Female athletes (130)</span>
                          <span className="text-slate-200 font-mono font-medium">$152,307 avg</span>
                        </div>
                        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-pink-500 rounded-full" style={{width: '97.4%'}}></div>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 mt-4 flex items-center gap-2">
                      Gender equity index: <span className="text-green-400 font-bold">97.4%</span> <span className="text-slate-600">(threshold: 95%)</span>
                    </div>
                  </div>
                  
                  <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600 flex flex-col justify-center">
                    <div className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-semibold flex items-center gap-2">
                        <Flag className="w-3 h-3" /> Policy Implication
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Any increase in men's football support must be matched in women's sports 
                      by <span className="text-yellow-400 font-bold font-mono">$1.2M</span> to remain compliant.
                    </p>
                    <p className="text-xs text-slate-500 mt-3 italic border-t border-slate-700/50 pt-2">
                      Receipts auto-calculate required offsets before approval.
                    </p>
                  </div>
                </div>
              </div>

              {/* Receipt Viewer */}
              <div className="animate-in fade-in duration-500">
                <button
                  onClick={() => setShowTitleIXReceipt(!showTitleIXReceipt)}
                  className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-sm font-medium transition flex items-center justify-center gap-2 text-slate-300 hover:text-white"
                >
                  <FileText className="w-4 h-4" />
                  {showTitleIXReceipt ? 'Hide' : 'View'} Title IX Summary Receipt
                </button>
                
                {showTitleIXReceipt && (
                  <div className="mt-4 bg-slate-900/80 border border-slate-700 rounded-xl p-4 animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-purple-400 font-mono">TITLEIX_SUMMARY_RECEIPT_V1</span>
                    </div>
                    <pre className="text-[10px] text-slate-400 overflow-x-auto max-h-80 font-mono custom-scrollbar">
{JSON.stringify(generateTitleIXReceipt(), null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Regent Story Beat */}
              <div className="mt-6 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-5">
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-purple-400">
                  <Briefcase className="w-4 h-4" /> Board-Ready Governance
                </h4>
                <p className="text-sm text-slate-300 mb-3 leading-relaxed">
                  "You can sit in a Board meeting with this. It shows: here's who's getting funded, 
                  here's where NIL is clean vs sketchy, and here's proof we're not starving women's 
                  and Olympic sports to feed football."
                </p>
                <p className="text-xs text-slate-400 border-t border-purple-500/20 pt-3">
                  <span className="text-purple-400 font-medium">Transfer Portal:</span> When athletes transfer, their NIL receipts travel with them — 
                  new schools can verify clean history without seeing dollar amounts.
                </p>
              </div>
            </div>
          )}

          {/* ==================== NATIONAL VIEW ==================== */}
          {activeView === 'national' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2 text-slate-200">National View</h2>
                <p className="text-slate-400">Conferences, NCAA, and federal oversight — one ledger standard, not 50 state laws.</p>
              </div>

              {/* National Snapshot */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-800/50 border border-emerald-500/30 rounded-xl p-5 text-center hover:bg-slate-800/80 transition-colors">
                  <div className="text-3xl font-bold text-emerald-400 mb-1">68</div>
                  <div className="text-sm text-slate-400 uppercase font-semibold tracking-wide">Institutions</div>
                  <div className="text-xs text-slate-500 mt-1">on Standard Ledger</div>
                </div>
                <div className="bg-slate-800/50 border border-blue-500/30 rounded-xl p-5 text-center hover:bg-slate-800/80 transition-colors">
                  <div className="text-3xl font-bold text-blue-400 mb-1">$2.4B</div>
                  <div className="text-sm text-slate-400 uppercase font-semibold tracking-wide">Athlete Payouts</div>
                  <div className="text-xs text-slate-500 mt-1">Tracked & Verified</div>
                </div>
                <div className="bg-slate-800/50 border border-purple-500/30 rounded-xl p-5 text-center hover:bg-slate-800/80 transition-colors">
                  <div className="text-3xl font-bold text-purple-400 mb-1">127</div>
                  <div className="text-sm text-slate-400 uppercase font-semibold tracking-wide">Olympic Programs</div>
                  <div className="text-xs text-slate-500 mt-1">Preserved vs cuts</div>
                </div>
              </div>

              {/* Audit Tools */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-slate-400 font-medium flex items-center gap-2">
                    <Users className="w-4 h-4" /> Federal Audit Console
                  </div>
                  <div className="flex items-center gap-2">
                    <select 
                      className="bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-xs text-slate-300 focus:border-blue-500 outline-none"
                      value={selectedInstitution}
                      onChange={(e) => setSelectedInstitution(e.target.value)}
                    >
                      <option value="all">All Institutions</option>
                      <option value="Conf 1">Conference 1</option>
                      <option value="Conf 2">Conference 2</option>
                      <option value="Conf 3">Conference 3</option>
                    </select>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mb-4 max-w-2xl">
                  Policy packs are shared across conferences — each can tune details, but all run on the same constitutional rails.
                </p>
                <div className="overflow-x-auto custom-scrollbar rounded-lg border border-slate-700">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-900/80">
                      <tr className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                        <th className="text-left px-4 py-3">Institution</th>
                        <th className="text-left px-4 py-3">Conference</th>
                        <th className="text-right px-4 py-3">Contracts</th>
                        <th className="text-right px-4 py-3">Verified</th>
                        <th className="text-right px-4 py-3">Blocked</th>
                        <th className="text-center px-4 py-3">Title IX</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nationalData
                        .filter(row => selectedInstitution === 'all' || row.conference === selectedInstitution)
                        .map((row, i) => (
                        <tr 
                          key={i} 
                          onClick={() => {setSelectedRow(row); setShowNationalReceipt(true);}}
                          className="border-b border-slate-800/50 hover:bg-slate-800/50 cursor-pointer transition last:border-0"
                        >
                          <td className="px-4 py-3 text-slate-300 font-medium">{row.institution}</td>
                          <td className="px-4 py-3 text-slate-400">{row.conference}</td>
                          <td className="px-4 py-3 text-right font-mono">{row.contracts}</td>
                          <td className="px-4 py-3 text-right text-green-400 font-mono">{row.verified}</td>
                          <td className="px-4 py-3 text-right text-red-400 font-mono">{row.blocked}</td>
                          <td className="px-4 py-3 text-center">
                            {row.titleix === '✓' ? (
                                <span className="text-green-400 font-bold"><Check className="w-4 h-4 inline" /></span>
                            ) : (
                                <span className="text-yellow-400 font-bold"><AlertTriangle className="w-4 h-4 inline" /></span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="text-[10px] text-slate-500 mt-3 italic text-center">
                  Click any row to view sample receipt. Athlete names redacted; only hashed IDs visible to auditors.
                </div>
              </div>

              {/* Policy Simulation */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 mb-4">
                <div className="text-sm text-slate-400 mb-4 font-medium flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Policy Simulation: Unified Media Rights Reform
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-6">
                      <label className="text-xs text-slate-500 mb-2 block uppercase tracking-wider font-semibold">
                        Unified media rights → <span className="text-emerald-400 font-mono">+$7B/year</span>
                      </label>
                      <input type="range" min="0" max="100" defaultValue="70" className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>Current</span>
                        <span>Target</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 text-sm p-2 rounded hover:bg-slate-800/50 transition-colors cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded bg-slate-700 border-slate-500 accent-emerald-500 w-4 h-4" />
                        <span className="text-slate-300">30% to deficit relief</span>
                      </label>
                      <label className="flex items-center gap-3 text-sm p-2 rounded hover:bg-slate-800/50 transition-colors cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded bg-slate-700 border-slate-500 accent-emerald-500 w-4 h-4" />
                        <span className="text-slate-300">20% to Olympic sports floor</span>
                      </label>
                      <label className="flex items-center gap-3 text-sm p-2 rounded hover:bg-slate-800/50 transition-colors cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded bg-slate-700 border-slate-500 accent-emerald-500 w-4 h-4" />
                        <span className="text-slate-300">10% to minimum NIL baseline</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-5 flex flex-col justify-center">
                    <div className="text-sm font-bold text-emerald-400 mb-3 uppercase tracking-wider">Projected Outcome by 2030</div>
                    <ul className="text-sm text-slate-300 space-y-2">
                      <li className="flex justify-between items-center border-b border-emerald-500/10 pb-2">
                        <span>Average FBS deficit</span>
                        <span className="text-emerald-400 font-mono font-bold">$2M <span className="text-slate-500 text-xs font-normal">(was $20M)</span></span>
                      </li>
                      <li className="flex justify-between items-center border-b border-emerald-500/10 pb-2">
                        <span>Women's & Olympic cuts</span>
                        <span className="text-emerald-400 font-bold">Avoided in 81%</span>
                      </li>
                      <li className="flex justify-between items-center pt-1">
                        <span>Agent fee violations</span>
                        <span className="text-emerald-400 font-bold">-94%</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Receipt Viewer */}
              <div className="animate-in fade-in duration-500">
                <button
                  onClick={() => setShowNationalReceipt(!showNationalReceipt)}
                  className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-sm font-medium transition flex items-center justify-center gap-2 text-slate-300 hover:text-white"
                >
                  <FileText className="w-4 h-4" />
                  {showNationalReceipt ? 'Hide' : 'View'} Sample NIL Contract Receipt
                  {selectedRow && <span className="text-slate-500 ml-1">({selectedRow.institution})</span>}
                </button>
                
                {showNationalReceipt && (
                  <div className="mt-4 bg-slate-900/80 border border-slate-700 rounded-xl p-4 animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-emerald-400 font-mono">NIL_CONTRACT_RECEIPT_V1</span>
                        {selectedRow && (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                            {selectedRow.institution}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 italic">Athlete data pseudonymized</span>
                    </div>
                    <pre className="text-[10px] text-slate-400 overflow-x-auto max-h-80 font-mono custom-scrollbar">
{JSON.stringify(generateNationalReceipt(), null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* DC Story Beat */}
              <div className="mt-6 bg-gradient-to-r from-emerald-900/20 to-blue-900/20 border border-emerald-500/30 rounded-xl p-5">
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-emerald-400">
                  <Flag className="w-4 h-4" /> The Federal Case
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  "You don't need 50 NIL laws; you need a single ledger standard plus a national media rights fix. 
                  This shows what that actually buys the country — preserved Olympic programs, clean agent practices, 
                  and Title IX compliance you can audit in real time."
                </p>
              </div>
            </div>
          )}
        </main>

        {/* Five Primitives Footer */}
        <section className="border-t border-slate-800 py-8 px-4 bg-slate-900/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-6">
              <div className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-semibold">Powered by the same constitutional primitives</div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center text-xs">
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                <div className="text-blue-400 font-medium mb-1">Provable Actors</div>
                <div className="text-slate-500">Verified athletes, certified agents</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                <div className="text-purple-400 font-medium mb-1">Lossless Lineage</div>
                <div className="text-slate-500">Contract → work → payment chain</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                <div className="text-emerald-400 font-medium mb-1">Portable Policy</div>
                <div className="text-slate-500">Fee caps & rules travel with contracts</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                <div className="text-cyan-400 font-medium mb-1">Explanatory Receipts</div>
                <div className="text-slate-500">Every dollar tracked with proof</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                <div className="text-amber-400 font-medium mb-1">Economic Gates</div>
                <div className="text-slate-500">No-compliance-no-payment</div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-800 py-8 px-4 text-center text-slate-500 text-sm bg-slate-950">
          <p className="font-medium text-slate-400 mb-2">AthleteGate™ — Constitutional NIL Ledger for College Athletics</p>
          <p className="mb-4">
            <span className="text-blue-400">Signed Identities</span> + <span className="text-purple-400">Portable Policies</span> + <span className="text-emerald-400">Receipts for Every Dollar</span>
          </p>
          <p className="text-slate-600 text-xs">© 2025 AnchorTrust Holdings LLC — PATHWELL CONNECT™</p>
        </footer>
      </div>
    </div>
  );
}

