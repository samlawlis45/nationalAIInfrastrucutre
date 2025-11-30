"use client";

import React, { useState, useCallback, useRef } from 'react';
import { CheckCircle2, Activity, Network, Shield, AlertTriangle, Package, Truck, Thermometer, ArrowRight, Ship, Factory, Building2, Stethoscope, Settings, Radio, ClipboardList, BarChart3, TrendingUp, Ghost, RefreshCw } from 'lucide-react';

// ============ RECEIPT SCHEMAS ============
const createBaseReceipt = (type: string, corridorId: string, assetBatchId: string, shipmentId: string | null, orderId: string | null) => ({
  schema_version: type,
  receipt_id: `${type.split('_')[1]}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`.toUpperCase(),
  timestamp: new Date().toISOString(),
  corridor_id: corridorId,
  asset_batch_id: assetBatchId,
  shipment_id: shipmentId,
  order_ids: orderId ? [orderId] : [],
  sku: "CRITICAL_MEDKIT_X",
  plan_lineage_id: `PLANLINEAGE_CRITMEDX_2025W12`,
  treaty_object_id: "TREATY.OBJ.GRID2SUPPLY.MULTIPARTY.2025",
  summary: "", // Added for type safety
  stage: "",
  node_role: ""
});

// ============ MAIN COMPONENT ============
export default function Grid2SupplyDemo() {
  // Core state
  const [scenario, setScenario] = useState<string | null>(null);
  const [scenarioType, setScenarioType] = useState<string | null>(null);
  const [scenarioStep, setScenarioStep] = useState(0);
  
  // Corridor state
  const [corridorLegs, setCorridorLegs] = useState([
    { id: 'port', name: 'Shanghai Port', type: 'origin', units: 0, status: 'idle' },
    { id: 'cm', name: 'Contract Mfg (CM Y)', type: 'manufacturer', units: 0, status: 'idle' },
    { id: 'dc', name: 'TTU Distribution Center', type: 'hub', units: 0, status: 'idle' },
    { id: 'urban', name: 'Urban Hospital', type: 'customer', units: 0, status: 'idle' },
    { id: 'rural', name: 'Rural Clinic', type: 'customer', units: 0, status: 'idle' }
  ]);
  
  // Orchestrator state
  const [showOrchestratorView, setShowOrchestratorView] = useState(false);
  const [orchestratorReceipts, setOrchestratorReceipts] = useState<{
    plan: any | null;
    digital: any | null;
    physical: any | null;
    iot: any | null;
  }>({ plan: null, digital: null, physical: null, iot: null });
  const [anomaly, setAnomaly] = useState<any | null>(null);
  
  // End-to-End Flow state
  const [showEndToEndFlow, setShowEndToEndFlow] = useState(false);
  const [fabricLog, setFabricLog] = useState<any[]>([]);
  const [swimlaneNodes, setSwimlaneNodes] = useState<any[]>([]);
  const [selectedFabricReceipt, setSelectedFabricReceipt] = useState<any | null>(null);
  
  // Common state
  const [receipts, setReceipts] = useState<any[]>([]);
  const [expandedReceipt, setExpandedReceipt] = useState<number | null>(null);
  const [demandSpike, setDemandSpike] = useState<any | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [metrics, setMetrics] = useState({
    totalUnits: 100,
    urbanAllocation: 60,
    ruralAllocation: 40,
    deliveryConfidence: 98,
    corridorHealth: 100
  });

  // Shared IDs for current scenario
  const idsRef = useRef({
    corridorId: "GRID2SUPPLY_CORRIDOR_TX_2025",
    assetBatchId: null as string | null,
    shipmentId: null as string | null,
    orderId: null as string | null,
    palletId: null as string | null,
    deviceId: null as string | null
  });

  // ============ RESET ============
  const resetScenario = useCallback(() => {
    setScenario(null);
    setScenarioType(null);
    setScenarioStep(0);
    setCorridorLegs([
      { id: 'port', name: 'Shanghai Port', type: 'origin', units: 0, status: 'idle' },
      { id: 'cm', name: 'Contract Mfg (CM Y)', type: 'manufacturer', units: 0, status: 'idle' },
      { id: 'dc', name: 'TTU Distribution Center', type: 'hub', units: 0, status: 'idle' },
      { id: 'urban', name: 'Urban Hospital', type: 'customer', units: 0, status: 'idle' },
      { id: 'rural', name: 'Rural Clinic', type: 'customer', units: 0, status: 'idle' }
    ]);
    setShowOrchestratorView(false);
    setOrchestratorReceipts({ plan: null, digital: null, physical: null, iot: null });
    setAnomaly(null);
    setShowEndToEndFlow(false);
    setFabricLog([]);
    setSwimlaneNodes([]);
    setSelectedFabricReceipt(null);
    setReceipts([]);
    setExpandedReceipt(null);
    setDemandSpike(null);
    setMetrics({
      totalUnits: 100,
      urbanAllocation: 60,
      ruralAllocation: 40,
      deliveryConfidence: 98,
      corridorHealth: 100
    });
    idsRef.current = {
      corridorId: "GRID2SUPPLY_CORRIDOR_TX_2025",
      assetBatchId: null,
      shipmentId: null,
      orderId: null,
      palletId: null,
      deviceId: null
    };
  }, []);

  // ============ ADD TO FABRIC LOG ============
  const addToFabricLog = useCallback((receipt: any, stage: string, nodeRole: string) => {
    const logEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2,4)}`,
      timestamp: new Date(),
      receipt_type: receipt.schema_version,
      stage: stage,
      node_role: nodeRole,
      summary: receipt.summary || `${receipt.schema_version.split('_').slice(1,3).join(' ')}`,
      receipt: receipt
    };
    setFabricLog(prev => [...prev, logEntry]);
    return logEntry;
  }, []);

  // ============ ADD SWIMLANE NODE ============
  const addSwimlaneNode = useCallback((laneIndex: number, receipt: any, label: string, status = 'complete') => {
    const node = {
      id: `swim-${Date.now()}-${Math.random().toString(36).slice(2,4)}`,
      laneIndex,
      receipt,
      label,
      status,
      timestamp: new Date()
    };
    setSwimlaneNodes(prev => [...prev, node]);
    return node;
  }, []);

  // ============ SCENARIO 1: BASE S&OP PLAN ============
  const runBasePlan = useCallback(() => {
    setScenario('running');
    setScenarioType('base');
    setScenarioStep(1);
    setReceipts([]);
    
    const corridorId = idsRef.current.corridorId;
    const assetBatchId = `CRITMEDX-BATCH-${Date.now().toString(36).toUpperCase()}`;
    idsRef.current.assetBatchId = assetBatchId;

    // Phase 1: Plan receipt
    setTimeout(() => {
      const planReceipt = {
        ...createBaseReceipt('PATHWELL_SUPPLY_PLAN_RECEIPT_V1', corridorId, assetBatchId, null, null),
        stage: "PLANNING",
        node_role: "S&OP_SYSTEM",
        plan_context: {
          plan_cycle: "S&OP_2025W12",
          planning_horizon_days: 30,
          demand_signal_source: "CUSTOMER_FORECAST_TTU"
        },
        plan_decisions: [
          { node_id: "TTU_DC", decision: "DISTRIBUTE", quantity: 100, sku: "CRITICAL_MEDKIT_X" },
          { node_id: "URBAN_HOSPITAL", decision: "ALLOCATE", quantity: 60, sku: "CRITICAL_MEDKIT_X" },
          { node_id: "RURAL_CLINIC", decision: "ALLOCATE", quantity: 40, sku: "CRITICAL_MEDKIT_X" }
        ],
        service_tiers: {
          tier1_urban: { fill_rate: 0.98, lead_time_days: 5 },
          tier2_rural: { fill_rate: 0.92, lead_time_days: 10 }
        }
      };
      setReceipts([planReceipt]);
      setCorridorLegs(prev => prev.map((leg, i) => 
        i === 0 ? { ...leg, units: 100, status: 'active' } : leg
      ));
      setScenarioStep(2);
    }, 800);

    // Phase 2-4: Flow through corridor
    setTimeout(() => {
      setCorridorLegs(prev => prev.map((leg, i) => ({
        ...leg,
        units: i <= 1 ? 100 : 0,
        status: i <= 1 ? 'active' : 'idle'
      })));
      setScenarioStep(3);
    }, 2000);

    setTimeout(() => {
      setCorridorLegs(prev => prev.map((leg, i) => ({
        ...leg,
        units: i === 2 ? 100 : (i === 3 ? 60 : (i === 4 ? 40 : 0)),
        status: i >= 2 ? 'active' : 'delivered'
      })));
      setScenarioStep(4);
    }, 3500);

    setTimeout(() => {
      setCorridorLegs(prev => prev.map(leg => ({ ...leg, status: 'delivered' })));
      setScenario('complete');
    }, 5000);
  }, []);

  // ============ SCENARIO 2: DEMAND SPIKE ============
  const runDemandSpike = useCallback(() => {
    setScenario('running');
    setScenarioType('spike');
    setScenarioStep(1);
    setReceipts([]);
    
    const corridorId = idsRef.current.corridorId;
    const assetBatchId = `CRITMEDX-BATCH-${Date.now().toString(36).toUpperCase()}`;

    // Phase 1: Initial plan
    setTimeout(() => {
      const planReceipt = {
        ...createBaseReceipt('PATHWELL_SUPPLY_PLAN_RECEIPT_V1', corridorId, assetBatchId, null, null),
        stage: "PLANNING",
        node_role: "S&OP_SYSTEM",
        plan_decisions: [
          { node_id: "URBAN_HOSPITAL", decision: "ALLOCATE", quantity: 60 },
          { node_id: "RURAL_CLINIC", decision: "ALLOCATE", quantity: 40 }
        ]
      };
      setReceipts([planReceipt]);
      setScenarioStep(2);
    }, 800);

    // Phase 2: Demand spike detected
    setTimeout(() => {
      setDemandSpike({
        source: 'RURAL_CLINIC',
        increase: 20,
        reason: 'Seasonal flu outbreak',
        newDemand: 55
      });
      setMetrics(prev => ({ ...prev, ruralAllocation: 55, urbanAllocation: 45 }));
      setScenarioStep(3);
    }, 2500);

    // Phase 3: Replan receipt
    setTimeout(() => {
      const replanReceipt = {
        ...createBaseReceipt('PATHWELL_SUPPLY_PLAN_REPLAN_V1', corridorId, assetBatchId, null, null),
        stage: "REPLANNING",
        node_role: "S&OP_SYSTEM",
        trigger: {
          type: "DEMAND_SPIKE",
          source_node: "RURAL_CLINIC",
          demand_delta_percent: 37.5
        },
        plan_adjustments: [
          { node_id: "URBAN_HOSPITAL", adjustment: -15, new_quantity: 45, reason: "T2_TO_T1_REALLOCATION" },
          { node_id: "RURAL_CLINIC", adjustment: +15, new_quantity: 55, reason: "DEMAND_SPIKE_RESPONSE" }
        ],
        economic_settlement: {
          reallocation_compensation_usd: 2500,
          from_node: "RURAL_CLINIC",
          to_node: "URBAN_HOSPITAL",
          treaty_clause: "REALLOCATION_COMPENSATION_T2_TAKES_FROM_T1"
        }
      };
      setReceipts(prev => [...prev, replanReceipt]);
      setScenarioStep(4);
    }, 4000);

    setTimeout(() => {
      setCorridorLegs(prev => prev.map((leg, i) => ({
        ...leg,
        units: i === 3 ? 45 : (i === 4 ? 55 : 0),
        status: 'delivered'
      })));
      setScenario('complete');
    }, 5500);
  }, []);

  // ============ SCENARIO 3: GHOST EXPEDITE ============
  const runGhostExpedite = useCallback(() => {
    setScenario('running');
    setScenarioType('ghost');
    setScenarioStep(1);
    setReceipts([]);
    setShowOrchestratorView(true);
    setAnomaly(null);
    setOrchestratorReceipts({ plan: null, digital: null, physical: null, iot: null });
    
    const corridorId = idsRef.current.corridorId;
    const assetBatchId = `CRITMEDX-BATCH-${Date.now().toString(36).toUpperCase()}`;
    const shipmentId = `SHP-${Date.now().toString(36).toUpperCase()}`;

    // Phase 1: Plan says TRUCK, no expedite
    setTimeout(() => {
      const planReceipt = {
        ...createBaseReceipt('PATHWELL_SUPPLY_PLAN_RECEIPT_V1', corridorId, assetBatchId, shipmentId, null),
        stage: "PLANNING",
        node_role: "S&OP_SYSTEM",
        summary: "Plan: 40u via TRUCK, no expedite",
        logistics_plan: {
          planned_mode: "TRUCK",
          planned_cost_usd: 5200,
          expedite_authorized: false,
          treaty_clause: "NO_AIR_EXPEDITE_FOR_T2"
        },
        plan_decisions: [
          { node_id: "RURAL_CLINIC", decision: "ALLOCATE", quantity: 40, mode: "TRUCK" }
        ]
      };
      setOrchestratorReceipts(prev => ({ ...prev, plan: planReceipt }));
      setReceipts([planReceipt]);
      setScenarioStep(2);
    }, 1000);

    // Phase 2: Digital shows forwarder booked AIR
    setTimeout(() => {
      const digitalReceipt = {
        ...createBaseReceipt('PATHWELL_SUPPLY_DIGITAL_V1', corridorId, assetBatchId, shipmentId, null),
        stage: "LOGISTICS_PROVIDER",
        node_role: "FORWARDER",
        summary: "⚠️ Forwarder booked AIR ($50,700)",
        actor: { role: "Forwarder", org_id: "FORWARDER_A" },
        event_type: "BOOKING_CREATED",
        booking_details: {
          mode: "AIR",
          carrier: "ACE_CARGO",
          origin: "SHANGHAI_PVG",
          destination: "DFW_CARGO"
        },
        economic_claim: {
          total_claim_usd: 50700,
          breakdown: { base_freight: 42000, fuel_surcharge: 5200, handling: 3500 }
        }
      };
      setOrchestratorReceipts(prev => ({ ...prev, digital: digitalReceipt }));
      setReceipts(prev => [...prev, digitalReceipt]);
      setScenarioStep(3);
    }, 2500);

    // Phase 3: Physical confirms AIR movement
    setTimeout(() => {
      const physicalReceipt = {
        ...createBaseReceipt('PATHWELL_SUPPLY_PHYSICAL_V1', corridorId, assetBatchId, shipmentId, null),
        stage: "LOGISTICS_PROVIDER",
        node_role: "CARRIER",
        summary: "⚠️ Airport scan: 35u on flight ACE-2847",
        actor: { role: "Carrier", device_id: "SCANNER-DFW-CARGO-07" },
        event_type: "DEPARTURE_SCAN",
        scan_details: {
          mode: "AIR",
          flight_number: "ACE-2847",
          measured_quantity: 35,
          expected_quantity: 40,
          quantity_variance: -5
        },
        gps_coords: { lat: 32.8998, lon: -97.0403, facility: "DFW_AIR_CARGO" }
      };
      setOrchestratorReceipts(prev => ({ ...prev, physical: physicalReceipt }));
      setReceipts(prev => [...prev, physicalReceipt]);
      setScenarioStep(4);
    }, 4000);

    // Phase 4: Anomaly detected
    setTimeout(() => {
      const anomalyData = {
        type: "UNAUTHORIZED_EXPEDITE",
        detected_at: new Date().toISOString(),
        evidence: {
          plan_mode: "TRUCK",
          digital_mode: "AIR",
          physical_mode: "AIR",
          expedite_authorized: false
        },
        economic_impact: {
          planned_cost_usd: 5200,
          actual_cost_usd: 50700,
          cost_delta_usd: 45500
        },
        recommended_actions: [
          { action: "BLOCK_PAYMENT", target: "FORWARDER_A", amount_usd: 50700 },
          { action: "FLAG_NONCOMPLIANT", target: "FORWARDER_A", duration_days: 90 },
          { action: "TRIGGER_REPLAN", target: "SOP_2025W13" }
        ]
      };
      setAnomaly(anomalyData);
      setScenarioStep(5);
      setScenario('complete');
    }, 5500);
  }, []);

  // ============ SCENARIO 4: COLD CHAIN BREACH ============
  const runColdChainBreach = useCallback(() => {
    setScenario('running');
    setScenarioType('coldchain');
    setScenarioStep(1);
    setReceipts([]);
    setShowOrchestratorView(true);
    setAnomaly(null);
    setOrchestratorReceipts({ plan: null, digital: null, physical: null, iot: null });
    
    const corridorId = idsRef.current.corridorId;
    const assetBatchId = `CRITMEDX-BATCH-${Date.now().toString(36).toUpperCase()}`;
    const shipmentId = `SHP-${Date.now().toString(36).toUpperCase()}`;
    const orderId = `ORD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const palletId = `PALLET-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const deviceId = `TEMP_TAG_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    // Phase 1: IoT Binding Receipt (Device → Asset → Business Object)
    setTimeout(() => {
      const iotBinding = {
        schema_version: "PATHWELL_IOT_BINDING_V1",
        receipt_id: `BIND-${Date.now().toString(36).toUpperCase()}`,
        timestamp: new Date().toISOString(),
        corridor_id: corridorId,
        stage: "LOGISTICS_PROVIDER",
        node_role: "WAREHOUSE",
        summary: `Device ${deviceId} bound to ${palletId}`,
        device: {
          device_id: deviceId,
          device_type: "TEMPERATURE_TAG",
          gateway_id: "IOT_GATE_TX_PORT_01",
          attested: true
        },
        asset: {
          asset_id: palletId,
          asset_type: "PALLET"
        },
        business_context: {
          corridor_id: corridorId,
          shipment_id: shipmentId,
          order_ids: [orderId],
          sku_batch_ids: [assetBatchId]
        }
      };
      setOrchestratorReceipts(prev => ({ ...prev, plan: iotBinding }));
      setReceipts([iotBinding]);
      setScenarioStep(2);
    }, 1000);

    // Phase 2: Normal temperature readings
    setTimeout(() => {
      const normalIotEvent = {
        schema_version: "PATHWELL_IOT_EVENT_V1",
        receipt_id: `IOT-${Date.now().toString(36).toUpperCase()}`,
        timestamp: new Date().toISOString(),
        corridor_id: corridorId,
        asset_batch_id: assetBatchId,
        shipment_id: shipmentId,
        stage: "IN_TRANSIT",
        node_role: "SENSOR",
        summary: "Temp: 4.2°C ✓ (range: 2-8°C)",
        device: { device_id: deviceId, attested: true },
        measurement: {
          type: "TEMPERATURE",
          value_celsius: 4.2,
          thresholds: { min: 2.0, max: 8.0 },
          status: "IN_RANGE"
        },
        asset: { asset_id: palletId },
        business_context: {
          corridor_id: corridorId,
          shipment_id: shipmentId,
          order_ids: [orderId]
        }
      };
      setOrchestratorReceipts(prev => ({ ...prev, digital: normalIotEvent }));
      setReceipts(prev => [...prev, normalIotEvent]);
      setScenarioStep(3);
    }, 2500);

    // Phase 3: Temperature breach!
    setTimeout(() => {
      const breachIotEvent = {
        schema_version: "PATHWELL_IOT_EVENT_V1",
        receipt_id: `IOT-${Date.now().toString(36).toUpperCase()}`,
        timestamp: new Date().toISOString(),
        corridor_id: corridorId,
        asset_batch_id: assetBatchId,
        shipment_id: shipmentId,
        stage: "IN_TRANSIT",
        node_role: "SENSOR",
        summary: "⚠️ TEMP BREACH: 12.8°C (max: 8°C)",
        device: { device_id: deviceId, attested: true },
        measurement: {
          type: "TEMPERATURE",
          value_celsius: 12.8,
          thresholds: { min: 2.0, max: 8.0 },
          status: "OUT_OF_RANGE",
          breach_duration_minutes: 47
        },
        location: {
          lat: 32.8968,
          lon: -97.0380,
          facility_id: "DFW_AIR_CARGO",
          facility_type: "AIRPORT"
        },
        asset: { asset_id: palletId },
        business_context: {
          corridor_id: corridorId,
          shipment_id: shipmentId,
          order_ids: [orderId],
          sku_batch_ids: [assetBatchId]
        }
      };
      setOrchestratorReceipts(prev => ({ ...prev, physical: breachIotEvent }));
      setReceipts(prev => [...prev, breachIotEvent]);
      setScenarioStep(4);
    }, 4000);

    // Phase 4: Anomaly + recommended actions
    setTimeout(() => {
      const anomalyData = {
        type: "COLD_CHAIN_BREACH",
        detected_at: new Date().toISOString(),
        trigger: "IOT_EVENT_TEMP_OUT_OF_RANGE",
        evidence: {
          device_id: deviceId,
          asset_id: palletId,
          max_temp_celsius: 12.8,
          threshold_max_celsius: 8.0,
          breach_duration_minutes: 47
        },
        affected: {
          orders: [orderId],
          batch: assetBatchId,
          quantity_at_risk: 100
        },
        economic_impact: {
          batch_value_usd: 125000,
          insurance_claim_usd: 125000,
          emergency_reorder_cost_usd: 18500
        },
        recommended_actions: [
          { action: "QUARANTINE_BATCH", target: assetBatchId, reason: "COLD_CHAIN_BREACH" },
          { action: "FILE_INSURANCE_CLAIM", target: "INSURER_COLDCHAIN_INC", amount_usd: 125000 },
          { action: "EMERGENCY_REORDER", source: "TIER2_SUPPLIER_Z", quantity: 100 },
          { action: "NOTIFY_DOWNSTREAM", targets: ["URBAN_HOSPITAL", "RURAL_CLINIC"] }
        ]
      };
      setAnomaly(anomalyData);
      setScenarioStep(5);
      setScenario('complete');
    }, 5500);
  }, []);

  // ============ SCENARIO 5: END-TO-END FLOW ============
  const runEndToEndFlow = useCallback(() => {
    setScenario('running');
    setScenarioType('e2e');
    setScenarioStep(1);
    setReceipts([]);
    setShowEndToEndFlow(true);
    setFabricLog([]);
    setSwimlaneNodes([]);
    
    const corridorId = idsRef.current.corridorId;
    const assetBatchId = `CRITMEDX-BATCH-${Date.now().toString(36).toUpperCase()}`;
    const shipmentId = `SHP-${Date.now().toString(36).toUpperCase()}`;
    const orderId = `ORD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const palletId = `PALLET-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const deviceId = `TEMP_TAG_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    idsRef.current = { corridorId, assetBatchId, shipmentId, orderId, palletId, deviceId };

    const stages = [
      // Lane 0: Tier-2 Supplier
      { delay: 500, lane: 0, type: 'PLAN', label: 'S&OP Plan', stage: 'UPSTREAM_SUPPLIER', role: 'S&OP_SYSTEM' },
      { delay: 1000, lane: 0, type: 'DIGITAL_PO', label: 'PO to T2', stage: 'UPSTREAM_SUPPLIER', role: 'BUYER' },
      
      // Lane 1: Contract Manufacturer
      { delay: 1800, lane: 1, type: 'PHYSICAL_PRODUCTION', label: '100u Produced', stage: 'CONTRACT_MANUFACTURER', role: 'CM' },
      { delay: 2300, lane: 1, type: 'DIGITAL_ASN', label: 'ASN: 100u', stage: 'CONTRACT_MANUFACTURER', role: 'CM' },
      
      // Lane 2: Logistics Provider
      { delay: 3000, lane: 2, type: 'DIGITAL_BOOKING', label: 'Truck Booking', stage: 'LOGISTICS_PROVIDER', role: 'FORWARDER' },
      { delay: 3500, lane: 2, type: 'IOT_BINDING', label: 'IoT Bound', stage: 'LOGISTICS_PROVIDER', role: 'WAREHOUSE' },
      { delay: 4000, lane: 2, type: 'PHYSICAL_SCAN', label: 'Depart Scan', stage: 'LOGISTICS_PROVIDER', role: 'CARRIER' },
      
      // Lane 3: In Transit
      { delay: 4800, lane: 3, type: 'IOT_EVENT', label: 'Temp: 4.2°C ✓', stage: 'IN_TRANSIT', role: 'SENSOR' },
      { delay: 5300, lane: 3, type: 'IOT_EVENT', label: 'Temp: 5.1°C ✓', stage: 'IN_TRANSIT', role: 'SENSOR' },
      
      // Lane 4: TTU DC
      { delay: 6000, lane: 4, type: 'PHYSICAL_ARRIVE', label: 'Arrive DC', stage: 'REGIONAL_HUB', role: 'WAREHOUSE' },
      { delay: 6500, lane: 4, type: 'PLAN_ALLOCATE', label: 'Allocate', stage: 'REGIONAL_HUB', role: 'WMS' },
      
      // Lane 5: Downstream
      { delay: 7200, lane: 5, type: 'PHYSICAL_DELIVERY', label: '45u Urban', stage: 'DOWNSTREAM_CUSTOMER', role: 'CARRIER' },
      { delay: 7700, lane: 5, type: 'PHYSICAL_DELIVERY', label: '55u Rural', stage: 'DOWNSTREAM_CUSTOMER', role: 'CARRIER' }
    ];

    stages.forEach(({ delay, lane, type, label, stage, role }) => {
      setTimeout(() => {
        const receipt = {
          schema_version: `PATHWELL_${type}_V1`,
          receipt_id: `${type}-${Date.now().toString(36).toUpperCase()}`,
          timestamp: new Date().toISOString(),
          corridor_id: corridorId,
          asset_batch_id: assetBatchId,
          shipment_id: shipmentId,
          order_ids: [orderId],
          stage: stage,
          node_role: role,
          summary: label
        };
        
        addToFabricLog(receipt, stage, role);
        addSwimlaneNode(lane, receipt, label, 'complete');
        setReceipts(prev => [...prev, receipt]);
        setScenarioStep(prev => prev + 1);
      }, delay);
    });

    setTimeout(() => {
      setScenario('complete');
    }, 8500);
  }, [addToFabricLog, addSwimlaneNode]);

  // ============ SWIMLANE LANES CONFIG ============
  const swimlaneLanes = [
    { id: 'tier2', name: 'Tier-2 Supplier', icon: <Factory className="w-4 h-4" />, color: 'blue' },
    { id: 'cm', name: 'Contract Manufacturer', icon: <Settings className="w-4 h-4" />, color: 'indigo' },
    { id: 'logistics', name: 'Logistics Provider', icon: <Truck className="w-4 h-4" />, color: 'purple' },
    { id: 'transit', name: 'In Transit', icon: <Radio className="w-4 h-4" />, color: 'amber' },
    { id: 'dc', name: 'TTU DC', icon: <Building2 className="w-4 h-4" />, color: 'teal' },
    { id: 'downstream', name: 'Downstream', icon: <Stethoscope className="w-4 h-4" />, color: 'green' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Grid to Supply
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              PATHWELL CONNECT™ — From customer's customer to supplier's supplier
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/20">Genesis EO §3(a)(i)</span>
            <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-700 rounded-full px-4 py-2">
              <span className="text-xs text-slate-400">Constitutional Supply Chain Orchestrator</span>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          
          {/* Corridor Visualization */}
          {!showEndToEndFlow && (
            <div className="bg-slate-900/50 rounded-xl p-6 mb-6 border border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                    <Network className="w-5 h-5 text-cyan-400" />
                    Supply Corridor
                </h2>
                <div className="text-xs text-slate-400 font-mono">
                  corridor_id: <span className="text-cyan-400">{idsRef.current.corridorId}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
                {corridorLegs.map((leg, i) => (
                  <React.Fragment key={leg.id}>
                    <div className={`flex-shrink-0 p-4 rounded-lg border-2 min-w-[140px] text-center transition-all duration-500 ${
                      leg.status === 'active' ? 'border-cyan-500 bg-cyan-900/20 shadow-[0_0_15px_rgba(6,182,212,0.3)]' :
                      leg.status === 'delivered' ? 'border-green-500 bg-green-900/20' :
                      'border-slate-700 bg-slate-800/30'
                    }`}>
                      <div className="text-2xl mb-2 flex justify-center">
                        {leg.type === 'origin' ? <Ship className="w-8 h-8 text-blue-400" /> : 
                         leg.type === 'manufacturer' ? <Factory className="w-8 h-8 text-amber-400" /> :
                         leg.type === 'hub' ? <Building2 className="w-8 h-8 text-purple-400" /> : <Stethoscope className="w-8 h-8 text-red-400" />}
                      </div>
                      <div className="text-xs font-medium text-slate-300 truncate">{leg.name}</div>
                      {leg.units > 0 && (
                        <div className="text-sm font-bold text-cyan-400 mt-1">{leg.units}u</div>
                      )}
                    </div>
                    {i < corridorLegs.length - 1 && (
                      <div className="flex-shrink-0 flex items-center justify-center px-2">
                         <div className={`h-0.5 w-8 transition-colors duration-500 ${leg.status === 'active' || leg.status === 'delivered' ? 'bg-cyan-500' : 'bg-slate-700'}`}></div>
                         <div className={`w-2 h-2 rotate-45 border-t-2 border-r-2 -ml-1 transition-colors duration-500 ${leg.status === 'active' || leg.status === 'delivered' ? 'border-cyan-500' : 'border-slate-700'}`}></div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* End-to-End Swimlane View */}
          {showEndToEndFlow && (
            <div className="bg-slate-900/50 rounded-xl border border-slate-800 mb-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="p-4 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-purple-400" />
                        End-to-End Flow (Suppliers → TTU → Clinics)
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Swimlane view for batch: <span className="text-cyan-400 font-mono">{idsRef.current.assetBatchId || 'Generating...'}</span>
                    </p>
                  </div>
                  <div className="text-xs bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                    {swimlaneNodes.length} receipts logged
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Swimlane Diagram */}
                <div className="lg:col-span-2 p-4 border-r border-slate-800 overflow-x-auto">
                  <div className="min-w-[600px]">
                    {swimlaneLanes.map((lane, laneIndex) => (
                      <div key={lane.id} className="flex items-center mb-4">
                        <div className="w-40 flex-shrink-0 pr-4">
                          <div className="flex items-center gap-2">
                            <span>{lane.icon}</span>
                            <span className="text-xs text-slate-400 font-medium truncate">{lane.name}</span>
                          </div>
                        </div>
                        <div className="flex-1 h-12 bg-slate-800/30 rounded-lg relative flex items-center px-2 gap-2 border border-slate-800">
                          {swimlaneNodes
                            .filter(node => node.laneIndex === laneIndex)
                            .map((node) => (
                              <div
                                key={node.id}
                                className={`px-3 py-1 rounded text-[10px] font-medium cursor-pointer transition-transform hover:scale-105 animate-in zoom-in duration-300
                                  ${node.receipt.schema_version.includes('IOT') ? 'bg-amber-900/40 text-amber-300 border border-amber-500/50' :
                                    node.receipt.schema_version.includes('PHYSICAL') ? 'bg-purple-900/40 text-purple-300 border border-purple-500/50' :
                                    node.receipt.schema_version.includes('DIGITAL') ? 'bg-blue-900/40 text-blue-300 border border-blue-500/50' :
                                    'bg-green-900/40 text-green-300 border border-green-500/50'
                                  }`}
                                onClick={() => setSelectedFabricReceipt(node.receipt)}
                              >
                                {node.label}
                              </div>
                            ))
                          }
                          {swimlaneNodes.filter(n => n.laneIndex === laneIndex).length === 0 && (
                            <div className="text-slate-600 text-xs italic ml-2">Waiting...</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Corridor Spine Legend */}
                  <div className="mt-6 pt-4 border-t border-slate-800">
                    <div className="text-xs text-slate-400 mb-2 uppercase tracking-wider font-semibold">Corridor Spine (Join Keys)</div>
                    <div className="flex flex-wrap gap-2 text-xs items-center">
                      <code className="bg-slate-800 px-2 py-1 rounded text-cyan-400 border border-slate-700">corridor_id</code>
                      <span className="text-slate-500">+</span>
                      <code className="bg-slate-800 px-2 py-1 rounded text-cyan-400 border border-slate-700">asset_batch_id</code>
                      <span className="text-slate-500">+</span>
                      <code className="bg-slate-800 px-2 py-1 rounded text-cyan-400 border border-slate-700">shipment_id</code>
                      <span className="text-slate-500">=</span>
                      <span className="text-green-400 font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> All receipts JOIN</span>
                    </div>
                  </div>
                </div>
                
                {/* Fabric Log Panel */}
                <div className="p-4 bg-slate-900/30">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-slate-400" /> Fabric Log
                    </h3>
                    <span className="text-xs text-slate-500">{fabricLog.length} entries</span>
                  </div>
                  
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {fabricLog.map((entry) => (
                      <div 
                        key={entry.id}
                        className={`text-xs p-3 rounded-lg cursor-pointer transition-all animate-in slide-in-from-right-4 duration-300
                          ${selectedFabricReceipt?.receipt_id === entry.receipt.receipt_id 
                            ? 'bg-cyan-900/30 border border-cyan-500' 
                            : 'bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600'
                          }`}
                        onClick={() => setSelectedFabricReceipt(entry.receipt)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full ${
                            entry.receipt_type.includes('IOT') ? 'bg-amber-400' :
                            entry.receipt_type.includes('PHYSICAL') ? 'bg-purple-400' :
                            entry.receipt_type.includes('DIGITAL') ? 'bg-blue-400' :
                            'bg-green-400'
                          }`}></span>
                          <span className="text-slate-400 font-mono">{entry.timestamp.toLocaleTimeString()}</span>
                        </div>
                        <div className="text-slate-200 font-medium truncate">{entry.summary}</div>
                        <div className="text-slate-500 text-[10px] mt-1">{entry.stage} | {entry.node_role}</div>
                      </div>
                    ))}
                    
                    {fabricLog.length === 0 && (
                      <div className="text-slate-500 text-center py-8 border-2 border-dashed border-slate-800 rounded-lg">
                        Waiting for receipts...
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Summary Stats */}
              {scenario === 'complete' && (
                <div className="p-4 border-t border-slate-800 bg-slate-800/20">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-400">{fabricLog.filter(l => l.receipt_type.includes('PLAN')).length}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Plan Receipts</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-400">{fabricLog.filter(l => l.receipt_type.includes('DIGITAL')).length}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Digital Receipts</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-400">{fabricLog.filter(l => l.receipt_type.includes('PHYSICAL')).length}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Physical Receipts</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-amber-400">{fabricLog.filter(l => l.receipt_type.includes('IOT')).length}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">IoT Receipts</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Ghost Expedite Orchestrator View */}
          {showOrchestratorView && scenarioType === 'ghost' && (
            <div className="mb-6 animate-in fade-in duration-500">
              {anomaly && (
                <div className="bg-red-900/20 border border-red-500/50 rounded-xl px-4 py-3 mb-6 text-center font-medium animate-pulse flex items-center justify-center gap-2 text-red-200">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  UNAUTHORIZED EXPEDITE DETECTED — +${anomaly.economic_impact.cost_delta_usd.toLocaleString()} cost delta, ECON.ESC blocking payment
                </div>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Plan Layer */}
                <div className={`bg-slate-900/50 rounded-xl border p-5 transition-colors duration-300 ${orchestratorReceipts.plan ? 'border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.1)]' : 'border-slate-800'}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-slate-800 text-green-400"><Package className="w-5 h-5" /></div>
                    <span className="font-semibold text-green-400 tracking-wide">PLAN LAYER</span>
                    {orchestratorReceipts.plan && <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded ml-auto border border-green-500/20">RECEIVED</span>}
                  </div>
                  {orchestratorReceipts.plan ? (
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Mode:</span>
                        <span className="text-green-400 font-medium bg-green-900/20 px-2 py-0.5 rounded border border-green-500/20">🚚 TRUCK</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Expedite:</span>
                        <span className="text-red-400 bg-red-900/20 px-2 py-0.5 rounded border border-red-500/20 text-xs">❌ NOT AUTHORIZED</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                        <span className="text-slate-400">Planned Cost:</span>
                        <span className="text-slate-200 font-mono">$5,200</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-2 p-2 bg-slate-800 rounded border border-slate-700">
                        Treaty: NO_AIR_EXPEDITE_FOR_T2
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-500 text-sm italic flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-600 animate-pulse"></div>Waiting for plan receipt...</div>
                  )}
                </div>

                {/* Digital Layer */}
                <div className={`bg-slate-900/50 rounded-xl border p-5 transition-colors duration-300 ${
                  orchestratorReceipts.digital 
                    ? (anomaly ? 'border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.1)]' : 'border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.1)]') 
                    : 'border-slate-800'
                }`}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`p-2 rounded-lg bg-slate-800 ${anomaly ? 'text-red-400' : 'text-blue-400'}`}><Network className="w-5 h-5" /></div>
                    <span className={`font-semibold tracking-wide ${anomaly ? 'text-red-400' : 'text-blue-400'}`}>DIGITAL LAYER</span>
                    {orchestratorReceipts.digital && (
                      <span className={`text-[10px] px-2 py-0.5 rounded ml-auto border ${
                        anomaly ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {anomaly ? '⚠️ MISMATCH' : 'RECEIVED'}
                      </span>
                    )}
                  </div>
                  {orchestratorReceipts.digital ? (
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Mode:</span>
                        <span className="text-red-400 font-medium bg-red-900/20 px-2 py-0.5 rounded border border-red-500/20">✈️ AIR ⚠️</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Forwarder:</span>
                        <span className="text-slate-200">FORWARDER_A</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                        <span className="text-slate-400">Claimed:</span>
                        <span className="text-red-400 font-bold font-mono">$50,700</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-2 p-2 bg-slate-800 rounded border border-slate-700">
                        EDI: BOOKING_CREATED → ACE_CARGO
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-500 text-sm italic flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-600 animate-pulse"></div>Waiting for digital receipt...</div>
                  )}
                </div>

                {/* Physical Layer */}
                <div className={`bg-slate-900/50 rounded-xl border p-5 transition-colors duration-300 ${
                  orchestratorReceipts.physical 
                    ? (anomaly ? 'border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.1)]' : 'border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.1)]') 
                    : 'border-slate-800'
                }`}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`p-2 rounded-lg bg-slate-800 ${anomaly ? 'text-red-400' : 'text-purple-400'}`}><Truck className="w-5 h-5" /></div>
                    <span className={`font-semibold tracking-wide ${anomaly ? 'text-red-400' : 'text-purple-400'}`}>PHYSICAL LAYER</span>
                    {orchestratorReceipts.physical && (
                      <span className={`text-[10px] px-2 py-0.5 rounded ml-auto border ${
                        anomaly ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                      }`}>
                        {anomaly ? '⚠️ CONFIRMS' : 'RECEIVED'}
                      </span>
                    )}
                  </div>
                  {orchestratorReceipts.physical ? (
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Mode:</span>
                        <span className="text-red-400 font-medium bg-red-900/20 px-2 py-0.5 rounded border border-red-500/20">✈️ AIR ⚠️</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Flight:</span>
                        <span className="text-slate-200">ACE-2847</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Scanned:</span>
                        <span className="text-amber-400">35u (5 short)</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-2 p-2 bg-slate-800 rounded border border-slate-700">
                        GPS: DFW_AIR_CARGO (32.89, -97.04)
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-500 text-sm italic flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-600 animate-pulse"></div>Waiting for physical receipt...</div>
                  )}
                </div>
              </div>

              {/* Anomaly Actions */}
              {anomaly && (
                <div className="mt-6 bg-slate-900/50 rounded-xl border border-red-500/30 p-5 animate-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-sm font-semibold text-red-400 mb-4 flex items-center gap-2"><Shield className="w-4 h-4" /> Recommended Actions (Auto-Triggered)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {anomaly.recommended_actions.map((action: any, i: number) => (
                      <div key={i} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-red-500/30 transition-colors">
                        <div className="text-xs text-slate-400 font-semibold tracking-wide mb-1">{action.action.replace('_', ' ')}</div>
                        <div className="text-sm text-slate-200 mb-2">{action.target}</div>
                        {action.amount_usd && (
                          <div className="text-red-400 font-mono font-bold text-lg">${action.amount_usd.toLocaleString()}</div>
                        )}
                        {action.duration_days && (
                          <div className="text-red-400 font-mono font-bold text-lg">{action.duration_days} Days</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cold Chain Breach Orchestrator View */}
          {showOrchestratorView && scenarioType === 'coldchain' && (
            <div className="mb-6 animate-in fade-in duration-500">
              {anomaly && (
                <div className="bg-amber-900/20 border border-amber-500/50 rounded-xl px-4 py-3 mb-6 text-center font-medium animate-pulse flex items-center justify-center gap-2 text-amber-200">
                  <Thermometer className="w-5 h-5 text-amber-500" />
                  COLD CHAIN BREACH — {anomaly.evidence.max_temp_celsius}°C for {anomaly.evidence.breach_duration_minutes}min | Batch at risk: ${anomaly.economic_impact.batch_value_usd.toLocaleString()}
                </div>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* IoT Binding */}
                <div className={`bg-slate-900/50 rounded-xl border p-5 transition-colors duration-300 ${orchestratorReceipts.plan ? 'border-teal-500/50 shadow-[0_0_10px_rgba(20,184,166,0.1)]' : 'border-slate-800'}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-slate-800 text-teal-400"><Network className="w-5 h-5" /></div>
                    <span className="font-semibold text-teal-400 tracking-wide">IoT BINDING</span>
                    {orchestratorReceipts.plan && <span className="text-[10px] bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded ml-auto border border-teal-500/20">BOUND</span>}
                  </div>
                  {orchestratorReceipts.plan ? (
                    <div className="space-y-3 text-sm">
                      <div className="text-xs text-slate-400 mb-2 flex items-center gap-1"><Activity className="w-3 h-3" /> Device → Asset → Business Object</div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Device:</span>
                        <span className="text-teal-400 font-mono text-xs bg-teal-900/20 px-2 py-0.5 rounded border border-teal-500/20">{orchestratorReceipts.plan.device?.device_id?.slice(-8)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Asset:</span>
                        <span className="text-slate-200">{orchestratorReceipts.plan.asset?.asset_id}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                        <span className="text-slate-400">Shipment:</span>
                        <span className="text-cyan-400 font-mono text-xs">{orchestratorReceipts.plan.business_context?.shipment_id?.slice(-8)}</span>
                      </div>
                      <div className="text-xs text-green-400 mt-2 p-2 bg-green-900/10 rounded border border-green-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Attested Gateway
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-500 text-sm italic flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-600 animate-pulse"></div>Waiting for binding...</div>
                  )}
                </div>

                {/* Normal Readings */}
                <div className={`bg-slate-900/50 rounded-xl border p-5 transition-colors duration-300 ${orchestratorReceipts.digital ? 'border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.1)]' : 'border-slate-800'}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-slate-800 text-green-400"><Activity className="w-5 h-5" /></div>
                    <span className="font-semibold text-green-400 tracking-wide">NORMAL READINGS</span>
                    {orchestratorReceipts.digital && <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded ml-auto border border-green-500/20">IN RANGE</span>}
                  </div>
                  {orchestratorReceipts.digital ? (
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Temperature:</span>
                        <span className="text-green-400 font-bold bg-green-900/20 px-2 py-0.5 rounded border border-green-500/20">4.2°C</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Range:</span>
                        <span className="text-slate-200 font-mono">2.0 - 8.0°C</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                        <span className="text-slate-400">Status:</span>
                        <span className="text-green-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> IN_RANGE</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-2 p-2 bg-slate-800 rounded border border-slate-700">
                        Logged to fabric @ {new Date().toLocaleTimeString()}
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-500 text-sm italic flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-600 animate-pulse"></div>Waiting for readings...</div>
                  )}
                </div>

                {/* Breach Event */}
                <div className={`bg-slate-900/50 rounded-xl border p-5 transition-colors duration-300 ${
                  orchestratorReceipts.physical 
                    ? 'border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.1)]' 
                    : 'border-slate-800'
                }`}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`p-2 rounded-lg bg-slate-800 ${orchestratorReceipts.physical ? 'text-red-400' : 'text-slate-400'}`}><AlertTriangle className="w-5 h-5" /></div>
                    <span className={`font-semibold tracking-wide ${orchestratorReceipts.physical ? 'text-red-400' : 'text-slate-400'}`}>BREACH EVENT</span>
                    {orchestratorReceipts.physical && (
                      <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded ml-auto border border-red-500/20 animate-pulse">⚠️ BREACH</span>
                    )}
                  </div>
                  {orchestratorReceipts.physical ? (
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Temperature:</span>
                        <span className="text-red-400 font-bold text-lg bg-red-900/20 px-2 py-0.5 rounded border border-red-500/20">12.8°C ⚠️</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Duration:</span>
                        <span className="text-red-300">47 minutes</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                        <span className="text-slate-400">Location:</span>
                        <span className="text-slate-200">DFW_AIR_CARGO</span>
                      </div>
                      <div className="text-xs text-red-400 mt-2 p-2 bg-red-900/10 rounded border border-red-500/20">
                        AUTO-TRIGGER: Treaty clause COLD_CHAIN_MUST_HOLD_2_8C
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-500 text-sm italic flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-600 animate-pulse"></div>Monitoring...</div>
                  )}
                </div>
              </div>

              {/* Anomaly Actions */}
              {anomaly && (
                <div className="mt-6 bg-slate-900/50 rounded-xl border border-amber-500/30 p-5 animate-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-sm font-semibold text-amber-400 mb-4 flex items-center gap-2"><Shield className="w-4 h-4" /> Recommended Actions (Auto-Triggered)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {anomaly.recommended_actions.map((action: any, i: number) => (
                      <div key={i} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-amber-500/30 transition-colors">
                        <div className="text-xs text-slate-400 font-semibold tracking-wide mb-1">{action.action.replace('_', ' ')}</div>
                        <div className="text-sm text-slate-200 mb-2 truncate" title={action.target || action.source}>{action.target || action.source}</div>
                        {action.amount_usd && (
                          <div className="text-amber-400 font-mono font-bold">${action.amount_usd.toLocaleString()}</div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-xs text-slate-500 text-center italic">
                    "Device → Asset → Shipment → Order. That's why we can quarantine the right batch, file the right claim, and reorder from the right supplier — automatically."
                  </div>
                </div>
              )}
            </div>
          )}

          {/* S&OP Treaty Card */}
          {!showOrchestratorView && !showEndToEndFlow && (
            <div className="bg-slate-900/50 rounded-xl p-6 mb-6 border border-slate-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-teal-900/20 border border-teal-500/30 text-teal-400">
                    <Shield className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-slate-200">S&OP Treaty</h2>
                    <div className="text-xs text-teal-400 font-mono bg-teal-900/20 px-2 py-0.5 rounded border border-teal-500/20 inline-block mt-1">TREATY.OBJ.GRID2SUPPLY.MULTIPARTY.2025</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-900/10 rounded-lg p-4 border border-green-500/20 hover:bg-green-900/20 transition-colors">
                  <div className="text-xs text-green-400 mb-2 uppercase tracking-wider font-semibold">Tier 1 — Urban Critical</div>
                  <div className="text-2xl font-bold text-green-400 mb-1">98% Fill Rate</div>
                  <div className="text-xs text-slate-400">5-day lead time</div>
                </div>
                <div className="bg-yellow-900/10 rounded-lg p-4 border border-yellow-500/20 hover:bg-yellow-900/20 transition-colors">
                  <div className="text-xs text-yellow-400 mb-2 uppercase tracking-wider font-semibold">Tier 2 — Rural Standard</div>
                  <div className="text-2xl font-bold text-yellow-400 mb-1">92% Fill Rate</div>
                  <div className="text-xs text-slate-400">10-day lead time</div>
                </div>
                <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700 hover:bg-slate-800/50 transition-colors">
                  <div className="text-xs text-slate-400 mb-2 uppercase tracking-wider font-semibold">Tier 3 — Buffer Stock</div>
                  <div className="text-2xl font-bold text-slate-300 mb-1">85% Fill Rate</div>
                  <div className="text-xs text-slate-500">15-day lead time</div>
                </div>
              </div>
              
              {demandSpike && (
                <div className="mt-6 p-4 bg-amber-900/10 rounded-lg border border-amber-500/30 animate-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center gap-2 text-amber-400 mb-2">
                    <Activity className="w-5 h-5" />
                    <span className="font-semibold">Demand Spike Detected</span>
                  </div>
                  <div className="text-sm text-slate-300 mb-1">
                    <span className="font-bold">{demandSpike.source}:</span> +{demandSpike.increase}% ({demandSpike.reason})
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2 bg-amber-900/20 p-2 rounded border border-amber-500/10">
                    <Network className="w-3 h-3" /> Reallocation: Urban 60→45, Rural 40→55 | Compensation: $2,500 T2→T1
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Plan Lineage */}
          {!showOrchestratorView && !showEndToEndFlow && (
            <div className="bg-slate-900/50 rounded-xl p-6 mb-6 border border-slate-800">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Plan Lineage (Customer's Customer ⇄ Supplier's Supplier)</h3>
              <div className="flex items-center justify-center gap-2 text-xs overflow-x-auto pb-2">
                {['Patient', 'Clinic', 'TTU DC', 'CM Y', 'Tier-2 Z'].map((node, i) => (
                  <React.Fragment key={node}>
                    <div className="bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700 whitespace-nowrap text-slate-300 font-medium">
                      {node}
                    </div>
                    {i < 4 && <ArrowRight className="w-4 h-4 text-cyan-500/50" />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Scenario Buttons */}
          <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Run Scenarios</h3>
              {scenario && (
                <button
                  onClick={resetScenario}
                  className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-full border border-slate-700 transition-colors text-slate-300"
                >
                  Reset
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                  { id: 'base', label: 'Base S&OP', icon: <BarChart3 className="w-6 h-6" />, color: 'green', action: runBasePlan },
                  { id: 'spike', label: 'Demand Spike', icon: <TrendingUp className="w-6 h-6" />, color: 'amber', action: runDemandSpike },
                  { id: 'ghost', label: 'Ghost Expedite', icon: <Ghost className="w-6 h-6" />, color: 'red', action: runGhostExpedite },
                  { id: 'coldchain', label: 'Cold Chain', icon: <Thermometer className="w-6 h-6" />, color: 'cyan', action: runColdChainBreach },
                  { id: 'e2e', label: 'End-to-End', icon: <RefreshCw className="w-6 h-6" />, color: 'purple', action: runEndToEndFlow },
              ].map((btn) => (
                  <button
                    key={btn.id}
                    onClick={btn.action}
                    disabled={scenario === 'running'}
                    className={`p-4 rounded-xl font-medium transition-all duration-300 flex flex-col items-center gap-3 border ${
                        scenario === 'running' 
                        ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed' 
                        : `bg-slate-800 hover:bg-${btn.color}-900/20 border-slate-700 hover:border-${btn.color}-500/50 text-slate-300 hover:text-${btn.color}-400 shadow-sm hover:shadow-[0_0_15px_rgba(0,0,0,0.3)]`
                    }`}
                  >
                    <span className="text-2xl">{btn.icon}</span>
                    <span className="text-xs font-semibold">{btn.label}</span>
                  </button>
              ))}
            </div>
          </div>

          {/* Receipt Viewer */}
          {(receipts.length > 0 || selectedFabricReceipt) && !showEndToEndFlow && (
            <div className="mt-6 bg-slate-900/50 rounded-xl p-6 border border-slate-800 animate-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Receipt Stream ({receipts.length})</h3>
              <div className="space-y-3">
                {receipts.map((receipt, i) => (
                  <div 
                    key={receipt.receipt_id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                      expandedReceipt === i 
                        ? 'bg-slate-800/80 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                        : 'bg-slate-800/30 border-slate-700 hover:border-slate-600 hover:bg-slate-800/50'
                    }`}
                    onClick={() => setExpandedReceipt(expandedReceipt === i ? null : i)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${
                          receipt.schema_version.includes('PHYSICAL') ? 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.5)]' :
                          receipt.schema_version.includes('DIGITAL') ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]' :
                          receipt.schema_version.includes('IOT') ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' :
                          'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]'
                        }`}></span>
                        <span className="text-sm font-medium text-slate-200">{receipt.schema_version}</span>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">{receipt.receipt_id.slice(-8)}</span>
                    </div>
                    {receipt.summary && (
                      <div className="text-xs text-slate-400 mt-2 pl-5 border-l-2 border-slate-700">{receipt.summary}</div>
                    )}
                    {expandedReceipt === i && (
                      <div className="mt-4 pt-4 border-t border-slate-700 animate-in fade-in duration-300">
                          <pre className="text-xs text-cyan-300 bg-slate-950 p-4 rounded-lg overflow-x-auto font-mono custom-scrollbar">
                            {JSON.stringify(receipt, null, 2)}
                          </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Fabric Receipt Modal */}
          {selectedFabricReceipt && showEndToEndFlow && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200" onClick={() => setSelectedFabricReceipt(null)}>
              <div className="bg-slate-900 rounded-xl border border-slate-700 max-w-3xl w-full max-h-[80vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
                  <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-slate-200">{selectedFabricReceipt.schema_version}</h3>
                      <span className="text-xs font-mono text-slate-500">{selectedFabricReceipt.receipt_id}</span>
                  </div>
                  <button onClick={() => setSelectedFabricReceipt(null)} className="text-slate-400 hover:text-white p-1 hover:bg-slate-700 rounded transition-colors">✕</button>
                </div>
                <div className="p-0 overflow-auto max-h-[calc(80vh-60px)] custom-scrollbar">
                    <pre className="p-6 text-xs text-cyan-300 font-mono leading-relaxed">
                        {JSON.stringify(selectedFabricReceipt, null, 2)}
                    </pre>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
            <p className="font-medium mb-2">PATHWELL CONNECT™ — Constitutional Infrastructure for Supply Chain Orchestration</p>
            <p className="font-mono">Every receipt shares: <span className="text-cyan-500">corridor_id</span> + <span className="text-cyan-500">asset_batch_id</span> + <span className="text-cyan-500">treaty_object_id</span> = Complete Traceability</p>
          </div>
        </div>
      </div>
    </div>
  );
}

