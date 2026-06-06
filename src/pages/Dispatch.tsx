import { useState } from 'react';
import {
  Plus,
  Search,
  Check,
  X,
  RefreshCw,
  Send,
  FileText,
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  ThermometerSun,
  Droplets,
  Calendar,
  Clock,
  AlertCircle,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { DispatchPlan } from '@/types';
import {
  generateId,
  generateDispatchPlan,
  getPlanStatusColor,
  getPlanStatusLabel,
  formatNumber,
} from '@/utils';

const weatherIcons: Record<string, typeof Sun> = {
  晴: Sun,
  多云: Cloud,
  阴: Cloud,
  小雨: CloudRain,
  小雪: CloudSnow,
};

const Dispatch = () => {
  const plans = useAppStore((s) => s.dispatchPlans);
  const stations = useAppStore((s) => s.stations);
  const nodes = useAppStore((s) => s.nodes);
  const user = useAppStore((s) => s.currentUser);
  const addPlan = useAppStore((s) => s.addDispatchPlan);
  const confirmPlan = useAppStore((s) => s.confirmDispatchPlan);
  const requestAdjust = useAppStore((s) => s.requestAdjustPlan);
  const approvePlan = useAppStore((s) => s.approvePlan);
  const rejectPlan = useAppStore((s) => s.rejectPlan);
  const pushPlan = useAppStore((s) => s.pushPlan);

  const [search, setSearch] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<DispatchPlan | null>(plans[0] || null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustReason, setAdjustReason] = useState('');

  const filteredPlans = plans.filter((p) => p.planDate.includes(search));

  const handleGeneratePlan = () => {
    const generated = generateDispatchPlan(
      stations.map((s) => ({ id: s.id, name: s.name, supplyCapacity: s.supplyCapacity })),
      nodes.map((n) => ({ id: n.id, name: n.name, designPressure: n.designPressure }))
    );
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const newPlan: DispatchPlan = {
      id: generateId('dp'),
      planDate: tomorrow.toISOString().split('T')[0],
      generatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      generatedBy: 'system',
      weather: generated.weather,
      isHoliday: false,
      stations: generated.stationAllocations,
      nodes: generated.nodeTargets,
      storageUsage: generated.storageUsage,
      totalDailySupply: generated.totalDailySupply,
      pressureBalanceScore: generated.pressureBalanceScore,
      status: 'pending',
      pushStatus: 'not_pushed',
    };
    addPlan(newPlan);
    setSelectedPlan(newPlan);
  };

  const handleConfirm = () => {
    if (!selectedPlan) return;
    confirmPlan(selectedPlan.id, user.id, user.name);
    setSelectedPlan({ ...selectedPlan, status: 'confirmed', dispatcherId: user.id, dispatcherName: user.name });
  };

  const handleRequestAdjust = () => {
    if (!selectedPlan || !adjustReason) return;
    requestAdjust(selectedPlan.id, adjustReason, user.id, user.name);
    setSelectedPlan({
      ...selectedPlan,
      status: 'adjust_requested',
      adjustReason,
      dispatcherId: user.id,
      dispatcherName: user.name,
    });
    setShowAdjustModal(false);
    setAdjustReason('');
  };

  const handlePush = () => {
    if (!selectedPlan) return;
    pushPlan(selectedPlan.id);
    setSelectedPlan({ ...selectedPlan, pushStatus: 'pushed' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-500">智能调度方案</h1>
          <p className="text-sm text-gray-500 mt-1">基于历史用气数据、天气与节假日自动生成调度方案</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleGeneratePlan} className="btn btn-secondary">
            <RefreshCw className="w-4 h-4 mr-1.5" />
            生成明日方案
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-4 card">
          <div className="card-header">
            <h2 className="card-title">调度方案列表</h2>
          </div>
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="按日期搜索..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-9"
              />
            </div>
          </div>
          <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
            {filteredPlans.map((plan) => {
              const WeatherIcon = weatherIcons[plan.weather.condition] || Cloud;
              const isSelected = selectedPlan?.id === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`p-4 cursor-pointer transition-all ${
                    isSelected ? 'bg-navy-50 border-l-4 border-navy-500' : 'hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold text-gray-800">{plan.planDate}</span>
                      {plan.isHoliday && plan.holidayName && (
                        <span className="badge bg-red-100 text-red-700">{plan.holidayName}</span>
                      )}
                    </div>
                    <span className={`badge ${getPlanStatusColor(plan.status)}`}>
                      {getPlanStatusLabel(plan.status)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <WeatherIcon className="w-3.5 h-3.5 text-orange-500" />
                        <span>{plan.weather.temperature}°C {plan.weather.condition}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5 text-blue-500" />
                        <span>{plan.weather.humidity}%</span>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-navy-500' : 'text-gray-300'}`} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      日供气量 <span className="font-mono font-semibold text-navy-500">{plan.totalDailySupply}</span> 万m³
                    </span>
                    <span className="text-gray-500">
                      压力平衡 <span className="font-mono font-semibold text-green-600">{plan.pressureBalanceScore}</span> 分
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="col-span-8">
          {selectedPlan ? (
            <div className="card">
              <div className="card-header">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-navy-500" />
                  <div>
                    <h2 className="card-title">调度方案详情 - {selectedPlan.planDate}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      生成时间：{selectedPlan.generatedAt} · {selectedPlan.generatedBy === 'system' ? '系统自动生成' : '人工调整'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${getPlanStatusColor(selectedPlan.status)}`}>
                    {getPlanStatusLabel(selectedPlan.status)}
                  </span>
                  <span
                    className={`badge ${
                      selectedPlan.pushStatus === 'pushed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {selectedPlan.pushStatus === 'pushed' ? '已推送' : '未推送'}
                  </span>
                </div>
              </div>
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-600 text-xs mb-1">
                      <ThermometerSun className="w-4 h-4" />
                      天气情况
                    </div>
                    <p className="text-lg font-bold text-orange-700">
                      {selectedPlan.weather.temperature}°C {selectedPlan.weather.condition}
                    </p>
                    <p className="text-xs text-orange-600 mt-0.5">湿度 {selectedPlan.weather.humidity}%</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                    <p className="text-xs text-green-600 mb-1">计划日供气量</p>
                    <p className="text-lg font-bold text-green-700 font-mono">{selectedPlan.totalDailySupply}</p>
                    <p className="text-xs text-green-600 mt-0.5">万立方米</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                    <p className="text-xs text-blue-600 mb-1">储气库调用</p>
                    <p className="text-lg font-bold text-blue-700 font-mono">{selectedPlan.storageUsage}</p>
                    <p className="text-xs text-blue-600 mt-0.5">万立方米</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                    <p className="text-xs text-purple-600 mb-1">压力平衡评分</p>
                    <p className="text-lg font-bold text-purple-700 font-mono">{selectedPlan.pressureBalanceScore}</p>
                    <p className="text-xs text-purple-600 mt-0.5">满分 100 分</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    气源门站供气计划
                  </h3>
                  <div className="overflow-hidden rounded-lg border border-gray-100">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="table-header">门站名称</th>
                          <th className="table-header">计划供气量</th>
                          <th className="table-header">供气能力</th>
                          <th className="table-header">负荷率</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedPlan.stations.map((s) => {
                          const station = stations.find((st) => st.id === s.stationId);
                          const rate = station ? (s.plannedOutput / station.supplyCapacity) * 100 : 0;
                          return (
                            <tr key={s.stationId}>
                              <td className="table-cell font-medium">{s.stationName}</td>
                              <td className="table-cell font-mono text-navy-500 font-semibold">
                                {s.plannedOutput} 万m³
                              </td>
                              <td className="table-cell font-mono text-gray-500">
                                {station?.supplyCapacity || '-'} 万m³
                              </td>
                              <td className="table-cell">
                                <div className="flex items-center gap-2">
                                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                                      style={{ width: `${rate}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs font-mono text-gray-600">{rate.toFixed(0)}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {selectedPlan.nodes.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">关键节点压力目标</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {selectedPlan.nodes.map((n) => {
                        const node = nodes.find((nd) => nd.id === n.nodeId);
                        return (
                          <div key={n.nodeId} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-800">{n.nodeName}</p>
                              <p className="text-xs text-gray-500">
                                设计 {node?.designPressure} MPa
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-mono font-bold text-navy-500">{n.targetPressure}</p>
                              <p className="text-xs text-gray-500">目标 MPa</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedPlan.adjustReason && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-amber-800">调整申请说明</p>
                        <p className="text-sm text-amber-700 mt-1">{selectedPlan.adjustReason}</p>
                        <p className="text-xs text-amber-600 mt-1">申请人：{selectedPlan.dispatcherName}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  {selectedPlan.status === 'pending' && (
                    <>
                      <button onClick={() => setShowAdjustModal(true)} className="btn btn-secondary">
                        <RefreshCw className="w-4 h-4 mr-1.5" />
                        申请调整
                      </button>
                      <button onClick={handleConfirm} className="btn btn-success">
                        <Check className="w-4 h-4 mr-1.5" />
                        确认方案
                      </button>
                    </>
                  )}
                  {selectedPlan.status === 'adjust_requested' && user.role === 'supervisor' && (
                    <>
                      <button
                        onClick={() => {
                          rejectPlan(selectedPlan.id, user.id, user.name);
                          setSelectedPlan({ ...selectedPlan, status: 'rejected' });
                        }}
                        className="btn btn-danger"
                      >
                        <X className="w-4 h-4 mr-1.5" />
                        驳回
                      </button>
                      <button
                        onClick={() => {
                          approvePlan(selectedPlan.id, user.id, user.name);
                          setSelectedPlan({ ...selectedPlan, status: 'approved' });
                        }}
                        className="btn btn-success"
                      >
                        <Check className="w-4 h-4 mr-1.5" />
                        审批通过
                      </button>
                    </>
                  )}
                  {(selectedPlan.status === 'confirmed' || selectedPlan.status === 'approved') &&
                    selectedPlan.pushStatus === 'not_pushed' && (
                      <button onClick={handlePush} className="btn btn-primary">
                        <Send className="w-4 h-4 mr-1.5" />
                        推送至调度终端
                      </button>
                    )}
                </div>
              </div>
            </div>
          ) : (
            <div className="card h-full flex items-center justify-center">
              <div className="text-center py-20">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">请选择左侧调度方案查看详情</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAdjustModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-card-hover">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-navy-500">申请调整调度方案</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label-field">调整原因 <span className="text-red-500">*</span></label>
                <textarea
                  rows={4}
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="input-field resize-none"
                  placeholder="请详细说明需要调整的原因和建议..."
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowAdjustModal(false)} className="btn btn-secondary">
                  取消
                </button>
                <button
                  onClick={handleRequestAdjust}
                  disabled={!adjustReason.trim()}
                  className="btn btn-primary"
                >
                  提交申请
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dispatch;
