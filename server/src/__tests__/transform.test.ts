import {
  transformUser,
  transformDevice,
  transformTicket,
  transformRecord
} from '../utils/transform'
import type { User, Device, RepairTicket, RepairRecord } from '../types'

describe('Transform functions', () => {
  describe('transformUser', () => {
    it('should transform snake_case row to camelCase User', () => {
      const row = {
        id: 1,
        username: 'admin',
        real_name: '系统管理员',
        role: 'admin',
        phone: '13800138000',
        email: 'admin@test.com',
        created_at: '2026-01-01 00:00:00',
        updated_at: '2026-01-01 00:00:00'
      }
      const result = transformUser(row)
      expect(result).toMatchObject<User>({
        id: 1,
        username: 'admin',
        realName: '系统管理员',
        role: 'admin',
        phone: '13800138000',
        email: 'admin@test.com',
        createdAt: '2026-01-01 00:00:00',
        updatedAt: '2026-01-01 00:00:00'
      })
    })

    it('should handle null phone and email gracefully', () => {
      const row = {
        id: 2,
        username: 'test',
        real_name: '测试',
        role: 'user',
        phone: null,
        email: null,
        created_at: '2026-01-01',
        updated_at: '2026-01-01'
      }
      const result = transformUser(row)
      expect(result.phone).toBe('')
      expect(result.email).toBe('')
    })
  })

  describe('transformDevice', () => {
    it('should transform snake_case row to camelCase Device', () => {
      const row = {
        id: 1,
        device_code: 'DEV000001',
        device_name: '电梯1号',
        device_type: 'elevator',
        floor: '1F',
        area: '东区',
        location: '1号位置',
        status: 'normal',
        manufacturer: '三菱',
        install_date: '2023-01-01',
        last_maintenance_date: '2026-01-01',
        created_at: '2026-01-01',
        updated_at: '2026-01-01'
      }
      const result = transformDevice(row)
      expect(result.deviceCode).toBe('DEV000001')
      expect(result.deviceName).toBe('电梯1号')
      expect(result.deviceType).toBe('elevator')
      expect(result.lastMaintenanceDate).toBe('2026-01-01')
    })
  })

  describe('transformTicket', () => {
    it('should transform snake_case row to camelCase RepairTicket', () => {
      const row = {
        id: 1,
        ticket_no: 'WO00000001',
        title: '电梯故障',
        description: '电梯无法运行',
        urgency: 'high',
        device_id: 1,
        device_type: 'elevator',
        floor: '1F',
        area: '东区',
        location: '1号',
        status: 'processing',
        reporter_id: 1,
        reporter_name: '管理员',
        assignee_id: 2,
        assignee_name: '工程师',
        process_note: '正在处理',
        created_at: '2026-01-01',
        updated_at: '2026-01-01',
        completed_at: null
      }
      const result = transformTicket(row)
      expect(result.ticketNo).toBe('WO00000001')
      expect(result.reporterName).toBe('管理员')
      expect(result.assigneeId).toBe(2)
      expect(result.assigneeName).toBe('工程师')
      expect(result.processNote).toBe('正在处理')
      expect(result.completedAt).toBeNull()
    })

    it('should handle null assignee', () => {
      const row = {
        id: 1,
        ticket_no: 'WO00000001',
        title: '测试',
        description: '',
        urgency: 'low',
        device_id: 1,
        device_type: 'lighting',
        floor: '1F',
        area: '',
        location: '',
        status: 'pending',
        reporter_id: 1,
        reporter_name: '测试',
        assignee_id: null,
        assignee_name: null,
        process_note: '',
        created_at: '',
        updated_at: '',
        completed_at: null
      }
      const result = transformTicket(row)
      expect(result.assigneeId).toBeNull()
      expect(result.assigneeName).toBeNull()
    })
  })

  describe('transformRecord', () => {
    it('should transform snake_case row to camelCase RepairRecord', () => {
      const row = {
        id: 1,
        ticket_id: 10,
        operator_id: 1,
        operator_name: '管理员',
        action: 'create',
        remark: '创建工单',
        created_at: '2026-01-01 12:00:00'
      }
      const result = transformRecord(row)
      expect(result.ticketId).toBe(10)
      expect(result.operatorId).toBe(1)
      expect(result.operatorName).toBe('管理员')
      expect(result.createdAt).toBe('2026-01-01 12:00:00')
    })
  })
})
