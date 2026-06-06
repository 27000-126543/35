const express = require('express');
const router = express.Router();
const { query, queryOne, getDb } = require('../db');
const { v4: uuidv4 } = require('uuid');
const { transformOrder } = require('../utils/transforms');

router.get('/', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM repair_orders ORDER BY created_at DESC');
    res.json({ success: true, data: rows.map(transformOrder) });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await queryOne('SELECT * FROM repair_orders WHERE id = ?', [req.params.id]);
    if (!row) {
      return res.json({ success: false, error: '工单不存在' });
    }
    res.json({ success: true, data: transformOrder(row) });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const id = uuidv4();
    const b = req.body;
    const params = [
      id,
      b.alarmId || b.alarm_id,
      b.nodeId || b.node_id,
      b.nodeName || b.node_name,
      b.description,
      b.teamId || b.team_id,
      b.status || 'pending',
      b.priority || 'high',
      JSON.stringify(b.equipmentUsed || b.equipment_used || []),
      b.repairNotes || b.repair_notes,
    ];
    await query(`
      INSERT INTO repair_orders (
        id, alarm_id, node_id, node_name, description, team_id,
        status, priority, equipment_used, repair_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, params);

    const row = await queryOne('SELECT * FROM repair_orders WHERE id = ?', [id]);
    res.json({ success: true, data: transformOrder(row), message: '工单创建成功' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const existing = await queryOne('SELECT * FROM repair_orders WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.json({ success: false, error: '工单不存在' });
    }

    const b = { ...existing, ...req.body };
    const params = [
      b.alarmId || b.alarm_id || existing.alarm_id,
      b.nodeId || b.node_id || existing.node_id,
      b.nodeName || b.node_name || existing.node_name,
      b.description || existing.description,
      b.teamId || b.team_id || existing.team_id,
      b.status || existing.status,
      b.priority || existing.priority,
      JSON.stringify(b.equipmentUsed || b.equipment_used || (existing.equipment_used ? JSON.parse(existing.equipment_used) : [])),
      b.repairNotes || b.repair_notes || existing.repair_notes,
      b.dispatchedAt || b.dispatched_at || existing.dispatched_at,
      b.arrivedAt || b.arrived_at || existing.arrived_at,
      b.startedAt || b.started_at || existing.started_at,
      b.completedAt || b.completed_at || existing.completed_at,
      b.durationMinutes || b.duration_minutes || existing.duration_minutes,
      req.params.id
    ];
    await query(`
      UPDATE repair_orders SET
        alarm_id = ?, node_id = ?, node_name = ?, description = ?, team_id = ?,
        status = ?, priority = ?, equipment_used = ?, repair_notes = ?,
        dispatched_at = ?, arrived_at = ?, started_at = ?, completed_at = ?,
        duration_minutes = ?, updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `, params);

    const row = await queryOne('SELECT * FROM repair_orders WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: transformOrder(row), message: '工单更新成功' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const b = req.body;
    const status = b.status;
    const teamId = b.teamId || b.team_id;
    const existing = await queryOne('SELECT * FROM repair_orders WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.json({ success: false, error: '工单不存在' });
    }

    const fields = ['status = ?'];
    const params = [status];

    if (teamId) {
      fields.push('team_id = ?');
      params.push(teamId);
    }

    const now = "datetime('now', 'localtime')";
    switch (status) {
      case 'dispatched':
        fields.push(`dispatched_at = ${now}`);
        break;
      case 'arrived':
        fields.push(`arrived_at = ${now}`);
        break;
      case 'repairing':
        fields.push(`started_at = ${now}`);
        break;
      case 'completed':
        fields.push(`completed_at = ${now}`);
        if (existing.started_at) {
          const started = new Date(existing.started_at).getTime();
          const completed = Date.now();
          const duration = Math.max(0, Math.round((completed - started) / 60000));
          fields.push('duration_minutes = ?');
          params.push(duration);
        }
        break;
    }

    fields.push("updated_at = datetime('now', 'localtime')");
    params.push(req.params.id);

    await query(`UPDATE repair_orders SET ${fields.join(', ')} WHERE id = ?`, params);

    if (teamId && (status === 'dispatched' || status === 'repairing')) {
      await query('UPDATE repair_teams SET status = ?, current_order_id = ? WHERE id = ?',
        ['busy', req.params.id, teamId]);
    }
    if (status === 'completed' && existing.team_id) {
      await query('UPDATE repair_teams SET status = ?, current_order_id = NULL WHERE id = ?',
        ['idle', existing.team_id]);
    }

    const row = await queryOne('SELECT * FROM repair_orders WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: transformOrder(row), message: '状态更新成功' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM repair_orders WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.json({ success: false, error: '工单不存在' });
    }
    res.json({ success: true, message: '工单删除成功' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

module.exports = router;
