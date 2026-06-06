import type {
  NodeStatus,
  AlarmType,
  AlarmLevel,
  AlarmStatus,
  PlanStatus,
  RepairOrderStatus,
  RepairTicketStatus,
  CustomerType,
  NodeType,
} from '@/types';

export const formatNumber = (num: number, decimals = 2) => {
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatDate = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
};

export const formatDateTime = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().replace('T', ' ').slice(0, 19);
};

export const getNodeStatusLabel = (status: NodeStatus) => {
  const map: Record<NodeStatus, string> = {
    normal: '正常',
    low_pressure: '压力偏低',
    high_pressure: '压力偏高',
    leak: '泄漏',
    repair: '抢修中',
    offline: '离线',
  };
  return map[status];
};

export const getNodeStatusColor = (status: NodeStatus) => {
  const map: Record<NodeStatus, string> = {
    normal: 'bg-green-100 text-green-800',
    low_pressure: 'bg-orange-100 text-orange-800',
    high_pressure: 'bg-red-100 text-red-800',
    leak: 'bg-red-600 text-white',
    repair: 'bg-yellow-100 text-yellow-800',
    offline: 'bg-gray-100 text-gray-600',
  };
  return map[status];
};

export const getNodeStatusDotColor = (status: NodeStatus) => {
  const map: Record<NodeStatus, string> = {
    normal: 'bg-brand-success',
    low_pressure: 'bg-brand-warning',
    high_pressure: 'bg-red-500',
    leak: 'bg-brand-danger animate-breathe',
    repair: 'bg-yellow-500',
    offline: 'bg-gray-400',
  };
  return map[status];
};

export const getAlarmTypeLabel = (type: AlarmType) => {
  const map: Record<AlarmType, string> = {
    pressure_low: '压力偏低',
    pressure_high: '压力偏高',
    leak: '管道泄漏',
    equipment_fault: '设备故障',
  };
  return map[type];
};

export const getAlarmLevelLabel = (level: AlarmLevel) => {
  const map: Record<AlarmLevel, string> = {
    critical: '紧急',
    warning: '警告',
    info: '提示',
  };
  return map[level];
};

export const getAlarmLevelColor = (level: AlarmLevel) => {
  const map: Record<AlarmLevel, string> = {
    critical: 'bg-red-600 text-white',
    warning: 'bg-orange-500 text-white',
    info: 'bg-blue-500 text-white',
  };
  return map[level];
};

export const getAlarmStatusLabel = (status: AlarmStatus) => {
  const map: Record<AlarmStatus, string> = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已解决',
    false_alarm: '误报',
  };
  return map[status];
};

export const getAlarmStatusColor = (status: AlarmStatus) => {
  const map: Record<AlarmStatus, string> = {
    pending: 'bg-red-100 text-red-800',
    processing: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    false_alarm: 'bg-gray-100 text-gray-600',
  };
  return map[status];
};

export const getPlanStatusLabel = (status: PlanStatus) => {
  const map: Record<PlanStatus, string> = {
    draft: '草稿',
    pending: '待确认',
    confirmed: '已确认',
    adjust_requested: '申请调整',
    approved: '已审批',
    rejected: '已驳回',
  };
  return map[status];
};

export const getPlanStatusColor = (status: PlanStatus) => {
  const map: Record<PlanStatus, string> = {
    draft: 'bg-gray-100 text-gray-600',
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    adjust_requested: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-600 text-white',
    rejected: 'bg-red-100 text-red-800',
  };
  return map[status];
};

export const getRepairOrderStatusLabel = (status: RepairOrderStatus) => {
  const map: Record<RepairOrderStatus, string> = {
    assigned: '已派单',
    en_route: '赶往现场',
    on_site: '已到达',
    repairing: '抢修中',
    completed: '已完成',
    cancelled: '已取消',
  };
  return map[status];
};

export const getRepairOrderStatusColor = (status: RepairOrderStatus) => {
  const map: Record<RepairOrderStatus, string> = {
    assigned: 'bg-blue-100 text-blue-800',
    en_route: 'bg-yellow-100 text-yellow-800',
    on_site: 'bg-purple-100 text-purple-800',
    repairing: 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-600',
  };
  return map[status];
};

export const getRepairTicketStatusLabel = (status: RepairTicketStatus) => {
  const map: Record<RepairTicketStatus, string> = {
    pending: '待派单',
    assigned: '已派单',
    in_progress: '处理中',
    completed: '已完成',
    cancelled: '已取消',
  };
  return map[status];
};

export const getRepairTicketStatusColor = (status: RepairTicketStatus) => {
  const map: Record<RepairTicketStatus, string> = {
    pending: 'bg-red-100 text-red-800',
    assigned: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-600',
  };
  return map[status];
};

export const getCustomerTypeLabel = (type: CustomerType) => {
  const map: Record<CustomerType, string> = {
    industrial: '工业',
    commercial: '商业',
    residential: '居民',
  };
  return map[type];
};

export const getCustomerTypeColor = (type: CustomerType) => {
  const map: Record<CustomerType, string> = {
    industrial: 'bg-indigo-100 text-indigo-800',
    commercial: 'bg-purple-100 text-purple-800',
    residential: 'bg-teal-100 text-teal-800',
  };
  return map[type];
};

export const getNodeTypeLabel = (type: NodeType) => {
  const map: Record<NodeType, string> = {
    regulator: '调压站',
    valve: '阀门',
    junction: '节点',
  };
  return map[type];
};

export const generateId = (prefix: string) => {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
};

export const generateDispatchPlan = (
  stations: Array<{ id: string; name: string; supplyCapacity: number }>,
  nodes: Array<{ id: string; name: string; designPressure: number }>
) => {
  const baseSupply = 500 + Math.random() * 100;
  const stationAllocations = stations.map((s) => ({
    stationId: s.id,
    stationName: s.name,
    plannedOutput: Math.round((s.supplyCapacity * (0.75 + Math.random() * 0.15)) * 10) / 10,
  }));

  const nodeTargets = nodes.slice(0, 5).map((n) => ({
    nodeId: n.id,
    nodeName: n.name,
    targetPressure: n.designPressure,
  }));

  return {
    stationAllocations,
    nodeTargets,
    totalDailySupply: stationAllocations.reduce((sum, s) => sum + s.plannedOutput, 0),
    storageUsage: Math.round(Math.random() * 30 * 10) / 10,
    pressureBalanceScore: Math.round(85 + Math.random() * 15),
    weather: {
      temperature: Math.round(20 + Math.random() * 15),
      condition: ['晴', '多云', '阴', '小雨'][Math.floor(Math.random() * 4)],
      humidity: Math.round(40 + Math.random() * 40),
    },
  };
};

export { jsPDF } from 'jspdf';
export { default as html2canvas } from 'html2canvas';
