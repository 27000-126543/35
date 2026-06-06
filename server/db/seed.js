const { getDb, save } = require('./index');
const { v4: uuidv4 } = require('uuid');

function toNull(v) {
  return v === undefined ? null : v;
}

async function seedAll() {
  const db = await getDb();

  const stations = [
    { id: 'station_1', name: '东门气源门站', location: '东城区燃气大道88号', longitude: 116.42, latitude: 39.92, supply_capacity: 150, current_output: 128, methane_content: 96.5, calorific_value: 36.2, impurity_content: 0.8, pressure: 2.5, status: 'normal' },
    { id: 'station_2', name: '西门气源门站', location: '西城区工业路256号', longitude: 116.30, latitude: 39.93, supply_capacity: 180, current_output: 165, methane_content: 97.2, calorific_value: 35.8, impurity_content: 0.6, pressure: 2.8, status: 'normal' },
    { id: 'station_3', name: '南门气源门站', location: '南城区能源路66号', longitude: 116.35, latitude: 39.85, supply_capacity: 120, current_output: 95, methane_content: 95.8, calorific_value: 36.5, impurity_content: 1.2, pressure: 2.3, status: 'normal' },
    { id: 'station_4', name: '北门气源门站', location: '北城区环北路102号', longitude: 116.36, latitude: 40.00, supply_capacity: 200, current_output: 182, methane_content: 97.0, calorific_value: 36.0, impurity_content: 0.7, pressure: 2.6, status: 'normal' },
  ];

  db.exec('BEGIN');
  try {
    const insStation = db.prepare(`INSERT OR IGNORE INTO gas_stations (id, name, location, longitude, latitude, supply_capacity, current_output, methane_content, calorific_value, impurity_content, pressure, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const s of stations) {
      insStation.run([s.id, s.name, s.location, s.longitude, s.latitude, s.supply_capacity, s.current_output, s.methane_content, s.calorific_value, s.impurity_content, s.pressure, s.status]);
    }
    insStation.free();

    const nodes = [
      { id: 'east_reg_main', name: '东区主调压站', type: 'regulator', location: '东城区建国门外大街1号', longitude: 116.45, latitude: 39.91, pipe_diameter: 500, design_pressure: 1.6, current_pressure: 1.52, status: 'normal', connected: JSON.stringify(['east_reg_1', 'changan_v']) },
      { id: 'west_reg', name: '西区调压站', type: 'regulator', location: '西城区金融街15号', longitude: 116.36, latitude: 39.92, pipe_diameter: 400, design_pressure: 1.6, current_pressure: 1.58, status: 'normal', connected: JSON.stringify(['west_reg_1', 'west_zhimen_v']) },
      { id: 'south_reg', name: '南区调压站', type: 'regulator', location: '南城区永定门外大街88号', longitude: 116.40, latitude: 39.86, pipe_diameter: 450, design_pressure: 1.6, current_pressure: 1.45, status: 'normal', connected: JSON.stringify(['third_ring_v', 'changan_v']) },
      { id: 'north_reg', name: '北区调压站', type: 'regulator', location: '北城区亚运村路20号', longitude: 116.39, latitude: 39.99, pipe_diameter: 500, design_pressure: 1.6, current_pressure: 1.62, status: 'high_pressure', connected: JSON.stringify(['north_gate_v', 'second_ring_v']) },
      { id: 'center_reg', name: '中心调压站', type: 'regulator', location: '市中心王府井大街58号', longitude: 116.41, latitude: 39.92, pipe_diameter: 600, design_pressure: 1.6, current_pressure: 1.55, status: 'normal', connected: JSON.stringify(['changan_v', 'second_ring_v']) },
      { id: 'east_reg_1', name: '东区1号调压站', type: 'regulator', location: '东三环北路45号', longitude: 116.47, latitude: 39.94, pipe_diameter: 300, design_pressure: 0.8, current_pressure: 0.72, status: 'normal', connected: JSON.stringify(['east_reg_main']) },
      { id: 'west_reg_1', name: '西区1号调压站', type: 'regulator', location: '西三环中路100号', longitude: 116.31, latitude: 39.90, pipe_diameter: 300, design_pressure: 0.8, current_pressure: 0.58, status: 'low_pressure', connected: JSON.stringify(['west_reg']) },
      { id: 'changan_v', name: '长安街阀门', type: 'valve', location: '长安街沿线', longitude: 116.40, latitude: 39.91, pipe_diameter: 400, design_pressure: 1.6, current_pressure: 1.50, status: 'normal', connected: JSON.stringify(['center_reg', 'east_reg_main', 'south_reg']) },
      { id: 'second_ring_v', name: '二环线阀门', type: 'valve', location: '二环路管网节点', longitude: 116.43, latitude: 39.95, pipe_diameter: 350, design_pressure: 1.6, current_pressure: 1.48, status: 'normal', connected: JSON.stringify(['center_reg', 'north_reg']) },
      { id: 'third_ring_v', name: '三环线阀门', type: 'valve', location: '三环路管网节点', longitude: 116.46, latitude: 39.88, pipe_diameter: 300, design_pressure: 1.6, current_pressure: 1.42, status: 'normal', connected: JSON.stringify(['south_reg']) },
      { id: 'west_zhimen_v', name: '西直门阀门', type: 'valve', location: '西直门交通枢纽', longitude: 116.35, latitude: 39.94, pipe_diameter: 350, design_pressure: 1.6, current_pressure: 1.35, status: 'leak', connected: JSON.stringify(['west_reg']) },
      { id: 'north_gate_v', name: '北辰阀门', type: 'valve', location: '北辰东路32号', longitude: 116.39, latitude: 40.00, pipe_diameter: 300, design_pressure: 0.8, current_pressure: 1.05, status: 'repair', connected: JSON.stringify(['north_reg']) },
    ];
    const insNode = db.prepare(`INSERT OR IGNORE INTO pipeline_nodes (id, name, type, location, longitude, latitude, pipe_diameter, design_pressure, current_pressure, status, connected_nodes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const n of nodes) {
      insNode.run([n.id, n.name, n.type, n.location, n.longitude, n.latitude, n.pipe_diameter, n.design_pressure, n.current_pressure, n.status, n.connected]);
    }
    insNode.free();

    const customers = [
      { id: 'cust_1', name: '京城钢铁集团', type: 'industrial', address: '东城区工业园区1号', region: '东城区', contact_person: '张经理', phone: '13900000001', daily_gas_volume: 85000, gas_percentage: 28.3 },
      { id: 'cust_2', name: '北方化工有限公司', type: 'industrial', address: '西城区化工路50号', region: '西城区', contact_person: '李主任', phone: '13900000002', daily_gas_volume: 62000, gas_percentage: 20.7 },
      { id: 'cust_3', name: '热电一厂', type: 'industrial', address: '南城区发电厂路10号', region: '南城区', contact_person: '王厂长', phone: '13900000003', daily_gas_volume: 98000, gas_percentage: 32.7 },
      { id: 'cust_4', name: '东城大型购物中心', type: 'commercial', address: '东城区王府井大街1号', region: '东城区', contact_person: '赵主管', phone: '13900000004', daily_gas_volume: 8500, gas_percentage: 2.8 },
      { id: 'cust_5', name: '西城商业广场', type: 'commercial', address: '西城区西单北大街25号', region: '西城区', contact_person: '钱经理', phone: '13900000005', daily_gas_volume: 12000, gas_percentage: 4.0 },
      { id: 'cust_6', name: '朝阳CBD餐饮区', type: 'commercial', address: '朝阳区国贸商圈', region: '朝阳区', contact_person: '孙店长', phone: '13900000006', daily_gas_volume: 15000, gas_percentage: 5.0 },
      { id: 'cust_7', name: '南城酒店集群', type: 'commercial', address: '南城区前门大街', region: '南城区', contact_person: '周总监', phone: '13900000007', daily_gas_volume: 9500, gas_percentage: 3.2 },
      { id: 'cust_8', name: '东城幸福里小区', type: 'residential', address: '东城区幸福大街100号', region: '东城区', contact_person: '物业吴主任', phone: '13900000008', daily_gas_volume: 6500, gas_percentage: 2.2 },
      { id: 'cust_9', name: '西城阳光花园', type: 'residential', address: '西城区三里河路50号', region: '西城区', contact_person: '物业郑经理', phone: '13900000009', daily_gas_volume: 7800, gas_percentage: 2.6 },
      { id: 'cust_10', name: '北城亚运村社区', type: 'residential', address: '北城区亚运村街道', region: '北城区', contact_person: '物业冯主任', phone: '13900000010', daily_gas_volume: 9200, gas_percentage: 3.1 },
      { id: 'cust_11', name: '南城永定门社区', type: 'residential', address: '南城区永定门外', region: '南城区', contact_person: '物业陈主管', phone: '13900000011', daily_gas_volume: 5400, gas_percentage: 1.8 },
      { id: 'cust_12', name: '中心区东四小区', type: 'residential', address: '市中心东四北大街', region: '中心区', contact_person: '物业褚经理', phone: '13900000012', daily_gas_volume: 4800, gas_percentage: 1.6 },
    ];
    const insCust = db.prepare(`INSERT OR IGNORE INTO customers (id, name, type, address, region, contact_person, phone, daily_gas_volume, gas_percentage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const c of customers) {
      insCust.run([c.id, c.name, c.type, c.address, c.region, c.contact_person, c.phone, c.daily_gas_volume, c.gas_percentage]);
    }
    insCust.free();

    const teams = [
      { id: 'team_1', name: '抢修一班', leader: '刘强', phone: '13700000001', members: JSON.stringify(['刘强', '张三', '李四']), equipment: JSON.stringify(['电焊机', '切割机', '气体检测仪', '防爆工具套装']), status: 'idle', region: '东城区', current_order_id: null },
      { id: 'team_2', name: '抢修二班', leader: '王强', phone: '13700000002', members: JSON.stringify(['王强', '王五', '赵六']), equipment: JSON.stringify(['抢修工程车', '气体检测仪', '管道堵漏工具']), status: 'working', region: '西城区', current_order_id: 'ro_1' },
      { id: 'team_3', name: '抢修三班', leader: '李刚', phone: '13700000003', members: JSON.stringify(['李刚', '孙七', '周八']), equipment: JSON.stringify(['大型抢修设备', '液压工具', '检测仪器']), status: 'idle', region: '南城区', current_order_id: null },
    ];
    const insTeam = db.prepare(`INSERT OR IGNORE INTO repair_teams (id, name, leader, phone, members, equipment, status, region, current_order_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const t of teams) {
      insTeam.run([t.id, t.name, t.leader, t.phone, t.members, t.equipment, t.status, t.region, toNull(t.current_order_id)]);
    }
    insTeam.free();

    const vehicles = [
      { id: 'v_1', plate_number: '京A·GAS01', vehicle_type: '抢修工程车', longitude: 116.41, latitude: 39.92, status: 'idle', current_order_id: null, driver: '陈师傅', phone: '13600000001' },
      { id: 'v_2', plate_number: '京A·GAS02', vehicle_type: '检测车', longitude: 116.35, latitude: 39.94, status: 'repairing', current_order_id: 'ro_1', driver: '褚师傅', phone: '13600000002' },
      { id: 'v_3', plate_number: '京A·GAS03', vehicle_type: '抢修指挥车', longitude: 116.46, latitude: 39.88, status: 'dispatched', current_order_id: null, driver: '卫师傅', phone: '13600000003' },
    ];
    const insVehicle = db.prepare(`INSERT OR IGNORE INTO repair_vehicles (id, plate_number, vehicle_type, longitude, latitude, status, current_order_id, driver, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const v of vehicles) {
      insVehicle.run([v.id, v.plate_number, v.vehicle_type, v.longitude, v.latitude, v.status, toNull(v.current_order_id), v.driver, v.phone]);
    }
    insVehicle.free();

    const workers = [
      { id: 'worker_1', name: '蒋维修', phone: '13500000001', region: '东城区', status: 'idle', current_ticket_id: null, skills: JSON.stringify(['户内维修', '燃气表更换', '检漏']) },
      { id: 'worker_2', name: '沈维修', phone: '13500000002', region: '西城区', status: 'working', current_ticket_id: 'rt_4', skills: JSON.stringify(['户内维修', '调压设备维护']) },
      { id: 'worker_3', name: '韩维修', phone: '13500000003', region: '南城区', status: 'idle', current_ticket_id: null, skills: JSON.stringify(['户内维修', '管道维修', '检漏']) },
      { id: 'worker_4', name: '杨维修', phone: '13500000004', region: '北城区', status: 'idle', current_ticket_id: null, skills: JSON.stringify(['户内维修', '燃气表更换']) },
      { id: 'worker_5', name: '朱维修', phone: '13500000005', region: '中心区', status: 'working', current_ticket_id: 'rt_3', skills: JSON.stringify(['户内维修', '商业用户维修', '检漏']) },
    ];
    const insWorker = db.prepare(`INSERT OR IGNORE INTO maintenance_workers (id, name, phone, region, status, current_ticket_id, skills) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    for (const w of workers) {
      insWorker.run([w.id, w.name, w.phone, w.region, w.status, toNull(w.current_ticket_id), w.skills]);
    }
    insWorker.free();

    const alarms = [
      { id: 'alarm_1', node_id: 'west_zhimen_v', node_name: '西直门阀门', type: 'leak', level: 'critical', description: '检测到管道泄漏，浓度超过安全阈值', status: 'acknowledged', triggered_at: '2026-06-06 10:20:30', acknowledged_at: '2026-06-06 10:22:15', resolved_at: null, acknowledged_by: null, resolved_by: null, resolution_notes: null },
      { id: 'alarm_2', node_id: 'west_reg_1', node_name: '西区1号调压站', type: 'pressure_low', level: 'warning', description: '出口压力低于设定值，可能影响下游供气', status: 'pending', triggered_at: '2026-06-06 10:15:42', acknowledged_at: null, resolved_at: null, acknowledged_by: null, resolved_by: null, resolution_notes: null },
      { id: 'alarm_3', node_id: 'north_reg', node_name: '北区调压站', type: 'pressure_high', level: 'warning', description: '压力超过上限，已自动触发调压站切换', status: 'acknowledged', triggered_at: '2026-06-06 10:28:50', acknowledged_at: '2026-06-06 10:30:00', resolved_at: null, acknowledged_by: null, resolved_by: null, resolution_notes: null },
      { id: 'alarm_4', node_id: 'north_gate_v', node_name: '北辰阀门', type: 'equipment_fault', level: 'info', description: '阀门电动执行机构自检异常', status: 'resolved', triggered_at: '2026-06-06 09:45:10', acknowledged_at: null, resolved_at: '2026-06-06 10:10:20', acknowledged_by: null, resolved_by: null, resolution_notes: '已更换故障执行机构模块' },
    ];
    const insAlarm = db.prepare(`INSERT OR IGNORE INTO emergency_alarms (id, node_id, node_name, type, level, description, status, triggered_at, acknowledged_at, resolved_at, acknowledged_by, resolved_by, resolution_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const a of alarms) {
      insAlarm.run([a.id, a.node_id, a.node_name, a.type, a.level, a.description, a.status, a.triggered_at, toNull(a.acknowledged_at), toNull(a.resolved_at), toNull(a.acknowledged_by), toNull(a.resolved_by), toNull(a.resolution_notes)]);
    }
    insAlarm.free();

    const orders = [
      { id: 'ro_1', alarm_id: 'alarm_1', node_id: 'west_zhimen_v', node_name: '西直门阀门', description: 'DN350管线泄漏应急抢修', status: 'repairing', priority: 'critical', dispatched_at: '2026-06-06 10:25:00', arrived_at: '2026-06-06 10:42:00', started_at: '2026-06-06 10:50:00', completed_at: null, duration_minutes: 0, equipment_used: JSON.stringify(['电焊机', '堵漏夹具', '气体检测仪']), repair_notes: null, team_id: 'team_2' },
      { id: 'ro_2', alarm_id: null, node_id: 'north_gate_v', node_name: '北辰阀门', description: '阀门执行机构故障维修', status: 'completed', priority: 'medium', dispatched_at: '2026-06-06 09:50:00', arrived_at: '2026-06-06 10:05:00', started_at: '2026-06-06 10:12:00', completed_at: '2026-06-06 10:40:00', duration_minutes: 28, repair_notes: '已更换故障执行机构模块，阀门恢复正常', equipment_used: JSON.stringify(['工具箱', '备件']), team_id: null },
    ];
    const insOrder = db.prepare(`INSERT OR IGNORE INTO repair_orders (id, alarm_id, node_id, node_name, description, status, priority, dispatched_at, arrived_at, started_at, completed_at, duration_minutes, repair_notes, equipment_used, team_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const o of orders) {
      insOrder.run([o.id, toNull(o.alarm_id), o.node_id, o.node_name, o.description, o.status, o.priority, o.dispatched_at, o.arrived_at, o.started_at, toNull(o.completed_at), o.duration_minutes, toNull(o.repair_notes), o.equipment_used, toNull(o.team_id)]);
    }
    insOrder.free();

    const tickets = [
      { id: 'rt_1', customer_id: null, customer_name: '东城幸福里小区-3栋205', customer_type: 'residential', address: '东城区幸福大街100号3栋205', phone: '13800000101', description: '燃气灶点不着火，疑似燃气表故障', fault_type: 'appliance', status: 'pending', worker_id: null, dispatched_at: null, completed_at: null, result: null, created_by: null },
      { id: 'rt_2', customer_id: null, customer_name: '东城购物中心-美食广场', customer_type: 'commercial', address: '东城区王府井大街1号B1层', phone: '13800000102', description: '厨房有燃气异味，请求上门检测', fault_type: 'leak', status: 'dispatched', worker_id: 'worker_1', dispatched_at: '2026-06-06 10:05:00', completed_at: null, result: null, created_by: null },
      { id: 'rt_3', customer_id: null, customer_name: '京城钢铁集团-后勤', customer_type: 'industrial', address: '东城区工业园区1号办公楼', phone: '13800000103', description: '职工宿舍燃气压力不足', fault_type: 'pressure', status: 'completed', worker_id: 'worker_5', dispatched_at: '2026-06-06 08:30:00', completed_at: '2026-06-06 09:45:00', result: '已清理过滤网，压力恢复正常', created_by: null },
      { id: 'rt_4', customer_id: null, customer_name: '西城阳光花园-5栋601', customer_type: 'residential', address: '西城区三里河路50号5栋601', phone: '13800000104', description: '燃气表显示异常，读数不准', fault_type: 'meter', status: 'completed', worker_id: 'worker_2', dispatched_at: '2026-06-06 09:00:00', completed_at: '2026-06-06 10:20:00', result: '已更换燃气表电池，读数恢复正常', created_by: null },
    ];
    const insTicket = db.prepare(`INSERT OR IGNORE INTO repair_tickets (id, customer_id, customer_name, customer_type, address, phone, description, fault_type, status, worker_id, dispatched_at, completed_at, result, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const t of tickets) {
      insTicket.run([t.id, toNull(t.customer_id), t.customer_name, t.customer_type, t.address, t.phone, t.description, t.fault_type, t.status, toNull(t.worker_id), toNull(t.dispatched_at), toNull(t.completed_at), toNull(t.result), toNull(t.created_by)]);
    }
    insTicket.free();

    const today = new Date().toISOString().split('T')[0];
    const plans = [
      {
        id: 'plan_1', plan_date: today, total_supply: 570, weather_forecast: '晴，温度22~30℃', is_holiday: 0,
        status: 'pending', storage_usage: 25, pressure_balance_score: 92,
        station_allocations: JSON.stringify([
          { station_id: 'station_1', station_name: '东门气源门站', planned_output: 135, actual_output: 128 },
          { station_id: 'station_2', station_name: '西门气源门站', planned_output: 168, actual_output: 165 },
          { station_id: 'station_3', station_name: '南门气源门站', planned_output: 105, actual_output: 95 },
          { station_id: 'station_4', station_name: '北门气源门站', planned_output: 185, actual_output: 182 },
        ]),
        node_pressure_targets: JSON.stringify([
          { node_id: 'east_reg_main', node_name: '东区主调压站', target_pressure: 1.55 },
          { node_id: 'west_reg', node_name: '西区调压站', target_pressure: 1.55 },
          { node_id: 'south_reg', node_name: '南区调压站', target_pressure: 1.50 },
          { node_id: 'north_reg', node_name: '北区调压站', target_pressure: 1.55 },
          { node_id: 'center_reg', node_name: '中心调压站', target_pressure: 1.58 },
        ]),
        adjust_reason: null, approver_id: null, approved_at: null, created_by: 'dispatcher_1',
      },
    ];
    const insPlan = db.prepare(`INSERT OR IGNORE INTO dispatch_plans (id, plan_date, total_supply, weather_forecast, is_holiday, status, storage_usage, pressure_balance_score, station_allocations, node_pressure_targets, adjust_reason, approver_id, approved_at, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const p of plans) {
      insPlan.run([p.id, p.plan_date, p.total_supply, p.weather_forecast, p.is_holiday, p.status, p.storage_usage, p.pressure_balance_score, p.station_allocations, p.node_pressure_targets, toNull(p.adjust_reason), toNull(p.approver_id), toNull(p.approved_at), toNull(p.created_by)]);
    }
    insPlan.free();

    const records = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const date = d.toISOString().split('T')[0];
      const base = [130, 165, 100, 180];
      ['station_1', 'station_2', 'station_3', 'station_4'].forEach((sid, idx) => {
        records.push({ id: uuidv4(), record_date: date, station_id: sid, gas_supply: Math.round(base[idx] * (0.95 + Math.random() * 0.15) * 10) / 10 });
      });
    }
    const insRecord = db.prepare(`INSERT OR IGNORE INTO daily_gas_records (id, record_date, station_id, gas_supply) VALUES (?, ?, ?, ?)`);
    for (const r of records) {
      insRecord.run([r.id, r.record_date, r.station_id, r.gas_supply]);
    }
    insRecord.free();

    db.exec('COMMIT');
    save();
    console.log('✅ 所有种子数据插入成功');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

module.exports = { seedAll };
