export type UrgencyLevel = 'high' | 'medium' | 'low'

export type TicketStatus = 'pending' | 'processing' | 'completed' | 'closed'

export type DeviceType = 'elevator' | 'air_conditioning' | 'lighting' | 'water_supply' | 'other'

export interface User {
  id: number
  username: string
  realName: string
  role: string
  phone: string
  email: string
  createdAt: string
  updatedAt: string
}

export interface Device {
  id: number
  deviceCode: string
  deviceName: string
  deviceType: DeviceType
  floor: string
  area: string
  location: string
  status: 'normal' | 'faulty' | 'maintenance'
  manufacturer: string
  installDate: string
  lastMaintenanceDate: string
  createdAt: string
  updatedAt: string
}

export interface RepairTicket {
  id: number
  ticketNo: string
  title: string
  description: string
  urgency: UrgencyLevel
  deviceId: number
  deviceType: DeviceType
  floor: string
  area: string
  location: string
  status: TicketStatus
  reporterId: number
  reporterName: string
  assigneeId: number | null
  assigneeName: string | null
  processNote: string
  createdAt: string
  updatedAt: string
  completedAt: string | null
}

export interface RepairRecord {
  id: number
  ticketId: number
  operatorId: number
  operatorName: string
  action: string
  remark: string
  createdAt: string
}

export interface CreateTicketRequest {
  title: string
  description: string
  urgency: UrgencyLevel
  deviceId: number
  reporterId: number
}

export interface UpdateTicketRequest {
  status?: TicketStatus
  assigneeId?: number | null
  processNote?: string
}

export interface TicketFilter {
  floor?: string
  deviceType?: DeviceType
  status?: TicketStatus
  urgency?: UrgencyLevel
  keyword?: string
  page?: number
  pageSize?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
