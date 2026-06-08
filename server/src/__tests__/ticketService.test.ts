import {
  getUrgencyLabel,
  getStatusLabel,
  getDeviceTypeLabel,
  URGENCY_OPTIONS,
  STATUS_OPTIONS,
  DEVICE_TYPE_OPTIONS
} from '../types'

describe('Type helpers', () => {
  describe('getUrgencyLabel', () => {
    it('should return correct label for high urgency', () => {
      expect(getUrgencyLabel('high')).toBe('高')
    })

    it('should return correct label for medium urgency', () => {
      expect(getUrgencyLabel('medium')).toBe('中')
    })

    it('should return correct label for low urgency', () => {
      expect(getUrgencyLabel('low')).toBe('低')
    })

    it('should return the value itself if not found', () => {
      expect(getUrgencyLabel('unknown' as 'high')).toBe('unknown')
    })
  })

  describe('getStatusLabel', () => {
    it('should return correct label for pending status', () => {
      expect(getStatusLabel('pending')).toBe('待处理')
    })

    it('should return correct label for processing status', () => {
      expect(getStatusLabel('processing')).toBe('处理中')
    })

    it('should return correct label for completed status', () => {
      expect(getStatusLabel('completed')).toBe('已完成')
    })

    it('should return correct label for closed status', () => {
      expect(getStatusLabel('closed')).toBe('已关闭')
    })
  })

  describe('getDeviceTypeLabel', () => {
    it('should return correct label for elevator', () => {
      expect(getDeviceTypeLabel('elevator')).toBe('电梯')
    })

    it('should return correct label for air_conditioning', () => {
      expect(getDeviceTypeLabel('air_conditioning')).toBe('空调')
    })

    it('should return correct label for lighting', () => {
      expect(getDeviceTypeLabel('lighting')).toBe('照明')
    })

    it('should return correct label for water_supply', () => {
      expect(getDeviceTypeLabel('water_supply')).toBe('给排水')
    })

    it('should return correct label for other', () => {
      expect(getDeviceTypeLabel('other')).toBe('其他设备')
    })
  })

  describe('Options arrays', () => {
    it('should have 3 urgency options', () => {
      expect(URGENCY_OPTIONS).toHaveLength(3)
    })

    it('should have 4 status options', () => {
      expect(STATUS_OPTIONS).toHaveLength(4)
    })

    it('should have 5 device type options', () => {
      expect(DEVICE_TYPE_OPTIONS).toHaveLength(5)
    })
  })
})
