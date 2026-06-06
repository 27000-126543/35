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
  getStations,
  getNodes,
  getCustomers,
  getDispatchPlans,
  getAlarms,
  getRepairOrders,
  getRepairTeams,
  getRepairVehicles,
  getRepairTickets,
  getWorkers,
  getStatistics,
  createStation,
  updateStation,
  deleteStation,
  createNode,
  updateNode,
  deleteNode,
  updateNodePressure,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  createDispatchPlan,
  updateDispatchPlan,
  updateDispatchPlanStatus,
  acknowledgeAlarm,
  resolveAlarm as resolveAlarmApi,
  createRepairOrder,
  updateRepairOrder,
  createRepairTicket,
  dispatchRepairTicket,
  completeRepairTicket as completeRepairTicketApi,
} from '@/api';

const mockUser: AuthUser = {
  id: 'u001',
  name: '张调度',
  role: 'dispatcher',
  department: '调度运营中心',
};

interface AppState {
  currentUser: AuthUser;
  loading: boolean;
  initialized: boolean;
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

  fetchAll: () => Promise<void>;
  fetchStatistics: () => Promise<StatisticsData>;

  addStation: (station: GasStation) => Promise<void>;
  updateStation: (id: string, data: Partial<GasStation>) => Promise<void>;
  deleteStation: (id: string) => Promise<void>;

  addNode: (node: PipelineNode) => Promise<void>;
  updateNode: (id: string, data: Partial<PipelineNode>) => Promise<void>;
  deleteNode: (id: string) => Promise<void>;

  addCustomer: (customer: Customer) => Promise<void>;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;

  addDispatchPlan: (plan: DispatchPlan) => Promise<void>;
  updateDispatchPlan: (id: string, data: Partial<DispatchPlan>) => Promise<void>;
  confirmDispatchPlan: (id: string, dispatcherId: string, dispatcherName: string) => Promise<void>;
  requestAdjustPlan: (id: string, reason: string, dispatcherId: string, dispatcherName: string) => Promise<void>;
  approvePlan: (id: string, supervisorId: string, supervisorName: string) => Promise<void>;
  rejectPlan: (id: string, supervisorId: string, supervisorName: string) => Promise<void>;
  pushPlan: (id: string) => Promise<void>;

  addAlarm: (alarm: EmergencyAlarm) => Promise<void>;
  updateAlarm: (id: string, data: Partial<EmergencyAlarm>) => Promise<void>;
  confirmAlarm: (id: string, handlerId: string, handlerName: string) => Promise<void>;
  resolveAlarm: (id: string) => Promise<void>;

  addRepairOrder: (order: RepairOrder) => Promise<void>;
  updateRepairOrder: (id: string, data: Partial<RepairOrder>) => Promise<void>;

  addRepairTicket: (ticket: RepairTicket) => Promise<void>;
  updateRepairTicket: (id: string, data: Partial<RepairTicket>) => Promise<void>;
  assignRepairTicket: (id: string, workerId: string, workerName: string, workerPhone: string) => Promise<void>;
  completeRepairTicket: (id: string, result: string) => Promise<void>;

  simulateNodePressureUpdate: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: mockUser,
  loading: false,
  initialized: false,
  stations: [],
  nodes: [],
  customers: [],
  dispatchPlans: [],
  alarms: [],
  repairOrders: [],
  repairTeams: [],
  repairVehicles: [],
  repairTickets: [],
  maintenanceWorkers: [],

  fetchAll: async () => {
    set({ loading: true });
    try {
      const [
        stations,
        nodes,
        customers,
        dispatchPlans,
        alarms,
        repairOrders,
        repairTeams,
        repairVehicles,
        repairTickets,
        maintenanceWorkers,
      ] = await Promise.all([
        getStations(),
        getNodes(),
        getCustomers(),
        getDispatchPlans(),
        getAlarms(),
        getRepairOrders(),
        getRepairTeams(),
        getRepairVehicles(),
        getRepairTickets(),
        getWorkers(),
      ]);
      set({
        stations,
        nodes,
        customers,
        dispatchPlans,
        alarms,
        repairOrders,
        repairTeams,
        repairVehicles,
        repairTickets,
        maintenanceWorkers,
        initialized: true,
      });
    } finally {
      set({ loading: false });
    }
  },

  fetchStatistics: async () => {
    return await getStatistics();
  },

  addStation: async (station) => {
    await createStation(station);
    set({ stations: await getStations() });
  },
  updateStation: async (id, data) => {
    await updateStation(id, data);
    set({ stations: await getStations() });
  },
  deleteStation: async (id) => {
    await deleteStation(id);
    set({ stations: await getStations() });
  },

