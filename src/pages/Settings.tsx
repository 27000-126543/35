import { useState } from 'react';
import {
  Settings as SettingsIcon,
  Users,
  Shield,
  Bell,
  Database,
  Plus,
  Search,
  Edit2,
  Trash2,
  UserPlus,
  Save,
} from 'lucide-react';
import { useAppStore } from '@/store';
import type { UserRole } from '@/types';

const roleLabels: Record<UserRole, string> = {
  admin: '系统管理员',
  supervisor: '调度主管',
  dispatcher: '调度员',
  repair_team: '抢修班组',
  maintenance_worker: '维修人员',
  manager: '运营管理者',
};

const roleColors: Record<UserRole, string> = {
  admin: 'bg-red-100 text-red-700',
  supervisor: 'bg-purple-100 text-purple-700',
  dispatcher: 'bg-blue-100 text-blue-700',
  repair_team: 'bg-orange-100 text-orange-700',
  maintenance_worker: 'bg-green-100 text-green-700',
  manager: 'bg-indigo-100 text-indigo-700',
};

interface SystemUser {
  id: string;
  name: string;
  role: UserRole;
  department: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
}

const mockSystemUsers: SystemUser[] = [
  { id: 'u001', name: '张调度', role: 'dispatcher' as UserRole, department: '调度运营中心', phone: '13800000001', email: 'zhang@gas.com', status: 'active' },
  { id: 'u002', name: '李主管', role: 'supervisor' as UserRole, department: '调度运营中心', phone: '13800000002', email: 'li@gas.com', status: 'active' },
  { id: 'u003', name: '王工程师', role: 'admin' as UserRole, department: '信息技术部', phone: '13800000003', email: 'wang@gas.com', status: 'active' },
  { id: 'u004', name: '赵经理', role: 'manager' as UserRole, department: '运营管理部', phone: '13800000004', email: 'zhao@gas.com', status: 'active' },
  { id: 'u005', name: '钱班长', role: 'repair_team' as UserRole, department: '抢修中心', phone: '13800000005', email: 'qian@gas.com', status: 'active' },
  { id: 'u006', name: '孙维修', role: 'maintenance_worker' as UserRole, department: '客户服务部', phone: '13800000006', email: 'sun@gas.com', status: 'inactive' },
];

