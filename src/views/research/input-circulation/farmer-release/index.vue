<template>
  <div class="page-container">
    <div class="page-wrapper">
      <!-- 页面头部 -->
      <PageHeader
        icon="ri-file-transfer-line"
        :title="$t('inputCirculation.cooperativeReleaseToFarmer')"
        :subtitle="$t('inputCirculation.cooperativeReleaseToFarmer')" />

      <!-- 内容区域 -->
      <div class="content-wrapper">
        <!-- 搜索卡片（无标题） -->
        <div class="search-card">
          <SearchForm @search="handleQuery" @reset="handleReset">
            <SearchItem :label="$t('inputCirculation.kebeleName')">
              <el-input
                v-model="queryParams.woredaName"
                :placeholder="$t('inputCirculation.pleaseEnterKebeleName')"
                clearable
                class="search-input">
                <template #prefix><i class="ri-search-line"></i></template>
              </el-input>
            </SearchItem>

            <SearchItem :label="$t('inputCirculation.farmerName')">
              <el-input
                v-model="queryParams.farmerName"
                :placeholder="$t('inputCirculation.pleaseEnterFarmerName')"
                clearable
                class="search-input" />
            </SearchItem>

            <SearchItem :label="$t('inputCirculation.farmerId')">
              <el-input
                v-model="queryParams.farmerId"
                :placeholder="$t('inputCirculation.pleaseEnterFarmerId')"
                clearable
                class="search-input" />
            </SearchItem>

            <SearchItem :label="$t('inputCirculation.year')">
              <el-date-picker
                v-model="queryParams.year"
                type="year"
                :placeholder="$t('common.pleaseSelect')"
                value-format="YYYY"
                clearable
                class="search-input" />
            </SearchItem>

            <SearchItem :label="$t('inputCirculation.receiveStatus')">
              <el-select
                v-model="queryParams.receiveStatus"
                :placeholder="$t('common.pleaseSelect')"
                clearable
                class="filter-select">
                <el-option :label="$t('inputCirculation.completed')" value="completed" />
                <el-option :label="$t('inputCirculation.pending')" value="pending" />
                <el-option :label="$t('inputCirculation.notReceived')" value="noReceived" />
                <el-option :label="$t('inputCirculation.received')" value="received" />
              </el-select>
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

        <!-- 列表卡片 -->
        <InfoCard :title="$t('inputCirculation.cooperativeReleaseToFarmer')" icon="ri-file-list-3-line">
          <template #actions>
            <el-button type="primary" @click="handleAdd">
              <i class="ri-add-line"></i>
              {{ $t('common.add') }}
            </el-button>
          </template>

          <!-- PC端表格 -->
          <div class="table-wrapper pc-only">
            <el-table :data="releaseList" stripe v-loading="loading" @selection-change="handleSelectionChange">
              <el-table-column type="selection" width="50" />
              <el-table-column prop="releaseId" :label="$t('inputCirculation.releaseId')" min-width="150" show-overflow-tooltip />
              <el-table-column prop="farmerId" :label="$t('inputCirculation.farmerId')" width="120" show-overflow-tooltip />
              <el-table-column prop="farmerName" :label="$t('inputCirculation.farmerName')" width="120" show-overflow-tooltip />
              <el-table-column prop="farmerPhone" :label="$t('inputCirculation.farmerPhone')" width="130" show-overflow-tooltip />
              <el-table-column prop="receiveStatus" :label="$t('inputCirculation.receiveStatus')" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.receiveStatus === 'received' ? 'success' : 'warning'">
                    {{ getReceiveStatusText(row.receiveStatus) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="releaseYear" :label="$t('inputCirculation.releaseYear')" width="100" />
              <el-table-column prop="releaseDate" :label="$t('inputCirculation.releaseDate')" width="180">
                <template #default="{ row }">
                  {{ formatDateTime(row.releaseDate) }}
                </template>
              </el-table-column>
              <el-table-column prop="releaseBy" :label="$t('inputCirculation.releaseBy')" width="120" show-overflow-tooltip />
              <el-table-column prop="releaseOrg" :label="$t('inputCirculation.releaseOrg')" min-width="150" show-overflow-tooltip />
              <el-table-column :label="$t('common.actions')" width="240" fixed="right">
                <template #default="{ row }">
                  <ActionButtons
                    :workflow-status="row.workflowStatus || 'S0'"
                    mode="list"
                    :show-audit="false"
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
          <div v-for="item in releaseList" :key="item.id" class="mobile-card">
            <div class="mobile-card-header">
              <div class="mobile-card-title">
                <i class="ri-file-transfer-line"></i>
                <span>{{ item.farmerName }}</span>
              </div>
              <el-tag :type="item.receiveStatus === 'received' ? 'success' : 'warning'" size="small">
                {{ getReceiveStatusText(item.receiveStatus) }}
              </el-tag>
            </div>
            <div class="mobile-card-body">
              <div class="mobile-card-row">
                <span class="label">{{ $t('inputCirculation.releaseId') }}:</span>
                <span class="value">{{ item.releaseId }}</span>
              </div>
              <div class="mobile-card-row">
                <span class="label">{{ $t('inputCirculation.farmerId') }}:</span>
                <span class="value">{{ item.farmerId }}</span>
              </div>
              <div class="mobile-card-row">
                <span class="label">{{ $t('inputCirculation.farmerPhone') }}:</span>
                <span class="value">{{ item.farmerPhone }}</span>
              </div>
              <div class="mobile-card-row">
                <span class="label">{{ $t('inputCirculation.releaseDate') }}:</span>
                <span class="value">{{ formatDateTime(item.releaseDate) }}</span>
              </div>
              <div class="mobile-card-row">
                <span class="label">{{ $t('inputCirculation.releaseOrg') }}:</span>
                <span class="value">{{ item.releaseOrg }}</span>
              </div>
            </div>
            <div class="mobile-card-footer">
              <ActionButtons
                :workflow-status="item.workflowStatus || 'S0'"
                mode="list"
                :show-audit="false"
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

    <el-dialog
      v-model="messageDialogVisible"
      :title="$t('inputCirculation.messageTitle')"
      width="520px"
      destroy-on-close>
      <div class="message-preview">
        <p class="line">{{ $t('inputCirculation.messageGreeting') }}</p>
        <p class="line">{{ $t('inputCirculation.messageAllocationNotice') }} <span class="placeholder">{{ messageContent.seedType }}</span>.</p>
        <p class="line">{{ $t('inputCirculation.messagePickupPrompt') }}</p>
        <p class="line pickup-name"><span class="placeholder">{{ messageContent.pickupLocationName }}</span></p>
        <p class="line">{{ $t('inputCirculation.messageLocation') }}: <span class="placeholder">{{ messageContent.address }}</span></p>
        <p class="line">{{ $t('inputCirculation.messageQuantity') }}: <span class="placeholder">{{ messageContent.quantity }}</span></p>
        <p class="line">{{ $t('inputCirculation.messageDate') }}: <span class="placeholder">{{ messageContent.date }}</span></p>
      </div>
      <template #footer>
        <el-button @click="messageDialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="messageDialogVisible = false">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getFarmerReleaseList, deleteFarmerRelease, getReleaseStockStatus, getFarmerReleaseDetail } from '@/api/inputCirculation'
import { PageHeader, InfoCard, SearchForm, SearchItem } from '@/components/common'
import ActionButtons from '@/components/workflow/ActionButtons.vue'

const router = useRouter()
const { t } = useI18n()

const loading = ref(false)
const releaseList = ref([])
const total = ref(0)
const selectedIds = ref([])
const dateRange = ref([])
const messageDialogVisible = ref(false)
const messageContent = reactive({
  seedType: '',
  pickupLocationName: '',
  address: '',
  quantity: '',
  date: ''
})

const getMessagePlaceholders = () => ({
  seedType: t('inputCirculation.messageSeedTypePlaceholder'),
  pickupLocationName: t('inputCirculation.messagePickupLocationPlaceholder'),
  address: t('inputCirculation.messageAddressPlaceholder'),
  quantity: t('inputCirculation.messageQuantityPlaceholder'),
  date: t('inputCirculation.messageDatePlaceholder')
})

const queryParams = reactive({
  woredaName: '',
  farmerName: '',
  farmerId: '',
  year: null,
  receiveStatus: '',
  startTime: '',
  endTime: '',
  pageNum: 1,
  pageSize: 10
})

// 查询列表
const handleQuery = () => {
  if (dateRange.value && dateRange.value.length === 2) {
    queryParams.startTime = dateRange.value[0]
    queryParams.endTime = dateRange.value[1]
  } else {
    queryParams.startTime = ''
    queryParams.endTime = ''
  }

  loading.value = true
  getFarmerReleaseList({ ...queryParams, flag: 0 })
    .then(async response => {
      releaseList.value = response.rows || []
      total.value = response.total || 0
      // 加载出入库状态
      await loadStockStatus()
    })
    .finally(() => {
      loading.value = false
    })
}

// 加载出入库状态
const loadStockStatus = async () => {
  if (releaseList.value.length === 0) return
  const releaseIds = releaseList.value.map(item => item.releaseId).join(',')
  try {
    const response = await getReleaseStockStatus(releaseIds, 1)
    if (response.code === 200 && response.data) {
      releaseList.value.forEach(item => {
        item.stockStatus = response.data[item.releaseId] || 'notProcessed'
      })
    }
  } catch (error) {
    console.error('Failed to load stock status:', error)
  }
}

// 获取出入库状态样式
const getStockStatusTag = (status) => {
  const map = {
    notProcessed: 'info',
    outPending: 'warning',
    outCompleted: 'success',
    notFound: 'danger'
  }
  return map[status] || 'info'
}

// // 获取出入库状态文本
// const getStockStatusText = (status) => {
//   return t(`inputCirculation.stockStatus_${status || 'notProcessed'}`)
// }

// 重置查询
const handleReset = () => {
  queryParams.woredaName = ''
  queryParams.farmerName = ''
  queryParams.farmerId = ''
  queryParams.year = null
  queryParams.receiveStatus = ''
  dateRange.value = []
  queryParams.pageNum = 1
  handleQuery()
}

// 短信
const handleMessage = async (id) => {
  messageDialogVisible.value = true
  try {
    const response = await getFarmerReleaseDetail(id, 1)
    const main = response?.data?.main || {}
    const details = response?.data?.details || []
    const firstDetail = details[0] || {}
    const totalQuantity = details.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
    const seedType = firstDetail.variety || firstDetail.inputCategory || firstDetail.inputType || ''
    const pickupLocationName = firstDetail.outWarehouseName || firstDetail.outWarehouseCode || main.releaseOrg || ''
    const address = main.releaseOrgAddress || main.address || main.releaseOrg || ''
    const date = main.releaseDate || firstDetail.releaseTime || ''
    const placeholders = getMessagePlaceholders()
    messageContent.seedType = seedType || placeholders.seedType
    messageContent.pickupLocationName = pickupLocationName || placeholders.pickupLocationName
    messageContent.address = address || placeholders.address
    messageContent.quantity = totalQuantity > 0 ? `${totalQuantity} Kg` : placeholders.quantity
    messageContent.date = date || placeholders.date
  } catch (error) {
    const placeholders = getMessagePlaceholders()
    messageContent.seedType = placeholders.seedType
    messageContent.pickupLocationName = placeholders.pickupLocationName
    messageContent.address = placeholders.address
    messageContent.quantity = placeholders.quantity
    messageContent.date = placeholders.date
    ElMessage.error(t('common.queryFailed'))
  }
}

const getReceiveStatusText = (status) => {
  const statusKeyMap = {
    completed: 'completed',
    pending: 'pending',
    noReceived: 'notReceived',
    received: 'received',
    Confirmed: 'confirmed'
  }
  return t(`inputCirculation.${statusKeyMap[status] || status}`)
}

// 新增
const handleAdd = () => {
  router.push({
    path: '/input/input-circulation/farmer-release/add',
    query: { source: 'kebele-farmer' }
  })
}

// 编辑
const handleEdit = (id) => {
  router.push({
    path: `/input/input-circulation/farmer-release/edit/${id}`,
    query: { source: 'kebele-farmer' }
  })
}

// 详情
const handleDetail = (id) => {
  router.push({
    path: `/input/input-circulation/farmer-release/detail/${id}`,
    query: { source: 'kebele-farmer' }
  })
}

// 删除
const handleDelete = (id) => {
  ElMessageBox.confirm(t('common.deleteConfirm'), t('common.warning'), {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    type: 'warning'
  }).then(() => {
    deleteFarmerRelease(id, 1).then(() => {
      ElMessage.success(t('common.deleteSuccess'))
      handleQuery()
    })
  })
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning(t('common.pleaseSelect'))
    return
  }
  ElMessageBox.confirm(t('common.confirmDelete'), t('common.warning'), {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    type: 'warning'
  }).then(() => {
    deleteFarmerRelease(selectedIds.value.join(','), 1).then(() => {
      ElMessage.success(t('common.deleteSuccess'))
      handleQuery()
    })
  })
}

// 表格选择变化
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id)
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  return dateTime.replace('T', ' ')
}

