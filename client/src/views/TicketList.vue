<template>
  <div class="page-container">
    <div class="page-header">
      <a-page-header title="报修工单列表" sub-title="管理和查看所有报修工单" />
    </div>

    <div class="page-content">
      <a-form layout="inline" :model="filterForm" style="margin-bottom: 24px">
        <a-form-item label="楼层">
          <a-select
            v-model:value="filterForm.floor"
            placeholder="选择楼层"
            allow-clear
            style="width: 140px"
            @change="handleFilterChange"
          >
            <a-select-option v-for="floor in meta.floors" :key="floor" :value="floor">
              {{ floor }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="设备类型">
          <a-select
            v-model:value="filterForm.deviceType"
            placeholder="选择设备类型"
            allow-clear
            style="width: 160px"
            @change="handleFilterChange"
          >
            <a-select-option
              v-for="item in DEVICE_TYPE_OPTIONS"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="工单状态">
          <a-select
            v-model:value="filterForm.status"
            placeholder="选择状态"
            allow-clear
            style="width: 140px"
            @change="handleFilterChange"
          >
            <a-select-option
              v-for="item in STATUS_OPTIONS"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="紧急程度">
          <a-select
            v-model:value="filterForm.urgency"
            placeholder="选择紧急程度"
            allow-clear
            style="width: 140px"
            @change="handleFilterChange"
          >
            <a-select-option
              v-for="item in URGENCY_OPTIONS"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="关键词">
          <a-input-search
            v-model:value="filterForm.keyword"
            placeholder="搜索工单编号/标题"
            style="width: 240px"
            allow-clear
            @search="handleFilterChange"
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="handleFilterChange">
            <SearchOutlined />
            查询
          </a-button>
          <a-button style="margin-left: 8px" @click="handleReset">
            <ReloadOutlined />
            重置
          </a-button>
        </a-form-item>
      </a-form>

      <a-table
        :columns="columns"
        :data-source="tickets"
        :loading="loading"
        :pagination="pagination"
        :row-key="(record) => record.id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'ticketNo'">
            <a @click="goToDetail(record.id)">
              {{ record.ticketNo }}
            </a>
          </template>
          <template v-else-if="column.key === 'urgency'">
            <a-tag :color="getUrgencyColor(record.urgency)">
              {{ getUrgencyLabel(record.urgency) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusLabel(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'location'">
            <div>{{ record.floor }} {{ record.area }}</div>
            <div style="color: #888; font-size: 12px">{{ record.location }}</div>
          </template>
          <template v-else-if="column.key === 'deviceType'">
            {{ getDeviceTypeLabel(record.deviceType) }}
          </template>
          <template v-else-if="column.key === 'createdAt'">
            {{ formatDate(record.createdAt) }}
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button type="link" @click="goToDetail(record.id)">详情</a-button>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import { getTicketList, getTicketMeta, type MetaData } from '@/api/tickets'
import type { RepairTicket, TicketFilter } from '@/types'
import {
  URGENCY_OPTIONS,
  STATUS_OPTIONS,
  DEVICE_TYPE_OPTIONS,
  getUrgencyLabel,
  getStatusLabel,
  getDeviceTypeLabel
} from '@/types'

const router = useRouter()

const loading = ref(false)
const tickets = ref<RepairTicket[]>([])
const meta = reactive<MetaData>({
  floors: [],
  users: [],
  devices: []
})

const filterForm = reactive<TicketFilter>({
  floor: undefined,
  deviceType: undefined,
  status: undefined,
  urgency: undefined,
  keyword: undefined,
  page: 1,
  pageSize: 20
})

const pagination = reactive<TablePaginationConfig>({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条工单`
})

const columns = [
  {
    title: '工单编号',
    key: 'ticketNo',
    dataIndex: 'ticketNo',
    width: 140,
    fixed: 'left' as const
  },
  {
    title: '标题',
    key: 'title',
    dataIndex: 'title',
    width: 200,
    ellipsis: true
  },
  {
    title: '紧急程度',
    key: 'urgency',
    dataIndex: 'urgency',
    width: 100
  },
  {
    title: '设备类型',
    key: 'deviceType',
    dataIndex: 'deviceType',
    width: 100
  },
  {
    title: '设备位置',
    key: 'location',
    width: 200
  },
  {
    title: '状态',
    key: 'status',
    dataIndex: 'status',
    width: 100
  },
  {
    title: '报修人',
    key: 'reporterName',
    dataIndex: 'reporterName',
    width: 100
  },
  {
    title: '责任人',
    key: 'assigneeName',
    dataIndex: 'assigneeName',
    width: 100,
    customRender: ({ text }: { text: string | null }) => text || '-'
  },
  {
    title: '创建时间',
    key: 'createdAt',
    dataIndex: 'createdAt',
    width: 170
  },
  {
    title: '操作',
    key: 'action',
    width: 80,
    fixed: 'right' as const
  }
]

const getUrgencyColor = (value: string): string => {
  return URGENCY_OPTIONS.find((o) => o.value === value)?.color ?? 'default'
}

const getStatusColor = (value: string): string => {
  return STATUS_OPTIONS.find((o) => o.value === value)?.color ?? 'default'
}

const formatDate = (dateStr: string): string => {
  return dayjs(dateStr).format('YYYY-MM-DD HH:mm')
}

const fetchData = async () => {
  loading.value = true
  try {
    const result = await getTicketList({
      floor: filterForm.floor,
      deviceType: filterForm.deviceType,
      status: filterForm.status,
      urgency: filterForm.urgency,
      keyword: filterForm.keyword,
      page: pagination.current,
      pageSize: pagination.pageSize
    })
    tickets.value = result.data
    pagination.total = result.total
  } catch (err) {
    message.error('加载工单列表失败')
  } finally {
    loading.value = false
  }
}

const fetchMeta = async () => {
  try {
    const result = await getTicketMeta()
    meta.floors = result.floors
    meta.users = result.users
    meta.devices = result.devices
  } catch (err) {
    message.error('加载元数据失败')
  }
}

const handleFilterChange = () => {
  pagination.current = 1
  void fetchData()
}

const handleReset = () => {
  filterForm.floor = undefined
  filterForm.deviceType = undefined
  filterForm.status = undefined
  filterForm.urgency = undefined
  filterForm.keyword = undefined
  pagination.current = 1
  void fetchData()
}

const handleTableChange = (p: TablePaginationConfig) => {
  pagination.current = p.current ?? 1
  pagination.pageSize = p.pageSize ?? 20
  void fetchData()
}

const goToDetail = (id: number) => {
  router.push(`/tickets/${id}`)
}

onMounted(() => {
  void fetchMeta()
  void fetchData()
})
</script>
