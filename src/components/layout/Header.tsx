import { Bell, User, ChevronDown, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { getAlarmLevelColor, getAlarmLevelLabel, getAlarmTypeLabel } from '@/utils';

const Header = () => {
  const user = useAppStore((s) => s.currentUser);
  const alarms = useAppStore((s) => s.alarms);
  const [showAlarms, setShowAlarms] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pendingAlarms = alarms.filter((a) => a.status === 'pending' || a.status === 'processing');

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span className="font-mono">
            {currentTime.toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            className="relative p-2 text-gray-600 hover:text-navy-500 hover:bg-gray-50 rounded-lg transition-colors"
            onClick={() => setShowAlarms(!showAlarms)}
          >
            <Bell className="w-5 h-5" />
            {pendingAlarms.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-danger text-white text-xs rounded-full flex items-center justify-center">
                {pendingAlarms.length}
              </span>
            )}
          </button>

          {showAlarms && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-card-hover border border-gray-100 overflow-hidden z-50 animate-slide-in-right">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-800">告警通知</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {pendingAlarms.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm">
                    暂无待处理告警
                  </div>
                ) : (
                  pendingAlarms.slice(0, 5).map((alarm) => (
                    <div
                      key={alarm.id}
                      className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className={`badge ${getAlarmLevelColor(alarm.level)}`}>
                          {getAlarmLevelLabel(alarm.level)}
                        </span>
                        <span className="text-xs text-gray-400">{alarm.createdAt.slice(11)}</span>
                      </div>
                      <p className="text-sm text-gray-800 font-medium">{alarm.nodeName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {getAlarmTypeLabel(alarm.type)} - {alarm.description}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="w-9 h-9 rounded-full bg-navy-500 flex items-center justify-center text-white">
            <User className="w-5 h-5" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-800">{user.name}</p>
            <p className="text-xs text-gray-500">{user.department}</p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </header>
  );
};

export default Header;
