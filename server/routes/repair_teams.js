const express = require('express');
const router = express.Router();
const { query, queryOne, getDb } = require('../db');
const { v4: uuidv4 } = require('uuid');
const { transformTeam } = require('../utils/transforms');

router.get('/', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM repair_teams ORDER BY created_at DESC');
    res.json({ success: true, data: rows.map(transformTeam) });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await queryOne('SELECT * FROM repair_teams WHERE id = ?', [req.params.id]);
    if (!row) {
      return res.json({ success: false, error: '班组不存在' });
    }
    res.json({ success: true, data: transformTeam(row) });
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
      b.leader,
      b.phone,
      JSON.stringify(b.members || []),
      JSON.stringify(b.equipment || []),
      b.status || 'idle',
      b.region,
      b.currentOrderId || b.current_order_id,
    ];
    await query(`
      INSERT INTO repair_teams (
        id, name, leader, phone, members, equipment, status, region, current_order_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, params);

    const row = await queryOne('SELECT * FROM repair_teams WHERE id = ?', [id]);
    res.json({ success: true, data: transformTeam(row), message: '班组创建成功' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const existing = await queryOne('SELECT * FROM repair_teams WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.json({ success: false, error: '班组不存在' });
    }

    const b = { ...existing, ...req.body };
    const params = [
      b.name,
      b.leader,
      b.phone,
      JSON.stringify(b.members || (existing.members ? JSON.parse(existing.members) : [])),
      JSON.stringify(b.equipment || (existing.equipment ? JSON.parse(existing.equipment) : [])),
      b.status || existing.status,
      b.region,
      b.currentOrderId || b.current_order_id || existing.current_order_id,
      req.params.id
    ];
    await query(`
      UPDATE repair_teams SET
        name = ?, leader = ?, phone = ?, members = ?, equipment = ?,
        status = ?, region = ?, current_order_id = ?
      WHERE id = ?
    `, params);

    const row = await queryOne('SELECT * FROM repair_teams WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: transformTeam(row), message: '班组更新成功' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM repair_teams WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.json({ success: false, error: '班组不存在' });
    }
    res.json({ success: true, message: '班组删除成功' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

module.exports = router;
