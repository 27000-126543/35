const express = require('express');
const router = express.Router();
const { query, queryOne, getDb } = require('../db');
const { v4: uuidv4 } = require('uuid');
const { transformCustomer } = require('../utils/transforms');

router.get('/', async (req, res) => {
  try {
    let sql = 'SELECT * FROM customers';
    const params = [];
    if (req.query.type) {
      sql += ' WHERE type = ?';
      params.push(req.query.type);
    }
    sql += ' ORDER BY created_at DESC';
    const rows = await query(sql, params);
    res.json({ success: true, data: rows.map(transformCustomer) });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await queryOne('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    if (!row) {
      return res.json({ success: false, error: '用户不存在' });
    }
    res.json({ success: true, data: transformCustomer(row) });
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
      b.address,
      b.region,
      b.contact || b.contact_person || '',
      b.phone,
      b.dailyGasUsage || b.daily_gas_volume || 0,
      b.usageRatio || b.gas_percentage || 0,
    ];
    await query(`
      INSERT INTO customers (
        id, name, type, address, region, contact_person, phone,
        daily_gas_volume, gas_percentage
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, params);

    const row = await queryOne('SELECT * FROM customers WHERE id = ?', [id]);
    res.json({ success: true, data: transformCustomer(row), message: '用户创建成功' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const existing = await queryOne('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.json({ success: false, error: '用户不存在' });
    }

    const b = { ...existing, ...req.body };
    const params = [
      b.name,
      b.type,
      b.address,
      b.region,
      b.contact || b.contact_person || existing.contact_person,
      b.phone,
      b.dailyGasUsage || b.daily_gas_volume || existing.daily_gas_volume,
      b.usageRatio || b.gas_percentage || existing.gas_percentage,
      req.params.id
    ];
    await query(`
      UPDATE customers SET
        name = ?, type = ?, address = ?, region = ?, contact_person = ?,
        phone = ?, daily_gas_volume = ?, gas_percentage = ?,
        updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `, params);

    const row = await queryOne('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: transformCustomer(row), message: '用户更新成功' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM customers WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.json({ success: false, error: '用户不存在' });
    }
    res.json({ success: true, message: '用户删除成功' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

module.exports = router;
