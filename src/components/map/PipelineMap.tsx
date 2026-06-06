import { useEffect, useMemo } from 'react';
import { useAppStore } from '@/store';
import type { PipelineNode, RepairVehicle } from '@/types';
import { getNodeStatusDotColor, getNodeStatusLabel } from '@/utils';

interface PipelineMapProps {
  height?: string;
  showVehicles?: boolean;
  onNodeClick?: (node: PipelineNode) => void;
}

const PipelineMap = ({ height = '500px', showVehicles = true, onNodeClick }: PipelineMapProps) => {
  const nodes = useAppStore((s) => s.nodes);
  const vehicles = useAppStore((s) => s.repairVehicles);
  const simulateUpdate = useAppStore((s) => s.simulateNodePressureUpdate);

  useEffect(() => {
    const timer = setInterval(() => simulateUpdate(), 5000);
    return () => clearInterval(timer);
  }, [simulateUpdate]);

  const mapBounds = useMemo(() => {
    const lngs = nodes.map((n) => n.longitude);
    const lats = nodes.map((n) => n.latitude);
    return {
      minLng: Math.min(...lngs) - 0.02,
      maxLng: Math.max(...lngs) + 0.02,
      minLat: Math.min(...lats) - 0.02,
      maxLat: Math.max(...lats) + 0.02,
    };
  }, [nodes]);

  const toXY = (lng: number, lat: number, width: number, height: number) => {
    const x =
      ((lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * width;
    const y =
      height - ((lat - mapBounds.minLat) / (mapBounds.maxLat - mapBounds.minLat)) * height;
    return { x, y };
  };

  const width = 800;
  const internalHeight = 500;

  const connections: Array<{ from: PipelineNode; to: PipelineNode }> = [];
  nodes.forEach((node) => {
    node.connectedNodes.forEach((connId) => {
      const targetNode = nodes.find((n) => n.id === connId);
      if (targetNode && node.id < connId) {
        connections.push({ from: node, to: targetNode });
      }
    });
  });

  const getPressureColor = (node: PipelineNode) => {
    const ratio = node.currentPressure / node.designPressure;
    if (node.status === 'leak') return '#E5484D';
    if (node.status === 'repair') return '#FFAB00';
    if (ratio < 0.7) return '#36B37E';
    if (ratio < 0.85) return '#FF6B35';
    return '#E5484D';
  };

  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-gradient-to-br from-slate-50 to-slate-100">
      <svg
        viewBox={`0 0 ${width} ${internalHeight}`}
        className="w-full"
        style={{ height }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
          </pattern>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="stationGradient">
            <stop offset="0%" stopColor="#FF6B35" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FF6B35" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width={width} height={internalHeight} fill="url(#grid)" />

        {connections.map((conn, idx) => {
          const from = toXY(conn.from.longitude, conn.from.latitude, width, internalHeight);
          const to = toXY(conn.to.longitude, conn.to.latitude, width, internalHeight);
          const isLeak = conn.from.status === 'leak' || conn.to.status === 'leak';
          const lineColor = isLeak ? '#E5484D' : '#94a3b8';
          return (
            <line
              key={idx}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={lineColor}
              strokeWidth={isLeak ? 3 : 2}
              strokeDasharray={isLeak ? '5,5' : undefined}
              className={isLeak ? 'animate-pulse' : ''}
            />
          );
        })}

        {nodes.map((node) => {
          const { x, y } = toXY(node.longitude, node.latitude, width, internalHeight);
          const color = getPressureColor(node);
          const radius = node.type === 'regulator' ? 10 : node.type === 'valve' ? 6 : 8;
          const isAnomalous = node.status !== 'normal';

          return (
            <g
              key={node.id}
              className={onNodeClick ? 'cursor-pointer' : ''}
              onClick={() => onNodeClick?.(node)}
            >
              {isAnomalous && (
                <circle cx={x} cy={y} r={radius + 8} fill={color} opacity={0.2} className="animate-pulse" />
              )}
              <circle
                cx={x}
                cy={y}
                r={radius}
                fill={color}
                stroke="white"
                strokeWidth={2}
                filter={isAnomalous ? 'url(#glow)' : undefined}
                className={isAnomalous ? 'animate-breathe' : ''}
              />
              {node.type === 'regulator' && (
                <text x={x} y={y + 1} textAnchor="middle" fontSize={7} fill="white" fontWeight="bold">
                  {node.type === 'regulator' ? 'R' : node.type === 'valve' ? 'V' : 'J'}
                </text>
              )}
              <text x={x} y={y - radius - 6} textAnchor="middle" fontSize={10} fill="#334155" fontWeight={500}>
                {node.name.length > 6 ? node.name.slice(0, 6) + '...' : node.name}
              </text>
              <text x={x} y={y + radius + 12} textAnchor="middle" fontSize={9} fill="#64748b">
                {node.currentPressure.toFixed(2)}MPa
              </text>
            </g>
          );
        })}

        {showVehicles &&
          vehicles.map((vehicle) => {
            const { x, y } = toXY(vehicle.longitude, vehicle.latitude, width, internalHeight);
            const vehicleColor = vehicle.status === 'repairing' ? '#E5484D' : vehicle.status === 'dispatched' ? '#FF6B35' : '#36B37E';
            return (
              <g key={vehicle.id}>
                <circle cx={x} cy={y} r={12} fill={vehicleColor} opacity={0.3} className="animate-pulse" />
                <circle cx={x} cy={y} r={8} fill={vehicleColor} stroke="white" strokeWidth={2} />
                <text x={x} y={y + 2} textAnchor="middle" fontSize={9} fill="white">
                  🚚
                </text>
                <text x={x} y={y - 14} textAnchor="middle" fontSize={9} fill="#334155" fontWeight={600}>
                  {vehicle.plateNumber}
                </text>
              </g>
            );
          })}
      </svg>

      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="status-dot bg-brand-success"></span>
          <span className="text-gray-600">正常</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="status-dot bg-brand-warning"></span>
          <span className="text-gray-600">压力偏低</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="status-dot bg-brand-danger animate-breathe"></span>
          <span className="text-gray-600">泄漏/抢修</span>
        </div>
        <div className="w-px h-4 bg-gray-300"></div>
        <div className="flex items-center gap-1.5">
          <span className="text-gray-600">R</span>
          <span className="text-gray-600">调压站</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-gray-600">V</span>
          <span className="text-gray-600">阀门</span>
        </div>
      </div>
    </div>
  );
};

export default PipelineMap;
