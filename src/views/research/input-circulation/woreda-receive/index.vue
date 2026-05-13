<template>
  <div class="page-container">
    <div class="page-wrapper">
      <!-- 页面头部 -->
      <PageHeader
        icon="ri-list-check-2"
        :title="$t('research.menu.cooperativeReceiveConfirm')"
        :subtitle="$t('research.menu.cooperativeReceiveConfirm')" />

      <!-- 内容区域 -->
      <div class="content-wrapper">
        <!-- 搜索卡片（无标题） -->
        <div class="search-card">
          <SearchForm @search="handleQuery" @reset="handleReset">
            <SearchItem :label="$t('inputCirculation.releaseBy')">
              <el-input
                v-model="queryParams.releaseBy"
                :placeholder="$t('common.pleaseInput')"
                clearable
                class="search-input">
                <template #prefix><i class="ri-search-line"></i></template>
              </el-input>
            </SearchItem>

            <SearchItem :label="$t('inputCirculation.timeRange')">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="-"
                :start-placeholder="$t('common.startDate')"
                :end-placeholder="$t('common.endDate')"
                value-format="YYYY-MM-DD"
                class="search-input" />
            </SearchItem>
          </SearchForm>
        </div>

        <!-- 列表卡片（注意：no-padding="true"） -->
        <InfoCard
          :title="$t('research.menu.cooperativeReceiveConfirm')"
          icon="ri-file-list-3-line"
          :no-padding="true">
          
          <!-- 状态标签页 -->
          <StatusTabs
            v-model="activeTab"
            :tabs="tabConfig"
            @tab-change="handleTabChange" />

          <!-- PC端表格 -->
          <div class="table-wrapper pc-only">
            <el-table :data="receiveList" stripe v-loading="loading">
              <el-table-column prop="releaseId" :label="$t('inputCirculation.releaseId')" min-width="150" show-overflow-tooltip />
              <el-table-column prop="releaseName" :label="$t('inputCirculation.releaseName')" min-width="200" show-overflow-tooltip />
              <el-table-column prop="releaseOrg" :label="$t('inputCirculation.releaseOrg')" min-width="150" show-overflow-tooltip />
              <el-table-column prop="releaseDate" :label="$t('inputCirculation.releaseDate')" min-width="160" />
              <el-table-column prop="receiveStatus" :label="$t('inputCirculation.status')" min-width="120" />
              <el-table-column prop="confirmBy" :label="$t('inputCirculation.confirmBy')" min-width="120" show-overflow-tooltip />
              <el-table-column prop="confirmTime" :label="$t('inputCirculation.confirmTime')" min-width="160" />
              <el-table-column :label="$t('common.actions')" width="240" fixed="right">
                <template #default="{ row }">
                  <ActionButtons
                    :workflow-status="row.workflowStatus || 'S0'"
                    mode="list"
                    :show-audit="activeTab === 'pendingApproval'"
                    :custom-buttons="getCustomButtons(row)"
                    @action="(action) => handleAction(row, action)" />
                </template>
              </el-table-column>
            </el-table>

            <div class="pagination-wrapper">
              <el-pagination
                v-model:current-page="queryParams.pageNum"
                v-model:page-size="queryParams.pageSize"
                :total="total"
                :page-sizes="[10, 20, 50]"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleQuery"
                @current-change="handleQuery"
              />
            </div>
          </div>
        </InfoCard>

        <!-- 移动端卡片 -->
        <div class="mobile-card-list mobile-only">
          <div v-for="item in receiveList" :key="item.id" class="mobile-card">
            <div class="mobile-card-header">
              <div class="mobile-card-title">
                <i class="ri-file-receive-line"></i>
                <span>{{ item.releaseName }}</span>
              </div>
            </div>
            <div class="mobile-card-body">
              <div class="mobile-card-row">
                <span class="label">{{ $t('inputCirculation.releaseId') }}:</span>
                <span class="value">{{ item.releaseId }}</span>
              </div>
              <div class="mobile-card-row">
                <span class="label">{{ $t('inputCirculation.releaseOrg') }}:</span>
                <span class="value">{{ item.releaseOrg }}</span>
              </div>
              <div class="mobile-card-row">
                <span class="label">{{ $t('inputCirculation.releaseDate') }}:</span>
                <span class="value">{{ item.releaseDate }}</span>
              </div>
              <div class="mobile-card-row">
                <span class="label">{{ $t('inputCirculation.status') }}:</span>
                <span class="value">{{ item.receiveStatus }}</span>
              </div>
            </div>
            <div class="mobile-card-footer">
              <ActionButtons
                :workflow-status="item.workflowStatus || 'S0'"
                mode="list"
                :show-audit="activeTab === 'pendingApproval'"
                :custom-buttons="getCustomButtons(item)"
                @action="(action) => handleAction(item, action)" />
            </div>
          </div>

          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="queryParams.pageNum"
              v-model:page-size="queryParams.pageSize"
              :total="total"
              layout="prev, pager, next"
              small
              @current-change="handleQuery"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getWoredaReceiveList, confirmWoredaReceive } from '@/api/inputCirculation'
