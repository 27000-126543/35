import { create } from 'zustand';
import type {
  GasStation,
  PipelineNode,
  Customer,
  DispatchPlan,
  EmergencyAlarm,
  RepairOrder,
  RepairTeam,
  RepairVehicle,
  RepairTicket,
  MaintenanceWorker,
  AuthUser,
  StatisticsData,
} from '@/types';
import {
  mockStations,
  mockNodes,
  mockCustomers,
  mockDispatchPlans,
  mockAlarms,
  mockRepairOrders,
  mockRepairTeams,
  mockRepairVehicles,
  mockRepairTickets,
  mockMaintenanceWorkers,
  mockUser,
} from '@/data';

interface AppState {
  currentUser: AuthUser;
  stations: GasStation[];
  nodes: PipelineNode[];
  customers: Customer[];
  dispatchPlans: DispatchPlan[];
  alarms: EmergencyAlarm[];
  repairOrders: RepairOrder[];
  repairTeams: RepairTeam[];
  repairVehicles: RepairVehicle[];
  repairTickets: RepairTicket[];
  maintenanceWorkers: MaintenanceWorker[];

  addStation: (station: GasStation) => void;
  updateStation: (id: string, data: Partial<GasStation>) => void;
  deleteStation: (id: string) => void;

  addNode: (node: PipelineNode) => void;
  updateNode: (id: string, data: Partial<PipelineNode>) => void;
  deleteNode: (id: string) => void;

  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  addDispatchPlan: (plan: DispatchPlan) => void;
  updateDispatchPlan: (id: string, data: Partial<DispatchPlan>) => void;
  confirmDispatchPlan: (id: string, dispatcherId: string, dispatcherName: string) => void;
  requestAdjustPlan: (id: string, reason: string, dispatcherId: string, dispatcherName: string) => void;
  approvePlan: (id: string, supervisorId: string, supervisorName: string) => void;
  rejectPlan: (id: string, supervisorId: string, supervisorName: string) => void;
  pushPlan: (id: string) => void;

  addAlarm: (alarm: EmergencyAlarm) => void;
  updateAlarm: (id: string, data: Partial<EmergencyAlarm>) => void;
  confirmAlarm: (id: string, handlerId: string, handlerName: string) => void;
  resolveAlarm: (id: string) => void;

  addRepairOrder: (order: RepairOrder) => void;
  updateRepairOrder: (id: string, data: Partial<RepairOrder>) => void;

  addRepairTicket: (ticket: RepairTicket) => void;
  updateRepairTicket: (id: string, data: Partial<RepairTicket>) => void;
  assignRepairTicket: (id: string, workerId: string, workerName: string, workerPhone: string) => void;
  completeRepairTicket: (id: string, result: string) => void;

  simulateNodePressureUpdate: () => void;
  getStatistics: () => StatisticsData;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: mockUser,
  stations: mockStations,
  nodes: mockNodes,
  customers: mockCustomers,
  dispatchPlans: mockDispatchPlans,
  alarms: mockAlarms,
  repairOrders: mockRepairOrders,
  repairTeams: mockRepairTeams,
  repairVehicles: mockRepairVehicles,
  repairTickets: mockRepairTickets,
  maintenanceWorkers: mockMaintenanceWorkers,

  addStation: (station) => set((s) => ({ stations: [...s.stations, station] })),
  updateStation: (id, data) =>
    set((s) => ({
      stations: s.stations.map((st) => (st.id === id ? { ...st, ...data } : st)),
    })),
  deleteStation: (id) => set((s) => ({ stations: s.stations.filter((st) => st.id !== id) })),

