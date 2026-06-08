<template>
  <div class="page-container">
    <div class="page-header">
      <a-page-header :title="`工单详情 - ${ticket?.ticketNo ?? ''}`" @back="goBack">
        <template #extra>
          <a-button type="primary" @click="showEditModal = true">
            <EditOutlined />
            更新工单
          </a-button>
        </template>
      </a-page-header>
    </div>

    <a-spin :spinning="loading">
      <div v-if="ticket" class="page-content">
        <a-row :gutter="24">
          <a-col :span="16">
            <a-card title="基本信息" style="margin-bottom: 24px">
              <a-descriptions :column="2" bordered size="small">
                <a-descriptions-item label="工单编号">{{ ticket.ticketNo }}</a-descriptions-item>
                <a-descriptions-item label="工单标题">{{ ticket.title }}</a-descriptions-item>
                <a-descriptions-item label="紧急程度">
                  <a-tag :color="getUrgencyColor(ticket.urgency)">
                    {{ getUrgencyLabel(ticket.urgency) }}
                  </a-tag>
                </a-descriptions-item>
                <a-descriptions-item label="工单状态">
                  <a-tag :color="getStatusColor(ticket.status)">
                    {{ getStatusLabel(ticket.status) }}
                  </a-tag>
                </a-descriptions-item>
                <a-descriptions-item label="设备类型">
                  {{ getDeviceTypeLabel(ticket.deviceType) }}
                </a-descriptions-item>
                <a-descriptions-item label="设备位置">
                  {{ ticket.floor }} {{ ticket.area }} - {{ ticket.location }}
                </a-descriptions-item>
                <a-descriptions-item label="报修人">{{ ticket.reporterName }}</a-descriptions-item>
                <a-descriptions-item label="处理责任人">
                  {{ ticket.assigneeName || '未指派' }}
                </a-descriptions-item>
                <a-descriptions-item label="创建时间">
                  {{ formatDate(ticket.createdAt) }}
                </a-descriptions-item>
                <a-descriptions-item label="完成时间">
                  {{ ticket.completedAt ? formatDate(ticket.completedAt) : '-' }}
                </a-descriptions-item>
              </a-descriptions>
            </a-card>

            <a-card title="问题描述" style="margin-bottom: 24px">
              <p style="white-space: pre-wrap; margin: 0">{{ ticket.description || '暂无描述' }}</p>
            </a-card>

            <a-card title="处理备注">
              <a-input-text-area
                v-model:value="processNote"
                :rows="4"
                :disabled="isNoteEditing"
                placeholder="暂无处理备注"
                style="margin-bottom: 12px"
              />
              <a-space>
                <a-button v-if="!isNoteEditing" type="primary" @click="startEditNote">
                  <EditOutlined />
                  编辑备注
                </a-button>
                <template v-else>
                  <a-button type="primary" :loading="savingNote" @click="saveNote">保存</a-button>
                  <a-button @click="cancelEditNote">取消</a-button>
                </template>
              </a-space>
            </a-card>
          </a-col>

          <a-col :span="8">
            <a-card title="维修记录" style="margin-bottom: 24px">
              <a-timeline v-if="ticket.records && ticket.records.length > 0">
                <a-timeline-item v-for="record in ticket.records" :key="record.id">
                  <div class="timeline-action">
                    {{ getActionLabel(record.action) }}
                    <span style="font-weight: normal; color: #888; margin-left: 8px">
                      - {{ record.operatorName }}
                    </span>
                  </div>
                  <div v-if="record.remark" class="timeline-remark">{{ record.remark }}</div>
                  <div class="timeline-time">{{ formatDate(record.createdAt) }}</div>
                </a-timeline-item>
              </a-timeline>
              <a-empty v-else description="暂无维修记录" />
            </a-card>
          </a-col>
        </a-row>
      </div>
    </a-spin>

    <a-modal
      v-model:open="showEditModal"
      title="更新工单"
      :confirm-loading="updating"
      @ok="handleUpdate"
      @cancel="showEditModal = false"
    >
      <a-form :model="updateForm" layout="vertical">
        <a-form-item label="工单状态">
          <a-select v-model:value="updateForm.status" style="width: 100%">
            <a-select-option
              v-for="item in STATUS_OPTIONS"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="处理责任人">
          <a-select
            v-model:value="updateForm.assigneeId"
            placeholder="选择责任人"
            allow-clear
            style="width: 100%"
          >
            <a-select-option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.realName }} ({{ user.role === 'technician' ? '工程师' : '管理员' }})
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { EditOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import { getTicketDetail, getTicketMeta, updateTicket } from '@/api/tickets'
import type { RepairTicket, User, UpdateTicketRequest } from '@/types'
import {
  URGENCY_OPTIONS,
  STATUS_OPTIONS,
  getUrgencyLabel,
  getStatusLabel,
  getDeviceTypeLabel
} from '@/types'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const updating = ref(false)
const savingNote = ref(false)
const isNoteEditing = ref(false)
const showEditModal = ref(false)
const ticket = ref<RepairTicket | null>(null)
const users = ref<User[]>([])
const processNote = ref('')
const originalNote = ref('')

const updateForm = reactive<UpdateTicketRequest>({
  status: undefined,
  assigneeId: undefined
})

const getUrgencyColor = (value: string): string => {
  return URGENCY_OPTIONS.find((o) => o.value === value)?.color ?? 'default'
}

const getStatusColor = (value: string): string => {
  return STATUS_OPTIONS.find((o) => o.value === value)?.color ?? 'default'
}

const formatDate = (dateStr: string): string => {
  return dayjs(dateStr).format('YYYY-MM-DD HH:mm:ss')
}

const getActionLabel = (action: string): string => {
  const map: Record<string, string> = {
    create: '创建工单',
    assign: '指派责任人',
    unassign: '取消指派',
    status: '状态变更',
    note: '更新备注',
    complete: '完成维修'
  }
  return map[action] || action
}

const fetchDetail = async () => {
  loading.value = true
  try {
    const id = Number(route.params.id)
    const result = await getTicketDetail(id)
    ticket.value = result
    processNote.value = result.processNote
    originalNote.value = result.processNote
    updateForm.status = result.status
    updateForm.assigneeId = result.assigneeId ?? undefined
  } catch (err) {
    message.error('加载工单详情失败')
  } finally {
    loading.value = false
  }
}

const fetchUsers = async () => {
  try {
    const result = await getTicketMeta()
    users.value = result.users
  } catch (err) {
    message.error('加载用户列表失败')
  }
}

const startEditNote = () => {
  isNoteEditing.value = true
}

const cancelEditNote = () => {
  processNote.value = originalNote.value
  isNoteEditing.value = false
}

const saveNote = async () => {
  if (!ticket.value) return
  savingNote.value = true
  try {
    const result = await updateTicket(ticket.value.id, {
      processNote: processNote.value,
      operatorId: 1
    })
    ticket.value = result
    originalNote.value = processNote.value
    isNoteEditing.value = false
    message.success('备注更新成功')
    await fetchDetail()
  } catch (err) {
    message.error('备注更新失败')
  } finally {
    savingNote.value = false
  }
}

const handleUpdate = async () => {
  if (!ticket.value) return
  updating.value = true
  try {
    const result = await updateTicket(ticket.value.id, {
      status: updateForm.status,
      assigneeId: updateForm.assigneeId ?? null,
      operatorId: 1
    })
    ticket.value = result
    showEditModal.value = false
    message.success('工单更新成功')
    await fetchDetail()
  } catch (err) {
    message.error('工单更新失败')
  } finally {
    updating.value = false
  }
}

const goBack = () => {
  router.push('/tickets')
}

onMounted(() => {
  void fetchUsers()
  void fetchDetail()
})
</script>