const Settings = () => {
  const currentUser = useAppStore((s) => s.currentUser);
  const [activeTab, setActiveTab] = useState<'users' | 'permissions' | 'alarm' | 'system'>('users');
  const [users, setUsers] = useState<SystemUser[]>(mockSystemUsers);
  const [search, setSearch] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [userForm, setUserForm] = useState<Partial<SystemUser>>({
    name: '',
    role: 'dispatcher',
    department: '',
    phone: '',
    email: '',
    status: 'active',
  });

  const filteredUsers = users.filter(
    (u) => u.name.includes(search) || u.department.includes(search) || u.phone.includes(search)
  );

  const tabs = [
    { id: 'users', label: '用户管理', icon: Users },
    { id: 'permissions', label: '角色权限', icon: Shield },
    { id: 'alarm', label: '告警规则', icon: Bell },
    { id: 'system', label: '系统参数', icon: Database },
  ];

  const handleOpenAdd = () => {
    setEditingUser(null);
    setUserForm({ name: '', role: 'dispatcher', department: '', phone: '', email: '', status: 'active' });
    setShowUserModal(true);
  };

  const handleOpenEdit = (user: SystemUser) => {
    setEditingUser(user);
    setUserForm(user);
    setShowUserModal(true);
  };

  const handleSaveUser = () => {
    if (!userForm.name) return;
    if (editingUser) {
      setUsers(users.map((u) => (u.id === editingUser.id ? { ...u, ...userForm } as SystemUser : u)));
    } else {
      setUsers([...users, { ...userForm, id: 'u' + Date.now() } as SystemUser]);
    }
    setShowUserModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-500">系统设置</h1>
          <p className="text-sm text-gray-500 mt-1">管理系统用户、角色权限及系统参数配置</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">当前用户：</span>
          <span className="text-sm font-medium text-navy-500">{currentUser.name}</span>
          <span className={`badge ${roleColors[currentUser.role]}`}>{roleLabels[currentUser.role]}</span>
        </div>
      </div>

      <div className="card">
        <div className="border-b border-gray-100 px-2">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? 'text-navy-500 border-navy-500'
                      : 'text-gray-500 border-transparent hover:text-navy-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索用户名/部门/电话..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input-field pl-9"
                  />
                </div>
                <button onClick={handleOpenAdd} className="btn btn-primary">
                  <UserPlus className="w-4 h-4 mr-1.5" />
                  新增用户
                </button>
              </div>

              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="table-header">用户姓名</th>
                      <th className="table-header">角色</th>
                      <th className="table-header">所属部门</th>
                      <th className="table-header">联系电话</th>
                      <th className="table-header">邮箱</th>
                      <th className="table-header">状态</th>
                      <th className="table-header">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="table-cell font-medium text-gray-800">{user.name}</td>
                        <td className="table-cell">
                          <span className={`badge ${roleColors[user.role]}`}>{roleLabels[user.role]}</span>
                        </td>
                        <td className="table-cell text-gray-600">{user.department}</td>
                        <td className="table-cell font-mono text-gray-600">{user.phone}</td>
                        <td className="table-cell text-gray-600">{user.email}</td>
                        <td className="table-cell">
                          <span
                            className={`badge ${
                              user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            <span
                              className={`status-dot ${user.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}
                            ></span>
                            {user.status === 'active' ? '启用' : '停用'}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(user)}
                              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('确定删除该用户？')) {
                                  setUsers(users.filter((u) => u.id !== user.id));
                                }
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
          )}

          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-navy-500">角色权限配置</h3>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="table-header">功能模块</th>
                      {(Object.keys(roleLabels) as UserRole[]).map((role) => (
                        <th key={role} className="table-header text-center">{roleLabels[role]}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { name: '数据看板', perms: [true, true, true, true, true, true] },
                      { name: '门站管理', perms: [true, true, true, false, false, true] },
                      { name: '管网节点', perms: [true, true, true, false, false, true] },
                      { name: '用户信息', perms: [true, true, true, false, false, true] },
                      { name: '调度方案', perms: [true, true, true, false, false, true] },
                      { name: '管网监控', perms: [true, true, true, true, false, true] },
                      { name: '应急抢修', perms: [true, true, true, true, false, true] },
                      { name: '用户报修', perms: [true, true, true, false, true, true] },
                      { name: '统计报表', perms: [true, true, true, false, false, true] },
                      { name: '系统设置', perms: [true, false, false, false, false, false] },
                    ].map((row) => (
                      <tr key={row.name} className="hover:bg-gray-50">
                        <td className="table-cell font-medium">{row.name}</td>
                        {row.perms.map((p, idx) => (
                          <td key={idx} className="table-cell text-center">
                            {p ? (
                              <span className="text-green-600 text-lg">✓</span>
                            ) : (
                              <span className="text-gray-300 text-lg">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'alarm' && (
            <div className="space-y-4 max-w-3xl">
              <h3 className="text-lg font-semibold text-navy-500">告警规则配置</h3>
              {[
                { name: '压力过低告警', desc: '当节点压力低于设定下限时触发告警', threshold: '低于设计压力的 75%', enabled: true },
                { name: '压力过高告警', desc: '当节点压力超过设定上限时触发告警', threshold: '高于设计压力的 125%', enabled: true },
                { name: '泄漏告警', desc: '气体浓度传感器检测到泄漏时触发', threshold: '浓度超过 20% LEL', enabled: true },
                { name: '设备故障告警', desc: '调压设备运行异常时触发', threshold: '设备自检异常', enabled: true },
                { name: '门站离线告警', desc: '门站数据超过 5 分钟未更新时触发', threshold: '数据断连 5 分钟', enabled: true },
              ].map((rule, idx) => (
                <div key={idx} className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{rule.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{rule.desc}</p>
                    <p className="text-xs text-navy-500 mt-1">触发阈值：{rule.threshold}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={rule.enabled} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-navy-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6 max-w-2xl">
              <h3 className="text-lg font-semibold text-navy-500">系统参数配置</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-field">系统名称</label>
                    <input type="text" defaultValue="城市燃气智能调度系统" className="input-field" />
                  </div>
                  <div>
                    <label className="label-field">运营企业</label>
                    <input type="text" defaultValue="城市燃气集团有限公司" className="input-field" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-field">调度方案自动生成时间</label>
                    <input type="time" defaultValue="06:00" className="input-field" />
                  </div>
                  <div>
                    <label className="label-field">数据采集间隔(秒)</label>
                    <input type="number" defaultValue={5} className="input-field" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-field">压力单位</label>
                    <select className="input-field" defaultValue="MPa">
                      <option>MPa</option>
                      <option>kPa</option>
                      <option>bar</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-field">流量单位</label>
                    <select className="input-field" defaultValue="万m³/日">
                      <option>m³/日</option>
                      <option>万m³/日</option>
                      <option>m³/时</option>
                    </select>
                  </div>
                </div>
                <div className="pt-4">
                  <button className="btn btn-primary">
                    <Save className="w-4 h-4 mr-1.5" />
                    保存配置
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-card-hover">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-navy-500">
                {editingUser ? '编辑用户' : '新增用户'}
              </h3>
              <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="label-field">用户姓名 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={userForm.name || ''}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">角色</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value as UserRole })}
                    className="input-field"
                  >
                    {(Object.keys(roleLabels) as UserRole[]).map((role) => (
                      <option key={role} value={role}>{roleLabels[role]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-field">所属部门</label>
                  <input
                    type="text"
                    value={userForm.department || ''}
                    onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-field">联系电话</label>
                  <input
                    type="tel"
                    value={userForm.phone || ''}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-field">邮箱</label>
                  <input
                    type="email"
                    value={userForm.email || ''}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="label-field">账户状态</label>
                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={userForm.status === 'active'}
                      onChange={() => setUserForm({ ...userForm, status: 'active' })} />
                    <span className="text-sm">启用</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={userForm.status === 'inactive'}
                      onChange={() => setUserForm({ ...userForm, status: 'inactive' })} />
                    <span className="text-sm">停用</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button onClick={() => setShowUserModal(false)} className="btn btn-secondary">取消</button>
                <button onClick={handleSaveUser} className="btn btn-primary">
                  {editingUser ? '保存修改' : '添加用户'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
