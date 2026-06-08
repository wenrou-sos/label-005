import { describe, it, expect } from 'vitest'
import {
  getUrgencyLabel,
  getStatusLabel,
  getDeviceTypeLabel,
  URGENCY_OPTIONS,
  STATUS_OPTIONS,
  DEVICE_TYPE_OPTIONS
} from '@/types'

describe('Type helper functions', () => {
  describe('getUrgencyLabel', () => {
    it('returns 高 for high urgency', () => {
      expect(getUrgencyLabel('high')).toBe('高')
    })

    it('returns 中 for medium urgency', () => {
      expect(getUrgencyLabel('medium')).toBe('中')
    })

    it('returns 低 for low urgency', () => {
      expect(getUrgencyLabel('low')).toBe('低')
    })
  })

  describe('getStatusLabel', () => {
    it('returns correct labels for all statuses', () => {
      expect(getStatusLabel('pending')).toBe('待处理')
      expect(getStatusLabel('processing')).toBe('处理中')
      expect(getStatusLabel('completed')).toBe('已完成')
      expect(getStatusLabel('closed')).toBe('已关闭')
    })
  })

  describe('getDeviceTypeLabel', () => {
    it('returns correct labels for all device types', () => {
      expect(getDeviceTypeLabel('elevator')).toBe('电梯')
      expect(getDeviceTypeLabel('air_conditioning')).toBe('空调')
      expect(getDeviceTypeLabel('lighting')).toBe('照明')
      expect(getDeviceTypeLabel('water_supply')).toBe('给排水')
      expect(getDeviceTypeLabel('other')).toBe('其他设备')
    })
  })

  describe('Options arrays', () => {
    it('has correct urgency options count', () => {
      expect(URGENCY_OPTIONS.length).toBe(3)
    })

    it('has correct status options count', () => {
      expect(STATUS_OPTIONS.length).toBe(4)
    })

    it('has correct device type options count', () => {
      expect(DEVICE_TYPE_OPTIONS.length).toBe(5)
    })
  })
})
