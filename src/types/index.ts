export type UserRole = 'admin' | 'supervisor' | 'dispatcher' | 'repair_team' | 'maintenance_worker' | 'manager';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  department: string;
}

export interface GasStation {
  id: string;
  name: string;
  address: string;
  longitude: number;
  latitude: number;
  supplyCapacity: number;
  currentOutput: number;
  gasQuality: {
    methane: number;
    calorificValue: number;
    sulfurContent: number;
    pressure: number;
  };
  status: 'normal' | 'maintenance' | 'offline';
  operator: string;
  lastInspection: string;
}

export type NodeType = 'regulator' | 'valve' | 'junction';
export type NodeStatus = 'normal' | 'low_pressure' | 'high_pressure' | 'leak' | 'repair' | 'offline';

export interface PipelineNode {
  id: string;
  name: string;
  type: NodeType;
  address: string;
  longitude: number;
  latitude: number;
  pipeDiameter: number;
  designPressure: number;
  currentPressure: number;
  minPressure: number;
  maxPressure: number;
  connectedNodes: string[];
  status: NodeStatus;
  lastUpdate: string;
}

export type CustomerType = 'industrial' | 'commercial' | 'residential';

export interface Customer {
  id: string;
  name: string;
  type: CustomerType;
  region: string;
  address: string;
  dailyGasUsage: number;
  monthlyUsage: number[];
  usageRatio: number;
  contact: string;
  phone: string;
  registerDate: string;
  status: 'active' | 'suspended';
}

export type PlanStatus = 'draft' | 'pending' | 'confirmed' | 'adjust_requested' | 'approved' | 'rejected';

export interface DispatchPlan {
  id: string;
  planDate: string;
  generatedAt: string;
  generatedBy: 'system' | 'manual';
  weather: {
    temperature: number;
    condition: string;
    humidity: number;
  };
  isHoliday: boolean;
  holidayName?: string;
  stations: Array<{
    stationId: string;
    stationName: string;
    plannedOutput: number;
  }>;
  nodes: Array<{
    nodeId: string;
    nodeName: string;
    targetPressure: number;
  }>;
  storageUsage: number;
  totalDailySupply: number;
  pressureBalanceScore: number;
  status: PlanStatus;
  dispatcherId?: string;
  dispatcherName?: string;
  supervisorId?: string;
  supervisorName?: string;
  adjustReason?: string;
  pushStatus: 'not_pushed' | 'pushed';
}

export type AlarmType = 'pressure_low' | 'pressure_high' | 'leak' | 'equipment_fault';
export type AlarmLevel = 'critical' | 'warning' | 'info';
export type AlarmStatus = 'pending' | 'processing' | 'resolved' | 'false_alarm';

export interface EmergencyAlarm {
  id: string;
  nodeId: string;
  nodeName: string;
  type: AlarmType;
  level: AlarmLevel;
  description: string;
  status: AlarmStatus;
  createdAt: string;
  confirmedAt?: string;
  resolvedAt?: string;
  handlerId?: string;
  handlerName?: string;
}

export type RepairOrderStatus = 'assigned' | 'en_route' | 'on_site' | 'repairing' | 'completed' | 'cancelled';

export interface RepairOrder {
  id: string;
  alarmId: string;
  nodeId: string;
  nodeName: string;
  teamId: string;
  teamName: string;
  vehicleId: string;
  vehiclePlate: string;
  equipment: string[];
  status: RepairOrderStatus;
  assignedAt: string;
  arrivedAt?: string;
  startedAt?: string;
  completedAt?: string;
  repairDuration?: number;
  description: string;
  repairNotes?: string;
  recoveryTime?: string;
}

export interface RepairTeam {
  id: string;
  name: string;
  leader: string;
  contact: string;
  memberCount: number;
  status: 'idle' | 'on_duty' | 'repairing';
  currentLocation?: {
    longitude: number;
    latitude: number;
  };
}

export interface RepairVehicle {
  id: string;
  plateNumber: string;
  type: string;
  longitude: number;
  latitude: number;
  status: 'idle' | 'dispatched' | 'repairing' | 'returning';
  equipment: string[];
}

export type RepairTicketStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export interface RepairTicket {
  id: string;
  userId: string;
  userName: string;
  userType: CustomerType;
  userPhone: string;
  userAddress: string;
  region: string;
  description: string;
  workerId?: string;
  workerName?: string;
  workerPhone?: string;
  status: RepairTicketStatus;
  createdAt: string;
  assignedAt?: string;
  completedAt?: string;
  result?: string;
  userRating?: number;
}

export interface MaintenanceWorker {
  id: string;
  name: string;
  contact: string;
  region: string;
  status: 'idle' | 'working' | 'offline';
  currentTicketCount: number;
}

export interface StatisticsData {
  dateRange: {
    start: string;
    end: string;
  };
  totalGasSupply: number;
  avgPressure: number;
  pressureQualifiedRate: number;
  repairOnTimeRate: number;
  gasLossRate: number;
  byRegion: Array<{
    region: string;
    gasSupply: number;
  }>;
  byUserType: Array<{
    type: CustomerType;
    gasSupply: number;
    percentage: number;
  }>;
  dailySupply: Array<{
    date: string;
    supply: number;
  }>;
  alarmCounts: Array<{
    type: AlarmType;
    count: number;
  }>;
}
