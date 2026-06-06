import { useState } from 'react';
import {
  Wrench,
  Search,
  User,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  Send,
  Plus,
  MessageSquare,
  Star,
  Filter,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { RepairTicket, RepairTicketStatus, CustomerType } from '@/types';
import {
  getRepairTicketStatusColor,
  getRepairTicketStatusLabel,
  getCustomerTypeColor,
  getCustomerTypeLabel,
  generateId,
} from '@/utils';

const Repair = () => {
  const tickets = useAppStore((s) => s.repairTickets);
  const workers = useAppStore((s) => s.maintenanceWorkers);
  const addTicket = useAppStore((s) => s.addRepairTicket);
  const assignTicket = useAppStore((s) => s.assignRepairTicket);
  const completeTicket = useAppStore((s) => s.completeRepairTicket);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RepairTicketStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<CustomerType | 'all'>('all');
  const [showNewModal, setShowNewModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<RepairTicket | null>(null);
  const [newTicket, setNewTicket] = useState({
    userName: '',
    userPhone: '',
    userAddress: '',
    region: '',
    description: '',
    userType: 'residential' as CustomerType,
  });
  const [completeResult, setCompleteResult] = useState('');

  const filteredTickets = tickets.filter((t) => {
    const matchSearch =
      t.userName.includes(search) ||
      t.userAddress.includes(search) ||
      t.description.includes(search) ||
      (t.workerName && t.workerName.includes(search));
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchType = typeFilter === 'all' || t.userType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const ticket: RepairTicket = {
      id: generateId('rtk'),
      userId: generateId('u'),
      ...newTicket,
      status: 'pending',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    addTicket(ticket);
    setShowNewModal(false);
    setNewTicket({ userName: '', userPhone: '', userAddress: '', region: '', description: '', userType: 'residential' });
  };

  const handleAssign = (workerId: string) => {
    if (!selectedTicket) return;
    const worker = workers.find((w) => w.id === workerId);
    if (!worker) return;
    assignTicket(selectedTicket.id, worker.id, worker.name, worker.contact);
    setShowAssignModal(false);
    setSelectedTicket(null);
  };

  const handleComplete = () => {
    if (!selectedTicket || !completeResult) return;
    completeTicket(selectedTicket.id, completeResult);
    setShowCompleteModal(false);
    setSelectedTicket(null);
    setCompleteResult('');
  };

  const stats = {
    total: tickets.length,
    pending: tickets.filter((t) => t.status === 'pending').length,
    inProgress: tickets.filter((t) => t.status === 'assigned' || t.status === 'in_progress').length,
    completed: tickets.filter((t) => t.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-500">用户报修服务</h1>
          <p className="text-sm text-gray-500 mt-1">用户报修工单管理、自动派单、维修进度跟踪</p>
        </div>
        <button onClick={() => setShowNewModal(true)} className="btn btn-primary">
          <Plus className="w-4 h-4 mr-1.5" />
          录入报修
        </button>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">工单总数</p>
              <p className="text-2xl font-bold text-navy-500 font-mono mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-navy-500" />
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">待派单</p>
              <p className="text-2xl font-bold text-red-600 font-mono mt-1">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">处理中</p>
              <p className="text-2xl font-bold text-orange-600 font-mono mt-1">{stats.inProgress}</p>
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
      </div>

      <div className="card">
        <div className="card-header flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-1 flex-wrap">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索报修人/地址/内容..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as CustomerType | 'all')}
                className="input-field w-28"
              >
                <option value="all">全部类型</option>
                <option value="industrial">工业</option>
                <option value="commercial">商业</option>
                <option value="residential">居民</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as RepairTicketStatus | 'all')}
                className="input-field w-32"
              >
                <option value="all">全部状态</option>
                <option value="pending">待派单</option>
                <option value="assigned">已派单</option>
                <option value="in_progress">处理中</option>
                <option value="completed">已完成</option>
              </select>
            </div>
          </div>
          <span className="text-sm text-gray-500">
            共 <span className="font-semibold text-navy-500">{filteredTickets.length}</span> 条工单
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">工单号</th>
                <th className="table-header">报修人</th>
                <th className="table-header">类型</th>
                <th className="table-header">联系电话</th>
                <th className="table-header">地址</th>
                <th className="table-header">报修内容</th>
                <th className="table-header">维修人员</th>
                <th className="table-header">状态</th>
                <th className="table-header">报修时间</th>
                <th className="table-header">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="table-cell font-mono text-navy-500 font-medium">{ticket.id}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{ticket.userName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${getCustomerTypeColor(ticket.userType)}`}>
                      {getCustomerTypeLabel(ticket.userType)}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {ticket.userPhone}
                    </div>
                  </td>
                  <td className="table-cell max-w-[180px]">
                    <div className="flex items-start gap-1 text-sm text-gray-600">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="truncate">{ticket.userAddress}</span>
                    </div>
                  </td>
                  <td className="table-cell max-w-[200px] text-gray-600 truncate">{ticket.description}</td>
                  <td className="table-cell">
                    {ticket.workerName ? (
                      <div>
                        <p className="text-sm text-gray-800">{ticket.workerName}</p>
                        <p className="text-xs text-gray-400">{ticket.workerPhone}</p>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">未派单</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${getRepairTicketStatusColor(ticket.status)}`}>
                      {getRepairTicketStatusLabel(ticket.status)}
                    </span>
                  </td>
                  <td className="table-cell text-gray-500 text-xs">{ticket.createdAt.slice(5, 16)}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      {ticket.status === 'pending' && (
                        <button
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setShowAssignModal(true);
                          }}
                          className="btn btn-primary text-xs py-1 px-2.5"
                        >
                          <Send className="w-3 h-3 mr-0.5" />
                          派单
                        </button>
                      )}
                      {(ticket.status === 'assigned' || ticket.status === 'in_progress') && (
                        <button
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setShowCompleteModal(true);
                          }}
                          className="btn btn-success text-xs py-1 px-2.5"
                        >
                          <CheckCircle className="w-3 h-3 mr-0.5" />
                          完成
                        </button>
                      )}
                      {ticket.status === 'completed' && ticket.userRating && (
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < (ticket.userRating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl w-full max-w-xl shadow-card-hover">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-navy-500">录入报修工单</h3>
            </div>
            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">报修人 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={newTicket.userName}
                    onChange={(e) => setNewTicket({ ...newTicket, userName: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-field">联系电话 <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    required
                    value={newTicket.userPhone}
                    onChange={(e) => setNewTicket({ ...newTicket, userPhone: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">用户类型</label>
                  <select
                    value={newTicket.userType}
                    onChange={(e) => setNewTicket({ ...newTicket, userType: e.target.value as CustomerType })}
                    className="input-field"
                  >
                    <option value="industrial">工业用户</option>
                    <option value="commercial">商业用户</option>
                    <option value="residential">居民用户</option>
                  </select>
                </div>
                <div>
                  <label className="label-field">所属区域</label>
                  <select
                    value={newTicket.region}
                    onChange={(e) => setNewTicket({ ...newTicket, region: e.target.value })}
                    className="input-field"
                  >
                    <option value="">请选择</option>
                    <option value="东城区">东城区</option>
                    <option value="西城区">西城区</option>
                    <option value="南城区">南城区</option>
                    <option value="北城区">北城区</option>
                    <option value="市中心">市中心</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label-field">详细地址 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={newTicket.userAddress}
                  onChange={(e) => setNewTicket({ ...newTicket, userAddress: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-field">故障描述 <span className="text-red-500">*</span></label>
                <textarea
                  rows={3}
                  required
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="input-field resize-none"
                  placeholder="请描述故障情况..."
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowNewModal(false)} className="btn btn-secondary">
                  取消
                </button>
                <button type="submit" className="btn btn-primary">
                  提交工单
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAssignModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-card-hover">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-navy-500">分派维修人员</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-800">{selectedTicket.userName} - {selectedTicket.description}</p>
                <p className="text-xs text-gray-500 mt-1">{selectedTicket.region} · {selectedTicket.userAddress}</p>
              </div>
              <div>
                <label className="label-field">选择维修人员</label>
                <div className="space-y-2">
                  {workers
                    .filter((w) => w.region === selectedTicket.region || w.status === 'idle')
                    .map((worker) => (
                      <label
                        key={worker.id}
                        className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="worker"
                          value={worker.id}
                          className="mr-3 text-navy-500"
                        />
                        <div className="flex-1 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-800">{worker.name}</p>
                            <p className="text-xs text-gray-500">{worker.region} · {worker.contact}</p>
                          </div>
                          <span
                            className={`badge ${
                              worker.status === 'idle'
                                ? 'bg-green-100 text-green-700'
                                : worker.status === 'working'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {worker.status === 'idle' ? '空闲' : worker.status === 'working' ? '工作中' : '离线'}
                            {worker.currentTicketCount > 0 && ` · ${worker.currentTicketCount}单`}
                          </span>
                        </div>
                      </label>
                    ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => { setShowAssignModal(false); setSelectedTicket(null); }} className="btn btn-secondary">
                  取消
                </button>
                <button
                  onClick={() => {
                    const selected = document.querySelector('input[name="worker"]:checked') as HTMLInputElement;
                    if (selected) handleAssign(selected.value);
                  }}
                  className="btn btn-primary"
                >
                  确认派单
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCompleteModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-card-hover">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-navy-500">完成维修</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label-field">处理结果 <span className="text-red-500">*</span></label>
                <textarea
                  rows={4}
                  value={completeResult}
                  onChange={(e) => setCompleteResult(e.target.value)}
                  className="input-field resize-none"
                  placeholder="请填写维修处理结果详情..."
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => { setShowCompleteModal(false); setSelectedTicket(null); setCompleteResult(''); }} className="btn btn-secondary">
                  取消
                </button>
                <button
                  onClick={handleComplete}
                  disabled={!completeResult.trim()}
                  className="btn btn-success"
                >
                  确认完成
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Repair;
