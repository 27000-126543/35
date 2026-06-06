const express = require('express');
const router = express.Router();
const { query, queryOne, getDb } = require('../db');
const { v4: uuidv4 } = require('uuid');
const { generateDispatchPlan } = require('../utils/scheduler');
const { transformPlan } = require('../utils/transforms');

router.get('/', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM dispatch_plans ORDER BY plan_date DESC, created_at DESC');
    res.json({ success: true, data: rows.map(transformPlan) });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await queryOne('SELECT * FROM dispatch_plans WHERE id = ?', [req.params.id]);
    if (!row) {
      return res.json({ success: false, error: '调度方案不存在' });
    }
    res.json({ success: true, data: transformPlan(row) });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const id = uuidv4();
    const b = req.body;
    const weather = b.weather || {};
    const isHolidayVal = b.isHoliday !== undefined ? b.isHoliday : b.is_holiday;
    const isHolidayNum = typeof isHolidayVal === 'boolean' ? (isHolidayVal ? 1 : 0) : (isHolidayVal || 0);
    const params = [
      id,
      b.planDate || b.plan_date,
      b.totalSupply || b.total_supply,
      weather.condition || b.weather_forecast || '',
      isHolidayNum,
      b.status || 'draft',
      b.storageUsage || b.storage_usage || 0,
      b.pressureBalanceScore || b.pressure_balance_score || 0,
      JSON.stringify(b.stationAllocations || b.station_allocations || []),
      JSON.stringify(b.nodePressureTargets || b.node_pressure_targets || []),
      b.adjustReason || b.adjust_reason,
      b.approver || b.approver_id,
      b.createdBy || b.created_by,
    ];
    await query(`
      INSERT INTO dispatch_plans (
        id, plan_date, total_supply, weather_forecast, is_holiday,
        status, storage_usage, pressure_balance_score,
        station_allocations, node_pressure_targets,
        adjust_reason, approver_id, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, params);

    const row = await queryOne('SELECT * FROM dispatch_plans WHERE id = ?', [id]);
    res.json({ success: true, data: transformPlan(row), message: '调度方案创建成功' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const existing = await queryOne('SELECT * FROM dispatch_plans WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.json({ success: false, error: '调度方案不存在' });
    }

    const b = { ...existing, ...req.body };
    const weather = b.weather || {};
    const isHolidayVal = b.isHoliday !== undefined ? b.isHoliday : b.is_holiday;
    const isHolidayNum = typeof isHolidayVal === 'boolean' ? (isHolidayVal ? 1 : 0) : (isHolidayVal !== undefined ? isHolidayVal : existing.is_holiday);
    const params = [
      b.planDate || b.plan_date || existing.plan_date,
      b.totalSupply || b.total_supply || existing.total_supply,
      weather.condition || b.weather_forecast || existing.weather_forecast,
      isHolidayNum,
      b.status || existing.status,
      b.storageUsage || b.storage_usage || existing.storage_usage,
      b.pressureBalanceScore || b.pressure_balance_score || existing.pressure_balance_score,
      JSON.stringify(b.stationAllocations || b.station_allocations || (existing.station_allocations ? JSON.parse(existing.station_allocations) : [])),
      JSON.stringify(b.nodePressureTargets || b.node_pressure_targets || (existing.node_pressure_targets ? JSON.parse(existing.node_pressure_targets) : [])),
      b.adjustReason || b.adjust_reason || existing.adjust_reason,
      b.approver || b.approver_id || existing.approver_id,
      req.params.id
    ];
    await query(`
      UPDATE dispatch_plans SET
        plan_date = ?, total_supply = ?, weather_forecast = ?, is_holiday = ?,
        status = ?, storage_usage = ?, pressure_balance_score = ?,
        station_allocations = ?, node_pressure_targets = ?,
        adjust_reason = ?, approver_id = ?, updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `, params);

    const row = await queryOne('SELECT * FROM dispatch_plans WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: transformPlan(row), message: '调度方案更新成功' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const { status, reason, approver } = req.body;
    const existing = await queryOne('SELECT * FROM dispatch_plans WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.json({ success: false, error: '调度方案不存在' });
    }

    const fields = ['status = ?'];
    const params = [status];
    if (reason) {
      fields.push('adjust_reason = ?');
      params.push(reason);
    }
    if (approver) {
      fields.push('approver_id = ?');
      params.push(approver);
      if (status === 'approved') {
        fields.push("approved_at = datetime('now', 'localtime')");
      }
    }
    fields.push("updated_at = datetime('now', 'localtime')");
    params.push(req.params.id);

    await query(`UPDATE dispatch_plans SET ${fields.join(', ')} WHERE id = ?`, params);

    const row = await queryOne('SELECT * FROM dispatch_plans WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: transformPlan(row), message: '状态变更成功' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM dispatch_plans WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.json({ success: false, error: '调度方案不存在' });
    }
    res.json({ success: true, message: '调度方案删除成功' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.post('/generate', async (req, res) => {
  try {
    const { weather, isHoliday, plan_date, created_by } = req.body;

    const stations = await query("SELECT * FROM gas_stations WHERE status = ?", ['normal']);
    const nodes = await query('SELECT * FROM pipeline_nodes');
    const customers = await query('SELECT * FROM customers');

    const planData = generateDispatchPlan({ stations, nodes, customers, weather, isHoliday });

    const id = uuidv4();
    const finalPlanDate = plan_date || planData.plan_date;

    await query(`
      INSERT INTO dispatch_plans (
        id, plan_date, total_supply, weather_forecast, is_holiday,
        status, storage_usage, pressure_balance_score,
        station_allocations, node_pressure_targets, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, finalPlanDate, planData.total_supply, planData.weather_forecast, planData.is_holiday,
      planData.status, planData.storage_usage, planData.pressure_balance_score,
      JSON.stringify(planData.station_allocations), JSON.stringify(planData.node_pressure_targets),
      created_by || null
    ]);

    const row = await queryOne('SELECT * FROM dispatch_plans WHERE id = ?', [id]);
    res.json({ success: true, data: transformPlan(row), message: '智能调度方案生成成功' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

module.exports = router;
