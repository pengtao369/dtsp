<template>
  <div class="page-container">
    <div class="page-wrapper">
      <!-- 页面头部 -->
      <PageHeader
        icon="ri-user-add-line"
        :title="$t('farmerDemand.title')"
        :subtitle="$t('farmerDemand.subtitle')"
      />

      <!-- 内容区域 -->
      <div class="content-wrapper">
        <!-- 搜索卡片 -->
        <div class="search-card">
          <SearchForm @search="handleSearch" @reset="handleReset">
            <SearchItem :label="$t('farmerDemand.columns.farmerName')">
              <el-input
                v-model="searchForm.farmerName"
                :placeholder="$t('farmerDemand.columns.farmerName')"
                clearable
              />
            </SearchItem>
            <SearchItem :label="$t('farmerDemand.columns.phone')">
              <el-input
                v-model="searchForm.phone"
                :placeholder="$t('farmerDemand.columns.phone')"
                clearable
              />
            </SearchItem>
          </SearchForm>
        </div>

        <!-- 列表卡片 -->
        <InfoCard
          :title="$t('farmerDemand.list')"
          icon="ri-list-check"
        >
          <template #actions>
            <el-button
              type="success"
              @click="handleBatchSubmit"
              :disabled="selectedRows.length === 0"
              v-if="selectedRows.length > 0"
            >
              <i class="ri-send-plane-line"></i>
              {{ $t('farmerDemand.submitForAudit') }} ({{ selectedRows.length }})
            </el-button>
            <el-button type="primary" @click="handleAdd">
              <i class="ri-add-line"></i>
              {{ $t('common.add') }}
            </el-button>
            <el-button type="primary" plain @click="handleAddByFarmers">
              <i class="ri-user-add-line"></i>
              Add By Farmers
            </el-button>
          </template>

          <StatusTabs
            v-model="activeTab"
            :tabs="tabConfig"
            @tab-change="handleTabChange"
          />

          <div class="card-body">
            <!-- PC端表格 -->
            <div class="table-wrapper pc-only">
              <el-table
                v-loading="loading"
                :data="tableData"
                stripe
                @selection-change="handleSelectionChange"
                :default-sort="{ prop: 'createdTime', order: 'descending' }"
              >
                <el-table-column
                  type="selection"
                  width="55"
                  :selectable="rowSelectable"
                />
                <el-table-column
                  prop="year"
                  :label="$t('Year')"
                  min-width="120"
                />
                <el-table-column
                  prop="batchNo"
                  :label="$t('farmerDemand.columns.batchNo')"
                  min-width="150"
                  sortable="custom"
                />
                <el-table-column
                  prop="farmerName"
                  :label="$t('farmerDemand.columns.farmerName')"
                  min-width="120"
                  v-if="showFarmerIdentityFields"
                />
                <el-table-column
                  prop="farmerIdNumber"
                  :label="$t('farmerDemand.columns.farmerIdNumber')"
                  min-width="150"
                  v-if="showFarmerIdentityFields"
                />
                <el-table-column
                  prop="kebeleName"
                  :label="$t('farmerDemand.columns.kebele')"
                  min-width="120"
                />
                <el-table-column
                  prop="landArea"
                  :label="$t('farmerDemand.columns.landArea')"
                  min-width="120"
                  v-if="showFarmerIdentityFields"
                >
                  <template #default="{ row }">
                    {{ row.landArea || '-' }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="statusName"
                  :label="$t('farmerDemand.columns.status')"
                  min-width="140"
                >
                  <template #default="{ row }">
                    <el-tag :type="getStatusType(row.status)">
                      {{ row.statusName || getStatusLabel(row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="daUserName"
                  :label="$t('farmerDemand.columns.daUserName')"
                  min-width="120"
                />
                <el-table-column
                  prop="createdTime"
                  :label="$t('farmerDemand.columns.createdTime')"
                  min-width="160"
                  sortable="custom"
                />
                <el-table-column :label="$t('common.actions')" fixed="right" width="240">
                  <template #default="{ row }">
                    <FarmerActionButtons
                      :status="row.status"
                      @action="(action) => handleAction(row, action)"
                    />
                  </template>
                </el-table-column>
              </el-table>

              <!-- 分页 -->
              <div class="pagination-wrapper">
                <el-pagination
                  v-model:current-page="pagination.currentPage"
                  v-model:page-size="pagination.pageSize"
                  :total="pagination.total"
                  :page-sizes="[10, 20, 50, 100]"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                />
              </div>
            </div>

            <!-- 移动端卡片 -->
            <div class="mobile-card-list mobile-only">
              <div v-for="item in tableData" :key="item.id" class="mobile-card">
                <div class="mobile-card-header">
                  <el-checkbox
                    v-model="item.checked"
                    @change="handleMobileCheckChange(item)"
                    :disabled="!rowSelectable(item)"
                  ></el-checkbox>
                  <div class="mobile-card-title">
                    <i class="ri-user-line"></i>
                    <span>{{ showFarmerIdentityFields ? (item.farmerName || '-') : (item.batchNo || '-') }}</span>
                  </div>
                  <el-tag :type="getStatusType(item.status)" size="small">
                    {{ item.statusName || getStatusLabel(item.status) }}
                  </el-tag>
                </div>
                <div class="mobile-card-body">
                  <!-- Mobile fields preserved -->
                  <div class="mobile-card-row">
                    <span class="label">{{ $t('farmerDemand.columns.batchNo') }}:</span>
                    <span class="value">{{ item.batchNo }}</span>
                  </div>
                  <div class="mobile-card-row" v-if="showFarmerIdentityFields">
                    <span class="label">{{ $t('farmerDemand.columns.farmerIdNumber') }}:</span>
                    <span class="value">{{ item.farmerIdNumber }}</span>
                  </div>
                  <div class="mobile-card-row">
                    <span class="label">{{ $t('farmerDemand.columns.kebele') }}:</span>
                    <span class="value">{{ item.kebeleName }}</span>
                  </div>
                  <div class="mobile-card-row" v-if="showFarmerIdentityFields">
                    <span class="label">{{ $t('farmerDemand.columns.landArea') }}:</span>
                    <span class="value">{{ item.landArea || '-' }}</span>
                  </div>
                  <div class="mobile-card-row">
                    <span class="label">{{ $t('farmerDemand.columns.daUserName') }}:</span>
                    <span class="value">{{ item.daUserName }}</span>
                  </div>
                  <div class="mobile-card-row">
                    <span class="label">{{ $t('farmerDemand.columns.createdTime') }}:</span>
                    <span class="value">{{ item.createdTime || '-' }}</span>
                  </div>
                </div>
                <div class="mobile-card-footer">
                   <FarmerActionButtons
                      :status="item.status"
                      @action="(action) => handleAction(item, action)"
                    />
                </div>
              </div>

              <!-- 移动端分页 -->
              <div class="pagination-wrapper mobile-pagination">
                <el-pagination
                  v-model:current-page="pagination.currentPage"
                  v-model:page-size="pagination.pageSize"
                  :page-sizes="[10, 20, 50]"
                  :total="pagination.total"
                  layout="total, prev, pager, next"
                  small
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                />
              </div>
            </div>

            <!-- 空状态 -->
            <el-empty v-if="tableData.length === 0 && !loading" :description="$t('farmerDemand.messages.noData')" />
          </div>
        </InfoCard>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getFarmerDemandPage, deleteFarmerDemand, submitForAudit } from '@/api/farmerDemand'
import { PageHeader, InfoCard, SearchForm, SearchItem } from '@/components/common'
import StatusTabs from '@/components/workflow/StatusTabs.vue'
import FarmerActionButtons from './components/FarmerActionButtons.vue'
import { getCurrentUserIdentity, getDemandKebeleCode } from '@/utils/demandHierarchy'

const router = useRouter()
const { t } = useI18n()

const loading = ref(false)
const tableData = ref([])
const selectedRows = ref([])
const activeTab = ref('all')
const currentYear = new Date().getFullYear().toString()
const KEBELE_LEVEL = '4'

const searchForm = reactive({
  farmerName: '',
  phone: ''
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const tabConfig = [
  {
    name: 'all',
    label: 'farmerDemand.tabs.all',
    icon: 'ri-list-check'
  },
  {
    name: 'wholeDemand',
    label: 'farmerDemand.tabs.wholeDemand',
    icon: 'ri-file-list-3-line'
  },
  {
    name: 'byFarmers',
    label: 'farmerDemand.tabs.byFarmers',
    icon: 'ri-user-3-line'
  }
]

const showFarmerIdentityFields = computed(() => activeTab.value !== 'byFarmers')

// 状态选项（0: 草稿, 1: 已提交, 2: 已通过, 3: 驳回, 4: 已锁定）
const statusOptions = computed(() => ({
  '0': t('farmerDemand.status.draft'),
  '1': t('farmerDemand.status.submitted'),
  '2': t('farmerDemand.status.approved'),
  '3': t('farmerDemand.status.rejected'),
  '4': t('farmerDemand.status.locked'),
}))

// 获取状态标签
const getStatusLabel = (status) => {
  return statusOptions.value[status] || status
}

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    '0': 'info', // draft
    '1': 'warning', // submitted
    '2': 'success', // approved
    '3': 'danger', // rejected
    '4': '', // locked
  }
  return typeMap[status] || 'info'
}

// 统一动作处理
const handleAction = (row, action) => {
  switch (action) {
    case 'view':
      handleView(row)
      break
    case 'edit':
      handleEdit(row)
      break
    case 'submit':
      handleSubmit(row)
      break
    case 'delete':
      handleDelete(row)
      break
  }
}


// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await getFarmerDemandPage({
      pageNum: pagination.currentPage,
      pageSize: pagination.pageSize,
      farmerName: searchForm.farmerName,
      phone: searchForm.phone,
      demandEntryType: activeTab.value === 'wholeDemand'
        ? 'WHOLE_DEMAND'
        : activeTab.value === 'byFarmers'
          ? 'BY_FARMERS'
          : '',
      orderByColumn: 'createdTime',
      isAsc: 'desc'
    })
    if (res.code === 200) {
      tableData.value = res.data?.records || res.data?.list || []
      pagination.total = res.data?.total || 0
      // 初始化移动端复选框状态
      tableData.value.forEach(item => {
        item.checked = selectedRows.value.some(r => r.id === item.id)
      })
    }
  } catch (error) {
    console.error('Failed to load data:', error)
    ElMessage.error(t('common.loadFailed'))
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  loadData()
}

