import { Router, type Request, type Response } from 'express'
import {
  listTickets,
  getTicketById,
  getTicketRecords,
  createTicket,
  updateTicket,
  deleteTicket,
  getDistinctFloors,
  getAllUsers,
  getAllDevices,
  getStatistics
} from '../services/ticketService'
import type { TicketFilter, CreateTicketRequest, UpdateTicketRequest } from '../types'

const router = Router()

router.get('/', (req: Request, res: Response) => {
  try {
    const filter: TicketFilter = {
      floor: req.query.floor as string | undefined,
      deviceType: req.query.deviceType as TicketFilter['deviceType'],
      status: req.query.status as TicketFilter['status'],
      urgency: req.query.urgency as TicketFilter['urgency'],
      keyword: req.query.keyword as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined
    }
    const result = listTickets(filter)
    res.json({ success: true, data: result })
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message })
  }
})

router.get('/meta', (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        floors: getDistinctFloors(),
        users: getAllUsers(),
        devices: getAllDevices()
      }
    })
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message })
  }
})

router.get('/statistics/summary', (_req: Request, res: Response) => {
  try {
    const data = getStatistics()
    res.json({ success: true, data })
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message })
  }
})

router.get('/:id', (req: Request, res: Response) => {
  try {
    const ticket = getTicketById(Number(req.params.id))
    if (!ticket) {
      res.status(404).json({ success: false, message: '工单不存在' })
      return
    }
    const records = getTicketRecords(ticket.id)
    res.json({ success: true, data: { ...ticket, records } })
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message })
  }
})

router.post('/', (req: Request, res: Response) => {
  try {
    const body = req.body as CreateTicketRequest
    if (!body.title || !body.deviceId || !body.reporterId || !body.urgency) {
      res.status(400).json({ success: false, message: '缺少必填字段' })
      return
    }
    const ticket = createTicket(body)
    res.status(201).json({ success: true, data: ticket })
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message })
  }
})

router.put('/:id', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    const body = req.body as UpdateTicketRequest & { operatorId?: number }
    const operatorId = body.operatorId ?? 1
    delete body.operatorId
    const ticket = updateTicket(id, body, operatorId)
    if (!ticket) {
      res.status(404).json({ success: false, message: '工单不存在' })
      return
    }
    res.json({ success: true, data: ticket })
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message })
  }
})

router.delete('/:id', (req: Request, res: Response) => {
  try {
    const deleted = deleteTicket(Number(req.params.id))
    if (!deleted) {
      res.status(404).json({ success: false, message: '工单不存在' })
      return
    }
    res.json({ success: true, message: '删除成功' })
  } catch (err) {
    res.status(500).json({ success: false, message: (err as Error).message })
  }
})

export default router
