"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  Hospital, 
  Stethoscope, 
  Ambulance, 
  Pill, 
  Sun, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Copy,
  Activity,
  Power,
  Clock,
  Shield,
  RefreshCw
} from 'lucide-react';

interface Facility {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  workloads: string[];
  powerStatus: string;
  policy: string;
  currentPower: number;
  activeWorkloads: string[];
  shedWorkloads: string[];
}

interface Receipt {
  id: string;
  facilityId: string;
  facilityName: string;
  facilityType: string;
  timestamp: string;
  powerStatus: string;
  policy: string;
  activeWorkloads: string[];
  shedWorkloads: string[];
  powerConsumed: number;
  jsonSchema: any;
}

const facilityTypes: Record<string, { label: string; tier: number; color: string; icon: any; backupHours: number }> = {
  hospital: { label: 'Regional Hospital', tier: 1, color: '#ef4444', icon: Hospital, backupHours: 72 },
  clinic: { label: 'Rural Clinic', tier: 2, color: '#f97316', icon: Stethoscope, backupHours: 24 },
  ems: { label: 'EMS Dispatch', tier: 1, color: '#eab308', icon: Ambulance, backupHours: 48 },
  pharmacy: { label: 'Pharmacy/Data Wing', tier: 3, color: '#22c55e', icon: Pill, backupHours: 12 },
  solar: { label: 'Solar Array', tier: 0, color: '#06b6d4', icon: Sun, backupHours: 0 }
};

const workloadTypes = [
  { id: 'er-imaging', name: 'ER Imaging', priority: 'critical', power: 45, aiEnabled: true, modelId: 'TTU-IMAGING-MODEL-01' },
  { id: 'telehealth', name: 'Telehealth', priority: 'critical', power: 12, aiEnabled: true, modelId: 'PATHWELL-TELEHEALTH-V2' },
  { id: 'ehr-sync', name: 'EHR Sync', priority: 'critical', power: 8, aiEnabled: true, modelId: 'EPIC-FHIR-AGENT-01' },
  { id: 'hvac', name: 'HVAC Control', priority: 'normal', power: 35, aiEnabled: false },
  { id: 'lighting', name: 'Non-Critical Lighting', priority: 'low', power: 15, aiEnabled: false },
  { id: 'dispatch', name: 'EMS Dispatch AI', priority: 'critical', power: 20, aiEnabled: true, modelId: 'EMS-ROUTING-V3' },
  { id: 'inventory', name: 'Inventory Management', priority: 'normal', power: 5, aiEnabled: false },
  { id: 'refrigeration', name: 'Med Refrigeration', priority: 'critical', power: 25, aiEnabled: false }
];

const policies = [
  { id: 'normal', label: 'Normal Operations', color: '#22c55e', desc: 'Full grid power, all services active' },
  { id: 'conservation', label: 'Conservation Mode', color: '#eab308', desc: 'Non-critical loads shed' },
  { id: 'clinical-priority', label: 'Clinical Priority Only', color: '#f97316', desc: 'Life-safety systems only' },
  { id: 'island', label: 'Island Mode', color: '#ef4444', desc: 'Disconnected from grid, local generation' },
  { id: 'curtailment-capture', label: 'Curtailment Capture', color: '#06b6d4', desc: 'Absorbing excess renewable generation' }
];

