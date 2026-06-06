function generateDispatchPlan({ stations, nodes, customers, weather, isHoliday }) {
  const baseSupply = customers.reduce((sum, c) => sum + (c.daily_gas_volume || 0), 0) / 10000;

  let weatherCoeff = 1.0;
  const weatherStr = typeof weather === 'string' ? weather : (weather && weather.condition ? weather.condition : '');
  const w = (weatherStr || '').toLowerCase();
  if (w.includes('晴') || w.includes('多云')) weatherCoeff = 1.0;
  else if (w.includes('阴')) weatherCoeff = 1.05;
  else if (w.includes('小雨') || w.includes('小雪') || w.includes('雪')) weatherCoeff = 1.1;
  else if (w.includes('大雨') || w.includes('暴雪')) weatherCoeff = 1.15;

  if (weather && typeof weather === 'object') {
    if ((weather.temperature && weather.temperature > 30) || (weather.temperature && weather.temperature < 5)) {
      weatherCoeff = Math.max(weatherCoeff, 1.1);
    }
  }

  const holidayCoeff = isHoliday ? 1.15 : 1.0;
  const randomCoeff = 0.97 + Math.random() * 0.06;
  const totalSupply = baseSupply * weatherCoeff * holidayCoeff * randomCoeff;

  const totalCapacity = stations.reduce((sum, s) => sum + (s.supply_capacity || 0), 0);
  const capacityRatio = totalCapacity > 0 ? totalSupply / totalCapacity : 0;

  let storageUsage = 0;
  if (capacityRatio > 0.85) {
    storageUsage = Math.min(0.3, (capacityRatio - 0.85) * 2);
  }

  const stationAllocations = stations.map((station) => {
    const weight = totalCapacity > 0 ? station.supply_capacity / totalCapacity : 0;
    let plannedOutput = totalSupply * weight * (1 + storageUsage * 0.3);
    plannedOutput = Math.min(plannedOutput, station.supply_capacity);
    return {
      station_id: station.id,
      station_name: station.name,
      supply_capacity: station.supply_capacity,
      planned_output: Number(plannedOutput.toFixed(4)),
    };
  });

  const nodePressureTargets = nodes
    .filter((n) => n.type === 'regulator')
    .map((node) => ({
      node_id: node.id,
      node_name: node.name,
      design_pressure: node.design_pressure,
      target_pressure: Number((node.design_pressure * 0.97).toFixed(4)),
    }));

  const allRegulators = nodes.filter((n) => n.type === 'regulator' && n.design_pressure > 0);
  let pressureBalanceScore = 100;
  if (allRegulators.length > 1) {
    const ratios = allRegulators.map((n) => {
      const target = n.design_pressure * 0.97;
      return target / n.design_pressure;
    });
    const mean = ratios.reduce((a, b) => a + b, 0) / ratios.length;
    const variance = ratios.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / ratios.length;
    const stdDev = Math.sqrt(variance);
    pressureBalanceScore = stdDev > 0 ? Math.min(100, Math.max(0, 100 - stdDev * 1000)) : 100;
  }

  return {
    plan_date: new Date().toISOString().split('T')[0],
    total_supply: Number(totalSupply.toFixed(4)),
    weather_forecast: typeof weather === 'string' ? weather : JSON.stringify(weather || {}),
    is_holiday: isHoliday ? 1 : 0,
    status: 'draft',
    storage_usage: Number(storageUsage.toFixed(4)),
    pressure_balance_score: Number(pressureBalanceScore.toFixed(2)),
    station_allocations: stationAllocations,
    node_pressure_targets: nodePressureTargets,
  };
}

module.exports = { generateDispatchPlan };