  addNode: async (node) => {
    await createNode(node);
    set({ nodes: await getNodes() });
  },
  updateNode: async (id, data) => {
    await updateNode(id, data);
    set({ nodes: await getNodes() });
  },
  deleteNode: async (id) => {
    await deleteNode(id);
    set({ nodes: await getNodes() });
  },

  addCustomer: async (customer) => {
    await createCustomer(customer);
    set({ customers: await getCustomers() });
  },
  updateCustomer: async (id, data) => {
    await updateCustomer(id, data);
    set({ customers: await getCustomers() });
  },
  deleteCustomer: async (id) => {
    await deleteCustomer(id);
    set({ customers: await getCustomers() });
  },

  addDispatchPlan: async (plan) => {
    await createDispatchPlan(plan);
    set({ dispatchPlans: await getDispatchPlans() });
  },
  updateDispatchPlan: async (id, data) => {
    await updateDispatchPlan(id, data);
    set({ dispatchPlans: await getDispatchPlans() });
  },
  confirmDispatchPlan: async (id, dispatcherId, dispatcherName) => {
    await updateDispatchPlanStatus(id, 'confirmed', undefined, dispatcherName);
    set({ dispatchPlans: await getDispatchPlans() });
  },
  requestAdjustPlan: async (id, reason, dispatcherId, dispatcherName) => {
    await updateDispatchPlanStatus(id, 'adjust_requested', reason, dispatcherName);
    set({ dispatchPlans: await getDispatchPlans() });
  },
  approvePlan: async (id, supervisorId, supervisorName) => {
    await updateDispatchPlanStatus(id, 'approved', undefined, supervisorName);
    set({ dispatchPlans: await getDispatchPlans() });
  },
  rejectPlan: async (id, supervisorId, supervisorName) => {
    await updateDispatchPlanStatus(id, 'rejected', undefined, supervisorName);
    set({ dispatchPlans: await getDispatchPlans() });
  },
  pushPlan: async (id) => {
    await updateDispatchPlanStatus(id, 'pushed');
    set({ dispatchPlans: await getDispatchPlans() });
  },

  addAlarm: async (alarm) => {
    set({ alarms: [...get().alarms, alarm] });
  },
  updateAlarm: async (id, data) => {
    set((s) => ({
      alarms: s.alarms.map((a) => (a.id === id ? { ...a, ...data } : a)),
    }));
  },
  confirmAlarm: async (id, handlerId, handlerName) => {
    await acknowledgeAlarm(id, handlerName);
    set({ alarms: await getAlarms() });
  },
  resolveAlarm: async (id) => {
    await resolveAlarmApi(id, get().currentUser.name);
    set({ alarms: await getAlarms() });
  },

  addRepairOrder: async (order) => {
    await createRepairOrder(order);
    set({ repairOrders: await getRepairOrders() });
  },
  updateRepairOrder: async (id, data) => {
    await updateRepairOrder(id, data);
    set({ repairOrders: await getRepairOrders() });
  },

  addRepairTicket: async (ticket) => {
    await createRepairTicket(ticket);
    set({ repairTickets: await getRepairTickets() });
  },
  updateRepairTicket: async (id, data) => {
    set((s) => ({
      repairTickets: s.repairTickets.map((t) => (t.id === id ? { ...t, ...data } : t)),
    }));
  },
  assignRepairTicket: async (id, workerId, workerName, workerPhone) => {
    await dispatchRepairTicket(id, workerId);
    set({ repairTickets: await getRepairTickets() });
  },
  completeRepairTicket: async (id, result) => {
    await completeRepairTicketApi(id, result);
    set({ repairTickets: await getRepairTickets() });
  },

  simulateNodePressureUpdate: async () => {
    const nodes = get().nodes;
    const updates = nodes.map(async (node) => {
      if (node.status === 'leak' || node.status === 'repair' || node.status === 'offline') return;
      const fluctuation = (Math.random() - 0.5) * 0.1;
      const newPressure = Math.max(
        node.minPressure,
        Math.min(node.maxPressure, node.currentPressure + fluctuation)
      );
      let status: typeof node.status = 'normal';
      if (newPressure < node.minPressure * 1.05) status = 'low_pressure';
      else if (newPressure > node.maxPressure * 0.95) status = 'high_pressure';
      await updateNodePressure(node.id, Number(newPressure.toFixed(2)), status);
    });
    await Promise.all(updates);
    set({ nodes: await getNodes() });
  },
}));
