"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  Mountain, 
  Sprout, 
  Building2, 
  Leaf, 
  RefreshCw, 
  Zap, 
  AlertTriangle, 
  FileText, 
  Copy,
  CheckCircle2,
  Droplets,
  DollarSign,
  Scale,
  Sun,
  Activity
} from 'lucide-react';

interface Facility {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  storage_af?: number;
  max_storage_af?: number;
  inflow_af_day?: number;
  release_af_day?: number;
  hydropower_mw?: number;
  allocation_af?: number;
  requested_af?: number;
  approved_af?: number;
  delivered_af?: number;
  priority_class?: string;
  minimum_flow_af?: number;
  current_flow_af?: number;
  species_protected?: string[];
  capacity_af_day?: number;
  current_output_af?: number;
  energy_mwh_per_af?: number;
  population?: number;
  status: string;
  treatyClause: string;
  flowStatus: string;
}

interface Receipt {
  id: string;
  facilityId: string;
  facilityName: string;
  facilityType: string;
  timestamp: string;
  requestedAF: number;
  approvedAF: number;
  deliveredAF: number;
  shortfallAF: number;
  compensationOwed: number;
  treatyClause: string;
  sovereignOverride: boolean;
  overrideReason?: string;
  jsonSchema: any;
}

const facilityTypes: Record<string, { label: string; icon: any; color: string; role: string; priority: number }> = {
  reservoir: { label: 'Upstream Reservoir', icon: Mountain, color: '#0ea5e9', role: 'hub', priority: 0 },
  irrigation: { label: 'Irrigation District', icon: Sprout, color: '#eab308', role: 'consumer', priority: 3 },
  metro: { label: 'Metro/Industrial', icon: Building2, color: '#8b5cf6', role: 'consumer', priority: 1 },
  ecological: { label: 'Ecological Zone', icon: Leaf, color: '#22c55e', role: 'protected', priority: 1 },
  desal: { label: 'Desal Plant', icon: RefreshCw, color: '#06b6d4', role: 'producer', priority: 2 },
  pumping: { label: 'Pumping Station', icon: Zap, color: '#f97316', role: 'infrastructure', priority: 2 }
};

const treatyClauses: Record<string, { id: string; label: string; color: string }> = {
  normal: { id: 'NORMAL_OPERATIONS', label: 'Normal Operations', color: '#22c55e' },
  drought_1: { id: 'DROUGHT_TIER_1_CONSERVATION', label: 'Drought Tier 1 - Conservation', color: '#eab308' },
  drought_2: { id: 'DROUGHT_TIER_2_AG_REDUCTION', label: 'Drought Tier 2 - Ag Reduction', color: '#f97316' },
  drought_3: { id: 'DROUGHT_TIER_3_CRITICAL', label: 'Drought Tier 3 - Critical', color: '#ef4444' },
  sov_override: { id: 'SOV_OVERRIDE_EMERGENCY', label: 'Sovereign Override', color: '#dc2626' },
  contamination: { id: 'SOV_OVERRIDE_CONTAMINATION', label: 'Contamination Protection', color: '#7c3aed' }
};

