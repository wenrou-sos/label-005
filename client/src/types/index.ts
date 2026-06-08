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
  records?: RepairRecord[]
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

export interface TicketFilter {
  floor?: string
  deviceType?: DeviceType
  status?: TicketStatus
  urgency?: UrgencyLevel
  keyword?: string
  page?: number
  pageSize?: number
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
  operatorId?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export const URGENCY_OPTIONS: Array<{ value: UrgencyLevel; label: string; color: string }> = [
  { value: 'high', label: '高', color: 'red' },
  { value: 'medium', label: '中', color: 'orange' },
  { value: 'low', label: '低', color: 'green' }
]

export const STATUS_OPTIONS: Array<{ value: TicketStatus; label: string; color: string }> = [
  { value: 'pending', label: '待处理', color: 'default' },
  { value: 'processing', label: '处理中', color: 'blue' },
  { value: 'completed', label: '已完成', color: 'green' },
  { value: 'closed', label: '已关闭', color: 'gray' }
]

export const DEVICE_TYPE_OPTIONS: Array<{ value: DeviceType; label: string }> = [
  { value: 'elevator', label: '电梯' },
  { value: 'air_conditioning', label: '空调' },
  { value: 'lighting', label: '照明' },
  { value: 'water_supply', label: '给排水' },
  { value: 'other', label: '其他设备' }
]

export function getUrgencyLabel(value: UrgencyLevel): string {
  return URGENCY_OPTIONS.find((o) => o.value === value)?.label ?? value
}

export function getStatusLabel(value: TicketStatus): string {
  return STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value
}

export function getDeviceTypeLabel(value: DeviceType): string {
  return DEVICE_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value
}
