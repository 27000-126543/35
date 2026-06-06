import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Network,
  Users,
  ClipboardList,
  Activity,
  AlertTriangle,
  Wrench,
  BarChart3,
  Settings,
  Flame,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: '数据看板', icon: LayoutDashboard },
  { path: '/stations', label: '门站管理', icon: Building2 },
  { path: '/nodes', label: '管网节点', icon: Network },
  { path: '/users', label: '用户信息', icon: Users },
  { path: '/dispatch', label: '调度方案', icon: ClipboardList },
  { path: '/monitor', label: '管网监控', icon: Activity },
  { path: '/emergency', label: '应急抢修', icon: AlertTriangle },
  { path: '/repair', label: '用户报修', icon: Wrench },
  { path: '/reports', label: '统计报表', icon: BarChart3 },
  { path: '/settings', label: '系统设置', icon: Settings },
];

const Sidebar = () => {
  return (
    <aside className="w-60 bg-navy-500 text-white flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-navy-600 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-accent to-orange-600 flex items-center justify-center">
          <Flame className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-wide">燃气智能调度</h1>
          <p className="text-xs text-navy-200">应急抢修管理系统</p>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="px-5 py-4 border-t border-navy-600">
        <div className="text-xs text-navy-300">
          <p>系统版本 v1.0.0</p>
          <p className="mt-1">© 2026 燃气运营中心</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
