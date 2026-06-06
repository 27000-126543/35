const express = require('express');
const router = express.Router();
const { query, queryOne, getDb } = require('../db');
const { v4: uuidv4 } = require('uuid');
const { transformVehicle } = require('../utils/transforms');

router.get('/', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM repair_vehicles ORDER BY created_at DESC');
    res.json({ success: true, data: rows.map(transformVehicle) });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await queryOne('SELECT * FROM repair_vehicles WHERE id = ?', [req.params.id]);
    if (!row) {
      return res.json({ success: false, error: '车辆不存在' });
    }
    res.json({ success: true, data: transformVehicle(row) });
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
      b.plateNumber || b.plate_number,
      b.vehicleType || b.vehicle_type,
      b.longitude,
      b.latitude,
      b.status || 'idle',
      b.currentOrderId || b.current_order_id,
      b.driver,
      b.phone,
    ];
    await query(`
      INSERT INTO repair_vehicles (
        id, plate_number, vehicle_type, longitude, latitude,
        status, current_order_id, driver, phone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, params);

    const row = await queryOne('SELECT * FROM repair_vehicles WHERE id = ?', [id]);
    res.json({ success: true, data: transformVehicle(row), message: '车辆创建成功' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const existing = await queryOne('SELECT * FROM repair_vehicles WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.json({ success: false, error: '车辆不存在' });
    }

    const b = { ...existing, ...req.body };
    const params = [
      b.plateNumber || b.plate_number || existing.plate_number,
      b.vehicleType || b.vehicle_type || existing.vehicle_type,
      b.longitude,
      b.latitude,
      b.status || existing.status,
      b.currentOrderId || b.current_order_id || existing.current_order_id,
      b.driver,
      b.phone,
      req.params.id
    ];
    await query(`
      UPDATE repair_vehicles SET
        plate_number = ?, vehicle_type = ?, longitude = ?, latitude = ?,
        status = ?, current_order_id = ?, driver = ?, phone = ?
      WHERE id = ?
    `, params);

    const row = await queryOne('SELECT * FROM repair_vehicles WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: transformVehicle(row), message: '车辆更新成功' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM repair_vehicles WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.json({ success: false, error: '车辆不存在' });
    }
    res.json({ success: true, message: '车辆删除成功' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

module.exports = router;
