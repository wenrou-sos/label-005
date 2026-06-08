<template>
  <div class="page-container">
    <div class="page-header">
      <a-page-header title="维修统计" sub-title="工单数据统计概览" />
    </div>

    <div class="page-content">
      <a-spin :spinning="loading">
        <template v-if="statistics">
          <a-row :gutter="[16, 16]" style="margin-bottom: 24px">
            <a-col :xs="24" :sm="12" :md="6">
              <a-card hoverable>
                <a-statistic
                  title="工单总数"
                  :value="statistics.total"
                  :value-style="{ color: '#1890ff' }"
                />
              </a-card>
            </a-col>
            <a-col :xs="24" :sm="12" :md="6">
              <a-card hoverable>
                <a-statistic
                  title="待处理"
                  :value="statusCount('pending')"
                  :value-style="{ color: '#faad14' }"
                />
              </a-card>
            </a-col>
            <a-col :xs="24" :sm="12" :md="6">
              <a-card hoverable>
                <a-statistic
                  title="处理中"
                  :value="statusCount('processing')"
                  :value-style="{ color: '#1890ff' }"
                />
              </a-card>
            </a-col>
            <a-col :xs="24" :sm="12" :md="6">
              <a-card hoverable>
                <a-statistic
                  title="已完成"
                  :value="statusCount('completed')"
                  :value-style="{ color: '#52c41a' }"
                >
                  <template #suffix>
                    <span style="font-size: 14px; color: #999">
                      关闭: {{ statusCount('closed') }}
                    </span>
                  </template>
                </a-statistic>
              </a-card>
            </a-col>
          </a-row>

          <a-row :gutter="24">
            <a-col :xs="24" :lg="12">
              <a-card title="工单状态分布" style="margin-bottom: 16px">
                <div
                  v-for="item in statistics.byStatus"
                  :key="item.status"
                  style="margin-bottom: 16px"
                >
                  <div
                    style="display: flex; justify-content: space-between; margin-bottom: 6px"
                  >
                    <span style="font-weight: 500">
                      {{ getStatusLabel(item.status as TicketStatus) }}
                    </span>
                    <span style="color: #666">
                      {{ item.count }} 单 ({{ getPercent(item.count) }}%)
                    </span>
                  </div>
                  <a-progress
                    :percent="getPercent(item.count)"
                    :stroke-color="getStatusColor(item.status)"
                    :show-info="false"
                  />
                </div>
              </a-card>
            </a-col>

            <a-col :xs="24" :lg="12">
              <a-card title="设备类型统计">
                <div
                  v-for="item in statistics.byDeviceType"
                  :key="item.deviceType"
                  style="margin-bottom: 16px"
                >
                  <div
                    style="display: flex; justify-content: space-between; margin-bottom: 6px"
                  >
                    <span style="font-weight: 500">
                      {{ getDeviceTypeLabel(item.deviceType as DeviceType) }}
                    </span>
                    <span style="color: #666">
                      {{ item.count }} 单 ({{ getPercent(item.count) }}%)
                    </span>
                  </div>
                  <a-progress
                    :percent="getPercent(item.count)"
                    :stroke-color="getDeviceTypeColor(item.deviceType)"
                    :show-info="false"
                  />
                </div>
              </a-card>
            </a-col>
          </a-row>

          <a-row style="margin-top: 16px">
            <a-col :span="24">
              <a-card title="快捷操作">
                <a-space>
                  <a-button type="primary" @click="goToTickets">
                    <UnorderedListOutlined />
                    查看工单列表
                  </a-button>
                  <a-button @click="refreshData">
                    <ReloadOutlined />
                    刷新数据
                  </a-button>
                </a-space>
              </a-card>
            </a-col>
          </a-row>
        </template>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { UnorderedListOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import { getTicketStatistics, type StatisticsData } from '@/api/tickets'
import {
  getStatusLabel,
  getDeviceTypeLabel,
  type TicketStatus,
  type DeviceType
} from '@/types'

const router = useRouter()
const loading = ref(false)
const statistics = ref<StatisticsData | null>(null)

const fetchData = async () => {
  loading.value = true
  try {
    statistics.value = await getTicketStatistics()
  } catch (err) {
    message.error('加载统计数据失败')
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  void fetchData()
}

const statusCount = (status: string): number => {
  if (!statistics.value) return 0
  const found = statistics.value.byStatus.find((s) => s.status === status)
  return found ? found.count : 0
}

const getPercent = (count: number): number => {
  if (!statistics.value || statistics.value.total === 0) return 0
  return Math.round((count / statistics.value.total) * 100)
}

const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    pending: '#faad14',
    processing: '#1890ff',
    completed: '#52c41a',
    closed: '#8c8c8c'
  }
  return colorMap[status] || '#1890ff'
}

const getDeviceTypeColor = (deviceType: string): string => {
  const colorMap: Record<string, string> = {
    elevator: '#1890ff',
    air_conditioning: '#52c41a',
    lighting: '#faad14',
    water_supply: '#722ed1',
    other: '#8c8c8c'
  }
  return colorMap[deviceType] || '#1890ff'
}

const goToTickets = () => {
  router.push('/tickets')
}

onMounted(() => {
  void fetchData()
})
</script>
