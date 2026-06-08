import type { User, Device, RepairTicket, RepairRecord } from '../types'

export function transformUser(row: Record<string, unknown>): User {
  return {
    id: Number(row.id),
    username: String(row.username),
    realName: String(row.real_name),
    role: String(row.role),
    phone: String(row.phone ?? ''),
    email: String(row.email ?? ''),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  }
}

export function transformDevice(row: Record<string, unknown>): Device {
  return {
    id: Number(row.id),
    deviceCode: String(row.device_code),
    deviceName: String(row.device_name),
    deviceType: row.device_type as Device['deviceType'],
    floor: String(row.floor),
    area: String(row.area ?? ''),
    location: String(row.location ?? ''),
    status: row.status as Device['status'],
    manufacturer: String(row.manufacturer ?? ''),
    installDate: String(row.install_date ?? ''),
    lastMaintenanceDate: String(row.last_maintenance_date ?? ''),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  }
}

export function transformTicket(row: Record<string, unknown>): RepairTicket {
  return {
    id: Number(row.id),
    ticketNo: String(row.ticket_no),
    title: String(row.title),
    description: String(row.description ?? ''),
    urgency: row.urgency as RepairTicket['urgency'],
    deviceId: Number(row.device_id),
    deviceType: row.device_type as RepairTicket['deviceType'],
    floor: String(row.floor),
    area: String(row.area ?? ''),
    location: String(row.location ?? ''),
    status: row.status as RepairTicket['status'],
    reporterId: Number(row.reporter_id),
    reporterName: String(row.reporter_name),
    assigneeId: row.assignee_id ? Number(row.assignee_id) : null,
    assigneeName: row.assignee_name ? String(row.assignee_name) : null,
    processNote: String(row.process_note ?? ''),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    completedAt: row.completed_at ? String(row.completed_at) : null
  }
}

export function transformRecord(row: Record<string, unknown>): RepairRecord {
  return {
    id: Number(row.id),
    ticketId: Number(row.ticket_id),
    operatorId: Number(row.operator_id),
    operatorName: String(row.operator_name),
    action: String(row.action),
    remark: String(row.remark ?? ''),
    createdAt: String(row.created_at)
  }
}