export default function AquaTreatyDemo() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [basinStatus, setBasinStatus] = useState('normal');
  const [scenario, setScenario] = useState<string | null>(null);
  const [scenarioType, setScenarioType] = useState<'drought' | 'override' | null>(null);
  const [scenarioStep, setScenarioStep] = useState(0);
  const [treatyImpact, setTreatyImpact] = useState<any>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [expandedReceipt, setExpandedReceipt] = useState<string | null>(null);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({
    totalFlowAF: 0,
    ecologicalMaintained: 100,
    treatyCompliance: 100,
    allocationsProcessed: 0,
    compensationOwed: 0
  });

  const selectedFacility = selectedFacilityId 
    ? facilities.find(f => f.id === selectedFacilityId) 
    : null;

  // Initialize facilities
  useEffect(() => {
    const initialFacilities: Facility[] = [
      { 
        id: 'res-1', 
        type: 'reservoir', 
        name: 'Upper Basin Reservoir', 
        x: 50, y: 15, 
        storage_af: 850000,
        max_storage_af: 1000000,
        inflow_af_day: 2500,
        release_af_day: 2000,
        hydropower_mw: 120,
        status: 'normal',
        treatyClause: 'normal',
        flowStatus: 'active'
      },
      { 
        id: 'irr-1', 
        type: 'irrigation', 
        name: 'State A Irrigation District', 
        x: 25, y: 45, 
        allocation_af: 1000,
        requested_af: 1000,
        approved_af: 1000,
        delivered_af: 0,
        priority_class: 'agricultural',
        status: 'normal',
        treatyClause: 'normal',
        flowStatus: 'active'
      },
      { 
        id: 'irr-2', 
        type: 'irrigation', 
        name: 'State B Ag Cooperative', 
        x: 75, y: 40, 
        allocation_af: 800,
        requested_af: 800,
        approved_af: 800,
        delivered_af: 0,
        priority_class: 'agricultural',
        status: 'normal',
        treatyClause: 'normal',
        flowStatus: 'active'
      },
      { 
        id: 'metro-1', 
        type: 'metro', 
        name: 'Riverside Metro Area', 
        x: 40, y: 65, 
        allocation_af: 500,
        requested_af: 500,
        approved_af: 500,
        delivered_af: 0,
        priority_class: 'municipal',
        population: 450000,
        status: 'normal',
        treatyClause: 'normal',
        flowStatus: 'active'
      },
      { 
        id: 'eco-1', 
        type: 'ecological', 
        name: 'Delta Wetlands Preserve', 
        x: 55, y: 85, 
        minimum_flow_af: 400,
        current_flow_af: 450,
        species_protected: ['Delta Smelt', 'Sandhill Crane'],
        priority_class: 'ecological',
        status: 'normal',
        treatyClause: 'normal',
        flowStatus: 'active'
      },
      { 
        id: 'desal-1', 
        type: 'desal', 
        name: 'Coastal Desal Plant', 
        x: 85, y: 70, 
        capacity_af_day: 150,
        current_output_af: 100,
        energy_mwh_per_af: 3.5,
        priority_class: 'supplemental',
        status: 'normal',
        treatyClause: 'normal',
        flowStatus: 'active'
      }
    ];

    setFacilities(initialFacilities);
  }, []);

  // Normal operations tick
  useEffect(() => {
    if (scenario) return;
    const interval = setInterval(() => {
      setFacilities(prev => {
        const updated = prev.map(f => {
          if (f.type === 'reservoir') {
            return {
              ...f,
              storage_af: Math.min(f.max_storage_af || 0, (f.storage_af || 0) + ((f.inflow_af_day || 0) - (f.release_af_day || 0)) / 24)
            };
          }
          if (f.type === 'irrigation' || f.type === 'metro') {
            return {
              ...f,
              delivered_af: f.approved_af
            };
          }
          return f;
        });
        return updated;
      });
      
      setMetrics(m => ({
        ...m,
        totalFlowAF: m.totalFlowAF + 25,
        allocationsProcessed: m.allocationsProcessed + 1
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, [scenario]);

  const runDroughtScenario = useCallback(() => {
    setScenario('running');
    setScenarioType('drought');
    setScenarioStep(1);
    setBasinStatus('drought');
    setTreatyImpact(null);

    setTimeout(() => {
      setScenarioStep(2);
      setFacilities(prev => prev.map(f => ({
        ...f,
        status: 'evaluating',
        treatyClause: 'drought_1'
      })));
    }, 800);

    setTimeout(() => {
      setFacilities(prev => {
        const updated = prev.map(f => {
          if (f.type === 'irrigation') {
            const approved = Math.floor((f.requested_af || 0) * 0.6);
            return {
              ...f,
              status: 'constrained',
              treatyClause: 'drought_2',
              approved_af: approved,
              delivered_af: approved,
              flowStatus: 'reduced'
            };
          }
          if (f.type === 'metro') {
            const approved = Math.floor((f.requested_af || 0) * 0.95);
            return {
              ...f,
              status: 'protected',
              treatyClause: 'drought_2',
              approved_af: approved,
              delivered_af: approved,
              flowStatus: 'maintained'
            };
          }
          if (f.type === 'ecological') {
            return {
              ...f,
              status: 'protected',
              treatyClause: 'drought_2',
              current_flow_af: f.minimum_flow_af,
              flowStatus: 'minimum'
            };
          }
          if (f.type === 'reservoir') {
            return {
              ...f,
              status: 'releasing',
              treatyClause: 'drought_2',
              release_af_day: 1400
            };
          }
          if (f.type === 'desal') {
            return {
              ...f,
              status: 'supplementing',
              treatyClause: 'drought_2',
              current_output_af: f.capacity_af_day
            };
          }
          return f;
        });

        const newReceipts: Receipt[] = updated.filter(f => f.type !== 'reservoir').map(f => {
          const receiptId = `AQT-DRT-${Date.now().toString(36).toUpperCase()}-${f.id.slice(0, 3).toUpperCase()}`;
          const isAg = f.type === 'irrigation';
          const requestedAF = f.requested_af || f.minimum_flow_af || f.capacity_af_day || 0;
          const approvedAF = f.approved_af || f.current_flow_af || f.current_output_af || 0;
          const shortfall = requestedAF - approvedAF;
          const compensationOwed = isAg ? shortfall * 125 : 0;

          const clauseByType: Record<string, string> = {
            irrigation: "DROUGHT_TIER_2_AG_REDUCTION",
            metro: "DROUGHT_TIER_2_MUNI_PROTECTED",
            ecological: "DROUGHT_TIER_2_ECO_MINIMUM_MAINTAINED",
            desal: "DROUGHT_TIER_2_SUPPLEMENTAL_ACTIVATED"
          };
          const appliedClause = clauseByType[f.type] || "DROUGHT_TIER_2_GENERAL";

          return {
            id: receiptId,
            facilityId: f.id,
            facilityName: f.name,
            facilityType: f.type,
            timestamp: new Date().toISOString(),
            requestedAF: requestedAF,
            approvedAF: approvedAF,
            deliveredAF: approvedAF,
            shortfallAF: shortfall,
            compensationOwed: compensationOwed,
            treatyClause: clauseByType[f.type]?.replace(/_/g, ' ').replace('DROUGHT TIER 2 ', '') || 'General',
            sovereignOverride: false,
            jsonSchema: {
              schema_version: "PATHWELL_TREATY_RECEIPT_V1",
              receipt_id: receiptId,
              timestamp_utc: new Date().toISOString(),
              basin_id: "RIVER_BASIN_WEST",
              facility_id: f.id,
              rights_holder_id: f.id.toUpperCase(),
              treaty_object_id: "TREATY.OBJ.BASIN_WEST-TRILATERAL-2024",
              sovereign_policy_id: "SOV.POLICY.MULTI_STATE_WATER.2025",
              genesis_eo_alignment: ["§3(c)", "§5(c)(ii)"],
              requested_volume_af: requestedAF,
              approved_volume_af: approvedAF,
              delivered_volume_af: approvedAF,
              ecological_minimum_af: 400,
              treaty_clause_applied: appliedClause,
              priority_class: f.priority_class || 'supplemental',
              sovereign_override_applied: false,
              energy_context: {
                energy_source: f.type === 'desal' ? "GRID_INTENSIVE" : "GRAVITY_FED",
                grid_region: "ERCOT_WEST",
                energy_used_kwh: f.type === 'desal' ? approvedAF * 3500 : approvedAF * 50,
                grams_co2e_per_kwh: 420,
                renewable_fraction: 0.32,
                curtailment_window: false
              },
              economic_context: {
                econ_royalty_policy_id: "ECON.ROY.AQUATREATY.V1",
                escrow_id: shortfall > 0 ? `ESC.AQUATREATY.DROUGHT.2025.${receiptId.slice(-6)}` : null,
                compensation_owed_usd: compensationOwed,
                tax_policy_id: "ECON.TAX.WATER_MARKET.2025"
              },
              notes: isAg 
                ? `Allocation reduced ${Math.round((1 - approvedAF/requestedAF) * 100)}% per Tier 2 drought schedule`
                : `${f.type === 'ecological' ? 'Ecological minimum maintained per treaty obligation' : f.type === 'metro' ? 'Municipal priority protected per treaty tier' : 'Supplemental production activated'}`
            }
          };
        });

        setReceipts(newReceipts);

        const totalRequested = newReceipts.reduce((sum, r) => sum + r.requestedAF, 0);
        const totalApproved = newReceipts.reduce((sum, r) => sum + r.approvedAF, 0);
        const totalCompensation = newReceipts.reduce((sum, r) => sum + r.compensationOwed, 0);
        const agReceipts = newReceipts.filter(r => r.facilityType === 'irrigation');
        const agShortfall = agReceipts.reduce((sum, r) => sum + r.shortfallAF, 0);

        setTreatyImpact({
          totalRequested,
          totalApproved,
          shortfall: totalRequested - totalApproved,
          agShortfall,
          compensationOwed: totalCompensation,
          ecologicalMaintained: true,
          municipalProtected: true
        });

        setMetrics(prev => ({
          ...prev,
          ecologicalMaintained: 100,
          treatyCompliance: 100,
          compensationOwed: prev.compensationOwed + totalCompensation
        }));

        return updated;
      });
    }, 2500);

    setTimeout(() => {
      setScenarioStep(3);
      setBasinStatus('settling');
    }, 5000);

    setTimeout(() => {
      setBasinStatus('normal');
      setScenario(null);
      setScenarioType(null);
      setScenarioStep(0);
      setTreatyImpact(null);
      setFacilities(prev => prev.map(f => ({
        ...f,
        status: 'normal',
        treatyClause: 'normal',
        flowStatus: 'active',
        approved_af: f.requested_af || f.allocation_af,
        delivered_af: f.requested_af || f.allocation_af
      })));
    }, 8000);
  }, []);

  const runOverrideScenario = useCallback(() => {
    setScenario('running');
    setScenarioType('override');
    setScenarioStep(1);
    setBasinStatus('emergency');
    setTreatyImpact(null);

    setTimeout(() => {
      setScenarioStep(2);
      setFacilities(prev => prev.map(f => ({
        ...f,
        status: 'emergency',
        treatyClause: 'sov_override'
      })));
    }, 800);

    setTimeout(() => {
      setFacilities(prev => {
        const updated = prev.map(f => {
          if (f.type === 'irrigation') {
            return {
              ...f,
              status: 'suspended',
              treatyClause: 'contamination',
              approved_af: 0,
              delivered_af: 0,
              flowStatus: 'halted'
            };
          }
          if (f.type === 'metro') {
            const approved = Math.floor((f.requested_af || 0) * 0.7);
            return {
              ...f,
              status: 'essential-only',
              treatyClause: 'contamination',
              approved_af: approved,
              delivered_af: approved,
              flowStatus: 'restricted'
            };
          }
          if (f.type === 'ecological') {
            return {
              ...f,
              status: 'priority-flush',
              treatyClause: 'contamination',
              current_flow_af: (f.minimum_flow_af || 0) * 1.5,
              flowStatus: 'elevated'
            };
          }
          if (f.type === 'reservoir') {
            return {
              ...f,
              status: 'controlled-release',
              treatyClause: 'contamination',
              release_af_day: 3000
            };
          }
          if (f.type === 'desal') {
            return {
              ...f,
              status: 'max-output',
              treatyClause: 'contamination',
              current_output_af: f.capacity_af_day
            };
          }
          return f;
        });

        const newReceipts: Receipt[] = updated.filter(f => f.type !== 'reservoir').map(f => {
          const receiptId = `AQT-SOV-${Date.now().toString(36).toUpperCase()}-${f.id.slice(0, 3).toUpperCase()}`;
          const isAg = f.type === 'irrigation';
          const requestedAF = f.requested_af || f.minimum_flow_af || f.capacity_af_day || 0;
          const approvedAF = f.approved_af || f.current_flow_af || f.current_output_af || 0;
          const shortfall = requestedAF - approvedAF;
          const compensationOwed = isAg ? requestedAF * 200 : (f.type === 'metro' ? shortfall * 150 : 0);

          const clauseByType: Record<string, string> = {
            irrigation: "SOV_OVERRIDE_AG_FULL_SUSPENSION",
            metro: "SOV_OVERRIDE_MUNI_ESSENTIAL_ONLY",
            ecological: "SOV_OVERRIDE_ECO_PRIORITY_FLUSH",
            desal: "SOV_OVERRIDE_SUPPLEMENTAL_MAXED"
          };
          const appliedClause = clauseByType[f.type] || "SOV_OVERRIDE_CONTAMINATION_PROTECTION";

          return {
            id: receiptId,
            facilityId: f.id,
            facilityName: f.name,
            facilityType: f.type,
            timestamp: new Date().toISOString(),
            requestedAF: requestedAF,
            approvedAF: approvedAF,
            deliveredAF: approvedAF,
            shortfallAF: shortfall,
            compensationOwed: compensationOwed,
            treatyClause: clauseByType[f.type]?.replace(/SOV_OVERRIDE_/g, '').replace(/_/g, ' ') || 'Override',
            sovereignOverride: true,
            overrideReason: 'CONTAMINATION_EVENT',
            jsonSchema: {
              schema_version: "PATHWELL_TREATY_RECEIPT_V1",
              receipt_id: receiptId,
              timestamp_utc: new Date().toISOString(),
              basin_id: "RIVER_BASIN_WEST",
              facility_id: f.id,
              rights_holder_id: f.id.toUpperCase(),
              treaty_object_id: "TREATY.OBJ.BASIN_WEST-TRILATERAL-2024",
              sovereign_policy_id: "SOV.OVERRIDE.CONTAMINATION.2025",
              genesis_eo_alignment: ["§3(c)", "§3(d)(i)", "§5(c)(ii)"],
              requested_volume_af: requestedAF,
              approved_volume_af: approvedAF,
              delivered_volume_af: approvedAF,
              ecological_minimum_af: 400,
              treaty_clause_applied: appliedClause,
              priority_class: f.priority_class || 'supplemental',
              sovereign_override_applied: true,
              sovereign_override_reason: "CONTAMINATION_EVENT_DOWNSTREAM",
              sovereign_override_authority: "FEDERAL_EPA_EMERGENCY_ORDER",
              energy_context: {
                energy_source: f.type === 'desal' ? "GRID_INTENSIVE" : "GRAVITY_FED",
                grid_region: "ERCOT_WEST",
                energy_used_kwh: f.type === 'desal' ? approvedAF * 3500 : approvedAF * 50,
                grams_co2e_per_kwh: 420,
                renewable_fraction: 0.32,
                curtailment_window: false
              },
              economic_context: {
                econ_royalty_policy_id: "ECON.ROY.AQUATREATY.V1",
                escrow_id: `ESC.AQUATREATY.SOV_OVERRIDE.2025.${receiptId.slice(-6)}`,
                compensation_owed_usd: compensationOwed,
                emergency_fund_draw: true,
                tax_policy_id: "ECON.TAX.EMERGENCY_WATER.2025"
              },
              notes: isAg 
                ? `Full suspension per Sovereign Override - contamination protection downstream`
                : f.type === 'ecological' 
                  ? `Priority flush authorized - 150% minimum flow for contamination dilution`
                  : f.type === 'metro'
                    ? `Essential services only - sovereign override in effect`
                    : `Supplemental production maximized per emergency protocol`
            }
          };
        });

        setReceipts(newReceipts);

        const totalRequested = newReceipts.reduce((sum, r) => sum + r.requestedAF, 0);
        const totalApproved = newReceipts.reduce((sum, r) => sum + r.approvedAF, 0);
        const totalCompensation = newReceipts.reduce((sum, r) => sum + r.compensationOwed, 0);
        const agShortfall = newReceipts
          .filter(r => r.facilityType === 'irrigation')
          .reduce((sum, r) => sum + r.shortfallAF, 0);

        setTreatyImpact({
          totalRequested,
          totalApproved,
          shortfall: totalRequested - totalApproved,
          agShortfall,
          compensationOwed: totalCompensation,
          ecologicalMaintained: true,
          municipalProtected: true,
          sovereignOverride: true,
          overrideReason: 'Contamination Event - Downstream Protection'
        });

        setMetrics(prev => ({
          ...prev,
          ecologicalMaintained: 150,
          treatyCompliance: 100,
          compensationOwed: prev.compensationOwed + totalCompensation
        }));

        return updated;
      });
    }, 2500);

    setTimeout(() => {
      setScenarioStep(3);
      setBasinStatus('compensating');
    }, 5000);

    setTimeout(() => {
      setBasinStatus('normal');
      setScenario(null);
      setScenarioType(null);
      setScenarioStep(0);
      setTreatyImpact(null);
      setFacilities(prev => prev.map(f => ({
        ...f,
        status: 'normal',
        treatyClause: 'normal',
        flowStatus: 'active',
        approved_af: f.requested_af || f.allocation_af,
        delivered_af: f.requested_af || f.allocation_af,
        current_flow_af: f.type === 'ecological' ? 450 : f.current_flow_af
      })));
    }, 8000);
  }, []);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'normal': '#22c55e',
      'evaluating': '#eab308',
      'constrained': '#f97316',
      'protected': '#22c55e',
      'suspended': '#ef4444',
      'emergency': '#dc2626',
      'essential-only': '#f97316',
      'priority-flush': '#8b5cf6',
      'releasing': '#0ea5e9',
      'controlled-release': '#dc2626',
      'supplementing': '#06b6d4',
      'max-output': '#06b6d4',
      'settling': '#8b5cf6',
      'compensating': '#a855f7'
    };
    return colors[status] || '#64748b';
  };

  const getBasinBanner = () => {
    if (basinStatus === 'normal') return null;

    const banners: Record<string, { bg: string; border: string; text: string; icon: any }> = {
      'drought': { bg: 'bg-amber-900/80', border: 'border-amber-500', text: 'DROUGHT CONDITIONS — Treaty engine enforcing Tier 2 allocations', icon: Sun },
      'settling': { bg: 'bg-purple-900/80', border: 'border-purple-500', text: 'SETTLEMENT PROCESSING — Compensation escrows being triggered', icon: DollarSign },
      'emergency': { bg: 'bg-red-900/80', border: 'border-red-500', text: 'SOVEREIGN OVERRIDE ACTIVE — Contamination event, emergency protocols engaged', icon: AlertTriangle },
      'compensating': { bg: 'bg-purple-900/80', border: 'border-purple-500', text: 'EMERGENCY FUND DRAW — Affected rights holders receiving compensation', icon: Scale }
    };

    const banner = banners[basinStatus];
    if (!banner) return null;
    const IconComponent = banner.icon;

    return (
      <div className={`${banner.bg} ${banner.border} border-2 rounded-lg px-4 py-3 mb-4 text-center font-medium flex items-center justify-center gap-2`}>
        <IconComponent className="w-5 h-5" />
        {banner.text}
      </div>
    );
  };

  const getScenarioStepper = () => {
    if (scenarioStep === 0) return null;

    const steps = scenarioType === 'drought' 
      ? [
          { num: 1, label: 'Drought Detected', active: scenarioStep >= 1 },
          { num: 2, label: 'Treaty Enforced', active: scenarioStep >= 2 },
          { num: 3, label: 'Settlements', active: scenarioStep >= 3 }
        ]
      : [
          { num: 1, label: 'Emergency Declared', active: scenarioStep >= 1 },
          { num: 2, label: 'Override Active', active: scenarioStep >= 2 },
          { num: 3, label: 'Compensation', active: scenarioStep >= 3 }
        ];

    const activeColor = scenarioType === 'drought' ? '#f59e0b' : '#ef4444';
    const activeBg = scenarioType === 'drought' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)';
    const activeText = scenarioType === 'drought' ? '#fcd34d' : '#fca5a5';

    return (
      <div className="mb-4 flex items-center justify-center gap-2 flex-wrap">
        {steps.map((step, i) => (
          <React.Fragment key={step.num}>
            <div 
              className="flex items-center gap-2 px-3 py-1 rounded-full text-xs"
              style={{
                backgroundColor: step.active ? activeBg : 'rgba(51, 65, 85, 0.5)',
                color: step.active ? activeText : '#64748b'
              }}
            >
              <span 
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: step.active ? activeColor : '#475569',
                  color: step.active ? 'white' : '#94a3b8'
                }}
              >{step.num}</span>
              {step.label}
            </div>
            {i < steps.length - 1 && (
              <div 
                className="w-8 h-0.5" 
                style={{ backgroundColor: step.active ? activeColor : '#475569' }} 
              />
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
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 rounded-full text-cyan-400 text-sm mb-4">
              <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
              PATHWELL CONNECT™ Treaty Infrastructure Demo
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              <span className="text-cyan-400">AQUA</span><span className="text-blue-400">TREATY</span>
            </h1>
            <p className="text-slate-400 text-lg">Constitutional Control Plane for Shared Water Systems</p>
            <p className="text-slate-500 text-sm mt-2 max-w-2xl mx-auto">
              No release, diversion, or pump run without a treaty token that proves it's allowed, logged, and economically reconciled.
            </p>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="text-slate-400 text-sm">Total Flow</div>
              <div className="text-2xl font-bold text-white font-mono">{metrics.totalFlowAF.toFixed(0)} <span className="text-sm text-slate-400">AF</span></div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="text-slate-400 text-sm">Ecological Flow</div>
              <div className="text-2xl font-bold text-green-400 font-mono">{metrics.ecologicalMaintained}%</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="text-slate-400 text-sm">Treaty Compliance</div>
              <div className="text-2xl font-bold text-cyan-400 font-mono">{metrics.treatyCompliance}%</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="text-slate-400 text-sm">Allocations</div>
              <div className="text-2xl font-bold text-amber-400 font-mono">{metrics.allocationsProcessed}</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="text-slate-400 text-sm">Compensation Owed</div>
              <div className="text-2xl font-bold text-purple-400 font-mono">${(metrics.compensationOwed / 1000).toFixed(0)}K</div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map Area */}
            <div className="lg:col-span-2 bg-slate-800/30 rounded-2xl border border-slate-700 p-6">
              {/* Controls */}
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h2 className="text-lg font-semibold">West Basin River System</h2>
                <div className="flex gap-2">
                  <button
                    onClick={runDroughtScenario}
                    disabled={scenario === 'running'}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      scenario === 'running'
                        ? 'bg-slate-600 cursor-not-allowed'
                        : 'bg-amber-600 hover:bg-amber-700'
                    }`}
                  >
                    {scenario === 'running' && scenarioType === 'drought' ? (
                      <>
                        <Activity className="w-4 h-4 animate-spin" /> Running...
                      </>
                    ) : (
                      <>
                        <Sun className="w-4 h-4" /> Run Drought Treaty
                      </>
                    )}
                  </button>
                  <button
                    onClick={runOverrideScenario}
                    disabled={scenario === 'running'}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      scenario === 'running'
                        ? 'bg-slate-600 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {scenario === 'running' && scenarioType === 'override' ? (
                      <>
                        <Activity className="w-4 h-4 animate-spin" /> Running...
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4" /> Run Sovereign Override
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Scenario Stepper */}
              {getScenarioStepper()}

              {/* Basin Banner */}
              {getBasinBanner()}

              {/* Treaty Impact Callout */}
              {treatyImpact && (
                <div className={`rounded-lg px-4 py-3 mb-4 ${
                  scenarioType === 'override' 
                    ? 'bg-red-900/50 border border-red-600' 
                    : 'bg-amber-900/50 border border-amber-600'
                }`}>
                  {scenarioType === 'override' ? (
                    <div className="text-red-200 text-sm">
                      <div className="font-bold text-red-300 mb-1 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> SOVEREIGN OVERRIDE: {treatyImpact.overrideReason}
                      </div>
                      <span className="font-bold">{treatyImpact.agShortfall.toLocaleString()} AF</span> ag allocations suspended • 
                      <span className="font-bold"> ${treatyImpact.compensationOwed.toLocaleString()}</span> in emergency compensation triggered • 
                      Ecological flow elevated to <span className="font-bold">150%</span> for contamination dilution
                    </div>
                  ) : (
                    <p className="text-amber-200 text-sm">
                      <span className="font-bold">{treatyImpact.shortfall.toLocaleString()} AF</span> shortfall under Tier 2 drought • 
                      <span className="font-bold"> {treatyImpact.agShortfall.toLocaleString()} AF</span> ag reductions • 
                      <span className="font-bold">${treatyImpact.compensationOwed.toLocaleString()}</span> compensation owed • 
                      Ecological minimum <span className="text-green-400 font-bold">maintained</span>
                    </p>
                  )}
                </div>
              )}

              {/* Map */}
              <div className="relative bg-gradient-to-b from-slate-900/80 to-blue-950/50 rounded-xl h-96 overflow-hidden border border-slate-600">
                {/* Water flow background */}
                <svg className="absolute inset-0 w-full h-full opacity-30">
                  <defs>
                    <linearGradient id="riverGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.1"/>
                      <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.4"/>
                    </linearGradient>
                  </defs>
                  <path 
                    d="M 50% 0 Q 45% 25%, 50% 50% Q 55% 75%, 50% 100%" 
                    fill="none" 
                    stroke="url(#riverGradient)" 
                    strokeWidth="40"
                    opacity="0.5"
                  />
                </svg>

                {/* Connection lines */}
                <svg className="absolute inset-0 w-full h-full">
                  {facilities.filter(f => f.type !== 'reservoir').map(f => {
                    const reservoir = facilities.find(h => h.type === 'reservoir');
                    if (!reservoir) return null;
                    const isActive = scenario === 'running';
                    const flowColor = f.flowStatus === 'halted' ? '#ef4444' : 
                                     f.flowStatus === 'reduced' ? '#f97316' :
                                     f.flowStatus === 'elevated' ? '#8b5cf6' : '#0ea5e9';
                    return (
                      <line
                        key={`line-${f.id}`}
                        x1={`${reservoir.x}%`}
                        y1={`${reservoir.y}%`}
                        x2={`${f.x}%`}
                        y2={`${f.y}%`}
                        stroke={isActive ? flowColor : '#0ea5e9'}
                        strokeWidth={isActive ? 3 : 2}
                        strokeDasharray={f.flowStatus === 'halted' ? '8,8' : isActive ? '10,5' : 'none'}
                        opacity={f.flowStatus === 'halted' ? 0.4 : 0.6}
                        className={isActive && f.flowStatus !== 'halted' ? 'animate-pulse' : ''}
                      />
                    );
                  })}
                </svg>

                {/* Facility nodes */}
                {facilities.map(f => {
                  const type = facilityTypes[f.type];
                  const isSelected = selectedFacilityId === f.id;
                  const statusColor = getStatusColor(f.status);
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
                        className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all ${
                          isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''
                        }`}
                        style={{ 
                          backgroundColor: `${type.color}20`,
                          borderColor: scenario === 'running' ? statusColor : type.color,
                          boxShadow: scenario === 'running' ? `0 0 20px ${statusColor}50` : 'none'
                        }}
                      >
                        <IconComponent className="w-7 h-7" style={{ color: type.color }} />
                      </div>

                      {/* Label */}
                      <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                        <div className="text-xs font-medium text-slate-300">{f.name.split(' ').slice(0, 2).join(' ')}</div>
                        <div 
                          className="text-xs px-2 py-0.5 rounded-full mt-1"
                          style={{ backgroundColor: `${statusColor}30`, color: statusColor }}
                        >
                          {f.status}
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
                    {React.createElement(facilityTypes[selectedFacility.type].icon, { className: "w-10 h-10", style: { color: facilityTypes[selectedFacility.type].color } })}
                    <div>
                      <h3 className="font-semibold">{selectedFacility.name}</h3>
                      <div className="text-sm text-slate-400">{facilityTypes[selectedFacility.type].label}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Status */}
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <div className="text-xs text-slate-500 mb-1">Status</div>
                      <div className="font-medium" style={{ color: getStatusColor(selectedFacility.status) }}>
                        {selectedFacility.status.toUpperCase().replace('-', ' ')}
                      </div>
                    </div>

                    {/* Treaty Clause */}
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <div className="text-xs text-slate-500 mb-1">Active Treaty Clause</div>
                      <div className="font-medium text-sm" style={{ color: treatyClauses[selectedFacility.treatyClause]?.color || '#94a3b8' }}>
                        {treatyClauses[selectedFacility.treatyClause]?.label || 'Normal Operations'}
                      </div>
                    </div>

                    {/* Type-specific details */}
                    {selectedFacility.type === 'reservoir' && (
                      <>
                        <div className="bg-slate-900/50 rounded-lg p-3">
                          <div className="text-xs text-slate-500 mb-1">Storage</div>
                          <div className="font-medium font-mono">
                            {selectedFacility.storage_af?.toLocaleString()} / {selectedFacility.max_storage_af?.toLocaleString()} AF
                          </div>
                          <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-cyan-500 transition-all"
                              style={{ width: `${((selectedFacility.storage_af || 0) / (selectedFacility.max_storage_af || 1)) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-3">
                          <div className="text-xs text-slate-500 mb-1">Release Rate</div>
                          <div className="font-medium font-mono text-cyan-400">{selectedFacility.release_af_day?.toLocaleString()} AF/day</div>
                        </div>
                      </>
                    )}

                    {(selectedFacility.type === 'irrigation' || selectedFacility.type === 'metro') && (
                      <>
                        <div className="bg-slate-900/50 rounded-lg p-3">
                          <div className="text-xs text-slate-500 mb-1">Allocation</div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono">{selectedFacility.requested_af} AF requested</span>
                            <span className="text-slate-500">→</span>
                            <span className="font-mono font-medium" style={{ color: (selectedFacility.approved_af || 0) < (selectedFacility.requested_af || 0) ? '#f97316' : '#22c55e' }}>
                              {selectedFacility.approved_af} AF approved
                            </span>
                          </div>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-3">
                          <div className="text-xs text-slate-500 mb-1">Priority Class</div>
                          <div className="font-medium capitalize" style={{ color: selectedFacility.type === 'metro' ? '#8b5cf6' : '#eab308' }}>
                            {selectedFacility.priority_class}
                          </div>
                        </div>
                      </>
                    )}

                    {selectedFacility.type === 'ecological' && (
                      <>
                        <div className="bg-slate-900/50 rounded-lg p-3">
                          <div className="text-xs text-slate-500 mb-1">Flow Status</div>
                          <div className="font-medium font-mono">
                            <span style={{ color: (selectedFacility.current_flow_af || 0) >= (selectedFacility.minimum_flow_af || 0) ? '#22c55e' : '#ef4444' }}>
                              {selectedFacility.current_flow_af} AF
                            </span>
                            <span className="text-slate-500"> / {selectedFacility.minimum_flow_af} AF minimum</span>
                          </div>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-3">
                          <div className="text-xs text-slate-500 mb-1">Protected Species</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedFacility.species_protected?.map(s => (
                              <span key={s} className="text-xs bg-green-900/50 text-green-400 px-2 py-1 rounded">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {selectedFacility.type === 'desal' && (
                      <>
                        <div className="bg-slate-900/50 rounded-lg p-3">
                          <div className="text-xs text-slate-500 mb-1">Output</div>
                          <div className="font-medium font-mono text-cyan-400">
                            {selectedFacility.current_output_af} / {selectedFacility.capacity_af_day} AF/day
                          </div>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-3">
                          <div className="text-xs text-slate-500 mb-1">Energy Intensity</div>
                          <div className="font-medium font-mono text-amber-400">{selectedFacility.energy_mwh_per_af} MWh/AF</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <Droplets className="w-16 h-16 mx-auto mb-2 text-slate-600" />
                    <p>Select a facility to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Treaty Object Card */}
          {receipts.length > 0 && (
            <div className="mt-6 bg-gradient-to-r from-slate-800/50 to-cyan-900/30 rounded-2xl border border-cyan-700/50 p-5">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="text-xs text-cyan-400 font-medium mb-1">ACTIVE TREATY</div>
                  <div className="text-lg font-bold text-white font-mono">Basin West Trilateral 2024</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">All receipts derive from this treaty</div>
                  <div className="text-xs text-cyan-500 font-mono mt-1">{receipts.length} receipts generated</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Parties</div>
                  <div className="text-slate-300">State A, State B, Federal Basin Authority</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Drought Tiers</div>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs px-2 py-0.5 rounded bg-green-900/50 text-green-400">Normal</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-yellow-900/50 text-yellow-400">Tier 1</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-orange-900/50 text-orange-400">Tier 2</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-red-900/50 text-red-400">Tier 3</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Override Paths</div>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs px-2 py-0.5 rounded bg-purple-900/50 text-purple-400">Contamination</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-red-900/50 text-red-400">National Emergency</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Economic Hooks</div>
                  <div className="text-slate-300 font-mono text-xs">Economic Settlement Engine V1</div>
                </div>
              </div>
            </div>
          )}

          {/* Receipts Panel */}
          {receipts.length > 0 && (
            <div className="mt-6 bg-slate-800/30 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                AQUATREATY Receipts
                <span className="text-xs bg-slate-700 px-2 py-1 rounded-full ml-auto">
                  {scenarioType === 'override' ? 'Sovereign Override Settlement' : 'Drought Treaty Enforcement'}
                </span>
              </h3>
              <div className="grid gap-4">
                {receipts.map(receipt => {
                  const facilityType = facilityTypes[receipt.facilityType];
                  const FacilityIcon = facilityType?.icon;
                  return (
                    <div key={receipt.id} className={`bg-slate-900/50 rounded-xl p-4 border ${
                      receipt.sovereignOverride ? 'border-red-700' : 'border-slate-700'
                    }`}>
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          {FacilityIcon && <FacilityIcon className="w-6 h-6" style={{ color: facilityType.color }} />}
                          <div>
                            <div className="font-medium">{receipt.facilityName}</div>
                            <div className="text-xs text-slate-500 font-mono">{receipt.id}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${receipt.sovereignOverride ? 'text-red-400' : 'text-amber-400'}`}>
                            {receipt.treatyClause}
                          </div>
                          {receipt.sovereignOverride && (
                            <div className="text-xs text-red-500">Sovereign Override</div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm mb-3 flex-wrap">
                        <span className="text-slate-400">
                          Requested: <span className="text-white font-mono">{receipt.requestedAF} AF</span>
                        </span>
                        <span className="text-slate-500">→</span>
                        <span style={{ color: receipt.approvedAF < receipt.requestedAF ? '#f97316' : '#22c55e' }}>
                          Approved: <span className="font-mono font-medium">{receipt.approvedAF} AF</span>
                        </span>
                        {receipt.shortfallAF > 0 && (
                          <span className="text-red-400">
                            Shortfall: <span className="font-mono">{receipt.shortfallAF} AF</span>
                          </span>
                        )}
                        {receipt.compensationOwed > 0 && (
                          <span className="text-purple-400">
                            Compensation: <span className="font-mono font-medium">${receipt.compensationOwed.toLocaleString()}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {receipt.sovereignOverride && (
                            <span className="text-xs bg-red-900/50 text-red-400 px-2 py-1 rounded">
                              {receipt.overrideReason}
                            </span>
                          )}
                          {receipt.jsonSchema.economic_context.escrow_id && (
                            <span className="text-xs bg-purple-900/50 text-purple-400 px-2 py-1 rounded">
                              ESCROW ACTIVE
                            </span>
                          )}
                          <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-400">
                            {receipt.jsonSchema.basin_id}
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
            <p>AQUATREATY™ — Constitutional Control Plane for Shared Water Systems</p>
            <p className="mt-1">
              <span className="text-cyan-400">Treaty Objects</span> + <span className="text-red-400">Sovereign Override</span> + <span className="text-purple-400">Economic Gates</span> — 
              Every release, diversion, and pump run is logged, enforced, and economically reconciled.
            </p>
            <p className="mt-1 text-slate-600">
              Applicable to Colorado River, Rio Grande, cross-border aquifers, and multi-state compacts.
            </p>
            <p className="mt-4 text-slate-600 text-xs">© 2025 AnchorTrust Holdings LLC — PATHWELL CONNECT™</p>
          </div>
        </div>
      </div>
    </div>
  );
}

