import { useState } from 'react';
import {
  AlertTriangle,
  Search,
  Truck,
  Users,
  Clock,
  MapPin,
  Wrench,
  CheckCircle,
  Play,
  ArrowRight,
  Phone,
  FileText,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { RepairOrder, RepairOrderStatus } from '@/types';
import {
  getRepairOrderStatusColor,
  getRepairOrderStatusLabel,
  formatNumber,
  generateId,
} from '@/utils';

const Emergency = () => {
  const alarms = useAppStore((s) => s.alarms);
  const repairOrders = useAppStore((s) => s.repairOrders);
  const repairTeams = useAppStore((s) => s.repairTeams);
  const repairVehicles = useAppStore((s) => s.repairVehicles);
  const addRepairOrder = useAppStore((s) => s.addRepairOrder);
  const updateRepairOrder = useAppStore((s) => s.updateRepairOrder);
  const addAlarm = useAppStore((s) => s.addAlarm);

  const [selectedOrder, setSelectedOrder] = useState<RepairOrder | null>(repairOrders[0] || null);
  const [statusFilter, setStatusFilter] = useState<RepairOrderStatus | 'all'>('all');
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [pendingAlarmId, setPendingAlarmId] = useState<string | null>(null);

  const leakAlarms = alarms.filter((a) => a.type === 'leak' || a.type === 'pressure_low' || a.type === 'pressure_high');
  const pendingDispatch = leakAlarms.filter(
    (a) => !repairOrders.some((o) => o.alarmId === a.id)
  );

  const filteredOrders = repairOrders.filter(
    (o) => statusFilter === 'all' || o.status === statusFilter
  );

  const handleDispatch = (teamId: string, vehicleId: string) => {
    if (!pendingAlarmId) return;
    const alarm = alarms.find((a) => a.id === pendingAlarmId);
    const team = repairTeams.find((t) => t.id === teamId);
    const vehicle = repairVehicles.find((v) => v.id === vehicleId);
    if (!alarm || !team || !vehicle) return;

    const newOrder: RepairOrder = {
      id: generateId('ro'),
      alarmId: alarm.id,
      nodeId: alarm.nodeId,
      nodeName: alarm.nodeName,
      teamId: team.id,
      teamName: team.name,
      vehicleId: vehicle.id,
      vehiclePlate: vehicle.plateNumber,
      equipment: vehicle.equipment,
      status: 'assigned',
      assignedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      description: alarm.description,
    };
    addRepairOrder(newOrder);
    setSelectedOrder(newOrder);
    setShowDispatchModal(false);
    setPendingAlarmId(null);
  };

  const updateStatus = (orderId: string, newStatus: RepairOrderStatus) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const updates: Partial<RepairOrder> = { status: newStatus };
    if (newStatus === 'en_route') updates.arrivedAt = undefined;
    if (newStatus === 'on_site') updates.arrivedAt = now;
    if (newStatus === 'repairing') updates.startedAt = now;
    if (newStatus === 'completed') {
      updates.completedAt = now;
      updates.recoveryTime = now;
      const order = repairOrders.find((o) => o.id === orderId);
      if (order?.startedAt) {
        updates.repairDuration = Math.round(
          (new Date(now).getTime() - new Date(order.startedAt).getTime()) / 60000
        );
      }
    }
    updateRepairOrder(orderId, updates);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, ...updates });
    }
  };

  const statusTimeline: Array<{ status: RepairOrderStatus; label: string; icon: typeof Clock }> = [
    { status: 'assigned', label: '已派单', icon: FileText },
    { status: 'en_route', label: '赶往现场', icon: Truck },
    { status: 'on_site', label: '到达现场', icon: MapPin },
    { status: 'repairing', label: '抢修中', icon: Wrench },
    { status: 'completed', label: '完成修复', icon: CheckCircle },
  ];

  const stats = {
    total: repairOrders.length,
    ongoing: repairOrders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled').length,
    completed: repairOrders.filter((o) => o.status === 'completed').length,
    avgDuration: 45,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-500">应急抢修管理</h1>
          <p className="text-sm text-gray-500 mt-1">泄漏报警响应、抢修派单、过程追踪</p>
        </div>
        {pendingDispatch.length > 0 && (
          <button
            onClick={() => {
              setPendingAlarmId(pendingDispatch[0].id);
              setShowDispatchModal(true);
            }}
            className="btn btn-danger"
          >
            <AlertTriangle className="w-4 h-4 mr-1.5" />
            {pendingDispatch.length} 个告警待派单
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">抢修工单总数</p>
              <p className="text-2xl font-bold text-navy-500 font-mono mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center">
              <FileText className="w-6 h-6 text-navy-500" />
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">进行中</p>
              <p className="text-2xl font-bold text-orange-600 font-mono mt-1">{stats.ongoing}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
              <Wrench className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">已完成</p>
              <p className="text-2xl font-bold text-green-600 font-mono mt-1">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">平均修复时长</p>
              <p className="text-2xl font-bold text-blue-600 font-mono mt-1">{stats.avgDuration}<span className="text-sm">分钟</span></p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-5 card">
          <div className="card-header flex-wrap gap-3">
            <h2 className="card-title">抢修工单列表</h2>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as RepairOrderStatus | 'all')}
              className="input-field w-36"
            >
              <option value="all">全部状态</option>
              <option value="assigned">已派单</option>
              <option value="en_route">赶往现场</option>
              <option value="on_site">到达现场</option>
              <option value="repairing">抢修中</option>
              <option value="completed">已完成</option>
            </select>
          </div>
          <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
            {filteredOrders.map((order) => {
              const isSelected = selectedOrder?.id === order.id;
              const team = repairTeams.find((t) => t.id === order.teamId);
              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-4 cursor-pointer transition-all ${
                    isSelected ? 'bg-navy-50 border-l-4 border-navy-500' : 'hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-navy-500 font-semibold">{order.id}</span>
                      <span className={`badge ${getRepairOrderStatusColor(order.status)}`}>
                        {getRepairOrderStatusLabel(order.status)}
                      </span>
                    </div>
                    <ArrowRight className={`w-4 h-4 ${isSelected ? 'text-navy-500' : 'text-gray-300'}`} />
                  </div>
                  <p className="text-sm font-medium text-gray-800 mb-1">{order.nodeName}</p>
                  <p className="text-xs text-gray-500 line-clamp-1 mb-2">{order.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {order.teamName}
                      </div>
                      <div className="flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        {order.vehiclePlate}
                      </div>
                    </div>
                    <span className="text-gray-400">{order.assignedAt.slice(5, 16)}</span>
                  </div>
                </div>
              );
            })}
            {filteredOrders.length === 0 && (
              <div className="p-8 text-center text-gray-400 text-sm">暂无工单</div>
            )}
          </div>
        </div>

        <div className="col-span-7">
          {selectedOrder ? (
            <div className="space-y-5">
              <div className="card">
                <div className="card-header">
                  <div>
                    <h2 className="card-title">工单详情 - {selectedOrder.id}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">派单时间：{selectedOrder.assignedAt}</p>
                  </div>
                  <span className={`badge ${getRepairOrderStatusColor(selectedOrder.status)}`}>
                    {getRepairOrderStatusLabel(selectedOrder.status)}
                  </span>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">抢修地点</p>
                      <p className="text-sm font-medium text-gray-800 flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-red-500" />
                        {selectedOrder.nodeName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">问题描述</p>
                      <p className="text-sm text-gray-800">{selectedOrder.description}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-600 mb-1">负责班组</p>
                      <p className="text-sm font-semibold text-blue-800">{selectedOrder.teamName}</p>
                      <p className="text-xs text-blue-600 mt-0.5 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {repairTeams.find((t) => t.id === selectedOrder.teamId)?.contact || '-'}
                      </p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <p className="text-xs text-orange-600 mb-1">抢修车辆</p>
                      <p className="text-sm font-semibold text-orange-800 font-mono">{selectedOrder.vehiclePlate}</p>
                      <p className="text-xs text-orange-600 mt-0.5">
                        携带：{selectedOrder.equipment.join('、')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h2 className="card-title">抢修进度</h2>
                </div>
                <div className="p-5">
                  <div className="relative">
                    <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200"></div>
                    <div className="space-y-5">
                      {statusTimeline.map((item, idx) => {
                        const currentIdx = statusTimeline.findIndex((s) => s.status === selectedOrder.status);
                        const isDone = idx <= currentIdx;
                        const isCurrent = idx === currentIdx;
                        return (
                          <div key={item.status} className="flex items-start gap-4 relative">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 ${
                                isDone
                                  ? isCurrent
                                    ? 'bg-brand-warning text-white animate-pulse'
                                    : 'bg-brand-success text-white'
                                  : 'bg-gray-200 text-gray-400'
                              }`}
                            >
                              <item.icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 pt-1">
                              <div className="flex items-center justify-between">
                                <p className={`text-sm font-medium ${isDone ? 'text-gray-800' : 'text-gray-400'}`}>
                                  {item.label}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {selectedOrder.repairDuration && (
                    <div className="mt-5 p-3 bg-green-50 rounded-lg text-center">
                      <p className="text-xs text-green-600">实际修复时长</p>
                      <p className="text-2xl font-bold text-green-700 font-mono">
                        {selectedOrder.repairDuration}<span className="text-sm">分钟</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {selectedOrder.status !== 'completed' && selectedOrder.status !== 'cancelled' && (
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">状态流转操作</h2>
                  </div>
                  <div className="p-5 flex justify-center gap-3">
                    {selectedOrder.status === 'assigned' && (
                      <button onClick={() => updateStatus(selectedOrder.id, 'en_route')} className="btn btn-primary">
                        <Truck className="w-4 h-4 mr-1.5" />
                        车辆已出发
                      </button>
                    )}
                    {selectedOrder.status === 'en_route' && (
                      <button onClick={() => updateStatus(selectedOrder.id, 'on_site')} className="btn btn-primary">
                        <MapPin className="w-4 h-4 mr-1.5" />
                        已到达现场
                      </button>
                    )}
                    {selectedOrder.status === 'on_site' && (
                      <button onClick={() => updateStatus(selectedOrder.id, 'repairing')} className="btn btn-warning">
                        <Play className="w-4 h-4 mr-1.5" />
                        开始抢修
                      </button>
                    )}
                    {selectedOrder.status === 'repairing' && (
                      <button onClick={() => updateStatus(selectedOrder.id, 'completed')} className="btn btn-success">
                        <CheckCircle className="w-4 h-4 mr-1.5" />
                        完成修复恢复供气
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card h-full flex items-center justify-center">
              <div className="text-center py-20">
                <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">请选择左侧工单查看详情</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showDispatchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-card-hover">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-semibold text-navy-500">应急派单</h3>
            </div>
            <div className="p-6 space-y-5">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-800">
                  {alarms.find((a) => a.id === pendingAlarmId)?.nodeName}
                </p>
                <p className="text-sm text-red-700 mt-1">
                  {alarms.find((a) => a.id === pendingAlarmId)?.description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">选择抢修班组</label>
                  <select id="teamSelect" className="input-field">
                    {repairTeams
                      .filter((t) => t.status === 'idle' || t.status === 'on_duty')
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} - {t.leader} ({t.memberCount}人)
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="label-field">选择抢修车辆</label>
                  <select id="vehicleSelect" className="input-field">
                    {repairVehicles
                      .filter((v) => v.status === 'idle')
                      .map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.plateNumber} - {v.type}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowDispatchModal(false);
                    setPendingAlarmId(null);
                  }}
                  className="btn btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    const teamId = (document.getElementById('teamSelect') as HTMLSelectElement).value;
                    const vehicleId = (document.getElementById('vehicleSelect') as HTMLSelectElement).value;
                    handleDispatch(teamId, vehicleId);
                  }}
                  className="btn btn-danger"
                >
                  确认派单
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Emergency;
