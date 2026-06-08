import { getDatabase } from '../config/database'
import type {
  RepairTicket,
  TicketFilter,
  CreateTicketRequest,
  UpdateTicketRequest,
  PaginatedResponse,
  User,
  Device
} from '../types'
import { transformTicket, transformRecord, transformUser, transformDevice } from '../utils/transform'

export function listTickets(filter: TicketFilter): PaginatedResponse<RepairTicket> {
  const db = getDatabase()
  const page = filter.page ?? 1
  const pageSize = filter.pageSize ?? 20
  const offset = (page - 1) * pageSize

  const whereClauses: string[] = []
  const params: unknown[] = []

  if (filter.floor) {
    whereClauses.push('floor = ?')
    params.push(filter.floor)
  }
  if (filter.deviceType) {
    whereClauses.push('device_type = ?')
    params.push(filter.deviceType)
  }
  if (filter.status) {
    whereClauses.push('status = ?')
    params.push(filter.status)
  }
  if (filter.urgency) {
    whereClauses.push('urgency = ?')
    params.push(filter.urgency)
  }
  if (filter.keyword) {
    whereClauses.push('(ticket_no LIKE ? OR title LIKE ? OR description LIKE ? OR process_note LIKE ?)')
    const keyword = `%${filter.keyword}%`
    params.push(keyword, keyword, keyword, keyword)
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''

  const countSql = `SELECT COUNT(*) as total FROM repair_tickets ${whereSql}`
  const total = Number((db.prepare(countSql).get(...params) as { total: number }).total)

  const dataSql = `
    SELECT * FROM repair_tickets ${whereSql}
    ORDER BY
      CASE urgency
        WHEN 'high' THEN 1
        WHEN 'medium' THEN 2
        WHEN 'low' THEN 3
      END,
      created_at DESC
    LIMIT ? OFFSET ?
  `
  const rows = db.prepare(dataSql).all(...params, pageSize, offset) as Array<Record<string, unknown>>
  const data = rows.map(transformTicket)

  return { data, total, page, pageSize }
}

export function getTicketById(id: number): RepairTicket | null {
  const db = getDatabase()
  const row = db.prepare('SELECT * FROM repair_tickets WHERE id = ?').get(id) as Record<string, unknown> | undefined
  return row ? transformTicket(row) : null
}

export function getTicketRecords(ticketId: number) {
  const db = getDatabase()
  const rows = db
    .prepare('SELECT * FROM repair_records WHERE ticket_id = ? ORDER BY created_at DESC')
    .all(ticketId) as Array<Record<string, unknown>>
  return rows.map(transformRecord)
}

export function createTicket(req: CreateTicketRequest): RepairTicket {
  const db = getDatabase()

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.reporterId) as Record<string, unknown> | undefined
  if (!user) {
    throw new Error('Reporter user not found')
  }

  const device = db.prepare('SELECT * FROM devices WHERE id = ?').get(req.deviceId) as Record<string, unknown> | undefined
  if (!device) {
    throw new Error('Device not found')
  }

  const countRow = db.prepare('SELECT COUNT(*) as count FROM repair_tickets').get() as { count: number }
  const ticketNo = `WO${String(countRow.count + 1).padStart(8, '0')}`

  const insertTicket = db.prepare(`
    INSERT INTO repair_tickets (ticket_no, title, description, urgency, device_id, device_type, floor, area, location, reporter_id, reporter_name)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const result = insertTicket.run(
    ticketNo,
    req.title,
    req.description,
    req.urgency,
    req.deviceId,
    device.device_type as string,
    device.floor as string,
    device.area as string ?? '',
    device.location as string ?? '',
    req.reporterId,
    user.real_name as string
  )

  const ticketId = Number(result.lastInsertRowid)
  const insertRecord = db.prepare(`
    INSERT INTO repair_records (ticket_id, operator_id, operator_name, action, remark)
    VALUES (?, ?, ?, ?, ?)
  `)
  insertRecord.run(ticketId, req.reporterId, user.real_name as string, 'create', '创建报修工单')

  const ticket = getTicketById(ticketId)
  if (!ticket) {
    throw new Error('Failed to create ticket')
  }
  return ticket
}

export function updateTicket(id: number, req: UpdateTicketRequest, operatorId: number): RepairTicket | null {
  const db = getDatabase()
  const existing = getTicketById(id)
  if (!existing) {
    return null
  }

  const operator = db.prepare('SELECT * FROM users WHERE id = ?').get(operatorId) as Record<string, unknown> | undefined
  if (!operator) {
    throw new Error('Operator user not found')
  }

  const updates: string[] = []
  const params: unknown[] = []
  const recordActions: Array<{ action: string; remark: string }> = []

  if (req.status !== undefined && req.status !== existing.status) {
    updates.push('status = ?')
    params.push(req.status)
    const statusLabels: Record<string, string> = {
      pending: '待处理',
      processing: '处理中',
      completed: '已完成',
      closed: '已关闭'
    }
    recordActions.push({ action: 'status', remark: `状态变更为：${statusLabels[req.status]}` })

    if (req.status === 'completed' && !existing.completedAt) {
      updates.push('completed_at = CURRENT_TIMESTAMP')
    }
  }

  if (req.assigneeId !== undefined) {
    if (req.assigneeId === null) {
      if (existing.assigneeId) {
        updates.push('assignee_id = NULL, assignee_name = NULL')
        recordActions.push({ action: 'unassign', remark: '取消责任人指派' })
      }
    } else if (req.assigneeId !== existing.assigneeId) {
      const assignee = db.prepare('SELECT * FROM users WHERE id = ?').get(req.assigneeId) as Record<string, unknown> | undefined
      if (assignee) {
        updates.push('assignee_id = ?, assignee_name = ?')
        params.push(req.assigneeId, assignee.real_name as string)
        recordActions.push({ action: 'assign', remark: `指派责任人：${assignee.real_name as string}` })
      }
    }
  }

  if (req.processNote !== undefined && req.processNote !== existing.processNote) {
    updates.push('process_note = ?')
    params.push(req.processNote)
    recordActions.push({ action: 'note', remark: `更新处理备注` })
  }

  if (updates.length === 0) {
    return existing
  }

  updates.push('updated_at = CURRENT_TIMESTAMP')
  params.push(id)

  db.prepare(`UPDATE repair_tickets SET ${updates.join(', ')} WHERE id = ?`).run(...params)

  const insertRecord = db.prepare(`
    INSERT INTO repair_records (ticket_id, operator_id, operator_name, action, remark)
    VALUES (?, ?, ?, ?, ?)
  `)
  recordActions.forEach((r) => {
    insertRecord.run(id, operatorId, operator.real_name as string, r.action, r.remark)
  })

  return getTicketById(id)
}

export function deleteTicket(id: number): boolean {
  const db = getDatabase()
  const transaction = db.transaction(() => {
    db.prepare('DELETE FROM repair_records WHERE ticket_id = ?').run(id)
    const result = db.prepare('DELETE FROM repair_tickets WHERE id = ?').run(id)
    return result.changes > 0
  })
  return transaction()
}

export function getDistinctFloors(): string[] {
  const db = getDatabase()
  const rows = db.prepare('SELECT DISTINCT floor FROM devices ORDER BY floor').all() as Array<{ floor: string }>
  return rows.map((r) => r.floor)
}

export function getAllUsers(): User[] {
  const db = getDatabase()
  const rows = db.prepare('SELECT * FROM users ORDER BY role, id').all() as Array<Record<string, unknown>>
  return rows.map(transformUser)
}

export function getAllDevices(): Device[] {
  const db = getDatabase()
  const rows = db.prepare('SELECT * FROM devices ORDER BY floor, device_code').all() as Array<Record<string, unknown>>
  return rows.map(transformDevice)
}
