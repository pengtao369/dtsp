<template>
  <div class="page-container">
    <div class="page-wrapper">
      <!-- 页面头部 -->
      <PageHeader
        icon="ri-file-transfer-line"
        :title="$t('inputCirculation.unionReleaseToCooperative')"
        :subtitle="$t('inputCirculation.unionReleaseToCooperative')" />

      <!-- 内容区域 -->
      <div class="content-wrapper">
        <!-- 搜索卡片（无标题） -->
        <div class="search-card">
          <SearchForm @search="handleQuery" @reset="handleReset">
            <SearchItem :label="$t('inputCirculation.releaseName')">
              <el-input
                v-model="queryParams.releaseName"
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

        <!-- 列表卡片 -->
        <InfoCard :title="$t('inputCirculation.unionReleaseToCooperative')" icon="ri-file-list-3-line">
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
              <el-table-column prop="releaseName" :label="$t('inputCirculation.releaseName')" min-width="180" show-overflow-tooltip />
              <el-table-column prop="targetId" :label="$t('inputCirculation.targetWoreda')" min-width="150" show-overflow-tooltip />
              <el-table-column prop="releaseDate" :label="$t('inputCirculation.releaseDate')" width="180">
                <template #default="{ row }">
                  {{ formatDateTime(row.releaseDate) }}
                </template>
              </el-table-column>
              <el-table-column prop="status" :label="$t('inputCirculation.status')" width="120" />
              <el-table-column :label="$t('inputCirculation.stockStatus')" min-width="140">
                <template #default="scope">
                  <el-tag :type="getStockStatusTag(scope.row.stockStatus)" size="small">
                    {{ getStockStatusText(scope.row.stockStatus) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="releaseBy" :label="$t('inputCirculation.releaseBy')" width="120" show-overflow-tooltip />
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
                <span>{{ item.releaseName }}</span>
              </div>
            </div>
            <div class="mobile-card-body">
              <div class="mobile-card-row">
                <span class="label">{{ $t('inputCirculation.releaseId') }}:</span>
                <span class="value">{{ item.releaseId }}</span>
              </div>
              <div class="mobile-card-row">
                <span class="label">{{ $t('inputCirculation.targetWoreda') }}:</span>
                <span class="value">{{ item.targetId }}</span>
              </div>
              <div class="mobile-card-row">
                <span class="label">{{ $t('inputCirculation.releaseDate') }}:</span>
                <span class="value">{{ formatDateTime(item.releaseDate) }}</span>
              </div>
              <div class="mobile-card-row">
                <span class="label">{{ $t('inputCirculation.releaseBy') }}:</span>
                <span class="value">{{ item.releaseBy }}</span>
              </div>
              <div class="mobile-card-row">
                <span class="label">{{ $t('inputCirculation.stockStatus') }}:</span>
                <el-tag :type="getStockStatusTag(item.stockStatus)" size="small">
                  {{ getStockStatusText(item.stockStatus) }}
                </el-tag>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUnionReleaseList, deleteUnionRelease, getReleaseStockStatus } from '@/api/inputCirculation'
import { PageHeader, InfoCard, SearchForm, SearchItem } from '@/components/common'
import ActionButtons from '@/components/workflow/ActionButtons.vue'

const router = useRouter()
const { t } = useI18n()

const loading = ref(false)
const releaseList = ref([])
const total = ref(0)
const selectedIds = ref([])
const dateRange = ref([])

const queryParams = reactive({
  releaseName: '',
  inputType: '',
  startTime: '',
  endTime: '',
  flag: 1,
  pageNum: 1,
  pageSize: 10
})

// 查询列表
const handleQuery = () => {
  queryParams.releaseType = 'UNION_TO_WOREDA'
  if (dateRange.value && dateRange.value.length === 2) {
    queryParams.startTime = dateRange.value[0]
    queryParams.endTime = dateRange.value[1]
  } else {
    queryParams.startTime = ''
    queryParams.endTime = ''
  }

  loading.value = true
  getUnionReleaseList(queryParams)
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

// 获取出入库状态文本
const getStockStatusText = (status) => {
  return t(`inputCirculation.stockStatus_${status || 'notProcessed'}`)
}

// 重置查询
const handleReset = () => {
  queryParams.releaseName = ''
  queryParams.inputType = ''
  dateRange.value = []
  queryParams.pageNum = 1
  handleQuery()
}

// 新增
const handleAdd = () => {
  router.push('/input/input-circulation/union-release/add')
}

// 编辑
const handleEdit = (id) => {
  router.push(`/input/input-circulation/union-release/edit/${id}`)
}

// 详情
const handleDetail = (id) => {
  router.push(`/input/input-circulation/union-release/detail/${id}`)
}

// 删除
const handleDelete = (id) => {
  ElMessageBox.confirm(t('common.deleteConfirm'), t('warning'), {
    confirmButtonText: t('confirm'),
    cancelButtonText: t('cancel'),
    type: 'warning'
  }).then(() => {
    deleteUnionRelease(id, 1).then(() => {
      ElMessage.success(t('deleteSuccess'))
      handleQuery()
    })
  })
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning(t('pleaseSelectData'))
    return
  }
  ElMessageBox.confirm(t('batchDeleteConfirm'), t('warning'), {
    confirmButtonText: t('confirm'),
    cancelButtonText: t('cancel'),
    type: 'warning'
  }).then(() => {
    deleteUnionRelease(selectedIds.value.join(','), 1).then(() => {
      ElMessage.success(t('deleteSuccess'))
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
    { type: 'danger', action: 'cancelBatch', label: 'void', icon: 'ri-delete-bin-line' }
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
</style>
