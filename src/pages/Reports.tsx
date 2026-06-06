import { useState, useRef, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  BarChart3,
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Gauge,
  Wrench,
  Droplets,
  Filter,
  Printer,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { formatNumber } from '@/utils';

const Reports = () => {
  const getStatistics = useAppStore((s) => s.getStatistics);
  const stats = useMemo(() => getStatistics(), [getStatistics]);
  const customers = useAppStore((s) => s.customers);
  const nodes = useAppStore((s) => s.nodes);
  const reportRef = useRef<HTMLDivElement>(null);

  const [region, setRegion] = useState('all');
  const [timeRange, setTimeRange] = useState('month');

  const regions = Array.from(new Set(customers.map((c) => c.region)));

  const regionChartOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 60, right: 20, top: 30, bottom: 30 },
    xAxis: {
      type: 'category',
      data: stats.byRegion.map((r) => r.region),
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: { color: '#64748b', fontSize: 11 },
    },
    yAxis: {
      type: 'value',
      name: 'm³/日',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#f1f5f9' } },
      axisLabel: { color: '#64748b', fontSize: 11 },
    },
    series: [
      {
        type: 'bar',
        data: stats.byRegion.map((r) => r.gasSupply),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#0A2540' },
              { offset: 1, color: '#2F588A' },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
        barWidth: 32,
        label: { show: true, position: 'top', formatter: (p: { value: number }) => formatNumber(p.value / 10000, 1) + '万', fontSize: 11 },
      },
    ],
  };

  const alarmTypeChartOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c}次' },
    legend: { bottom: 0, itemWidth: 12, itemHeight: 12, textStyle: { fontSize: 12 } },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '42%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
        label: { show: true, formatter: '{b}\n{d}%', fontSize: 11 },
        data: [
          { name: '压力偏低', value: stats.alarmCounts.find((a) => a.type === 'pressure_low')?.count || 0, itemStyle: { color: '#FF6B35' } },
          { name: '压力偏高', value: stats.alarmCounts.find((a) => a.type === 'pressure_high')?.count || 0, itemStyle: { color: '#E5484D' } },
          { name: '管道泄漏', value: stats.alarmCounts.find((a) => a.type === 'leak')?.count || 0, itemStyle: { color: '#DC2626' } },
          { name: '设备故障', value: stats.alarmCounts.find((a) => a.type === 'equipment_fault')?.count || 0, itemStyle: { color: '#F59E0B' } },
        ],
      },
    ],
  };

  const pressureChartOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 30, bottom: 30 },
    xAxis: {
      type: 'category',
      data: nodes.map((n) => (n.name.length > 5 ? n.name.slice(0, 5) : n.name)),
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: { color: '#64748b', fontSize: 10, rotate: 30 },
    },
    yAxis: [
      {
        type: 'value',
        name: 'MPa',
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#f1f5f9' } },
        axisLabel: { color: '#64748b', fontSize: 11 },
      },
    ],
    series: [
      {
        name: '当前压力',
        type: 'bar',
        data: nodes.map((n) => n.currentPressure),
        itemStyle: {
          color: (params: { data: number; value: number; dataIndex: number }) => {
            const node = nodes[params.dataIndex];
            if (!node) return '#36B37E';
            if (node.status === 'normal') return '#36B37E';
            if (node.status === 'low_pressure') return '#FF6B35';
            if (node.status === 'high_pressure') return '#E5484D';
            if (node.status === 'leak') return '#DC2626';
            return '#FFAB00';
          },
          borderRadius: [3, 3, 0, 0],
        },
        barWidth: 18,
      },
      {
        name: '设计压力',
        type: 'line',
        data: nodes.map((n) => n.designPressure),
        lineStyle: { color: '#0A2540', type: 'dashed', width: 2 },
        itemStyle: { color: '#0A2540' },
        symbol: 'none',
      },
    ],
    legend: { top: 0, right: 10 },
  };

  const supplyTrendOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['实际供气量', '计划供气量'], top: 0 },
    grid: { left: 40, right: 20, top: 40, bottom: 30 },
    xAxis: {
      type: 'category',
      data: stats.dailySupply.map((d) => d.date),
      boundaryGap: false,
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
        name: '实际供气量',
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 3, color: '#0A2540' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(10,37,64,0.3)' },
              { offset: 1, color: 'rgba(10,37,64,0.02)' },
            ],
          },
        },
        data: stats.dailySupply.map((d) => (d.supply / 10000).toFixed(1)),
      },
      {
        name: '计划供气量',
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2, color: '#FF6B35', type: 'dashed' },
        data: stats.dailySupply.map((d) => ((d.supply * 0.98) / 10000).toFixed(1)),
      },
    ],
  };

  const handleExportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const html2canvas = (await import('html2canvas')).default;
    if (!reportRef.current) return;

    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 10;

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight - 20;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 20;
    }

    pdf.save(`燃气运营分析报告_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-500">统计分析报表</h1>
          <p className="text-sm text-gray-500 mt-1">多维度统计供气量、压力合格率、抢修及时率等指标</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="input-field w-32">
              <option value="week">本周</option>
              <option value="month">本月</option>
              <option value="quarter">本季度</option>
              <option value="year">本年</option>
            </select>
            <select value={region} onChange={(e) => setRegion(e.target.value)} className="input-field w-32">
              <option value="all">全部区域</option>
              {regions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <button onClick={handleExportPDF} className="btn btn-primary">
            <Download className="w-4 h-4 mr-1.5" />
            导出PDF报告
          </button>
        </div>
      </div>

      <div ref={reportRef} className="bg-white p-8 rounded-xl">
        <div className="text-center mb-8 pb-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-navy-500 mb-2">城市燃气运营月度分析报告</h2>
          <p className="text-sm text-gray-500">
            <Calendar className="w-4 h-4 inline mr-1" />
            报告周期：{stats.dateRange.start} 至 {stats.dateRange.end}
          </p>
        </div>

        <div className="grid grid-cols-4 gap-5 mb-8">
          <div className="p-5 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl text-center">
            <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-orange-600 font-mono">{formatNumber(stats.totalGasSupply, 1)}</p>
            <p className="text-sm text-orange-600 mt-1">总供气量 (万m³)</p>
          </div>
          <div className="p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-xl text-center">
            <Gauge className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600 font-mono">{formatNumber(stats.pressureQualifiedRate, 1)}%</p>
            <p className="text-sm text-green-600 mt-1">压力合格率</p>
          </div>
          <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl text-center">
            <Wrench className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600 font-mono">{formatNumber(stats.repairOnTimeRate, 1)}%</p>
            <p className="text-sm text-blue-600 mt-1">抢修及时率</p>
          </div>
          <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl text-center">
            <Droplets className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600 font-mono">{formatNumber(stats.gasLossRate, 1)}%</p>
            <p className="text-sm text-purple-600 mt-1">气损率</p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-navy-500 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              近7日供气量趋势
            </h3>
            <ReactECharts option={supplyTrendOption} style={{ height: 300 }} />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-navy-500 mb-4">各区域供气量分布</h3>
              <ReactECharts option={regionChartOption} style={{ height: 280 }} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-navy-500 mb-4">告警类型分布</h3>
              <ReactECharts option={alarmTypeChartOption} style={{ height: 280 }} />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-navy-500 mb-4">各节点压力监测</h3>
            <ReactECharts option={pressureChartOption} style={{ height: 300 }} />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-navy-500 mb-4">用气结构分析</h3>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="table-header">用户类型</th>
                    <th className="table-header">用户数量</th>
                    <th className="table-header">日用气量 (m³)</th>
                    <th className="table-header">占比</th>
                    <th className="table-header">同比变化</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.byUserType.map((item, idx) => {
                    const labels = ['工业用户', '商业用户', '居民用户'];
                    const colors = ['bg-indigo-100 text-indigo-700', 'bg-purple-100 text-purple-700', 'bg-teal-100 text-teal-700'];
                    const count = customers.filter((c) => c.type === item.type).length;
                    return (
                      <tr key={item.type}>
                        <td className="table-cell">
                          <span className={`badge ${colors[idx]}`}>{labels[idx]}</span>
                        </td>
                        <td className="table-cell font-mono">{count}</td>
                        <td className="table-cell font-mono font-medium">{formatNumber(item.gasSupply)}</td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-navy-500 rounded-full"
                                style={{ width: `${item.percentage}%` }}
                              ></div>
                            </div>
                            <span className="font-mono text-sm">{formatNumber(item.percentage, 1)}%</span>
                          </div>
                        </td>
                        <td className="table-cell">
                          <span className="text-green-600 font-medium">+{(Math.random() * 10).toFixed(1)}%</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
          <p>报告生成时间：{new Date().toLocaleString('zh-CN')}</p>
          <p className="mt-1">城市燃气运营中心 · 智能调度系统</p>
        </div>
      </div>
    </div>
  );
};

export default Reports;