// 统一的动作处理方法
const handleAction = (row, action) => {
  switch (action) {
    case 'view':
      handleDetail(row.id)
      break
    case 'edit':
      handleEdit(row.id)
      break
    case 'message':
      handleMessage(row.id)
      break
    case 'cancelBatch':
      handleDelete(row.id)
      break
  }
}

// 获取自定义按钮配置（因为这个页面没有工作流状态，使用自定义按钮）
const getCustomButtons = (row) => {
  return [
    { type: 'primary', action: 'view', label: 'view', icon: 'ri-eye-line' },
    { type: 'primary', action: 'edit', label: 'edit', icon: 'ri-edit-line' },
    { type: 'primary', action: 'message', label: 'message', rawLabel: 'message', icon: 'ri-message-2-line' },
    { type: 'danger', action: 'cancelBatch', label: 'delete', icon: 'ri-delete-bin-line' }
  ]
}

onMounted(() => {
  handleQuery()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/page-common.scss';
@use '@/assets/styles/workflow-common.scss';
@use '@/assets/styles/table-enhanced.scss';

.message-preview {
  padding: 16px 18px;
  border: 1px solid #e4e7ed;
  border-radius: 10px;
  background: linear-gradient(180deg, #f7fbf8 0%, #ffffff 100%);
  box-shadow: inset 0 0 0 1px rgba(0, 154, 68, 0.06);
}

.message-preview .line {
  margin: 0;
  line-height: 1.9;
  color: #303133;
  font-size: 14px;
}

.message-preview .pickup-name {
  margin-bottom: 6px;
}

.message-preview .placeholder {
  color: #009a44;
  font-weight: 600;
}
</style>
