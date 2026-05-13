<template>
  <div class="page-container">
    <div class="page-wrapper">
      <!-- 页面头部 -->
      <PageHeader
        icon="ri-file-transfer-line"
        :title="$t('inputCirculation.oseReleaseToWoreda')"
        :subtitle="$t('inputCirculation.oseReleaseToWoreda')" />

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
        <InfoCard :title="$t('inputCirculation.oseReleaseToWoreda')" icon="ri-file-list-3-line">
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
              <el-table-column prop="releaseName" :label="$t('inputCirculation.releaseName')" min-width="200" show-overflow-tooltip />
              <el-table-column prop="targetId" :label="$t('inputCirculation.woredaId')" min-width="150" show-overflow-tooltip />
              <el-table-column prop="targetContact" :label="$t('inputCirculation.woredaContact')" min-width="160" show-overflow-tooltip />
              <el-table-column prop="releaseDate" :label="$t('inputCirculation.releaseDate')" min-width="160" />
              <el-table-column prop="status" :label="$t('inputCirculation.status')" min-width="120" />
              <el-table-column :label="$t('inputCirculation.stockStatus')" min-width="140">
                <template #default="scope">
                  <el-tag :type="getStockStatusTag(scope.row.stockStatus)" size="small">
                    {{ getStockStatusText(scope.row.stockStatus) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="releaseBy" :label="$t('inputCirculation.releaseBy')" min-width="160" show-overflow-tooltip />
              <el-table-column prop="auditBy" :label="$t('inputCirculation.auditBy')" min-width="160" show-overflow-tooltip />
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
                <span class="label">{{ $t('inputCirculation.woredaId') }}:</span>
                <span class="value">{{ item.targetId }}</span>
              </div>
              <div class="mobile-card-row">
                <span class="label">{{ $t('inputCirculation.woredaContact') }}:</span>
                <span class="value">{{ item.targetContact }}</span>
              </div>
              <div class="mobile-card-row">
                <span class="label">{{ $t('inputCirculation.releaseDate') }}:</span>
                <span class="value">{{ item.releaseDate }}</span>
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
import { getOseReleaseList, deleteOseRelease, getReleaseStockStatus } from '@/api/inputCirculation'
import { PageHeader, InfoCard, SearchForm, SearchItem } from '@/components/common'
import ActionButtons from '@/components/workflow/ActionButtons.vue'

const { t } = useI18n()
const router = useRouter()

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

const handleQuery = async () => {
  loading.value = true
  queryParams.releaseType = 'OSE_TO_UNION'
  if (dateRange.value && dateRange.value.length === 2) {
    queryParams.startTime = dateRange.value[0]
    queryParams.endTime = dateRange.value[1]
  } else {
    queryParams.startTime = ''
    queryParams.endTime = ''
  }
  try {
    const response = await getOseReleaseList(queryParams)
    if (response.code === 200) {
      releaseList.value = response.rows || []
      total.value = response.total || 0
      // 加载出入库状态
      await loadStockStatus()
    } else {
      ElMessage.error(response.msg || t('common.queryFailed'))
    }
  } catch (error) {
    ElMessage.error(t('common.queryFailed'))
  } finally {
    loading.value = false
  }
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

const handleAdd = () => {
  router.push({
    path: '/input/input-circulation/ose-release/add',
    query: { from: 'zone-woreda' }
  })
}

const handleEdit = (row) => {
  router.push({
    path: `/input/input-circulation/ose-release/edit/${row.id}`,
    query: { from: 'zone-woreda' }
  })
}

const handleView = (row) => {
  router.push({
    path: `/input/input-circulation/ose-release/detail/${row.id}`,
    query: { from: 'zone-woreda' }
  })
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(t('common.confirmDelete'), t('common.warning'), { type: 'warning' })
    const response = await deleteOseRelease(row.id, 1)
    if (response.code === 200) {
      ElMessage.success(t('common.deleteSuccess'))
      handleQuery()
    } else {
      ElMessage.error(response.msg || t('common.deleteFailed'))
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(t('common.deleteFailed'))
    }
  }
}

// 统一的动作处理方法
const handleAction = (row, action) => {
  switch (action) {
    case 'view':
      handleView(row)
      break
    case 'edit':
      handleEdit(row)
      break
    case 'cancelBatch':
      handleDelete(row)
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

const handleDeleteBatch = async () => {
  if (!selectedIds.value.length) return
  try {
    await ElMessageBox.confirm(t('common.confirmDelete'), t('common.warning'), { type: 'warning' })
    const response = await deleteOseRelease(selectedIds.value.join(','), 1)
    if (response.code === 200) {
      ElMessage.success(t('common.deleteSuccess'))
      handleQuery()
    } else {
      ElMessage.error(response.msg || t('common.deleteFailed'))
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(t('common.deleteFailed'))
    }
  }
}

const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id)
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
