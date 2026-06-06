import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, MapPin, Thermometer, Gauge, Droplets } from 'lucide-react';
import { useAppStore } from '@/store';
import type { GasStation } from '@/types';
import { generateId, formatNumber } from '@/utils';

const initialStation: GasStation = {
  id: '',
  name: '',
  address: '',
  longitude: 116.4,
  latitude: 39.9,
  supplyCapacity: 0,
  currentOutput: 0,
  gasQuality: {
    methane: 0,
    calorificValue: 0,
    sulfurContent: 0,
    pressure: 0,
  },
  status: 'normal',
  operator: '',
  lastInspection: '',
};

const Stations = () => {
  const stations = useAppStore((s) => s.stations);
  const addStation = useAppStore((s) => s.addStation);
  const updateStation = useAppStore((s) => s.updateStation);
  const deleteStation = useAppStore((s) => s.deleteStation);

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<GasStation | null>(null);
  const [viewing, setViewing] = useState<GasStation | null>(null);
  const [formData, setFormData] = useState<GasStation>(initialStation);

  const filteredStations = stations.filter(
    (s) => s.name.includes(search) || s.address.includes(search)
  );

  const openAddModal = () => {
    setEditing(null);
    setFormData({ ...initialStation, lastInspection: new Date().toISOString().split('T')[0] });
    setShowModal(true);
  };

  const openEditModal = (station: GasStation) => {
    setEditing(station);
    setFormData(station);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateStation(editing.id, formData);
    } else {
      addStation({ ...formData, id: generateId('st') });
    }
    setShowModal(false);
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, { label: string; color: string }> = {
      normal: { label: '正常运行', color: 'bg-green-100 text-green-700' },
      maintenance: { label: '维护中', color: 'bg-orange-100 text-orange-700' },
      offline: { label: '离线', color: 'bg-gray-100 text-gray-600' },
    };
    return map[status] || map.normal;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-500">气源门站管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理各气源门站基础信息及运行状态</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <Plus className="w-4 h-4 mr-1.5" />
          新增门站
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索门站名称或地址..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            共 <span className="font-semibold text-navy-500">{filteredStations.length}</span> 个门站
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">门站名称</th>
                <th className="table-header">地址</th>
                <th className="table-header">供气能力</th>
                <th className="table-header">当前输出</th>
                <th className="table-header">进站压力</th>
                <th className="table-header">运行状态</th>
                <th className="table-header">最后巡检</th>
                <th className="table-header">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStations.map((station) => {
                const status = getStatusLabel(station.status);
                return (
                  <tr key={station.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-orange-500" />
                        </div>
                        <span className="font-medium text-gray-800">{station.name}</span>
                      </div>
                    </td>
                    <td className="table-cell text-gray-600 max-w-[200px] truncate">{station.address}</td>
                    <td className="table-cell font-mono">{station.supplyCapacity} 万m³/日</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-navy-500 font-medium">{station.currentOutput}</span>
                        <span className="text-xs text-gray-400">万m³/日</span>
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                            style={{ width: `${(station.currentOutput / station.supplyCapacity) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell font-mono">{formatNumber(station.gasQuality.pressure)} MPa</td>
                    <td className="table-cell">
                      <span className={`badge ${status.color}`}>
                        <span className={`status-dot ${station.status === 'normal' ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                        {status.label}
                      </span>
                    </td>
                    <td className="table-cell text-gray-500">{station.lastInspection}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewing(station)}
                          className="p-1.5 text-gray-500 hover:text-navy-500 hover:bg-navy-50 rounded transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(station)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('确定删除该门站？')) deleteStation(station.id);
                          }}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-card-hover">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-navy-500">
                {editing ? '编辑门站信息' : '新增气源门站'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">门站名称 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-field">运行状态</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as GasStation['status'] })}
                    className="input-field"
                  >
                    <option value="normal">正常运行</option>
                    <option value="maintenance">维护中</option>
                    <option value="offline">离线</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label-field">详细地址</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">经度</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-field">纬度</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">供气能力 (万m³/日)</label>
                  <input
                    type="number"
                    value={formData.supplyCapacity}
                    onChange={(e) => setFormData({ ...formData, supplyCapacity: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-field">当前输出 (万m³/日)</label>
                  <input
                    type="number"
                    value={formData.currentOutput}
                    onChange={(e) => setFormData({ ...formData, currentOutput: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Thermometer className="w-4 h-4" />
                  气质参数
                </h4>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="label-field">甲烷含量 (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.gasQuality.methane}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gasQuality: { ...formData.gasQuality, methane: Number(e.target.value) },
                        })
                      }
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label-field">热值 (MJ/m³)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.gasQuality.calorificValue}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gasQuality: { ...formData.gasQuality, calorificValue: Number(e.target.value) },
                        })
                      }
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label-field">含硫量 (mg/m³)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.gasQuality.sulfurContent}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gasQuality: { ...formData.gasQuality, sulfurContent: Number(e.target.value) },
                        })
                      }
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label-field">进站压力 (MPa)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.gasQuality.pressure}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gasQuality: { ...formData.gasQuality, pressure: Number(e.target.value) },
                        })
                      }
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">运行值班员</label>
                  <input
                    type="text"
                    value={formData.operator}
                    onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-field">最后巡检日期</label>
                  <input
                    type="date"
                    value={formData.lastInspection}
                    onChange={(e) => setFormData({ ...formData, lastInspection: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  取消
                </button>
                <button type="submit" className="btn btn-primary">
                  {editing ? '保存修改' : '确认添加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-card-hover">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-navy-500">门站详情 - {viewing.name}</h3>
              <button onClick={() => setViewing(null)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-500 mb-1">地址</p>
                  <p className="text-sm font-medium text-gray-800">{viewing.address}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">状态</p>
                  <span className={`badge ${getStatusLabel(viewing.status).color}`}>
                    {getStatusLabel(viewing.status).label}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">坐标</p>
                  <p className="text-sm font-mono text-gray-800">
                    {viewing.longitude.toFixed(4)}, {viewing.latitude.toFixed(4)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">运行值班员</p>
                  <p className="text-sm font-medium text-gray-800">{viewing.operator}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">供气能力</p>
                  <p className="text-lg font-bold text-navy-500 font-mono mt-1">{viewing.supplyCapacity}<span className="text-xs font-normal text-gray-500 ml-1">万m³/日</span></p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">当前输出</p>
                  <p className="text-lg font-bold text-green-600 font-mono mt-1">{viewing.currentOutput}<span className="text-xs font-normal text-gray-500 ml-1">万m³/日</span></p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">负荷率</p>
                  <p className="text-lg font-bold text-orange-500 font-mono mt-1">
                    {((viewing.currentOutput / viewing.supplyCapacity) * 100).toFixed(1)}<span className="text-xs font-normal text-gray-500 ml-1">%</span>
                  </p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Droplets className="w-4 h-4" />
                  气质参数
                </h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                    <p className="text-xs text-blue-600">甲烷</p>
                    <p className="text-lg font-bold text-blue-700 font-mono">{viewing.gasQuality.methane}<span className="text-xs">%</span></p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                    <p className="text-xs text-orange-600">热值</p>
                    <p className="text-lg font-bold text-orange-700 font-mono">{viewing.gasQuality.calorificValue}<span className="text-xs">MJ/m³</span></p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                    <p className="text-xs text-purple-600">含硫量</p>
                    <p className="text-lg font-bold text-purple-700 font-mono">{viewing.gasQuality.sulfurContent}<span className="text-xs">mg/m³</span></p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                    <p className="text-xs text-green-600">压力</p>
                    <p className="text-lg font-bold text-green-700 font-mono">{viewing.gasQuality.pressure}<span className="text-xs">MPa</span></p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button onClick={() => setViewing(null)} className="btn btn-secondary">
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stations;
