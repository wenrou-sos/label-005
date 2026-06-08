import { getDatabase } from '../config/database'

export function initializeDatabase(): void {
  const db = getDatabase()

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      real_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'property_manager',
      phone TEXT,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_code TEXT UNIQUE NOT NULL,
      device_name TEXT NOT NULL,
      device_type TEXT NOT NULL,
      floor TEXT NOT NULL,
      area TEXT,
      location TEXT,
      status TEXT DEFAULT 'normal',
      manufacturer TEXT,
      install_date TEXT,
      last_maintenance_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS repair_tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_no TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      urgency TEXT NOT NULL DEFAULT 'medium',
      device_id INTEGER,
      device_type TEXT NOT NULL,
      floor TEXT NOT NULL,
      area TEXT,
      location TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      reporter_id INTEGER NOT NULL,
      reporter_name TEXT NOT NULL,
      assignee_id INTEGER,
      assignee_name TEXT,
      process_note TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (device_id) REFERENCES devices(id),
      FOREIGN KEY (reporter_id) REFERENCES users(id),
      FOREIGN KEY (assignee_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS repair_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id INTEGER NOT NULL,
      operator_id INTEGER NOT NULL,
      operator_name TEXT NOT NULL,
      action TEXT NOT NULL,
      remark TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ticket_id) REFERENCES repair_tickets(id),
      FOREIGN KEY (operator_id) REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_tickets_status ON repair_tickets(status);
    CREATE INDEX IF NOT EXISTS idx_tickets_floor ON repair_tickets(floor);
    CREATE INDEX IF NOT EXISTS idx_tickets_device_type ON repair_tickets(device_type);
    CREATE INDEX IF NOT EXISTS idx_tickets_urgency ON repair_tickets(urgency);
    CREATE INDEX IF NOT EXISTS idx_records_ticket ON repair_records(ticket_id);
  `)

  seedInitialData()
}

function seedInitialData(): void {
  const db = getDatabase()

  const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count
  if (userCount === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (username, real_name, role, phone, email)
      VALUES (?, ?, ?, ?, ?)
    `)
    const users = [
      ['admin', '系统管理员', 'admin', '13800138000', 'admin@building.com'],
      ['manager01', '张经理', 'property_manager', '13800138001', 'zhang@building.com'],
      ['manager02', '李主管', 'property_manager', '13800138002', 'li@building.com'],
      ['tech01', '王工程师', 'technician', '13800138003', 'wang@building.com'],
      ['tech02', '赵师傅', 'technician', '13800138004', 'zhao@building.com']
    ]
    users.forEach((u) => insertUser.run(...u))
  }

  const deviceCount = (db.prepare('SELECT COUNT(*) as count FROM devices').get() as { count: number }).count
  if (deviceCount === 0) {
    const insertDevice = db.prepare(`
      INSERT INTO devices (device_code, device_name, device_type, floor, area, location, status, manufacturer, install_date, last_maintenance_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    const floors = ['1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F', '9F', '10F']
    const areas = ['东区', '西区', '南区', '北区', '中区']
    const deviceTypes: Array<{ type: string; name: string; manu: string }> = [
      { type: 'elevator', name: '乘客电梯', manu: '三菱电机' },
      { type: 'air_conditioning', name: '中央空调机组', manu: '大金空调' },
      { type: 'lighting', name: '照明系统', manu: '飞利浦照明' },
      { type: 'water_supply', name: '给排水设备', manu: '格兰富水泵' },
      { type: 'other', name: '消防报警设备', manu: '海湾消防' }
    ]

    let deviceCode = 1
    for (let i = 0; i < 50; i++) {
      const dt = deviceTypes[i % deviceTypes.length]
      const floor = floors[i % floors.length]
      const area = areas[i % areas.length]
      insertDevice.run(
        `DEV${String(deviceCode++).padStart(6, '0')}`,
        `${floor}-${area}-${dt.name}`,
        dt.type,
        floor,
        area,
        `${floor}层${area}${i % 3 + 1}号位置`,
        i % 7 === 0 ? 'faulty' : 'normal',
        dt.manu,
        `202${i % 3}-0${(i % 9) + 1}-15`,
        `2026-0${(i % 6) + 1}-10`
      )
    }
  }

  const ticketCount = (db.prepare('SELECT COUNT(*) as count FROM repair_tickets').get() as { count: number }).count
  if (ticketCount === 0) {
    const allDevices = db.prepare('SELECT * FROM devices').all() as Array<{
      id: number
      device_type: string
      floor: string
      area: string
      location: string
    }>
    const allUsers = db.prepare('SELECT * FROM users').all() as Array<{ id: number; real_name: string }>

    const insertTicket = db.prepare(`
      INSERT INTO repair_tickets (ticket_no, title, description, urgency, device_id, device_type, floor, area, location, status, reporter_id, reporter_name, assignee_id, assignee_name, process_note, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    const insertRecord = db.prepare(`
      INSERT INTO repair_records (ticket_id, operator_id, operator_name, action, remark)
      VALUES (?, ?, ?, ?, ?)
    `)

    const statuses = ['pending', 'processing', 'completed', 'closed']
    const urgencies = ['high', 'medium', 'low']
    const titles = [
      '电梯无法正常运行',
      '空调制冷效果差',
      '走廊灯不亮',
      '卫生间水管漏水',
      '消防报警器误报',
      '电梯门开关异响',
      '空调出风口有异味',
      '办公区灯光闪烁',
      '饮水机无法加热',
      '门禁系统故障'
    ]
    const descriptions = [
      '设备突然停止工作，需要紧急检修',
      '用户反映设备性能下降，需要检查',
      '设备出现异常噪音，建议排查',
      '例行检查发现异常，需要进一步确认',
      '设备使用年限较长，建议更换'
    ]
    const notes = [
      '已派人前往现场检查',
      '正在等待配件到货',
      '已完成维修，设备恢复正常',
      '需要协调外部供应商处理',
      '已与用户沟通，正在制定解决方案'
    ]

    for (let i = 1; i <= 150; i++) {
      const device = allDevices[i % allDevices.length]
      const reporter = allUsers[i % allUsers.length]
      const statusIdx = i % 4
      const status = statuses[statusIdx]
      const urgency = urgencies[i % 3]
      const assignee = status !== 'pending' ? allUsers[(i + 2) % allUsers.length] : null
      const completedAt = status === 'completed' || status === 'closed'
        ? `2026-0${(i % 6) + 1}-${String((i % 27) + 1).padStart(2, '0')} 15:${String((i % 59)).padStart(2, '0')}:00`
        : null
      const processNote = status !== 'pending' ? notes[i % notes.length] : ''

      const info = insertTicket.run(
        `WO${String(i).padStart(8, '0')}`,
        titles[i % titles.length],
        descriptions[i % descriptions.length],
        urgency,
        device.id,
        device.device_type,
        device.floor,
        device.area,
        device.location,
        status,
        reporter.id,
        reporter.real_name,
        assignee?.id ?? null,
        assignee?.real_name ?? null,
        processNote,
        completedAt
      )

      const ticketId = Number(info.lastInsertRowid)
      insertRecord.run(ticketId, reporter.id, reporter.real_name, 'create', '创建报修工单')
      if (assignee) {
        insertRecord.run(ticketId, assignee.id, assignee.real_name, 'assign', `指派给 ${assignee.real_name}`)
      }
      if (status === 'completed' || status === 'closed') {
        insertRecord.run(ticketId, assignee?.id ?? reporter.id, assignee?.real_name ?? reporter.real_name, 'complete', '维修完成')
      }
    }
  }
}