  addNode: (node) => set((s) => ({ nodes: [...s.nodes, node] })),
  updateNode: (id, data) =>
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, ...data } : n)),
    })),
  deleteNode: (id) => set((s) => ({ nodes: s.nodes.filter((n) => n.id !== id) })),

  addCustomer: (customer) => set((s) => ({ customers: [...s.customers, customer] })),
  updateCustomer: (id, data) =>
    set((s) => ({
      customers: s.customers.map((c) => (c.id === id ? { ...c, ...data } : c)),
    })),
  deleteCustomer: (id) => set((s) => ({ customers: s.customers.filter((c) => c.id !== id) })),

  addDispatchPlan: (plan) => set((s) => ({ dispatchPlans: [...s.dispatchPlans, plan] })),
  updateDispatchPlan: (id, data) =>
    set((s) => ({
      dispatchPlans: s.dispatchPlans.map((p) => (p.id === id ? { ...p, ...data } : p)),
    })),
  confirmDispatchPlan: (id, dispatcherId, dispatcherName) =>
    set((s) => ({
      dispatchPlans: s.dispatchPlans.map((p) =>
        p.id === id ? { ...p, status: 'confirmed', dispatcherId, dispatcherName } : p
      ),
    })),
  requestAdjustPlan: (id, reason, dispatcherId, dispatcherName) =>
    set((s) => ({
      dispatchPlans: s.dispatchPlans.map((p) =>
        p.id === id
          ? { ...p, status: 'adjust_requested', adjustReason: reason, dispatcherId, dispatcherName }
          : p
      ),
    })),
  approvePlan: (id, supervisorId, supervisorName) =>
    set((s) => ({
      dispatchPlans: s.dispatchPlans.map((p) =>
        p.id === id ? { ...p, status: 'approved', supervisorId, supervisorName } : p
      ),
    })),
  rejectPlan: (id, supervisorId, supervisorName) =>
    set((s) => ({
      dispatchPlans: s.dispatchPlans.map((p) =>
        p.id === id ? { ...p, status: 'rejected', supervisorId, supervisorName } : p
      ),
    })),
  pushPlan: (id) =>
    set((s) => ({
      dispatchPlans: s.dispatchPlans.map((p) => (p.id === id ? { ...p, pushStatus: 'pushed' } : p)),
    })),

  addAlarm: (alarm) => set((s) => ({ alarms: [...s.alarms, alarm] })),
  updateAlarm: (id, data) =>
    set((s) => ({
      alarms: s.alarms.map((a) => (a.id === id ? { ...a, ...data } : a)),
    })),
  confirmAlarm: (id, handlerId, handlerName) =>
    set((s) => ({
      alarms: s.alarms.map((a) =>
        a.id === id
          ? {
              ...a,
              status: 'processing',
              confirmedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
              handlerId,
              handlerName,
            }
          : a
      ),
    })),
  resolveAlarm: (id) =>
    set((s) => ({
      alarms: s.alarms.map((a) =>
        a.id === id
          ? {
              ...a,
              status: 'resolved',
              resolvedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
            }
          : a
      ),
    })),

  addRepairOrder: (order) => set((s) => ({ repairOrders: [...s.repairOrders, order] })),
  updateRepairOrder: (id, data) =>
    set((s) => ({
      repairOrders: s.repairOrders.map((o) => (o.id === id ? { ...o, ...data } : o)),
    })),

  addRepairTicket: (ticket) => set((s) => ({ repairTickets: [...s.repairTickets, ticket] })),
  updateRepairTicket: (id, data) =>
    set((s) => ({
      repairTickets: s.repairTickets.map((t) => (t.id === id ? { ...t, ...data } : t)),
    })),
  assignRepairTicket: (id, workerId, workerName, workerPhone) =>
    set((s) => ({
      repairTickets: s.repairTickets.map((t) =>
        t.id === id
          ? {
              ...t,
              status: 'assigned',
              workerId,
              workerName,
              workerPhone,
              assignedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
            }
          : t
      ),
    })),
  completeRepairTicket: (id, result) =>
    set((s) => ({
      repairTickets: s.repairTickets.map((t) =>
        t.id === id
          ? {
              ...t,
              status: 'completed',
              result,
              completedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
            }
          : t
      ),
    })),

  simulateNodePressureUpdate: () => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    set((s) => ({
      nodes: s.nodes.map((node) => {
        if (node.status === 'leak' || node.status === 'repair' || node.status === 'offline') return node;
        const fluctuation = (Math.random() - 0.5) * 0.1;
        const newPressure = Math.max(node.minPressure, Math.min(node.maxPressure, node.currentPressure + fluctuation));
        let status: typeof node.status = 'normal';
        if (newPressure < node.minPressure * 1.05) status = 'low_pressure';
        else if (newPressure > node.maxPressure * 0.95) status = 'high_pressure';
        return { ...node, currentPressure: Number(newPressure.toFixed(2)), status, lastUpdate: now };
      }),
    }));
  },

  getStatistics: () => {
    const state = get();
    const totalCustomers = state.customers;
    const totalGasSupply = totalCustomers.reduce((sum, c) => sum + c.dailyGasUsage, 0);
    const qualifiedNodes = state.nodes.filter(
      (n) => n.status === 'normal' && n.currentPressure >= n.minPressure && n.currentPressure <= n.maxPressure
    );
    const pressureQualifiedRate = state.nodes.length > 0 ? (qualifiedNodes.length / state.nodes.length) * 100 : 0;

    const completedRepairs = state.repairOrders.filter((o) => o.status === 'completed');
    const totalRepairs = state.repairOrders.filter((o) => o.status !== 'cancelled');
    const repairOnTimeRate = totalRepairs.length > 0 ? (completedRepairs.length / totalRepairs.length) * 100 : 95;

    const regions = Array.from(new Set(state.customers.map((c) => c.region)));
    const byRegion = regions.map((region) => ({
      region,
      gasSupply: state.customers.filter((c) => c.region === region).reduce((sum, c) => sum + c.dailyGasUsage, 0),
    }));

    const userTypes: Array<'industrial' | 'commercial' | 'residential'> = ['industrial', 'commercial', 'residential'];
    const byUserType = userTypes.map((type) => {
      const supply = state.customers.filter((c) => c.type === type).reduce((sum, c) => sum + c.dailyGasUsage, 0);
      return {
        type,
        gasSupply: supply,
        percentage: totalGasSupply > 0 ? (supply / totalGasSupply) * 100 : 0,
      };
    });

    const today = new Date();
    const dailySupply = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      return {
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        supply: Math.round(totalGasSupply * (0.9 + Math.random() * 0.2)),
      };
    });

    const alarmTypes: Array<'pressure_low' | 'pressure_high' | 'leak' | 'equipment_fault'> = [
      'pressure_low',
      'pressure_high',
      'leak',
      'equipment_fault',
    ];
    const alarmCounts = alarmTypes.map((type) => ({
      type,
      count: state.alarms.filter((a) => a.type === type).length,
    }));

    const nodePressures = state.nodes.map((n) => n.currentPressure);
    const avgPressure = nodePressures.length > 0 ? nodePressures.reduce((a, b) => a + b, 0) / nodePressures.length : 0;

    return {
      dateRange: {
        start: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: today.toISOString().split('T')[0],
      },
      totalGasSupply: totalGasSupply / 10000,
      avgPressure: Number(avgPressure.toFixed(2)),
      pressureQualifiedRate: Number(pressureQualifiedRate.toFixed(1)),
      repairOnTimeRate: Number(repairOnTimeRate.toFixed(1)),
      gasLossRate: 2.8,
      byRegion,
      byUserType,
      dailySupply,
      alarmCounts,
    };
  },
}));
