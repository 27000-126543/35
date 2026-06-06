const express = require('express');
const router = express.Router();
const { query, queryOne, getDb } = require('../db');
const { v4: uuidv4 } = require('uuid');
const { transformWorker } = require('../utils/transforms');

router.get('/', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM maintenance_workers ORDER BY created_at DESC');
    res.json({ success: true, data: rows.map(transformWorker) });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await queryOne('SELECT * FROM maintenance_workers WHERE id = ?', [req.params.id]);
    if (!row) {
      return res.json({ success: false, error: '维修人员不存在' });
    }
    res.json({ success: true, data: transformWorker(row) });
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
      b.phone,
      b.region,
      b.status || 'idle',
      b.currentTicketId || b.current_ticket_id,
      JSON.stringify(b.skills || []),
    ];
    await query(`
      INSERT INTO maintenance_workers (
        id, name, phone, region, status, current_ticket_id, skills
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, params);

    const row = await queryOne('SELECT * FROM maintenance_workers WHERE id = ?', [id]);
    res.json({ success: true, data: transformWorker(row), message: '维修人员创建成功' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const existing = await queryOne('SELECT * FROM maintenance_workers WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.json({ success: false, error: '维修人员不存在' });
    }

    const b = { ...existing, ...req.body };
    const params = [
      b.name,
      b.phone,
      b.region,
      b.status || existing.status,
      b.currentTicketId || b.current_ticket_id || existing.current_ticket_id,
      JSON.stringify(b.skills || (existing.skills ? JSON.parse(existing.skills) : [])),
      req.params.id
    ];
    await query(`
      UPDATE maintenance_workers SET
        name = ?, phone = ?, region = ?, status = ?, current_ticket_id = ?, skills = ?
      WHERE id = ?
    `, params);

    const row = await queryOne('SELECT * FROM maintenance_workers WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: transformWorker(row), message: '维修人员更新成功' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM maintenance_workers WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.json({ success: false, error: '维修人员不存在' });
    }
    res.json({ success: true, message: '维修人员删除成功' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

module.exports = router;
