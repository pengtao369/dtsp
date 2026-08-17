<template>
  <div class="page-container">
    <div class="page-wrapper">
      <!-- 页面头部 -->
      <PageHeader
        icon="ri-database-2-line"
        :title="$t('villageAggregation.title')"
        :subtitle="$t('villageAggregation.subtitle')"
      />

      <!-- 内容区域 -->
      <div class="content-wrapper">
        <InfoCard
          :title="$t('Aggregation List')"
          icon="ri-list-check"
          :is-list="true"
        >
          <div class="card-body">
            <div class="filter-bar">
              <el-select
                v-model="exportFilters.season"
                :placeholder="$t('farmerDemand.form.season')"
                clearable
                style="width: 220px"
              >
                <el-option
                  v-for="item in options.agri_season || []"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>

            <!-- PC端表格 -->
            <div class="table-wrapper pc-only">
              <el-table
                v-loading="loading"
                :data="tableData"
                stripe
                empty-text=""
                :default-sort="{ prop: 'year', order: 'descending' }"
              >
                <el-table-column
                  prop="year"
                  :label="$t('villageAggregation.columns.year')"
                  min-width="100"
                />
                <el-table-column
                  prop="sourceName"
                  :label="$t('KebeleName')"
                  min-width="140"
                />
                <el-table-column
                  prop="subQuantity"
                  :label="$t('villageAggregation.columns.subQuantity')"
                  min-width="140"
                >
                </el-table-column>
                <el-table-column
                    prop="unsubmitQuantity"
                    :label="$t('Unsubmit Quantity')"
                    min-width="140"
                >
                </el-table-column>
                <el-table-column
                    prop="submitQuantity"
                    :label="$t('Submit Quantity')"
                    min-width="140"
                >
                </el-table-column>
                <el-table-column
                    prop="auditQuantity"
                    :label="$t('Audit Quantity')"
                    min-width="140"
                >
                </el-table-column>
                <el-table-column
                  prop="status"
                  :label="$t('villageAggregation.columns.status')"
                  min-width="100"
                >
                  <template #default="{ row }">
                    <el-tag v-if="row.status === '0'" type="info">
                      {{ $t('villageAggregation.status.draft') }}
                    </el-tag>
                    <el-tag v-else-if="row.status === '1'" type="warning">
                      {{ $t('villageAggregation.status.pending') }}
                    </el-tag>
                    <el-tag v-else-if="row.status === '2'" type="success">
                      {{ $t('villageAggregation.status.approved') }}
                    </el-tag>
                    <el-tag v-else-if="row.status === '3'" type="danger">
                      {{ $t('villageAggregation.status.rejected') }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="createTime"
                  :label="$t('villageAggregation.columns.createTime')"
                  min-width="160"
                />
                <el-table-column
                  :label="$t('villageAggregation.columns.actions')"
                  fixed="right"
                  width="340"
                >
                  <template #default="{ row }">
                    <div class="action-buttons">
                      <ActionButtons
                        :custom-buttons="getCustomButtons(row)"
                        :workflow-status="row.status"
                        mode="list"
                        :show-audit="false"
                        @action="(action) => handleTableAction(row, action)"
                      />
                    </div>
                  </template>
                </el-table-column>
              </el-table>

              <!-- PC pagination -->
              <div class="pagination-wrapper">
                <el-pagination
                  v-model:current-page="pagination.currentPage"
                  v-model:page-size="pagination.pageSize"
                  :total="pagination.total"
                  :page-sizes="[5, 10, 20, 50, 100]"
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
                  <div class="mobile-card-title">
                    <i class="ri-calendar-line"></i>
                    <span>{{ item.year }}</span>
                  </div>
                  <el-tag v-if="item.status === '0'" type="info" size="small">
                    {{ $t('villageAggregation.status.draft') }}
                  </el-tag>
                  <el-tag v-else-if="item.status === '1'" type="warning" size="small">
                    {{ $t('villageAggregation.status.pending') }}
                  </el-tag>
                  <el-tag v-else-if="item.status === '2'" type="success" size="small">
                    {{ $t('villageAggregation.status.approved') }}
                  </el-tag>
                  <el-tag v-else-if="item.status === '3'" type="danger" size="small">
                    {{ $t('villageAggregation.status.rejected') }}
                  </el-tag>
                </div>
                <div class="mobile-card-body">
                  <div class="mobile-card-row">
                    <span class="label">{{ $t('KebeleName') }}:</span>
                    <span class="value">{{ item.sourceName }}</span>
                  </div>
                  <div class="mobile-card-row">
                    <span class="label">{{ $t('villageAggregation.columns.subQuantity') }}:</span>
                    <span class="value">{{ (item.approvedQuantity || 0) + '/' + (item.subQuantity || 0) }}</span>
                  </div>
                  <div class="mobile-card-row">
                    <span class="label">{{ $t('villageAggregation.columns.creator') }}:</span>
                    <span class="value">{{ item.creator }}</span>
                  </div>
                  <div class="mobile-card-row">
                    <span class="label">{{ $t('villageAggregation.columns.createTime') }}:</span>
                    <span class="value">{{ item.createTime }}</span>
                  </div>
                </div>
                <div class="mobile-card-footer">
                  <ActionButtons
                    :custom-buttons="getCustomButtons(item)"
                    :workflow-status="item.status"
                    mode="list"
                    :show-audit="false"
                    @action="(action) => handleTableAction(item, action)"
                  />
                </div>
              </div>

              <!-- Mobile pagination -->
              <div class="pagination-wrapper mobile-pagination">
                <el-pagination
                  v-model:current-page="pagination.currentPage"
                  v-model:page-size="pagination.pageSize"
                  :page-sizes="[5, 10, 20, 50]"
                  :total="pagination.total"
                  layout="total, prev, pager, next"
                  small
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                />
              </div>
            </div>

            <!-- 空状态 -->
            <el-empty
              v-if="tableData.length === 0 && !loading"
              :description="$t('villageAggregation.messages.noData')"
            />
          </div>
        </InfoCard>
      </div>
    </div>

    <!-- 新增年度对话框 -->
    <el-dialog
      v-model="addYearDialogVisible"
      :title="$t('villageAggregation.addYearDialog.title')"
      width="500px"
    >
      <el-form :model="addYearForm" :rules="addYearRules" ref="addYearFormRef" label-width="100px">
        <el-form-item :label="$t('villageAggregation.addYearDialog.year')" prop="year">
          <el-date-picker
            v-model="addYearForm.year"
            type="year"
            :placeholder="$t('villageAggregation.addYearDialog.yearPlaceholder')"
            style="width: 100%"
            value-format="YYYY"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addYearDialogVisible = false">
          {{ $t('villageAggregation.addYearDialog.cancel') }}
        </el-button>
        <el-button type="primary" @click="confirmAddYear" :loading="submitting">
          {{ $t('villageAggregation.addYearDialog.confirm') }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 汇聚明细对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="$t('villageAggregation.detailDialog.title')"
      width="80%"
      top="5vh"
    >
      <el-table
        v-loading="detailLoading"
        :data="detailData"
        stripe
        max-height="500px"
      >
        <el-table-column
          prop="inputCategory"
          :label="$t('villageAggregation.detailDialog.columns.inputCategory')"
          min-width="150"
        >
          <template #default="{ row }">
            {{ getLabelByValue('input_category', row.inputCategory) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="inputType"
          :label="$t('villageAggregation.detailDialog.columns.inputType')"
          min-width="150"
        >
          <template #default="{ row }">
            {{ getLabelByValue('input_type', row.inputType) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="season"
          :label="$t('farmerDemand.form.season')"
          min-width="120"
        >
          <template #default="{ row }">
            {{ getLabelByValue('agri_season', row.season || row.seasonCode || row.season_code) || row.season || row.seasonCode || row.season_code || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="variety"
          :label="$t('farmerDemand.form.variety')"
          min-width="150"
        >
          <template #default="{ row }">
            {{ row.variety || '-' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="totalQuantity"
          :label="$t('villageAggregation.detailDialog.columns.totalQuantity')"
          min-width="120"
        />
      </el-table>

      <el-empty
        v-if="detailData.length === 0 && !detailLoading"
        :description="$t('villageAggregation.detailDialog.noData')"
      />

      <template #footer>
        <el-button @click="detailDialogVisible = false">
          {{ $t('common.close') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createVillageDemandSummaryMain, getVillageDemandSummaryMainList, aggregateVillageInputDemand, getVillageAggregationDetail, updateVillageDemandSummaryMain } from '@/api/villageAggregation'
import { getApprovedDemandPage } from '@/api/demandAudit'
import { useDict } from '@/hooks/useDict'
import { PageHeader, InfoCard } from '@/components/common'
import ActionButtons from '@/components/workflow/ActionButtons.vue'
import { getCurrentDeptCode } from '@/utils/demandHierarchy'

const { getLabelByValue, options } = useDict(['input_type', 'input_category', 'agri_season'])

const router = useRouter()
const { t } = useI18n()

const loading = ref(false)
const submitting = ref(false)
const tableData = ref([])

const exportFilters = reactive({
  season: ''
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 5,
  total: 0
})

// 新增年度对话框
const addYearDialogVisible = ref(false)
const addYearFormRef = ref(null)
const addYearForm = reactive({
  year: ''
})

const addYearRules = reactive({
  year: [
    { required: true, message: t('villageAggregation.addYearDialog.yearRequired'), trigger: 'change' }
  ]
})

// 汇聚明细对话框
const detailDialogVisible = ref(false)
const detailLoading = ref(false)
const detailData = ref([])
const currentDetailRow = ref(null)

const detailPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 加载每行已审批数量（approvedQuantity）
const loadApprovedCountForRow = async (row) => {
  try {
    const params = {
      pageNum: 1,
      pageSize: 1,
      kebele: row.sourceCode || getCurrentDeptCode(),
      year: row.year
    }
    const res = await getApprovedDemandPage(params)
    if (res.code === 200 && res.data) {
      row.approvedQuantity = res.data.total || 0
    }
  } catch (error) {
    console.error('Failed to load approved count for row:', error)
  }
}

// 获取自定义按钮
const getCustomButtons = (row) => {
  const buttons = [
    { 
      type: 'primary', 
      action: 'approve', 
      label: 'villageAggregation.actions.approve', 
      icon: 'ri-eye-line' 
    }
  ]
  
  // Submit button logic
  if (row.status === '0' || row.status === '3') {
    buttons.push({ 
      type: 'success', 
      action: 'submit', 
      label: 'villageAggregation.actions.submit', 
      icon: 'ri-upload-cloud-line' 
    })
  }

  // Detail button
  buttons.push({ 
    type: 'primary', 
    action: 'detail', 
    label: 'villageAggregation.detailDialog.title', 
    icon: 'ri-list-check' 
  })

  buttons.push({
    type: 'success',
    action: 'export',
    label: 'common.export',
    icon: 'ri-download-line'
  })

  return buttons
}

// 统一动作处理
const handleTableAction = (row, action) => {
  if (action === 'approve') handleApprove(row)
  else if (action === 'submit') handleSubmit(row)
  else if (action === 'detail') handleDetail(row)
  else if (action === 'export') handleExport(row)
}

const escapeCsvCell = (value) => {
  if (value === null || value === undefined) return ''
  const stringValue = String(value)
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

const downloadCsv = (content, filename) => {
  const blob = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const normalizeSeasonValue = (value) => String(value ?? '').trim().toLowerCase()

const getSeasonFilterCandidates = (selectedSeason) => {
  const selected = options.value.agri_season?.find((item) => String(item.value) === String(selectedSeason))
  return new Set(
    [
      selectedSeason,
      selected?.actualValue,
      selected?.label
    ]
      .filter(Boolean)
      .map(normalizeSeasonValue)
  )
}

const matchesSelectedSeason = (item, selectedSeason) => {
  if (!selectedSeason) return true

  const filterCandidates = getSeasonFilterCandidates(selectedSeason)
  const recordSeason = item.season ?? item.seasonCode ?? item.season_code
  const recordCandidates = new Set(
    [
      recordSeason,
      getLabelByValue('agri_season', recordSeason)
    ]
      .filter(Boolean)
      .map(normalizeSeasonValue)
  )

  return [...recordCandidates].some((candidate) => filterCandidates.has(candidate))
}

const handleExport = async (row) => {
  try {
    const res = await getVillageAggregationDetail({
      sourceCode: row.sourceCode,
      year: row.year
    })

    if (res.code !== 200) {
      ElMessage.error(res.msg || t('villageAggregation.detailDialog.loadFailed'))
      return
    }

    const selectedSeason = exportFilters.season
    const records = (res.data || []).filter((item) => matchesSelectedSeason(item, selectedSeason))

    if (records.length === 0) {
      ElMessage.warning(t('villageAggregation.detailDialog.noData'))
      return
    }

    const headers = [
      'Kebele Name',
      t('villageAggregation.detailDialog.columns.inputCategory'),
      t('villageAggregation.detailDialog.columns.inputType'),
      t('farmerDemand.form.season'),
      t('farmerDemand.form.variety'),
      t('villageAggregation.detailDialog.columns.totalQuantity')
    ]

    const rows = records.map((item) => [
      row.sourceName || '-',
      getLabelByValue('input_category', item.inputCategory) || item.inputCategory || '-',
      getLabelByValue('input_type', item.inputType) || item.inputType || '-',
      getLabelByValue('agri_season', item.season || item.seasonCode || item.season_code) || item.season || item.seasonCode || item.season_code || '-',
      item.variety || '-',
      item.totalQuantity ?? '-'
    ])

    const csvContent = [headers, ...rows]
      .map((csvRow) => csvRow.map(escapeCsvCell).join(','))
      .join('\n')

    const safeSourceName = (row.sourceName || 'aggregation-results').replace(/[\\/:*?"<>|]/g, '_')
    const seasonLabel = selectedSeason
      ? (getLabelByValue('agri_season', selectedSeason) || selectedSeason)
      : 'all-seasons'
    const safeSeasonLabel = seasonLabel.replace(/[\\/:*?"<>|\s]/g, '_')
    downloadCsv(csvContent, `${safeSourceName}-${row.year}-${safeSeasonLabel}-aggregation-results.csv`)
    ElMessage.success(t('common.success'))
  } catch (error) {
    console.error('Failed to export aggregation results:', error)
    ElMessage.error(t('villageAggregation.detailDialog.loadFailed'))
  }
}

// 加载列表数据
const loadData = async () => {
  loading.value = true
  try {
    console.log('currentPage',pagination.currentPage)
    console.log('pageSize',pagination.pageSize)
    const params = {
      page: pagination.currentPage, // 修正为 page
      pageSize: pagination.pageSize,
      sourceCode: getCurrentDeptCode(),
      level: '0',
      orderByColumn: 'year',
      isAsc: 'desc'
    }
    const res = await getVillageDemandSummaryMainList(params)

    if (res.code === 200) {
      tableData.value = res.data?.list || []
      pagination.total = res.data?.total || 0

      // 为每行加载已审批数量
      await Promise.all(tableData.value.map(item => loadApprovedCountForRow(item)))
    }
  } catch (error) {
    console.error('Failed to load data:', error)
    ElMessage.error(t('villageAggregation.messages.loadFailed'))
  } finally {
    loading.value = false
  }
}

// 打开新增年度对话框
const handleAddYear = () => {
  addYearForm.year = ''
  addYearDialogVisible.value = true
}

// 确认新增年度
const confirmAddYear = async () => {
  if (!addYearFormRef.value) return

  try {
    await addYearFormRef.value.validate()

    submitting.value = true
    const res = await createVillageDemandSummaryMain({
      year: addYearForm.year,
      sourceCode: getCurrentDeptCode(),
      // sourceCode: 'huangshan',
      status: '0',
      level: '0',
      creator: JSON.parse(localStorage.getItem('userInfo')).userName,
      // subQuantity: 0//农民数||村的数量||
    })

    if (res.code === 200) {
      ElMessage.success(t('villageAggregation.addYearDialog.success'))
      addYearDialogVisible.value = false
      loadData()
    } else {
      // ElMessage.error(res.msg || t('villageAggregation.addYearDialog.failed'))
    }
  } catch (error) {
    if (error !== false) {
      // console.error('Failed to add year:', error)
      // ElMessage.error(t('villageAggregation.addYearDialog.failed'))
    }
  } finally {
    submitting.value = false
  }
}

// 审批 - 跳转到审核页面
const handleApprove = (row) => {
  router.push({
    name: 'VillageAuditDetail',
    params: { year: row.year }
  })
}

// 汇聚数据提交 - 调用汇聚接口
const handleSubmit = async (row) => {
  try {
    await ElMessageBox.confirm(
      t('villageAggregation.submitDialog.confirmMessage'),
      t('common.warning'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )

    submitting.value = true
    const targetCode = row.targetCode || getCurrentDeptCode()
    const res = await aggregateVillageInputDemand({
      sourceCode: row.sourceCode,
      targetCode,
      year: row.year,
      level: '3',
      demandSummaryId: row.id
    })

    if (res.code === 200) {
      ElMessage.success(t('villageAggregation.submitDialog.success'))

      // 更新状态为待审核（1）
      const updateRes = await updateVillageDemandSummaryMain({
        id: row.id,
        sourceCode: row.sourceCode,
        status: '1'
      })

      if (updateRes.code === 200) {
        loadData()
      } else {
        ElMessage.error(updateRes.msg || t('villageAggregation.submitDialog.failed'))
      }
    } else {
      ElMessage.error(res.msg || t('villageAggregation.submitDialog.failed'))
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to submit aggregation:', error)
      ElMessage.error(t('villageAggregation.submitDialog.failed'))
    }
  } finally {
    submitting.value = false
  }
}

// 查看汇聚明细
const handleDetail = async (row) => {
  currentDetailRow.value = row
  detailDialogVisible.value = true
  detailPagination.currentPage = 1
  await loadDetailData()
}

// 加载明细数据
const loadDetailData = async () => {
  if (!currentDetailRow.value) return

  detailLoading.value = true
  try {
    const res = await getVillageAggregationDetail({
      sourceCode: currentDetailRow.value.sourceCode,
      year: currentDetailRow.value.year
    })

    if (res.code === 200) {
      detailData.value = res.data || []
      detailPagination.total = res.data?.length || 0
    }
  } catch (error) {
    console.error('Failed to load detail data:', error)
    ElMessage.error(t('villageAggregation.detailDialog.loadFailed'))
  } finally {
    detailLoading.value = false
  }
}

// 明细分页变化
const handleDetailSizeChange = () => {
  detailPagination.currentPage = 1
  loadDetailData()
}

const handleDetailCurrentChange = () => {
  loadDetailData()
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

// 自定义样式可以根据需要添加，大部分已包含在通用样式中
.filter-bar {
  display: flex;
  width: 100%;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 16px;
}
</style>
