function snakeToCamel(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function camelToSnake(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
}

function transformKeys(obj, fn) {
  if (Array.isArray(obj)) {
    return obj.map((item) => transformKeys(item, fn));
  }
  if (obj && typeof obj === 'object' && obj.constructor === Object) {
    const result = {};
    for (const key of Object.keys(obj)) {
      result[fn(key)] = transformKeys(obj[key], fn);
    }
    return result;
  }
  return obj;
}

function transformStation(row) {
  if (!row) return row;
  return {
    ...transformKeys(row, snakeToCamel),
    address: row.location,
    supplyCapacity: row.supply_capacity,
    currentOutput: row.current_output,
    gasQuality: {
      methane: row.methane_content,
      calorificValue: row.calorific_value,
      sulfurContent: row.impurity_content,
      pressure: row.pressure,
    },
    operator: '系统',
    lastInspection: row.updated_at || row.created_at,
  };
}

function transformNode(row) {
  if (!row) return row;
  const designPressure = row.design_pressure;
  return {
    ...transformKeys(row, snakeToCamel),
    address: row.location,
    pipeDiameter: row.pipe_diameter,
    designPressure: designPressure,
    currentPressure: row.current_pressure,
    minPressure: designPressure * 0.7,
    maxPressure: designPressure * 1.25,
    connectedNodes: row.connected_nodes ? JSON.parse(row.connected_nodes) : [],
    lastUpdate: row.updated_at,
  };
}

function transformCustomer(row) {
  if (!row) return row;
  const dailyGasUsage = row.daily_gas_volume;
  const monthlyUsage = Array.from({ length: 12 }, () =>
    Math.round(Math.random() * (dailyGasUsage / 30) * 100) / 100
  );
  return {
    ...transformKeys(row, snakeToCamel),
    dailyGasUsage: dailyGasUsage,
    monthlyUsage: monthlyUsage,
    usageRatio: row.gas_percentage,
    contact: row.contact_person,
    registerDate: row.created_at,
    status: row.status || 'active',
  };
}

function transformPlan(row) {
  if (!row) return row;
  return {
    ...transformKeys(row, snakeToCamel),
    planDate: row.plan_date,
    generatedAt: row.created_at,
    generatedBy: row.created_by ? 'manual' : 'system',
    weather: {
      condition: row.weather_forecast,
      temperature: 25,
      humidity: 60,
    },
    isHoliday: row.is_holiday === 1 ? true : false,
    stations: row.station_allocations ? JSON.parse(row.station_allocations) : [],
    nodes: row.node_pressure_targets ? JSON.parse(row.node_pressure_targets) : [],
  };
}

function transformAlarm(row) {
  if (!row) return row;
  return {
    ...transformKeys(row, snakeToCamel),
    nodeId: row.node_id,
    nodeName: row.node_name,
    triggeredAt: row.triggered_at,
    acknowledgedAt: row.acknowledged_at,
    resolvedAt: row.resolved_at,
    acknowledgedBy: row.acknowledged_by,
    resolvedBy: row.resolved_by,
    resolutionNotes: row.resolution_notes,
  };
}

function transformOrder(row) {
  if (!row) return row;
  return {
    ...transformKeys(row, snakeToCamel),
    alarmId: row.alarm_id,
    nodeId: row.node_id,
    nodeName: row.node_name,
    teamId: row.team_id,
    dispatchedAt: row.dispatched_at,
    arrivedAt: row.arrived_at,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    durationMinutes: row.duration_minutes,
    equipment: row.equipment_used ? JSON.parse(row.equipment_used) : [],
    repairNotes: row.repair_notes,
  };
}

function transformTeam(row) {
  if (!row) return row;
  return {
    ...transformKeys(row, snakeToCamel),
    members: row.members ? JSON.parse(row.members) : [],
    equipment: row.equipment ? JSON.parse(row.equipment) : [],
    currentOrderId: row.current_order_id,
  };
}

function transformVehicle(row) {
  if (!row) return row;
  return {
    ...transformKeys(row, snakeToCamel),
    plateNumber: row.plate_number,
    vehicleType: row.vehicle_type,
    currentOrderId: row.current_order_id,
  };
}

function transformTicket(row) {
  if (!row) return row;
  return {
    ...transformKeys(row, snakeToCamel),
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerType: row.customer_type,
    faultType: row.fault_type,
    workerId: row.worker_id,
    dispatchedAt: row.dispatched_at,
    completedAt: row.completed_at,
  };
}

function transformWorker(row) {
  if (!row) return row;
  return {
    ...transformKeys(row, snakeToCamel),
    currentTicketId: row.current_ticket_id,
    skills: row.skills ? JSON.parse(row.skills) : [],
  };
}

function transformStatistics(data) {
  if (!data) return data;
  return transformKeys(data, snakeToCamel);
}

module.exports = {
  snakeToCamel,
  camelToSnake,
  transformKeys,
  transformStation,
  transformNode,
  transformCustomer,
  transformPlan,
  transformAlarm,
  transformOrder,
  transformTeam,
  transformVehicle,
  transformTicket,
  transformWorker,
  transformStatistics,
};
