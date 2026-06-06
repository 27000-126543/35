const express = require('express');
const router = express.Router();
const { query, queryOne, getDb } = require('../db');
const { v4: uuidv4 } = require('uuid');
const { transformStation } = require('../utils/transforms');

router.get('/', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM gas_stations ORDER BY created_at DESC');
    res.json({ success: true, data: rows.map(transformStation) });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await queryOne('SELECT * FROM gas_stations WHERE id = ?', [req.params.id]);
    if (!row) {
      return res.json({ success: false, error: '门站不存在' });
    }
    res.json({ success: true, data: transformStation(row) });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const id = uuidv4();
    const b = req.body;
    const gq = b.gasQuality || {};
    const params = [
      id,
      b.name,
      b.location || b.address || '',
      b.longitude,
      b.latitude,
      b.supplyCapacity || b.supply_capacity || 0,
      b.currentOutput || b.current_output || 0,
      gq.methane || b.methane_content || 0,
      gq.calorificValue || b.calorific_value || 0,
      gq.sulfurContent || b.impurity_content || 0,
      gq.pressure || b.pressure || 0,
      b.status || 'normal',
    ];
    await query(`
      INSERT INTO gas_stations (
        id, name, location, longitude, latitude, supply_capacity,
        current_output, methane_content, calorific_value, impurity_content,
        pressure, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, params);

    const row = await queryOne('SELECT * FROM gas_stations WHERE id = ?', [id]);
    res.json({ success: true, data: transformStation(row), message: '门站创建成功' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const existing = await queryOne('SELECT * FROM gas_stations WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.json({ success: false, error: '门站不存在' });
    }

    const b = { ...existing, ...req.body };
    const gq = b.gasQuality || {};
    const params = [
      b.name,
      b.location || b.address || existing.location,
      b.longitude,
      b.latitude,
      b.supplyCapacity || b.supply_capacity || existing.supply_capacity,
      b.currentOutput || b.current_output || existing.current_output,
      gq.methane || b.methane_content || existing.methane_content,
      gq.calorificValue || b.calorific_value || existing.calorific_value,
      gq.sulfurContent || b.impurity_content || existing.impurity_content,
      gq.pressure || b.pressure || existing.pressure,
      b.status || existing.status,
      req.params.id
    ];
    await query(`
      UPDATE gas_stations SET
        name = ?, location = ?, longitude = ?, latitude = ?, supply_capacity = ?,
        current_output = ?, methane_content = ?, calorific_value = ?, impurity_content = ?,
        pressure = ?, status = ?, updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `, params);

    const row = await queryOne('SELECT * FROM gas_stations WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: transformStation(row), message: '门站更新成功' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM gas_stations WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.json({ success: false, error: '门站不存在' });
    }
    res.json({ success: true, message: '门站删除成功' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

module.exports = router;
