<template>
  <a-layout style="min-height: 100vh">
    <a-layout-header
      style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #001529;
        padding: 0 24px;
      "
    >
      <div style="display: flex; align-items: center; gap: 16px">
        <BankOutlined style="font-size: 24px; color: #fff" />
        <h1 style="color: #fff; margin: 0; font-size: 20px">商业楼宇设备报修管理系统</h1>
      </div>
      <a-menu
        theme="dark"
        mode="horizontal"
        :selected-keys="[$route.name as string]"
        style="min-width: 200px"
      >
        <a-menu-item key="TicketList" @click="$router.push('/tickets')">
          <UnorderedListOutlined />
          报修工单
        </a-menu-item>
      </a-menu>
    </a-layout-header>
    <a-layout-content>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
import { BankOutlined, UnorderedListOutlined } from '@ant-design/icons-vue'
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