export default function GridToCareDemo() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [gridStatus, setGridStatus] = useState('normal');
  const [scenario, setScenario] = useState<string | null>(null);
  const [scenarioType, setScenarioType] = useState<'outage' | 'curtailment' | null>(null);
  const [scenarioStep, setScenarioStep] = useState(0);
  const [careImpact, setCareImpact] = useState<any>(null);
  const [solarContribution, setSolarContribution] = useState(0);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [expandedReceipt, setExpandedReceipt] = useState<string | null>(null);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({
    totalPowerConsumed: 0,
    patientsServed: 0,
    uptimePercent: 99.97,
    activeWorkloads: 0,
    criticalWorkloadsMaintained: 0,
    workloadsShed: 0
  });

  const selectedFacility = selectedFacilityId 
    ? facilities.find(f => f.id === selectedFacilityId) 
    : null;

  // Initialize facilities
  useEffect(() => {
    const initialFacilities: Facility[] = [
      { id: 'hosp-1', type: 'hospital', name: 'Permian Regional Medical', x: 45, y: 35, workloads: ['er-imaging', 'telehealth', 'ehr-sync', 'hvac', 'lighting'], powerStatus: 'grid', policy: 'normal', currentPower: Math.floor(Math.random() * 100 + 50), activeWorkloads: ['er-imaging', 'telehealth', 'ehr-sync', 'hvac', 'lighting'], shedWorkloads: [] },
      { id: 'clinic-a', type: 'clinic', name: 'Rural Clinic Alpha', x: 25, y: 55, workloads: ['telehealth', 'ehr-sync', 'lighting'], powerStatus: 'grid', policy: 'normal', currentPower: Math.floor(Math.random() * 100 + 50), activeWorkloads: ['telehealth', 'ehr-sync', 'lighting'], shedWorkloads: [] },
      { id: 'clinic-b', type: 'clinic', name: 'Rural Clinic Beta', x: 70, y: 60, workloads: ['telehealth', 'ehr-sync', 'hvac'], powerStatus: 'grid', policy: 'normal', currentPower: Math.floor(Math.random() * 100 + 50), activeWorkloads: ['telehealth', 'ehr-sync', 'hvac'], shedWorkloads: [] },
      { id: 'ems-1', type: 'ems', name: 'County EMS Dispatch', x: 55, y: 75, workloads: ['dispatch', 'ehr-sync'], powerStatus: 'grid', policy: 'normal', currentPower: Math.floor(Math.random() * 100 + 50), activeWorkloads: ['dispatch', 'ehr-sync'], shedWorkloads: [] },
      { id: 'pharm-1', type: 'pharmacy', name: 'Central Pharmacy Hub', x: 65, y: 40, workloads: ['inventory', 'refrigeration', 'ehr-sync'], powerStatus: 'grid', policy: 'normal', currentPower: Math.floor(Math.random() * 100 + 50), activeWorkloads: ['inventory', 'refrigeration', 'ehr-sync'], shedWorkloads: [] },
      { id: 'solar-1', type: 'solar', name: 'West Mesa Solar Array', x: 20, y: 30, workloads: [], powerStatus: 'grid', policy: 'normal', currentPower: 0, activeWorkloads: [], shedWorkloads: [] }
    ];

    setFacilities(initialFacilities);

    const totalActive = initialFacilities.reduce((sum, f) => sum + f.workloads.length, 0);
    const totalCritical = initialFacilities.reduce((sum, f) => {
      return sum + f.workloads.filter(wId => {
        const w = workloadTypes.find(wt => wt.id === wId);
        return w?.priority === 'critical';
      }).length;
    }, 0);

    setMetrics(prev => ({
      ...prev,
      activeWorkloads: totalActive,
      criticalWorkloadsMaintained: totalCritical,
      patientsServed: totalCritical * 18
    }));
  }, []);

  // Normal operations power tick
  useEffect(() => {
    if (scenario) return;
    const interval = setInterval(() => {
      setFacilities(prev => prev.map(f => ({
        ...f,
        currentPower: Math.max(20, Math.min(200, f.currentPower + (Math.random() - 0.5) * 20))
      })));
      
      setMetrics(prev => {
        const facilityPower = facilities.reduce((sum, f) => sum + f.currentPower, 0);
        const powerIncrement = facilityPower / 1000;
        return {
          ...prev,
          totalPowerConsumed: prev.totalPowerConsumed + powerIncrement
        };
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [scenario, facilities]);

  const runOutageScenario = useCallback(() => {
    setScenario('running');
    setScenarioType('outage');
    setScenarioStep(1);
    setGridStatus('outage');
    setCareImpact(null);

    const solarPower = Math.floor(Math.random() * 150 + 200);
    setSolarContribution(solarPower);

    setTimeout(() => {
      setScenarioStep(2);
      setFacilities(prev => prev.map(f => ({
        ...f,
        powerStatus: f.type === 'solar' ? 'generating' : 'switching',
        policy: 'conservation'
      })));
    }, 500);

    setTimeout(() => {
      setFacilities(prev => {
        const updated = prev.map(f => {
          const type = facilityTypes[f.type];
          const isCritical = type.tier === 1;
          
          const criticalWorkloads = f.workloads.filter(wId => {
            const w = workloadTypes.find(wt => wt.id === wId);
            return w?.priority === 'critical';
          });
          const shedWorkloads = f.workloads.filter(wId => {
            const w = workloadTypes.find(wt => wt.id === wId);
            return w?.priority !== 'critical';
          });

          return {
            ...f,
            powerStatus: f.type === 'solar' ? 'generating' : (isCritical ? 'backup' : 'islanded'),
            policy: isCritical ? 'clinical-priority' : 'island',
            activeWorkloads: criticalWorkloads,
            shedWorkloads: shedWorkloads
          };
        });

        const newReceipts: Receipt[] = updated.filter(f => f.type !== 'solar').map(f => {
          const type = facilityTypes[f.type];
          const receiptId = `G2C-OUT-${Date.now().toString(36).toUpperCase()}-${f.id.slice(0, 3).toUpperCase()}`;
          const powerConsumed = Math.floor(f.currentPower * 0.6);

          return {
            id: receiptId,
            facilityId: f.id,
            facilityName: f.name,
            facilityType: f.type,
            timestamp: new Date().toISOString(),
            powerStatus: type.tier === 1 ? 'backup' : 'islanded',
            policy: type.tier === 1 ? 'clinical-priority' : 'island',
            activeWorkloads: f.activeWorkloads,
            shedWorkloads: f.shedWorkloads,
            powerConsumed: powerConsumed,
            jsonSchema: {
              receipt_id: receiptId,
              schema_version: "PATHWELL_RECEIPT_V1",
              genesis_eo_alignment: ["§3(c)", "§3(d)(i)"],
              workload_topology: "HUB_SPOKE_RESILIENCE",
              energy_source: type.tier === 1 ? "BACKUP_GENERATION" : "ISLAND_MODE",
              grid_region: "ERCOT_WEST",
              grams_co2e_per_kwh: 420,
              renewable_fraction: 0.0,
              curtailment_window: false,
              facility_id: f.id,
              facility_type: f.type,
              facility_tier: type.tier,
              power_status: type.tier === 1 ? 'BACKUP_GENERATION' : 'ISLAND_MODE',
              policy_applied: type.tier === 1 ? 'CLINICAL_PRIORITY_ONLY' : 'ISLAND_CONSERVATION',
              workloads_active: f.activeWorkloads,
              workloads_shed: f.shedWorkloads,
              power_consumed_kwh: powerConsumed,
              backup_hours_remaining: type.backupHours - 2,
              ai_workloads: f.activeWorkloads
                .map(wId => workloadTypes.find(wt => wt.id === wId))
                .filter(w => w?.aiEnabled)
                .map(w => ({
                  workload_id: w.id,
                  model_id: w.modelId,
                  agent_id: `PATHWELL_AGENT_${w.id.toUpperCase().replace('-', '_')}`
                })),
              econ_royalty_policy_id: "ECON.ROY.GRID2CARE.V1",
              sovereign_policy_id: "SOV.OVERRIDE.TEXAS.HEALTH.2025",
              treaty_object_id: "TREATY.OBJ.TTU-TTUHSC-COUNTYEMS.V1",
              signing_authority: "PATHWELL_HEALTH_GRID_NODE",
              attestation_type: "HEALTH_CRITICAL_RESILIENCE",
              care_continuity_maintained: true,
              timestamp_utc: new Date().toISOString()
            }
          };
        });

        setReceipts(newReceipts);

        const totalCriticalMaintained = newReceipts.reduce((sum, r) => sum + r.activeWorkloads.length, 0);
        const totalShed = newReceipts.reduce((sum, r) => sum + r.shedWorkloads.length, 0);
        const totalPowerFromReceipts = newReceipts.reduce((sum, r) => sum + r.powerConsumed, 0);
        const patientsProtected = totalCriticalMaintained * 18;

        setCareImpact({
          criticalMaintained: totalCriticalMaintained,
          workloadsShed: totalShed,
          patientsProtected: patientsProtected
        });

        setMetrics(prev => ({
          ...prev,
          uptimePercent: 99.94,
          activeWorkloads: totalCriticalMaintained,
          criticalWorkloadsMaintained: totalCriticalMaintained,
          workloadsShed: totalShed,
          totalPowerConsumed: prev.totalPowerConsumed + totalPowerFromReceipts
        }));

        return updated;
      });
    }, 2000);

    setTimeout(() => {
      setScenarioStep(3);
      setGridStatus('recovering');
    }, 5000);

    setTimeout(() => {
      setGridStatus('normal');
      setScenario(null);
      setScenarioType(null);
      setScenarioStep(0);
      setCareImpact(null);
      setFacilities(prev => {
        const restored = prev.map(f => ({
          ...f,
          powerStatus: 'grid',
          policy: 'normal',
          activeWorkloads: f.workloads,
          shedWorkloads: []
        }));

        const totalActive = restored.reduce((sum, f) => sum + f.workloads.length, 0);
        const totalCritical = restored.reduce((sum, f) => {
          return sum + f.workloads.filter(wId => {
            const w = workloadTypes.find(wt => wt.id === wId);
            return w?.priority === 'critical';
          }).length;
        }, 0);

        setMetrics(prev => ({
          ...prev,
          uptimePercent: 99.97,
          activeWorkloads: totalActive,
          criticalWorkloadsMaintained: totalCritical,
          workloadsShed: 0
        }));

        return restored;
      });
    }, 8000);
  }, []);

  const runCurtailmentScenario = useCallback(() => {
    setScenario('running');
    setScenarioType('curtailment');
    setScenarioStep(1);
    setGridStatus('curtailment');
    setCareImpact(null);

    const excessSolar = Math.floor(Math.random() * 400 + 600);
    setSolarContribution(excessSolar);

    setTimeout(() => {
      setScenarioStep(2);
      setFacilities(prev => prev.map(f => ({
        ...f,
        powerStatus: f.type === 'solar' ? 'curtailment-capture' : 'absorbing',
        policy: 'curtailment-capture'
      })));
    }, 500);

    setTimeout(() => {
      setFacilities(prev => {
        const updated = prev.map(f => ({
          ...f,
          powerStatus: f.type === 'solar' ? 'curtailment-capture' : 'absorbing',
          policy: 'curtailment-capture',
          activeWorkloads: f.workloads,
          shedWorkloads: [],
          currentPower: f.currentPower * 1.3
        }));

        const newReceipts: Receipt[] = updated.filter(f => f.type !== 'solar').map(f => {
          const type = facilityTypes[f.type];
          const receiptId = `G2C-CUR-${Date.now().toString(36).toUpperCase()}-${f.id.slice(0, 3).toUpperCase()}`;
          const powerConsumed = Math.floor(f.currentPower * 1.2);

          return {
            id: receiptId,
            facilityId: f.id,
            facilityName: f.name,
            facilityType: f.type,
            timestamp: new Date().toISOString(),
            powerStatus: 'absorbing',
            policy: 'curtailment-capture',
            activeWorkloads: f.activeWorkloads,
            shedWorkloads: [],
            powerConsumed: powerConsumed,
            jsonSchema: {
              receipt_id: receiptId,
              schema_version: "PATHWELL_RECEIPT_V1",
              genesis_eo_alignment: ["§3(a)(i)", "Energy Dominance Mandate"],
              workload_topology: "HUB_SPOKE_RESILIENCE",
              energy_source: "CURTAILMENT_REDEPLOYED",
              grid_region: "ERCOT_WEST",
              grams_co2e_per_kwh: 0,
              renewable_fraction: 1.0,
              curtailment_window: true,
              curtailment_captured_kwh: powerConsumed,
              facility_id: f.id,
              facility_type: f.type,
              facility_tier: type.tier,
              power_status: 'CURTAILMENT_ABSORPTION',
              policy_applied: 'CURTAILMENT_CAPTURE_OPPORTUNISTIC',
              workloads_active: f.activeWorkloads,
              workloads_shed: [],
              power_consumed_kwh: powerConsumed,
              ai_workloads: f.activeWorkloads
                .map(wId => workloadTypes.find(wt => wt.id === wId))
                .filter(w => w?.aiEnabled)
                .map(w => ({
                  workload_id: w.id,
                  model_id: w.modelId,
                  agent_id: `PATHWELL_AGENT_${w.id.toUpperCase().replace('-', '_')}`
                })),
              econ_royalty_policy_id: "ECON.ROY.CURTAILMENT.V1",
              sovereign_policy_id: "SOV.OVERRIDE.TEXAS.ENERGY.2025",
              treaty_object_id: "TREATY.OBJ.ERCOT-DOE-GENESIS.V1",
              signing_authority: "PATHWELL_CURTAILMENT_NODE",
              attestation_type: "CURTAILMENT_CAPTURE_RECEIPT",
              carbon_avoided_grams: powerConsumed * 420,
              timestamp_utc: new Date().toISOString()
            }
          };
        });

        setReceipts(newReceipts);

        const totalActive = newReceipts.reduce((sum, r) => sum + r.activeWorkloads.length, 0);
        const totalPowerFromReceipts = newReceipts.reduce((sum, r) => sum + r.powerConsumed, 0);
        const carbonAvoided = totalPowerFromReceipts * 420;

        setCareImpact({
          criticalMaintained: totalActive,
          workloadsShed: 0,
          patientsProtected: totalActive * 18,
          curtailmentCaptured: totalPowerFromReceipts,
          carbonAvoided: carbonAvoided
        });

        setMetrics(prev => ({
          ...prev,
          activeWorkloads: totalActive,
          workloadsShed: 0,
          totalPowerConsumed: prev.totalPowerConsumed + totalPowerFromReceipts
        }));

        return updated;
      });
    }, 2000);

    setTimeout(() => {
      setScenarioStep(3);
      setGridStatus('stabilizing');
    }, 5000);

    setTimeout(() => {
      setGridStatus('normal');
      setScenario(null);
      setScenarioType(null);
      setScenarioStep(0);
      setCareImpact(null);
      setFacilities(prev => {
        const restored = prev.map(f => ({
          ...f,
          powerStatus: 'grid',
          policy: 'normal',
          activeWorkloads: f.workloads,
          shedWorkloads: [],
          currentPower: f.currentPower / 1.3
        }));

        const totalActive = restored.reduce((sum, f) => sum + f.workloads.length, 0);
        const totalCritical = restored.reduce((sum, f) => {
          return sum + f.workloads.filter(wId => {
            const w = workloadTypes.find(wt => wt.id === wId);
            return w?.priority === 'critical';
          }).length;
        }, 0);

        setMetrics(prev => ({
          ...prev,
          activeWorkloads: totalActive,
          criticalWorkloadsMaintained: totalCritical,
          workloadsShed: 0
        }));

        return restored;
      });
    }, 8000);
  }, []);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'grid': '#22c55e',
      'backup': '#f97316',
      'islanded': '#ef4444',
      'switching': '#eab308',
      'generating': '#06b6d4',
      'recovering': '#8b5cf6',
      'absorbing': '#06b6d4',
      'curtailment-capture': '#06b6d4'
    };
    return colors[status] || '#64748b';
  };

  const getGridBanner = () => {
    if (gridStatus === 'normal') return null;

    const banners: Record<string, { bg: string; border: string; text: string }> = {
      'outage': { bg: 'bg-red-900/80', border: 'border-red-500', text: 'GRID OUTAGE DETECTED — Microgrids activating resilience protocols' },
      'recovering': { bg: 'bg-purple-900/80', border: 'border-purple-500', text: 'RECOVERY IN PROGRESS — Reconnecting to main grid' },
      'curtailment': { bg: 'bg-cyan-900/80', border: 'border-cyan-500', text: 'CURTAILMENT CAPTURE — Absorbing excess renewable generation' },
      'stabilizing': { bg: 'bg-blue-900/80', border: 'border-blue-500', text: 'GRID STABILIZING — Curtailment window closing' }
    };

    const banner = banners[gridStatus];
    if (!banner) return null;

    return (
      <div className={`${banner.bg} ${banner.border} border-2 rounded-lg px-4 py-3 mb-4 text-center font-medium flex items-center justify-center gap-2`}>
        <AlertTriangle className="w-5 h-5" />
        {banner.text}
      </div>
    );
  };

  const getScenarioStepper = () => {
    if (scenarioStep === 0) return null;

    const steps = scenarioType === 'outage' 
      ? [
          { num: 1, label: 'Outage Detected', active: scenarioStep >= 1 },
          { num: 2, label: 'Policy Enforced', active: scenarioStep >= 2 },
          { num: 3, label: 'Recovery', active: scenarioStep >= 3 }
        ]
      : [
          { num: 1, label: 'Curtailment Detected', active: scenarioStep >= 1 },
          { num: 2, label: 'Absorption Active', active: scenarioStep >= 2 },
          { num: 3, label: 'Stabilizing', active: scenarioStep >= 3 }
        ];

    return (
      <div className="mb-4 flex items-center justify-center gap-2 flex-wrap">
        {steps.map((step, i) => (
          <React.Fragment key={step.num}>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
              step.active 
                ? scenarioType === 'outage' ? 'bg-red-500/30 text-red-300' : 'bg-cyan-500/30 text-cyan-300'
                : 'bg-slate-700/50 text-slate-500'
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                step.active 
                  ? scenarioType === 'outage' ? 'bg-red-500 text-white' : 'bg-cyan-500 text-white'
                  : 'bg-slate-600 text-slate-400'
              }`}>{step.num}</span>
              {step.label}
            </div>
            {i < steps.length - 1 && (
              <div className={`w-8 h-0.5 ${step.active ? scenarioType === 'outage' ? 'bg-red-500' : 'bg-cyan-500' : 'bg-slate-600'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const copyToClipboard = (text: string, receiptId: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(receiptId);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="pt-24 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Back Link */}
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition">
            <ChevronLeft className="w-4 h-4" />
            Back to National AI Infrastructure
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-full text-red-400 text-sm mb-4">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              PATHWELL CONNECT™ Health Infrastructure Demo
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              <span className="text-red-500">Grid</span> to <span className="text-cyan-400">Care</span>
            </h1>
            <p className="text-slate-400 text-lg">Rural Health Microgrids with Attribution + Resilience</p>
            <p className="text-slate-500 text-sm mt-2 max-w-2xl mx-auto">
              Routing scarce power and compute to the right beds, rooms, and clinics — with receipts that prove care continuity.
            </p>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="text-slate-400 text-sm">Total Power Consumed</div>
              <div className="text-2xl font-bold text-white font-mono">{metrics.totalPowerConsumed.toFixed(1)} <span className="text-sm text-slate-400">kWh</span></div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="text-slate-400 text-sm">Patients Served</div>
              <div className="text-2xl font-bold text-cyan-400 font-mono">{metrics.patientsServed.toLocaleString()}</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="text-slate-400 text-sm">Care Uptime</div>
              <div className="text-2xl font-bold text-green-400 font-mono">{metrics.uptimePercent}%</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="text-slate-400 text-sm">Active Workloads</div>
              <div className="text-2xl font-bold text-amber-400 font-mono">{metrics.activeWorkloads}</div>
              {metrics.workloadsShed > 0 && (
                <div className="text-xs text-red-400">({metrics.workloadsShed} shed)</div>
              )}
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map Area */}
            <div className="lg:col-span-2 bg-slate-800/30 rounded-2xl border border-slate-700 p-6 relative">
              {/* Controls */}
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h2 className="text-lg font-semibold">West Texas Health Network</h2>
                <div className="flex gap-2">
                  <button
                    onClick={runOutageScenario}
                    disabled={scenario === 'running'}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      scenario === 'running'
                        ? 'bg-slate-600 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {scenario === 'running' && scenarioType === 'outage' ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Running...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" /> Run Outage Scenario
                      </>
                    )}
                  </button>
                  <button
                    onClick={runCurtailmentScenario}
                    disabled={scenario === 'running'}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      scenario === 'running'
                        ? 'bg-slate-600 cursor-not-allowed'
                        : 'bg-cyan-600 hover:bg-cyan-700'
                    }`}
                  >
                    {scenario === 'running' && scenarioType === 'curtailment' ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Running...
                      </>
                    ) : (
                      <>
                        <Sun className="w-4 h-4" /> Run Curtailment Capture
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Scenario Stepper */}
              {getScenarioStepper()}

              {/* Grid Banner */}
              {getGridBanner()}

              {/* Care Impact Callout */}
              {careImpact && (
                <div className={`rounded-lg px-4 py-3 mb-4 ${
                  scenarioType === 'curtailment' 
                    ? 'bg-cyan-900/50 border border-cyan-600' 
                    : 'bg-amber-900/50 border border-amber-600'
                }`}>
                  {scenarioType === 'curtailment' ? (
                    <p className="text-cyan-200 text-sm">
                      <span className="font-bold">{careImpact.curtailmentCaptured} kWh</span> captured from curtailment • 
                      <span className="font-bold"> {careImpact.criticalMaintained}</span> workloads running at zero marginal carbon • 
                      <span className="font-bold"> {careImpact.carbonAvoided?.toLocaleString()} g CO₂</span> avoided vs grid baseline
                    </p>
                  ) : (
                    <p className="text-amber-200 text-sm">
                      <span className="font-bold">{careImpact.criticalMaintained}</span> critical workloads maintained • 
                      <span className="font-bold"> {careImpact.workloadsShed}</span> non-critical shed • 
                      <span className="font-bold"> ~{careImpact.patientsProtected}</span> patients protected under clinical-priority policy
                    </p>
                  )}
                </div>
              )}

              {/* Solar Contribution */}
              {solarContribution > 0 && scenario === 'running' && (
                <div className="absolute top-4 left-4 bg-cyan-900/80 border border-cyan-500 rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                  {scenarioType === 'curtailment' 
                    ? (
                      <>
                        <Zap className="w-4 h-4" /> +{solarContribution} kW Redeployed Curtailment
                      </>
                    ) : (
                      <>
                        +{solarContribution} kW from <Sun className="w-4 h-4" /> Solar
                      </>
                    )}
                </div>
              )}

              {/* Map */}
              <div className="relative bg-slate-900/50 rounded-xl h-80 overflow-hidden border border-slate-600">
                {/* Grid lines */}
                <svg className="absolute inset-0 w-full h-full opacity-20">
                  {[20, 40, 60, 80].map(y => (
                    <line key={`h-${y}`} x1="0" y1={`${y}%`} x2="100%" y2={`${y}%`} stroke="#475569" strokeWidth="1" />
                  ))}
                  {[20, 40, 60, 80].map(x => (
                    <line key={`v-${x}`} x1={`${x}%`} y1="0" x2={`${x}%`} y2="100%" stroke="#475569" strokeWidth="1" />
                  ))}
                </svg>

                {/* Connection lines */}
                <svg className="absolute inset-0 w-full h-full">
                  {facilities.filter(f => f.type !== 'hospital').map(f => {
                    const hospital = facilities.find(h => h.type === 'hospital');
                    if (!hospital) return null;
                    const isActive = scenario === 'running';

                    return (
                      <line
                        key={`line-${f.id}`}
                        x1={`${hospital.x}%`}
                        y1={`${hospital.y}%`}
                        x2={`${f.x}%`}
                        y2={`${f.y}%`}
                        stroke={isActive ? getStatusColor(f.powerStatus) : '#475569'}
                        strokeWidth={isActive ? 2 : 1}
                        strokeDasharray={f.powerStatus === 'islanded' ? '4,4' : 'none'}
                        opacity={isActive ? 0.8 : 0.3}
                      />
                    );
                  })}
                </svg>

                {/* Facility nodes */}
                {facilities.map(f => {
                  const type = facilityTypes[f.type];
                  const isSelected = selectedFacilityId === f.id;
                  const statusColor = getStatusColor(f.powerStatus);
                  const IconComponent = type.icon;

                  return (
                    <div
                      key={f.id}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
                        isSelected ? 'z-20 scale-110' : 'z-10 hover:scale-105'
                      }`}
                      style={{ left: `${f.x}%`, top: `${f.y}%` }}
                      onClick={() => setSelectedFacilityId(isSelected ? null : f.id)}
                    >
                      {/* Node */}
                      <div 
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                          isSelected ? 'border-white' : ''
                        }`}
                        style={{ 
                          backgroundColor: `${type.color}20`,
                          borderColor: isSelected ? '#fff' : statusColor,
                          boxShadow: scenario === 'running' ? `0 0 15px ${statusColor}40` : 'none'
                        }}
                      >
                        <IconComponent className="w-6 h-6" style={{ color: type.color }} />
                      </div>

                      {/* Label */}
                      <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap">
                        <div className="text-xs font-medium text-slate-300">{f.name.split(' ')[0]}</div>
                        <div 
                          className="text-xs px-2 py-0.5 rounded-full text-center mt-1"
                          style={{ backgroundColor: `${statusColor}30`, color: statusColor }}
                        >
                          {f.powerStatus}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detail Panel */}
            <div className="bg-slate-800/30 rounded-2xl border border-slate-700 p-6">
              {selectedFacility ? (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    {React.createElement(facilityTypes[selectedFacility.type].icon, { className: "w-8 h-8", style: { color: facilityTypes[selectedFacility.type].color } })}
                    <div>
                      <h3 className="font-semibold">{selectedFacility.name}</h3>
                      <div className="text-sm text-slate-400">{facilityTypes[selectedFacility.type].label}</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Status */}
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <div className="text-xs text-slate-500 mb-1">Power Status</div>
                      <div className="font-medium" style={{ color: getStatusColor(selectedFacility.powerStatus) }}>
                        {selectedFacility.powerStatus.toUpperCase()}
                      </div>
                    </div>

                    {/* Policy */}
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <div className="text-xs text-slate-500 mb-1">Active Policy</div>
                      <div className="font-medium text-amber-400">
                        {policies.find(p => p.id === selectedFacility.policy)?.label || selectedFacility.policy}
                      </div>
                    </div>

                    {/* Power */}
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <div className="text-xs text-slate-500 mb-1">Current Power</div>
                      <div className="font-medium font-mono">{selectedFacility.currentPower.toFixed(0)} kW</div>
                    </div>

                    {/* Backup Hours */}
                    {facilityTypes[selectedFacility.type].backupHours > 0 && (
                      <div className="bg-slate-900/50 rounded-lg p-3">
                        <div className="text-xs text-slate-500 mb-1">Backup Capacity</div>
                        <div className="font-medium text-orange-400 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {scenario === 'running' && scenarioType === 'outage'
                            ? `${facilityTypes[selectedFacility.type].backupHours - 2} hrs remaining`
                            : `${facilityTypes[selectedFacility.type].backupHours} hrs`
                          }
                        </div>
                      </div>
                    )}

                    {/* Active Workloads */}
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <div className="text-xs text-slate-500 mb-2">Active Workloads</div>
                      <div className="space-y-1">
                        {selectedFacility.activeWorkloads.map(wId => {
                          const w = workloadTypes.find(wt => wt.id === wId);
                          return (
                            <div key={wId} className="flex items-center justify-between text-sm">
                              <span className={w?.priority === 'critical' ? 'text-green-400' : 'text-slate-300'}>
                                {w?.name}
                              </span>
                              {w?.aiEnabled && <span className="text-xs text-purple-400">AI</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Shed Workloads */}
                    {selectedFacility.shedWorkloads.length > 0 && (
                      <div className="bg-red-900/20 rounded-lg p-3 border border-red-900/50">
                        <div className="text-xs text-red-400 mb-2">Shed Workloads</div>
                        <div className="space-y-1">
                          {selectedFacility.shedWorkloads.map(wId => {
                            const w = workloadTypes.find(wt => wt.id === wId);
                            return (
                              <div key={wId} className="text-sm text-red-300/60">{w?.name}</div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <Hospital className="w-16 h-16 mx-auto mb-2 text-slate-600" />
                    <p>Select a facility to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Receipts Panel */}
          {receipts.length > 0 && (
            <div className="mt-6 bg-slate-800/30 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                PATHWELL Resilience Receipts
                <span className="text-xs bg-slate-700 px-2 py-1 rounded-full ml-auto">
                  Care Continuity Report
                </span>
              </h3>
              <div className="grid gap-4">
                {receipts.map(receipt => {
                  const facilityType = facilityTypes[receipt.facilityType];
                  const FacilityIcon = facilityType?.icon;
                  return (
                    <div key={receipt.id} className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          {FacilityIcon && <FacilityIcon className="w-6 h-6" style={{ color: facilityType.color }} />}
                          <div>
                            <div className="font-medium">{receipt.facilityName}</div>
                            <div className="text-xs text-slate-500 font-mono">{receipt.id}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium" style={{ color: getStatusColor(receipt.powerStatus) }}>
                            {receipt.policy.toUpperCase()}
                          </div>
                          <div className="text-xs text-slate-500">{receipt.powerConsumed} kWh consumed</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm mb-3 flex-wrap">
                        <span className="text-green-400">{receipt.activeWorkloads.length} active</span>
                        <span className="text-red-400">{receipt.shedWorkloads.length} shed</span>
                        <span className="text-slate-500">|</span>
                        <span className="text-slate-400 font-mono text-xs">
                          {scenarioType === 'curtailment' 
                            ? `0 gCO₂/kWh • ${(receipt.jsonSchema.renewable_fraction * 100).toFixed(0)}% renewable`
                            : `${receipt.jsonSchema.grams_co2e_per_kwh} gCO₂/kWh • ${(receipt.jsonSchema.renewable_fraction * 100).toFixed(0)}% renewable`
                          }
                        </span>
                      </div>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {receipt.jsonSchema.curtailment_window && (
                            <span className="text-xs bg-cyan-900/50 text-cyan-400 px-2 py-1 rounded">
                              CURTAILMENT_CAPTURE
                            </span>
                          )}
                          {receipt.jsonSchema.ai_workloads?.length > 0 && (
                            <span className="text-xs bg-purple-900/50 text-purple-400 px-2 py-1 rounded">
                              {receipt.jsonSchema.ai_workloads.length} AI workloads
                            </span>
                          )}
                          <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-400">
                            {receipt.jsonSchema.grid_region}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setExpandedReceipt(expandedReceipt === receipt.id ? null : receipt.id)}
                            className="text-xs px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 transition-colors"
                          >
                            {expandedReceipt === receipt.id ? 'Hide JSON' : 'View Receipt JSON'}
                          </button>
                        </div>
                      </div>
                      {expandedReceipt === receipt.id && (
                        <div className="mt-4 relative">
                          <pre className="p-4 bg-slate-950 rounded-lg text-xs text-slate-300 overflow-x-auto border border-slate-600 font-mono">
                            {JSON.stringify(receipt.jsonSchema, null, 2)}
                          </pre>
                          <button
                            onClick={() => copyToClipboard(JSON.stringify(receipt.jsonSchema, null, 2), receipt.id)}
                            className="mt-2 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 rounded-lg transition text-slate-300 flex items-center gap-1"
                          >
                            {copySuccess === receipt.id ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-green-400" />
                                <span className="text-green-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                Copy JSON
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pb-12 text-center text-slate-500 text-sm px-6">
            <p>Grid to Care™ — Health-Critical Infrastructure with Attribution + Resilience</p>
            <p className="mt-1">
              <span className="text-red-400">Hub + spoke resilience metapattern</span> — energy attribution directly affects health outcomes and care continuity.
            </p>
            <p className="mt-1 text-slate-600">
              Modeled as a West Texas health microgrid lattice — TTU/TTUHSC could operate as a living lab.
            </p>
            <p className="mt-4 text-slate-600 text-xs">© 2025 AnchorTrust Holdings LLC — PATHWELL CONNECT™</p>
          </div>
        </div>
      </div>
    </div>
  );
}

