import { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  Activity,
  AlertTriangle,
  Gauge,
  RefreshCw,
  Bell,
  Send,
  Thermometer,
} from 'lucide-react';
import { useAppStore } from '@/store';
import PipelineMap from '@/components/map/PipelineMap';
import {
  getNodeStatusColor,
  getNodeStatusLabel,
  getNodeStatusDotColor,
  getNodeTypeLabel,
  formatNumber,
} from '@/utils';
import type { PipelineNode } from '@/types';

const Monitor = () => {
  const nodes = useAppStore((s) => s.nodes);
  const alarms = useAppStore((s) => s.alarms);
  const confirmAlarm = useAppStore((s) => s.confirmAlarm);
  const resolveAlarm = useAppStore((s) => s.resolveAlarm);
  const updateNode = useAppStore((s) => s.updateNode);
  const simulateUpdate = useAppStore((s) => s.simulateNodePressureUpdate);
  const user = useAppStore((s) => s.currentUser);

  const [selectedNode, setSelectedNode] = useState<PipelineNode | null>(null);
  const [pressureHistory, setPressureHistory] = useState<Array<{ time: string; pressure: number }>>(
    Array.from({ length: 20 }, (_, i) => ({
      time: `${String(i).padStart(2, '0')}:00`,
      pressure: 1.5 + (Math.random() - 0.5) * 0.2,
    }))
  );

  useEffect(() => {
    const timer = setInterval(() => {
      simulateUpdate();
      setPressureHistory((prev) => {
        const newPoint = {
          time: new Date().toTimeString().slice(0, 5),
          pressure: selectedNode ? selectedNode.currentPressure : 1.5 + (Math.random() - 0.5) * 0.2,
        };
        return [...prev.slice(1), newPoint];
      });
    }, 3000);
    return () => clearInterval(timer);
  }, [simulateUpdate, selectedNode]);

  const abnormalNodes = nodes.filter((n) => n.status !== 'normal' && n.status !== 'offline');
  const pendingAlarms = alarms.filter((a) => a.status === 'pending' || a.status === 'processing');

  const pressureChartOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: {
      type: 'category',
      data: pressureHistory.map((p) => p.time),
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: { color: '#64748b', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      name: 'MPa',
      min: selectedNode ? selectedNode.minPressure * 0.9 : 1.0,
      max: selectedNode ? selectedNode.maxPressure * 1.1 : 2.0,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#f1f5f9' } },
      axisLabel: { color: '#64748b', fontSize: 10 },
    },
    series: [
      {
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 2,
          color: selectedNode && selectedNode.status !== 'normal' ? '#E5484D' : '#0A2540',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: selectedNode && selectedNode.status !== 'normal' ? 'rgba(229,72,77,0.3)' : 'rgba(10,37,64,0.2)' },
              { offset: 1, color: 'rgba(10,37,64,0.02)' },
            ],
          },
        },
        markLine: selectedNode
          ? {
              silent: true,
              lineStyle: { type: 'dashed' },
              data: [
                { yAxis: selectedNode.minPressure, label: { formatter: '下限', fontSize: 10 }, lineStyle: { color: '#FF6B35' } },
                { yAxis: selectedNode.maxPressure, label: { formatter: '上限', fontSize: 10 }, lineStyle: { color: '#FF6B35' } },
              ],
            }
          : undefined,
        data: pressureHistory.map((p) => p.pressure.toFixed(2)),
      },
    ],
  };

  const handleSwitchRegulator = (node: PipelineNode) => {
    updateNode(node.id, { status: 'normal', currentPressure: node.designPressure });
    alert(`已触发 ${node.name} 调压站自动切换，已通知巡检人员`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-500">管网实时监控</h1>
          <p className="text-sm text-gray-500 mt-1">实时监测管网压力状态，异常自动告警与处置</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className={`status-dot bg-green-500 animate-pulse`}></span>
            实时采集中
          </div>
          <button onClick={simulateUpdate} className="btn btn-secondary">
            <RefreshCw className="w-4 h-4 mr-1.5" />
            刷新数据
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-8 space-y-5">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title flex items-center gap-2">
                <Activity className="w-5 h-5" />
                管网压力热力图
              </h2>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <span className="status-dot bg-brand-success"></span>正常
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="status-dot bg-brand-warning"></span>压力异常
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="status-dot bg-brand-danger animate-breathe"></span>泄漏/抢修
                </div>
              </div>
            </div>
            <div className="p-3">
              <PipelineMap height="420px" onNodeClick={setSelectedNode} />
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">
                {selectedNode ? `${selectedNode.name} - 压力实时曲线` : '压力实时曲线'}
              </h2>
              {selectedNode && (
                <div className="flex items-center gap-4 text-xs">
                  <span className={`badge ${getNodeStatusColor(selectedNode.status)}`}>
                    <span className={`status-dot ${getNodeStatusDotColor(selectedNode.status)}`}></span>
                    {getNodeStatusLabel(selectedNode.status)}
                  </span>
                  <span className="text-gray-500">
                    设计压力：<span className="font-mono font-semibold">{selectedNode.designPressure} MPa</span>
                  </span>
                  <span className="text-gray-500">
                    当前：<span className="font-mono font-semibold text-navy-500">{formatNumber(selectedNode.currentPressure)} MPa</span>
                  </span>
                </div>
              )}
            </div>
            <div className="p-3">
              <ReactECharts option={pressureChartOption} style={{ height: 280 }} />
            </div>
          </div>
        </div>

        <div className="col-span-4 space-y-5">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title flex items-center gap-2">
                <Gauge className="w-5 h-5" />
                节点状态概览
              </h2>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600 font-mono">
                  {nodes.filter((n) => n.status === 'normal').length}
                </p>
                <p className="text-xs text-green-600">正常运行</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-orange-600 font-mono">{abnormalNodes.length}</p>
                <p className="text-xs text-orange-600">异常节点</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-600 font-mono">
                  {nodes.filter((n) => n.status === 'leak').length}
                </p>
                <p className="text-xs text-red-600">泄漏告警</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-yellow-600 font-mono">
                  {nodes.filter((n) => n.status === 'repair').length}
                </p>
                <p className="text-xs text-yellow-600">抢修中</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                异常告警列表
                <span className="badge bg-red-100 text-red-700 ml-1">{pendingAlarms.length}</span>
              </h2>
            </div>
            <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
              {pendingAlarms.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  暂无异常告警
                </div>
              ) : (
                pendingAlarms.map((alarm) => {
                  const isCritical = alarm.level === 'critical';
                  return (
                    <div
                      key={alarm.id}
                      className={`p-4 ${isCritical ? 'bg-red-50/60' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`badge ${
                              isCritical ? 'bg-red-600 text-white animate-pulse' : 'bg-orange-500 text-white'
                            }`}
                          >
                            {isCritical ? '紧急' : '警告'}
                          </span>
                          <span className="text-sm font-semibold text-gray-800">{alarm.nodeName}</span>
                        </div>
                        <span className="text-xs text-gray-400">{alarm.createdAt.slice(11)}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{alarm.description}</p>
                      <div className="flex items-center gap-2">
                        {alarm.status === 'pending' && (
                          <button
                            onClick={() => confirmAlarm(alarm.id, user.id, user.name)}
                            className="btn btn-primary text-xs py-1.5 px-3"
                          >
                            <Bell className="w-3 h-3 mr-1" />
                            确认告警
                          </button>
                        )}
                        {alarm.type === 'pressure_low' || alarm.type === 'pressure_high' ? (
                          <button
                            onClick={() => {
                              const node = nodes.find((n) => n.id === alarm.nodeId);
                              if (node) handleSwitchRegulator(node);
                            }}
                            className="btn btn-warning text-xs py-1.5 px-3"
                          >
                            <Send className="w-3 h-3 mr-1" />
                            触发调压切换
                          </button>
                        ) : null}
                        {alarm.status === 'processing' && (
                          <button
                            onClick={() => resolveAlarm(alarm.id)}
                            className="btn btn-success text-xs py-1.5 px-3"
                          >
                            标记解决
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {selectedNode && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">节点详情 - {selectedNode.name}</h2>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">类型</span>
                  <span className="badge bg-blue-50 text-blue-700">{getNodeTypeLabel(selectedNode.type)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">管径</span>
                  <span className="text-sm font-mono font-medium">DN{selectedNode.pipeDiameter}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">地址</span>
                  <span className="text-sm text-gray-700 text-right max-w-[60%]">{selectedNode.address}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">压力范围</span>
                  <span className="text-sm font-mono">
                    {selectedNode.minPressure} ~ {selectedNode.maxPressure} MPa
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">最后更新</span>
                  <span className="text-xs text-gray-400">{selectedNode.lastUpdate}</span>
                </div>
                {(selectedNode.status === 'low_pressure' || selectedNode.status === 'high_pressure') && (
                  <button
                    onClick={() => handleSwitchRegulator(selectedNode)}
                    className="w-full btn btn-warning mt-2"
                  >
                    <Thermometer className="w-4 h-4 mr-1.5" />
                    自动调压并通知巡检
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Monitor;