// 重置
const handleReset = () => {
  searchForm.farmerName = ''
  searchForm.phone = ''
  handleSearch()
}

// 新增
const handleAdd = () => {
  router.push({ name: 'FarmerDemandAdd' })
}

const handleAddByFarmers = () => {
  router.push({ name: 'FarmerDemandAddByFarmers' })
}

const handleTabChange = () => {
  pagination.currentPage = 1
  selectedRows.value = []
  loadData()
}

// 查看
const handleView = (row) => {
  router.push({ name: 'FarmerDemandDetail', params: { id: row.id } })
}

// 编辑
const handleEdit = (row) => {
  router.push({ name: 'FarmerDemandEdit', params: { id: row.id } })
}

// 判断行是否可选择（只有草稿(0)和驳回(3)状态可以提交审核）
const rowSelectable = (row) => {
  return row.status === '0' || row.status === '3'
}

const getSubmitSourceCode = (row) => getDemandKebeleCode(row)

const buildSubmitPayload = (rows) => {
  const sourceCode = getSubmitSourceCode(rows[0])
  const currentUser = getCurrentUserIdentity()

  return {
    ids: rows.map(row => row.id),
    sourceCode,
    kebele: sourceCode,
    kebeleCode: sourceCode,
    level: KEBELE_LEVEL,
    year: currentYear,
    ...currentUser
  }
}