import { PageHeader, InfoCard, SearchForm, SearchItem } from '@/components/common'
import StatusTabs from '@/components/workflow/StatusTabs.vue'
import ActionButtons from '@/components/workflow/ActionButtons.vue'

const { t } = useI18n()
const router = useRouter()
const loading = ref(false)
const receiveList = ref([])
const total = ref(0)
const dateRange = ref([])
const activeTab = ref('pendingApproval')

const queryParams = reactive({
  releaseBy: '',
  batchId: '',
  cropType: '',
  varietyName: '',
  startTime: '',
  endTime: '',
  receiveStatus: '',
  pageNum: 1,
  pageSize: 10
})

// 标签页配置
const tabConfig = [
  { name: 'pendingApproval', label: 'inputCirculation.pending', icon: 'ri-time-line' },
  { name: 'approved', label: 'inputCirculation.confirmed', icon: 'ri-check-line' }
]

// 标签页切换处理
const handleTabChange = (tabName) => {
  activeTab.value = tabName
  // 根据标签页设置不同的查询参数
  switch (tabName) {
    case 'pendingApproval':
      // 待确认：不设置状态，查询时过滤掉"已确认"状态
      queryParams.receiveStatus = ''
      break
    case 'approved':
      queryParams.receiveStatus = 'Confirmed'
      break
  }
  queryParams.pageNum = 1
  handleQuery()
}

const handleQuery = async () => {
  loading.value = true
  if (dateRange.value?.length === 2) {
    queryParams.startTime = dateRange.value[0]
    queryParams.endTime = dateRange.value[1]
  } else {
    queryParams.startTime = ''
    queryParams.endTime = ''
  }
  try {
    const response = await getWoredaReceiveList(queryParams)
    if (response.code === 200) {
      let data = response.rows || []
      // 如果是"待确认"标签页，过滤掉"已确认"状态的数据（包括空状态的数据也要显示）
      if (activeTab.value === 'pendingApproval') {
        data = data.filter(item => item.receiveStatus !== 'Confirmed')
      }
      receiveList.value = data
      total.value = data.length
    }
  } catch (error) {
    ElMessage.error(t('common.queryFailed'))
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  queryParams.releaseBy = ''
  queryParams.startTime = ''
  queryParams.endTime = ''
  dateRange.value = []
  queryParams.pageNum = 1
  // 保持当前标签页的状态
  handleQuery()
}

const handleView = (row) => {
  router.push(`/input/input-circulation/woreda-receive/detail/${row.id}`)
}

const handleConfirm = async (row) => {
  ElMessageBox.confirm(
    'Are you sure you want to confirm receipt of this distribution?',
    'Confirm Receipt',
    {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning'
    }
  ).then(async () => {
    try {
      loading.value = true
      // Get current user info
      const userInfoStr = localStorage.getItem('userInfo')
      let confirmBy = ''
      let confirmOrg = ''

      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr)
        const user = userInfo.user || userInfo
        confirmBy = user.REALNAME || user.USERNAME || user.realName || user.username || ''
        confirmOrg = user.ORGANNAME || user.organName || ''
      }

      const response = await confirmWoredaReceive(row.id, confirmBy, confirmOrg)

      if (response.code === 200) {
        ElMessage.success('Receipt confirmed successfully')
        handleQuery() // Refresh the list
      } else {
        ElMessage.error(response.msg || 'Failed to confirm receipt')
      }
    } catch (error) {
      console.error('Failed to confirm receipt:', error)
      ElMessage.error('Failed to confirm receipt')
    } finally {
      loading.value = false
    }
  }).catch(() => {
    // User cancelled
  })
}

// 统一的动作处理方法
const handleAction = (row, action) => {
  switch (action) {
    case 'view':
      handleView(row)
      break
    case 'audit':
      handleConfirm(row)
      break
  }
}

// 获取自定义按钮配置
const getCustomButtons = (row) => {
  const buttons = [
    { type: 'primary', action: 'view', label: 'view', icon: 'ri-eye-line' }
  ]
  // 如果是待确认状态，添加确认按钮
  if (row.receiveStatus === 'Pending') {
    buttons.push({ type: 'success', action: 'audit', label: 'confirm', icon: 'ri-check-line' })
  }
  return buttons
}

onMounted(() => {
  // 初始化时根据当前标签页设置查询参数
  handleTabChange(activeTab.value)
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/page-common.scss';
@use '@/assets/styles/workflow-common.scss';
@use '@/assets/styles/table-enhanced.scss';
</style>
