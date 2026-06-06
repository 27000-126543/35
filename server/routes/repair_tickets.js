const express = require('express');
const router = express.Router();
const { query, queryOne, getDb } = require('../db');
const { v4: uuidv4 } = require('uuid');
const { transformTicket } = require('../utils/transforms');

router.get('/', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM repair_tickets ORDER BY created_at DESC');
    res.json({ success: true, data: rows.map(transformTicket) });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await queryOne('SELECT * FROM repair_tickets WHERE id = ?', [req.params.id]);
    if (!row) {
      return res.json({ success: false, error: '报修工单不存在' });
    }
    res.json({ success: true, data: transformTicket(row) });
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
      b.customerId || b.customer_id,
      b.customerName || b.customer_name,
      b.customerType || b.customer_type,
      b.address,
      b.phone,
      b.description,
      b.faultType || b.fault_type,
      b.status || 'pending',
      b.createdBy || b.created_by,
    ];
    await query(`
      INSERT INTO repair_tickets (
        id, customer_id, customer_name, customer_type, address, phone,
        description, fault_type, status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, params);

    const row = await queryOne('SELECT * FROM repair_tickets WHERE id = ?', [id]);
    res.json({ success: true, data: transformTicket(row), message: '报修工单创建成功' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.put('/:id/dispatch', async (req, res) => {
  try {
    const b = req.body;
    const workerId = b.workerId || b.worker_id;
    const existing = await queryOne('SELECT * FROM repair_tickets WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.json({ success: false, error: '报修工单不存在' });
    }

    await query(`
      UPDATE repair_tickets SET
        status = 'dispatched',
        worker_id = ?,
        dispatched_at = datetime('now', 'localtime'),
        updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `, [workerId, req.params.id]);

    await query(`
      UPDATE maintenance_workers SET status = 'busy', current_ticket_id = ? WHERE id = ?
    `, [req.params.id, workerId]);

    const row = await queryOne('SELECT * FROM repair_tickets WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: transformTicket(row), message: '派单成功' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.put('/:id/complete', async (req, res) => {
  try {
    const b = req.body;
    const result = b.result;
    const existing = await queryOne('SELECT * FROM repair_tickets WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.json({ success: false, error: '报修工单不存在' });
    }

    await query(`
      UPDATE repair_tickets SET
        status = 'completed',
        result = ?,
        completed_at = datetime('now', 'localtime'),
        updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `, [result, req.params.id]);

    if (existing.worker_id) {
      await query(`
        UPDATE maintenance_workers SET status = 'idle', current_ticket_id = NULL WHERE id = ?
      `, [existing.worker_id]);
    }

    const row = await queryOne('SELECT * FROM repair_tickets WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: transformTicket(row), message: '工单已完成' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM repair_tickets WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.json({ success: false, error: '报修工单不存在' });
    }
    res.json({ success: true, message: '报修工单删除成功' });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

module.exports = router;