// 表格选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 移动端复选框变化
const handleMobileCheckChange = (item) => {
  if (item.checked) {
    if (!selectedRows.value.find(r => r.id === item.id)) {
      selectedRows.value.push(item)
    }
  } else {
    selectedRows.value = selectedRows.value.filter(r => r.id !== item.id)
  }
}

// 单条提交审核
const handleSubmit = async (row) => {
  try {
    await ElMessageBox.confirm(
      t('farmerDemand.submitConfirm'),
      t('common.tip'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )
    const sourceCode = getSubmitSourceCode(row)
    if (!sourceCode) {
      ElMessage.error(t('farmerDemand.rules.kebeleRequired'))
      return
    }

    const res = await submitForAudit(buildSubmitPayload([row]))
    if (res.code === 200) {
      const result = res.data
      if (result.successCount > 0) {
        ElMessage.success(t('farmerDemand.submitSuccess'))
        loadData()
      } else {
        ElMessage.error(t('farmerDemand.submitFailed'))
      }
    } else {
      ElMessage.error(res.msg || t('farmerDemand.submitFailed'))
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to submit:', error)
      ElMessage.error(t('farmerDemand.submitFailed'))
    }
  }
}

// 批量提交审核
const handleBatchSubmit = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning(t('farmerDemand.pleaseSelectData'))
    return
  }

  try {
    await ElMessageBox.confirm(
      t('farmerDemand.batchSubmitConfirm', { count: selectedRows.value.length }),
      t('common.tip'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )

    const rowsWithoutKebele = selectedRows.value.filter(row => !getSubmitSourceCode(row))
    if (rowsWithoutKebele.length > 0) {
      ElMessage.error(t('farmerDemand.rules.kebeleRequired'))
      return
    }

    const groupedRows = selectedRows.value.reduce((groups, row) => {
      const sourceCode = getSubmitSourceCode(row)
      if (!groups[sourceCode]) {
        groups[sourceCode] = []
      }
      groups[sourceCode].push(row)
      return groups
    }, {})

    const responses = await Promise.all(
      Object.values(groupedRows).map(rows => submitForAudit(buildSubmitPayload(rows)))
    )

    const allSuccess = responses.every(res => res.code === 200)

    if (allSuccess) {
      const result = responses.reduce((total, res) => {
        const data = res.data || {}
        total.successCount += data.successCount || 0
        total.failCount += data.failCount || 0
        return total
      }, { successCount: 0, failCount: 0 })

      if (result.successCount > 0) {
        ElMessage.success(
          t('farmerDemand.batchSubmitResult', {
            success: result.successCount,
            fail: result.failCount
          })
        )
        selectedRows.value = []
        loadData()
      } else {
        ElMessage.error(t('farmerDemand.submitFailed'))
      }
    } else {
      const failedResponse = responses.find(res => res.code !== 200)
      ElMessage.error(failedResponse?.msg || t('farmerDemand.submitFailed'))
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to batch submit:', error)
      ElMessage.error(t('farmerDemand.submitFailed'))
    }
  }
}


// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      t('farmerDemand.deleteConfirm'),
      t('common.warning'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )
    const res = await deleteFarmerDemand(row.id)
    if (res.code === 200) {
      ElMessage.success(t('farmerDemand.deleteSuccess'))
      loadData()
    } else {
      ElMessage.error(res.msg || t('farmerDemand.messages.deleteFailed'))
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete:', error)
      ElMessage.error(t('farmerDemand.messages.deleteFailed'))
    }
  }
}

// 分页
const handleSizeChange = () => {
  pagination.currentPage = 1
  loadData()
}

const handleCurrentChange = () => {
  loadData()
}

// 初始化
onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/page-common.scss';
@use '@/assets/styles/workflow-common.scss';
@use '@/assets/styles/table-enhanced.scss';

// 自定义样式（部分保留逻辑）
.mobile-card-footer {
  padding-top: 12px;
  border-top: 1px solid var(--border-color-lighter);
}
</style>
