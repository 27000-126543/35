const express = require('express');
const { query, queryOne } = require('../db');
const { transformStatistics } = require('../utils/transforms');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6);
    const formatYMD = (d) => d.toISOString().split('T')[0];
    const formatMD = (d) => `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const totalGasSupplyRow = await queryOne('SELECT COALESCE(SUM(current_output), 0) as total FROM gas_stations');
    const totalGasSupply = Number(totalGasSupplyRow.total.toFixed(1));

    const nodesCountRow = await queryOne('SELECT COUNT(*) as total FROM pipeline_nodes');
    const normalNodesRow = await queryOne("SELECT COUNT(*) as count FROM pipeline_nodes WHERE status = 'normal'");
    const pressureQualifiedRate = nodesCountRow.total > 0
      ? Number(((normalNodesRow.count / nodesCountRow.total) * 100).toFixed(1))
      : 0;

    const completedRepairsRow = await queryOne("SELECT COUNT(*) as total FROM repair_orders WHERE status = 'completed'");
    const onTimeRepairsRow = await queryOne("SELECT COUNT(*) as count FROM repair_orders WHERE status = 'completed' AND duration_minutes <= 30");
    const repairOnTimeRate = completedRepairsRow.total > 0
      ? Number(((onTimeRepairsRow.count / completedRepairsRow.total) * 100).toFixed(1))
      : 100;

    const gasLossRate = 2.8;

    const dailySupplyRows = await query(`
      SELECT record_date, COALESCE(SUM(gas_supply), 0) as supply
      FROM daily_gas_records
      WHERE record_date >= ? AND record_date <= ?
      GROUP BY record_date
      ORDER BY record_date ASC
    `, [formatYMD(startDate), formatYMD(today)]);

    const dailySupplyMap = new Map(dailySupplyRows.map(r => [r.record_date, Number(r.supply.toFixed(1))]));
    const dailySupply = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const ymd = formatYMD(d);
      dailySupply.push({
        date: formatMD(d),
        supply: dailySupplyMap.get(ymd) || 0,
      });
    }

    const byRegionRows = await query(`
      SELECT region, COALESCE(SUM(daily_gas_volume / 10000), 0) as gasSupply
      FROM customers
      GROUP BY region
      ORDER BY gasSupply DESC
    `);
    const byRegion = byRegionRows.map(r => ({
      region: r.region,
      gasSupply: Number(r.gasSupply.toFixed(2)),
    }));

    const totalCustomerVolumeRow = await queryOne('SELECT COALESCE(SUM(daily_gas_volume), 0) as total FROM customers');
    const totalCustomerVolume = totalCustomerVolumeRow.total || 1;
    const userTypes = ['industrial', 'commercial', 'residential'];
    const byUserType = [];
    for (const type of userTypes) {
      const row = await queryOne('SELECT COALESCE(SUM(daily_gas_volume), 0) as supply FROM customers WHERE type = ?', [type]);
      const supply = row.supply;
      byUserType.push({
        type,
        gasSupply: Number(supply.toFixed(2)),
        percentage: Number(((supply / totalCustomerVolume) * 100).toFixed(1)),
      });
    }

    const alarmTypes = ['pressure_low', 'pressure_high', 'leak', 'equipment_fault'];
    const alarmCounts = [];
    for (const type of alarmTypes) {
      const row = await queryOne('SELECT COUNT(*) as count FROM emergency_alarms WHERE type = ?', [type]);
      alarmCounts.push({ type, count: row.count });
    }

    const activeAlarmsRow = await queryOne("SELECT COUNT(*) as count FROM emergency_alarms WHERE status IN ('pending', 'acknowledged', 'processing')");
    const activeAlarms = activeAlarmsRow.count;

    const totalRepairOrdersRow = await queryOne('SELECT COUNT(*) as total FROM repair_orders');
    const totalRepairOrders = totalRepairOrdersRow.total;
    const completedRepairs = completedRepairsRow.total;

    const totalTicketsRow = await queryOne('SELECT COUNT(*) as total FROM repair_tickets');
    const totalTickets = totalTicketsRow.total;
    const pendingTicketsRow = await queryOne("SELECT COUNT(*) as count FROM repair_tickets WHERE status = 'pending'");
    const pendingTickets = pendingTicketsRow.count;

    const rawData = {
      totalGasSupply,
      pressureQualifiedRate,
      repairOnTimeRate,
      gasLossRate,
      dateRange: {
        start: formatYMD(startDate),
        end: formatYMD(today),
      },
      dailySupply,
      byRegion,
      byUserType,
      alarmCounts,
      activeAlarms,
      totalRepairOrders,
      completedRepairs,
      totalTickets,
      pendingTickets,
    };

    res.json({ success: true, data: transformStatistics(rawData) });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

module.exports = router;
