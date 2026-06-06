const express = require('express');
const router = express.Router();
const { query, queryOne, getDb } = require('../db');
const { v4: uuidv4 } = require('uuid');
const { transformAlarm } = require('../utils/transforms');

router.get('/', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM emergency_alarms ORDER BY triggered_at DESC');
    res.json({ success: true, data: rows.map(transformAlarm) });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await queryOne('SELECT * FROM emergency_alarms WHERE id = ?', [req.params.id]);
    if (!row) {
      return res.json({ success: false, error: '告警不存在' });
    }
    res.json({ success: true, data: transformAlarm(row) });
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
      b.nodeId || b.node_id,
      b.nodeName || b.node_name,
      b.type,
      b.level,
      b.description,
      b.status || 'pending',
    ];
    await query(`
      INSERT INTO emergency_alarms (
        id, node_id, node_name, type, level, description, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, params);

    const row = await queryOne('SELECT * FROM emergency_alarms WHERE id = ?', [id]);
    res.json({ success: true, data: transformAlarm(row), message: '告警创建成功' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.put('/:id/acknowledge', async (req, res) => {
  try {
    const b = req.body;
    const acknowledgedBy = b.acknowledgedBy || b.acknowledged_by;
    const existing = await queryOne('SELECT * FROM emergency_alarms WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.json({ success: false, error: '告警不存在' });
    }

    await query(`
      UPDATE emergency_alarms SET
        status = 'acknowledged',
        acknowledged_by = ?,
        acknowledged_at = datetime('now', 'localtime')
      WHERE id = ?
    `, [acknowledgedBy, req.params.id]);

    const row = await queryOne('SELECT * FROM emergency_alarms WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: transformAlarm(row), message: '告警已确认' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.put('/:id/resolve', async (req, res) => {
  try {
    const b = req.body;
    const resolvedBy = b.resolvedBy || b.resolved_by;
    const resolutionNotes = b.resolutionNotes || b.resolution_notes;
    const existing = await queryOne('SELECT * FROM emergency_alarms WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.json({ success: false, error: '告警不存在' });
    }

    await query(`
      UPDATE emergency_alarms SET
        status = 'resolved',
        resolved_by = ?,
        resolution_notes = ?,
        resolved_at = datetime('now', 'localtime')
      WHERE id = ?
    `, [resolvedBy, resolutionNotes, req.params.id]);

    const row = await queryOne('SELECT * FROM emergency_alarms WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: transformAlarm(row), message: '告警已解决' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM emergency_alarms WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.json({ success: false, error: '告警不存在' });
    }
    res.json({ success: true, message: '告警删除成功' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

module.exports = router;
