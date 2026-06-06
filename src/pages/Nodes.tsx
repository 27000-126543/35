import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Filter, Network } from 'lucide-react';
import { useAppStore } from '@/store';
import type { PipelineNode, NodeType, NodeStatus } from '@/types';
import {
  generateId,
  getNodeStatusColor,
  getNodeStatusLabel,
  getNodeStatusDotColor,
  getNodeTypeLabel,
  formatNumber,
} from '@/utils';

const initialNode: PipelineNode = {
  id: '',
  name: '',
  type: 'regulator',
  address: '',
  longitude: 116.4,
  latitude: 39.9,
  pipeDiameter: 300,
  designPressure: 1.6,
  currentPressure: 1.5,
  minPressure: 1.0,
  maxPressure: 2.0,
  connectedNodes: [],
  status: 'normal',
  lastUpdate: '',
};

const Nodes = () => {
  const nodes = useAppStore((s) => s.nodes);
  const addNode = useAppStore((s) => s.addNode);
  const updateNode = useAppStore((s) => s.updateNode);
  const deleteNode = useAppStore((s) => s.deleteNode);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<NodeType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<NodeStatus | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<PipelineNode | null>(null);
  const [formData, setFormData] = useState<PipelineNode>(initialNode);

  const filteredNodes = nodes.filter((n) => {
    const matchSearch = n.name.includes(search) || n.address.includes(search);
    const matchType = typeFilter === 'all' || n.type === typeFilter;
    const matchStatus = statusFilter === 'all' || n.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const openAddModal = () => {
    setEditing(null);
    setFormData({ ...initialNode, lastUpdate: new Date().toISOString().replace('T', ' ').slice(0, 19) });
    setShowModal(true);
  };

  const openEditModal = (node: PipelineNode) => {
    setEditing(node);
    setFormData(node);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateNode(editing.id, formData);
    } else {
      addNode({ ...formData, id: generateId('n') });
    }
    setShowModal(false);
  };

  const stats = {
    total: nodes.length,
    normal: nodes.filter((n) => n.status === 'normal').length,
    abnormal: nodes.filter((n) => n.status !== 'normal' && n.status !== 'offline').length,
    offline: nodes.filter((n) => n.status === 'offline').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-500">管网节点管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理调压站、阀门、管网节点信息</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <Plus className="w-4 h-4 mr-1.5" />
          新增节点
        </button>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">节点总数</p>
              <p className="text-2xl font-bold text-navy-500 font-mono mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center">
              <Network className="w-6 h-6 text-navy-500" />
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">正常运行</p>
              <p className="text-2xl font-bold text-green-600 font-mono mt-1">{stats.normal}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
              <span className="w-4 h-4 rounded-full bg-green-500"></span>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">异常状态</p>
              <p className="text-2xl font-bold text-orange-600 font-mono mt-1">{stats.abnormal}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
              <span className="w-4 h-4 rounded-full bg-orange-500 animate-pulse"></span>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">离线/停用</p>
              <p className="text-2xl font-bold text-gray-400 font-mono mt-1">{stats.offline}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
              <span className="w-4 h-4 rounded-full bg-gray-400"></span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索节点..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as NodeType | 'all')}
                className="input-field w-32"
              >
                <option value="all">全部类型</option>
                <option value="regulator">调压站</option>
                <option value="valve">阀门</option>
                <option value="junction">节点</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as NodeStatus | 'all')}
                className="input-field w-32"
              >
                <option value="all">全部状态</option>
                <option value="normal">正常</option>
                <option value="low_pressure">压力偏低</option>
                <option value="high_pressure">压力偏高</option>
                <option value="leak">泄漏</option>
                <option value="repair">抢修中</option>
              </select>
            </div>
          </div>
          <span className="text-sm text-gray-500">
            共 <span className="font-semibold text-navy-500">{filteredNodes.length}</span> 个节点
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">节点名称</th>
                <th className="table-header">类型</th>
                <th className="table-header">位置</th>
                <th className="table-header">管径</th>
                <th className="table-header">设计压力</th>
                <th className="table-header">当前压力</th>
                <th className="table-header">状态</th>
                <th className="table-header">最后更新</th>
                <th className="table-header">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredNodes.map((node) => (
                <tr key={node.id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium text-gray-800">{node.name}</td>
                  <td className="table-cell">
                    <span className="badge bg-blue-50 text-blue-700">
                      {getNodeTypeLabel(node.type)}
                    </span>
                  </td>
                  <td className="table-cell text-gray-600 max-w-[180px] truncate">{node.address}</td>
                  <td className="table-cell font-mono">DN{node.pipeDiameter}</td>
                  <td className="table-cell font-mono text-gray-600">{node.designPressure} MPa</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-semibold ${
                        node.status === 'low_pressure' ? 'text-orange-600' :
                        node.status === 'high_pressure' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {formatNumber(node.currentPressure)} MPa
                      </span>
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            node.status === 'normal' ? 'bg-green-500' :
                            node.status === 'low_pressure' ? 'bg-orange-500' :
                            node.status === 'high_pressure' ? 'bg-red-500' : 'bg-gray-400'
                          }`}
                          style={{
                            width: `${Math.min(100, ((node.currentPressure - node.minPressure) / (node.maxPressure - node.minPressure)) * 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${getNodeStatusColor(node.status)}`}>
                      <span className={`status-dot ${getNodeStatusDotColor(node.status)}`}></span>
                      {getNodeStatusLabel(node.status)}
                    </span>
                  </td>
                  <td className="table-cell text-gray-500 text-xs">{node.lastUpdate}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(node)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('确定删除该节点？')) deleteNode(node.id);
                        }}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-card-hover">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-navy-500">
                {editing ? '编辑节点信息' : '新增管网节点'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">节点名称 <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field" />
                </div>
                <div>
                  <label className="label-field">节点类型</label>
                  <select value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as NodeType })}
                    className="input-field">
                    <option value="regulator">调压站</option>
                    <option value="valve">阀门</option>
                    <option value="junction">管网节点</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label-field">地址</label>
                <input type="text" value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">经度</label>
                  <input type="number" step="0.0001" value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
                    className="input-field" />
                </div>
                <div>
                  <label className="label-field">纬度</label>
                  <input type="number" step="0.0001" value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
                    className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">管径 (mm)</label>
                  <input type="number" value={formData.pipeDiameter}
                    onChange={(e) => setFormData({ ...formData, pipeDiameter: Number(e.target.value) })}
                    className="input-field" />
                </div>
                <div>
                  <label className="label-field">设计压力 (MPa)</label>
                  <input type="number" step="0.1" value={formData.designPressure}
                    onChange={(e) => setFormData({ ...formData, designPressure: Number(e.target.value) })}
                    className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label-field">当前压力 (MPa)</label>
                  <input type="number" step="0.01" value={formData.currentPressure}
                    onChange={(e) => setFormData({ ...formData, currentPressure: Number(e.target.value) })}
                    className="input-field" />
                </div>
                <div>
                  <label className="label-field">最低压力 (MPa)</label>
                  <input type="number" step="0.1" value={formData.minPressure}
                    onChange={(e) => setFormData({ ...formData, minPressure: Number(e.target.value) })}
                    className="input-field" />
                </div>
                <div>
                  <label className="label-field">最高压力 (MPa)</label>
                  <input type="number" step="0.1" value={formData.maxPressure}
                    onChange={(e) => setFormData({ ...formData, maxPressure: Number(e.target.value) })}
                    className="input-field" />
                </div>
              </div>
              <div>
                <label className="label-field">运行状态</label>
                <select value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as NodeStatus })}
                  className="input-field">
                  <option value="normal">正常</option>
                  <option value="low_pressure">压力偏低</option>
                  <option value="high_pressure">压力偏高</option>
                  <option value="leak">泄漏</option>
                  <option value="repair">抢修中</option>
                  <option value="offline">离线</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">取消</button>
                <button type="submit" className="btn btn-primary">{editing ? '保存修改' : '确认添加'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Nodes;
