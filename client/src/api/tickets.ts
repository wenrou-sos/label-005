import { request } from './request'
import type {
  RepairTicket,
  TicketFilter,
  CreateTicketRequest,
  UpdateTicketRequest,
  PaginatedResponse,
  User,
  Device
} from '@/types'

export interface MetaData {
  floors: string[]
  users: User[]
  devices: Device[]
}

export function getTicketList(filter: TicketFilter) {
  return request<PaginatedResponse<RepairTicket>>({
    url: '/tickets',
    method: 'get',
    params: filter
  })
}

export function getTicketDetail(id: number) {
  return request<RepairTicket & { records: RepairTicket['records'] }>({
    url: `/tickets/${id}`,
    method: 'get'
  })
}

export function createTicket(data: CreateTicketRequest) {
  return request<RepairTicket>({
    url: '/tickets',
    method: 'post',
    data
  })
}

export function updateTicket(id: number, data: UpdateTicketRequest) {
  return request<RepairTicket>({
    url: `/tickets/${id}`,
    method: 'put',
    data
  })
}

export function deleteTicket(id: number) {
  return request<void>({
    url: `/tickets/${id}`,
    method: 'delete'
  })
}

export function getTicketMeta() {
  return request<MetaData>({
    url: '/tickets/meta',
    method: 'get'
  })
}

export interface StatusStat {
  status: string
  count: number
}

export interface DeviceTypeStat {
  deviceType: string
  count: number
}

export interface StatisticsData {
  total: number
  byStatus: StatusStat[]
  byDeviceType: DeviceTypeStat[]
}

export function getTicketStatistics() {
  return request<StatisticsData>({
    url: '/tickets/statistics/summary',
    method: 'get'
  })
}
