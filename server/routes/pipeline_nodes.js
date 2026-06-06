const express = require('express');
const router = express.Router();
const { query, queryOne, getDb } = require('../db');
const { v4: uuidv4 } = require('uuid');
const { transformNode } = require('../utils/transforms');

router.get('/', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM pipeline_nodes ORDER BY created_at DESC');
    res.json({ success: true, data: rows.map(transformNode) });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await queryOne('SELECT * FROM pipeline_nodes WHERE id = ?', [req.params.id]);
    if (!row) {
      return res.json({ success: false, error: '节点不存在' });
    }
    res.json({ success: true, data: transformNode(row) });
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
      b.name,
      b.type,
      b.location || b.address || '',
      b.longitude,
      b.latitude,
      b.pipeDiameter || b.pipe_diameter || 0,
      b.designPressure || b.design_pressure || 0,
      b.currentPressure || b.current_pressure || 0,
      b.status || 'normal',
      JSON.stringify(b.connectedNodes || b.connected_nodes || []),
    ];
    await query(`
      INSERT INTO pipeline_nodes (
        id, name, type, location, longitude, latitude, pipe_diameter,
        design_pressure, current_pressure, status, connected_nodes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, params);

    const row = await queryOne('SELECT * FROM pipeline_nodes WHERE id = ?', [id]);
    res.json({ success: true, data: transformNode(row), message: '节点创建成功' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const existing = await queryOne('SELECT * FROM pipeline_nodes WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.json({ success: false, error: '节点不存在' });
    }

    const b = { ...existing, ...req.body };
    const params = [
      b.name,
      b.type,
      b.location || b.address || existing.location,
      b.longitude,
      b.latitude,
      b.pipeDiameter || b.pipe_diameter || existing.pipe_diameter,
      b.designPressure || b.design_pressure || existing.design_pressure,
      b.currentPressure || b.current_pressure || existing.current_pressure,
      b.status || existing.status,
      JSON.stringify(b.connectedNodes || b.connected_nodes || (existing.connected_nodes ? JSON.parse(existing.connected_nodes) : [])),
      req.params.id
    ];
    await query(`
      UPDATE pipeline_nodes SET
        name = ?, type = ?, location = ?, longitude = ?, latitude = ?,
        pipe_diameter = ?, design_pressure = ?, current_pressure = ?,
        status = ?, connected_nodes = ?, updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `, params);

    const row = await queryOne('SELECT * FROM pipeline_nodes WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: transformNode(row), message: '节点更新成功' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.put('/:id/pressure', async (req, res) => {
  try {
    const { pressure, status } = req.body;
    const existing = await queryOne('SELECT * FROM pipeline_nodes WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.json({ success: false, error: '节点不存在' });
    }

    await query(`
      UPDATE pipeline_nodes SET
        current_pressure = ?, status = ?, updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `, [pressure, status || existing.status, req.params.id]);

    await query(`
      INSERT INTO pressure_records (id, node_id, pressure, status, recorded_at)
      VALUES (?, ?, ?, ?, datetime('now', 'localtime'))
    `, [uuidv4(), req.params.id, pressure, status || existing.status]);

    const row = await queryOne('SELECT * FROM pipeline_nodes WHERE id = ?', [req.params.id]);

    res.json({ success: true, data: transformNode(row), message: '压力更新成功' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM pipeline_nodes WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.json({ success: false, error: '节点不存在' });
    }
    res.json({ success: true, message: '节点删除成功' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

module.exports = router;
