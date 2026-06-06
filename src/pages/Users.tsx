import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Plus, Search, Edit2, Trash2, Users as UsersIcon, Building, Factory, Home, Filter } from 'lucide-react';
import { useAppStore } from '@/store';
import type { Customer, CustomerType } from '@/types';
import { generateId, formatNumber, getCustomerTypeColor, getCustomerTypeLabel } from '@/utils';

const initialCustomer: Customer = {
  id: '',
  name: '',
  type: 'residential',
  region: '',
  address: '',
  dailyGasUsage: 0,
  monthlyUsage: [],
  usageRatio: 0,
  contact: '',
  phone: '',
  registerDate: '',
  status: 'active',
};

const Users = () => {
  const customers = useAppStore((s) => s.customers);
  const addCustomer = useAppStore((s) => s.addCustomer);
  const updateCustomer = useAppStore((s) => s.updateCustomer);
  const deleteCustomer = useAppStore((s) => s.deleteCustomer);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<CustomerType | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<Customer>(initialCustomer);

  const filteredCustomers = customers.filter((c) => {
    const matchSearch = c.name.includes(search) || c.address.includes(search) || c.contact.includes(search);
    const matchType = typeFilter === 'all' || c.type === typeFilter;
    return matchSearch && matchType;
  });

  const openAddModal = () => {
    setEditing(null);
    setFormData({ ...initialCustomer, registerDate: new Date().toISOString().split('T')[0] });
    setShowModal(true);
  };

  const openEditModal = (customer: Customer) => {
    setEditing(customer);
    setFormData(customer);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalUsage = customers.reduce((sum, c) => sum + c.dailyGasUsage, 0) + (editing ? -editing.dailyGasUsage : 0) + formData.dailyGasUsage;
    const ratio = totalUsage > 0 ? (formData.dailyGasUsage / totalUsage) * 100 : 0;
    const data = { ...formData, usageRatio: Number(ratio.toFixed(2)) };
    if (editing) {
      updateCustomer(editing.id, data);
    } else {
      addCustomer({ ...data, id: generateId('c') });
    }
    setShowModal(false);
  };

  const usageByType = [
    { type: 'industrial', name: '工业用户', color: '#0A2540' },
    { type: 'commercial', name: '商业用户', color: '#FF6B35' },
    { type: 'residential', name: '居民用户', color: '#36B37E' },
  ].map((t) => ({
    ...t,
    count: customers.filter((c) => c.type === t.type).length,
    usage: customers.filter((c) => c.type === t.type).reduce((sum, c) => sum + c.dailyGasUsage, 0),
  }));

  const monthlyChartOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: usageByType.map((t) => t.name), top: 0 },
    grid: { left: 40, right: 20, top: 40, bottom: 30 },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
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
    series: usageByType.map((t) => ({
      name: t.name,
      type: 'line',
      smooth: true,
      itemStyle: { color: t.color },
      areaStyle: { opacity: 0.1 },
      data: [0, 1, 2, 3, 4, 5].map((i) => {
        const total = customers
          .filter((c) => c.type === t.type)
          .reduce((sum, c) => sum + (c.monthlyUsage[i] || 0), 0);
        return (total / 10000).toFixed(1);
      }),
    })),
  };

  const getTypeIcon = (type: CustomerType) => {
    if (type === 'industrial') return Factory;
    if (type === 'commercial') return Building;
    return Home;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-500">用户信息管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理工业、商业、居民用户信息及用气数据</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <Plus className="w-4 h-4 mr-1.5" />
          新增用户
        </button>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {usageByType.map((t) => {
          const Icon = t.type === 'industrial' ? Factory : t.type === 'commercial' ? Building : Home;
          return (
            <div key={t.type} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg" style={{ backgroundColor: t.color + '15' }}>
                      <Icon className="w-5 h-5 m-2.5" style={{ color: t.color }} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t.name}</p>
                      <p className="text-2xl font-bold font-mono mt-0.5" style={{ color: t.color }}>
                        {t.count}<span className="text-xs font-normal text-gray-500 ml-1">户</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">日用气量</p>
                  <p className="text-lg font-bold text-gray-800 font-mono mt-0.5">
                    {formatNumber(t.usage / 10000, 1)}<span className="text-xs font-normal text-gray-500 ml-1">万m³</span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-5 card">
          <div className="card-header">
            <h2 className="card-title">各类型月度用气趋势</h2>
          </div>
          <div className="p-3">
            <ReactECharts option={monthlyChartOption} style={{ height: 300 }} />
          </div>
        </div>

        <div className="col-span-7 card">
          <div className="card-header flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="搜索用户名称/地址..." value={search}
                  onChange={(e) => setSearch(e.target.value)} className="input-field pl-9" />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as CustomerType | 'all')}
                  className="input-field w-32">
                  <option value="all">全部类型</option>
                  <option value="industrial">工业</option>
                  <option value="commercial">商业</option>
                  <option value="residential">居民</option>
                </select>
              </div>
            </div>
            <span className="text-sm text-gray-500">
              共 <span className="font-semibold text-navy-500">{filteredCustomers.length}</span> 个用户
            </span>
          </div>
          <div className="overflow-x-auto max-h-[340px] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="table-header">用户名称</th>
                  <th className="table-header">类型</th>
                  <th className="table-header">区域</th>
                  <th className="table-header">日用气量</th>
                  <th className="table-header">占比</th>
                  <th className="table-header">联系人</th>
                  <th className="table-header">状态</th>
                  <th className="table-header">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map((customer) => {
                  const Icon = getTypeIcon(customer.type);
                  return (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                            <Icon className="w-4 h-4 text-gray-500" />
                          </div>
                          <span className="font-medium text-gray-800">{customer.name}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className={`badge ${getCustomerTypeColor(customer.type)}`}>
                          {getCustomerTypeLabel(customer.type)}
                        </span>
                      </td>
                      <td className="table-cell text-gray-600">{customer.region}</td>
                      <td className="table-cell font-mono text-navy-500 font-medium">
                        {formatNumber(customer.dailyGasUsage)} m³
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-navy-500 rounded-full"
                              style={{ width: `${Math.min(100, customer.usageRatio * 3)}%` }}></div>
                          </div>
                          <span className="text-xs font-mono text-gray-500">{customer.usageRatio}%</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div>
                          <p className="text-sm text-gray-800">{customer.contact}</p>
                          <p className="text-xs text-gray-500">{customer.phone}</p>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className={`badge ${customer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          <span className={`status-dot ${customer.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                          {customer.status === 'active' ? '正常' : '停用'}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEditModal(customer)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => { if (confirm('确定删除该用户？')) deleteCustomer(customer.id); }}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
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
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-card-hover">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-navy-500">{editing ? '编辑用户信息' : '新增用户'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">用户名称 <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field" />
                </div>
                <div>
                  <label className="label-field">用户类型</label>
                  <select value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as CustomerType })}
                    className="input-field">
                    <option value="industrial">工业用户</option>
                    <option value="commercial">商业用户</option>
                    <option value="residential">居民用户</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">所属区域</label>
                  <select value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="input-field">
                    <option value="">请选择区域</option>
                    <option value="东城区">东城区</option>
                    <option value="西城区">西城区</option>
                    <option value="南城区">南城区</option>
                    <option value="北城区">北城区</option>
                    <option value="市中心">市中心</option>
                  </select>
                </div>
                <div>
                  <label className="label-field">详细地址</label>
                  <input type="text" value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">日用气量 (m³)</label>
                  <input type="number" value={formData.dailyGasUsage}
                    onChange={(e) => setFormData({ ...formData, dailyGasUsage: Number(e.target.value) })}
                    className="input-field" />
                </div>
                <div>
                  <label className="label-field">账户状态</label>
                  <select value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'suspended' })}
                    className="input-field">
                    <option value="active">正常供气</option>
                    <option value="suspended">暂停供气</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">联系人</label>
                  <input type="text" value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="input-field" />
                </div>
                <div>
                  <label className="label-field">联系电话</label>
                  <input type="tel" value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field" />
                </div>
              </div>
              <div>
                <label className="label-field">开户日期</label>
                <input type="date" value={formData.registerDate}
                  onChange={(e) => setFormData({ ...formData, registerDate: e.target.value })}
                  className="input-field" />
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

export default Users;
