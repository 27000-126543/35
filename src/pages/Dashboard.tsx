import { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  Flame,
  Gauge,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  Building2,
  Wrench,
  ChevronRight,
} from 'lucide-react';
import PipelineMap from '@/components/map/PipelineMap';
import { useAppStore } from '@/store';
import type { StatisticsData } from '@/types';
import {
  formatNumber,
  getAlarmLevelColor,
  getAlarmLevelLabel,
  getAlarmTypeLabel,
  getNodeStatusColor,
  getNodeStatusLabel,
} from '@/utils';

const Dashboard = () => {
  const fetchStatistics = useAppStore((s) => s.fetchStatistics);
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const alarms = useAppStore((s) => s.alarms);
  const nodes = useAppStore((s) => s.nodes);
  const stations = useAppStore((s) => s.stations);
  const repairOrders = useAppStore((s) => s.repairOrders);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const loadStats = async () => {
      const data = await fetchStatistics();
      setStats(data);
    };
    loadStats();
  }, [fetchStatistics]);

  useEffect(() => {
    const timer = setInterval(() => forceUpdate((v) => v + 1), 5000);
    return () => clearInterval(timer);
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-navy-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">加载统计数据中...</p>
        </div>
      </div>
    );
  }

  const totalOutput = stations.reduce((sum, s) => sum + s.currentOutput, 0);
  const normalNodes = nodes.filter((n) => n.status === 'normal').length;
  const activeAlarms = alarms.filter((a) => a.status !== 'resolved' && a.status !== 'false_alarm');
  const activeRepairs = repairOrders.filter((r) => r.status !== 'completed' && r.status !== 'cancelled');

  const kpiCards = [
    {
      title: '今日供气量',
      value: formatNumber(stats.totalGasSupply, 1),
      unit: '万m³',
      icon: Flame,
      trend: '+5.2%',
      trendUp: true,
      color: 'from-orange-500 to-red-500',
    },
    {
      title: '压力合格率',
      value: formatNumber(stats.pressureQualifiedRate, 1),
      unit: '%',
      icon: Gauge,
      trend: '+1.3%',
      trendUp: true,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: '抢修及时率',
      value: formatNumber(stats.repairOnTimeRate, 1),
      unit: '%',
      icon: Wrench,
      trend: '-0.5%',
      trendUp: false,
      color: 'from-blue-500 to-indigo-500',
    },
    {
      title: '气损率',
      value: formatNumber(stats.gasLossRate, 1),
      unit: '%',
      icon: TrendingDown,
      trend: '-0.2%',
      trendUp: true,
      color: 'from-purple-500 to-pink-500',
    },
  ];

  const supplyChartOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 30, bottom: 30 },
    xAxis: {
      type: 'category',
      data: stats.dailySupply.map((d) => d.date),
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: { color: '#64748b', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      name: '万m³',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#f1f5f9' } },
      axisLabel: { color: '#64748b', fontSize: 11 },
    },
    series: [
      {
        type: 'bar',
        data: stats.dailySupply.map((d) => (d.supply / 10000).toFixed(1)),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#FF6B35' },
              { offset: 1, color: '#FFAB00' },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
        barWidth: 24,
      },
    ],
  };

  const userTypeChartOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c}万m³ ({d}%)' },
    legend: { orient: 'vertical', right: 10, top: 'center', itemWidth: 12, itemHeight: 12, textStyle: { fontSize: 12 } },
    series: [
      {
        type: 'pie',
        radius: ['50%', '75%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        label: { show: false },
        itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
        data: stats.byUserType.map((u, idx) => ({
          name: ['工业', '商业', '居民'][idx],
          value: (u.gasSupply / 10000).toFixed(1),
          itemStyle: { color: ['#0A2540', '#FF6B35', '#36B37E'][idx] },
        })),
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-500">运营数据看板</h1>
        <p className="text-sm text-gray-500 mt-1">实时监控燃气输配运营状态</p>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {kpiCards.map((card, idx) => (
          <div key={idx} className="card overflow-hidden">
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-bold text-gray-900 font-mono">{card.value}</span>
                    <span className="text-sm text-gray-500">{card.unit}</span>
                  </div>
                  <div className={`flex items-center gap-1 mt-2 text-xs ${card.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                    {card.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>较上周</span>
                    <span className="font-medium">{card.trend}</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-8 card">
          <div className="card-header">
            <h2 className="card-title">管网实时监控</h2>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <span className="status-dot bg-brand-success"></span>
                正常 {normalNodes}/{nodes.length}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="status-dot bg-brand-danger animate-breathe"></span>
                告警 {activeAlarms.length}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {new Date().toLocaleTimeString('zh-CN')}
              </div>
            </div>
          </div>
          <div className="p-3">
            <PipelineMap height="380px" />
          </div>
        </div>

        <div className="col-span-4 space-y-5">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">实时告警</h2>
              <span className="badge bg-red-100 text-red-700">{activeAlarms.length} 条待处理</span>
            </div>
            <div className="divide-y divide-gray-50 max-h-[420px] overflow-y-auto">
              {activeAlarms.slice(0, 6).map((alarm) => (
                <div key={alarm.id} className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`badge ${getAlarmLevelColor(alarm.level)}`}>
                        <AlertTriangle className="w-3 h-3 mr-0.5" />
                        {getAlarmLevelLabel(alarm.level)}
                      </span>
                      <span className={`badge ${getNodeStatusColor(alarm.type === 'leak' ? 'leak' : 'low_pressure')}`}>
                        {getAlarmTypeLabel(alarm.type)}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-800">{alarm.nodeName}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{alarm.description}</p>
                  <p className="text-xs text-gray-400 mt-1.5">{alarm.createdAt}</p>
                </div>
              ))}
              {activeAlarms.length === 0 && (
                <div className="p-8 text-center text-gray-400 text-sm">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  暂无告警
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-5 card">
          <div className="card-header">
            <h2 className="card-title">近7日供气量趋势</h2>
          </div>
          <div className="p-3">
            <ReactECharts option={supplyChartOption} style={{ height: 280 }} />
          </div>
        </div>

        <div className="col-span-3 card">
          <div className="card-header">
            <h2 className="card-title">用气结构占比</h2>
          </div>
          <div className="p-3">
            <ReactECharts option={userTypeChartOption} style={{ height: 280 }} />
          </div>
        </div>

        <div className="col-span-4 card">
          <div className="card-header">
            <h2 className="card-title">门站运行状态</h2>
            <span className="text-xs text-gray-500">当前总输出 {formatNumber(totalOutput, 0)} 万m³/日</span>
          </div>
          <div className="divide-y divide-gray-50">
            {stations.map((station) => (
              <div key={station.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-navy-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{station.name}</p>
                    <p className="text-xs text-gray-500">{station.address}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-mono font-semibold text-navy-500">
                    {station.currentOutput}
                    <span className="text-xs font-normal text-gray-500 ml-0.5">/{station.supplyCapacity}万m³</span>
                  </p>
                  <div className={`inline-flex items-center text-xs ${station.status === 'normal' ? 'text-green-600' : 'text-orange-600'}`}>
                    <span className={`status-dot ${station.status === 'normal' ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                    {getNodeStatusLabel(station.status === 'normal' ? 'normal' : 'repair')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">进行中的抢修任务</h2>
          <span className="badge bg-orange-100 text-orange-700">{activeRepairs.length} 个任务</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">工单号</th>
                <th className="table-header">抢修地点</th>
                <th className="table-header">负责班组</th>
                <th className="table-header">车辆</th>
                <th className="table-header">状态</th>
                <th className="table-header">派单时间</th>
                <th className="table-header">持续时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {repairOrders
                .filter((r) => r.status !== 'completed' && r.status !== 'cancelled')
                .map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="table-cell font-mono text-navy-500">{order.id}</td>
                    <td className="table-cell font-medium">{order.nodeName}</td>
                    <td className="table-cell">{order.teamName}</td>
                    <td className="table-cell">{order.vehiclePlate}</td>
                    <td className="table-cell">
                      <span
                        className={`badge ${
                          order.status === 'repairing'
                            ? 'bg-orange-100 text-orange-700'
                            : order.status === 'en_route'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {order.status === 'repairing'
                          ? '抢修中'
                          : order.status === 'en_route'
                          ? '赶往现场'
                          : order.status === 'on_site'
                          ? '已到达'
                          : '已派单'}
                      </span>
                    </td>
                    <td className="table-cell text-gray-500">{order.assignedAt}</td>
                    <td className="table-cell font-mono text-gray-600">
                      {Math.round((Date.now() - new Date(order.assignedAt).getTime()) / 60000)} 分钟
                    </td>
                  </tr>
                ))}
              {activeRepairs.length === 0 && (
                <tr>
                  <td colSpan={7} className="table-cell text-center text-gray-400 py-8">
                    暂无进行中的抢修任务
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
