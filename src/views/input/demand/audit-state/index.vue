<template>
  <div class="page-container">
    <div class="page-wrapper">
      <!-- 页面头部 -->
      <PageHeader
        icon="ri-task-line"
        :title="$t('stateAggregationAudit.title')"
        :subtitle="$t('stateAggregationAudit.subtitle')"
      >
        <template #actions>
          <el-button type="primary" @click="handleBack">
            <i class="ri-arrow-left-line"></i>
            {{ $t('demandAudit.actions.back') }}
          </el-button>
        </template>
      </PageHeader>

      <!-- 内容区域 -->
      <div class="content-wrapper">
        <InfoCard 
          :title="$t('stateAggregationAudit.listTitle')" 
          icon="ri-list-check"
          :no-padding="true"
        >
          <!-- PC端表格 -->
          <div class="table-wrapper pc-only">
            <el-table
              v-loading="loading"
              :data="tableData"
              stripe
              empty-text=""
            >
              <el-table-column
                prop="sourceCode"
                :label="$t('zoneCode')"
                min-width="140"
              />
              <el-table-column
                prop="sourceName"
                :label="$t('ZoneName')"
                min-width="140"
              />
              <el-table-column
                prop="targetCode"
                :label="$t('RegionCode')"
                min-width="140"
              />
              <el-table-column
                prop="targetName"
                :label="$t('RegionName')"
                min-width="140"
              />
              <el-table-column
                prop="status"
                :label="$t('stateAggregationAudit.columns.status')"
                min-width="100"
              >
                <template #default="{ row }">
                  <el-tag v-if="row.status === '0'" type="info">
                    {{ $t('stateAggregationAudit.status.draft') }}
                  </el-tag>
                  <el-tag v-else-if="row.status === '1'" type="warning">
                    {{ $t('stateAggregationAudit.status.pending') }}
                  </el-tag>
                  <el-tag v-else-if="row.status === '2'" type="success">
                    {{ $t('stateAggregationAudit.status.approved') }}
                  </el-tag>
                  <el-tag v-else-if="row.status === '3'" type="danger">
                    {{ $t('stateAggregationAudit.status.rejected') }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('common.actions')"
                fixed="right"
                width="300"
              >
                <template #default="{ row }">
                  <ActionButtons
                    :workflow-status="mapWorkflowStatus(row.status)"
                    mode="list"
                    :show-audit="false"
                    :custom-buttons="getTableButtons(row)"
                    @action="(action) => handleTableAction(row, action)"
                  />
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 分页 -->
          <div v-if="pagination.total > 0" class="pagination-wrapper">
            <el-pagination
              :current-page="pagination.currentPage"
              :page-size="pagination.pageSize"
              :page-sizes="[10, 20, 50]"
              :total="pagination.total"
              layout="total, sizes, prev, pager, next"
              background
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              @update:current-page="pagination.currentPage = $event"
              @update:page-size="pagination.pageSize = $event"
            />
          </div>

          <el-empty
            v-if="tableData.length === 0 && !loading"
            :description="$t('stateAggregationAudit.messages.noData')"
          />
        </InfoCard>
      </div>
    </div>

    <!-- 查看明细对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="$t('stateAggregationAudit.detailDialog.title')"
      width="96%"
      top="5vh"
      class="adjustment-dialog"
    >
      <div class="adjustment-workspace">
        <div class="detail-table-panel">
          <div class="panel-title">
            {{ $t('stateAggregationAudit.adjustment.title') }}
          </div>
          <el-table
            v-loading="detailLoading"
            :data="detailData"
            stripe
            max-height="560px"
          >
            <el-table-column
              type="index"
              :label="$t('stateAggregationAudit.adjustment.index')"
              width="60"
              fixed="left"
            />
            <el-table-column
              prop="sourceName"
              :label="$t('stateAggregationAudit.adjustment.zoneName')"
              min-width="150"
              fixed="left"
            />
            <el-table-column
              prop="inputType"
              :label="$t('stateAggregationAudit.adjustment.inputType')"
              min-width="130"
            >
              <template #default="{ row }">
                {{ getDictLabel('input_type', row.inputType) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="inputCategory"
              :label="$t('stateAggregationAudit.adjustment.category')"
              min-width="140"
            >
              <template #default="{ row }">
                {{ getDictLabel('input_category', row.inputCategory) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="variety"
              :label="$t('stateAggregationAudit.adjustment.variety')"
              min-width="130"
            >
              <template #default="{ row }">
                {{ row.variety || row.varieties || '-' }}
              </template>
            </el-table-column>
            <el-table-column
              prop="season"
              :label="$t('stateAggregationAudit.adjustment.season')"
              min-width="130"
            >
              <template #default="{ row }">
                {{ getSeasonLabel(row.season ?? row.seasonCode ?? row.season_code) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="receivedQuantity"
              :label="$t('stateAggregationAudit.adjustment.receivedDemand')"
              min-width="170"
            >
              <template #default="{ row }">
                {{ formatQuantity(row.receivedQuantity, row.unit || row.units) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="adjustedQuantity"
              :label="$t('stateAggregationAudit.adjustment.adjustedDemand')"
              min-width="170"
            >
              <template #default="{ row }">
                {{ formatQuantity(row.adjustedQuantity, row.unit || row.units) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="adjustmentRemark"
              :label="$t('stateAggregationAudit.adjustment.adjustmentRemark')"
              min-width="220"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                {{ row.adjustmentRemark || '-' }}
              </template>
            </el-table-column>
            <el-table-column
              prop="adjustmentStatus"
              :label="$t('stateAggregationAudit.adjustment.status')"
              min-width="120"
            >
              <template #default="{ row }">
                <el-tag :type="getAdjustmentStatusType(row.adjustmentStatus)">
                  {{ getAdjustmentStatusLabel(row.adjustmentStatus) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('common.actions')"
              fixed="right"
              min-width="280"
            >
              <template #default="{ row }">
                <div class="detail-actions">
                  <el-button
                    v-if="!isDetailLocked(row)"
                    size="small"
                    type="primary"
                    @click="handleAdjust(row)"
                  >
                    {{ $t('stateAggregationAudit.adjustment.adjust') }}
                  </el-button>
                  <!-- Submit to upper level is temporarily hidden per business flow adjustment. -->
                  <!--
                    <el-button
                      size="small"
                      type="success"
                      :loading="submittingToZoneId === row.id"
                      :disabled="isDetailLocked(row)"
                      @click="handleSubmitToZone(row)"
                    >
                      {{ row.adjustmentStatus === 'submitted'
                        ? $t('stateAggregationAudit.adjustment.alreadySubmitted')
                        : $t('stateAggregationAudit.adjustment.submitToZone') }}
                    </el-button>
                  -->
                  <el-button
                    size="small"
                    @click="handleViewHistory(row)"
                  >
                    {{ $t('stateAggregationAudit.adjustment.viewHistory') }}
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <el-empty
            v-if="detailData.length === 0 && !detailLoading"
            :description="$t('stateAggregationAudit.detailDialog.noData')"
          />
        </div>

        <aside class="adjustment-side-panel">
          <el-empty
            v-if="sidePanelMode === 'empty'"
            :description="$t('stateAggregationAudit.adjustment.emptyTitle')"
          >
            <template #description>
              <p>{{ $t('stateAggregationAudit.adjustment.emptyTip') }}</p>
            </template>
          </el-empty>

          <div v-else-if="sidePanelMode === 'adjust' && selectedDetailRow" class="side-content">
            <div class="side-header">
              <h3>{{ $t('stateAggregationAudit.adjustment.adjustPanelTitle') }}</h3>
              <el-tag :type="getAdjustmentStatusType(selectedDetailRow.adjustmentStatus)">
                {{ getAdjustmentStatusLabel(selectedDetailRow.adjustmentStatus) }}
              </el-tag>
            </div>

            <div class="detail-summary">
              <div>
                <span>{{ $t('stateAggregationAudit.adjustment.zoneName') }}</span>
                <strong>{{ selectedDetailRow.sourceName || '-' }}</strong>
              </div>
              <div>
                <span>{{ $t('stateAggregationAudit.adjustment.inputType') }}</span>
                <strong>{{ getDictLabel('input_type', selectedDetailRow.inputType) }}</strong>
              </div>
              <div>
                <span>{{ $t('stateAggregationAudit.adjustment.category') }}</span>
                <strong>{{ getDictLabel('input_category', selectedDetailRow.inputCategory) }}</strong>
              </div>
              <div>
                <span>{{ $t('stateAggregationAudit.adjustment.variety') }}</span>
                <strong>{{ selectedDetailRow.variety || selectedDetailRow.varieties || '-' }}</strong>
              </div>
              <div>
                <span>{{ $t('stateAggregationAudit.adjustment.season') }}</span>
                <strong>{{ getSeasonLabel(selectedDetailRow.season ?? selectedDetailRow.seasonCode ?? selectedDetailRow.season_code) }}</strong>
              </div>
              <div>
                <span>{{ $t('stateAggregationAudit.adjustment.receivedDemand') }}</span>
                <strong>{{ formatQuantity(selectedDetailRow.receivedQuantity, selectedDetailRow.unit || selectedDetailRow.units) }}</strong>
              </div>
              <div>
                <span>{{ $t('stateAggregationAudit.adjustment.currentAdjustedDemand') }}</span>
                <strong>{{ formatQuantity(selectedDetailRow.adjustedQuantity, selectedDetailRow.unit || selectedDetailRow.units) }}</strong>
              </div>
            </div>

            <el-form
              ref="adjustFormRef"
              :model="adjustForm"
              :rules="adjustRules"
              label-position="top"
              class="adjust-form"
            >
              <el-form-item
                :label="$t('stateAggregationAudit.adjustment.newAdjustedDemand')"
                prop="adjustedQuantity"
              >
                <el-input-number
                  v-model="adjustForm.adjustedQuantity"
                  :min="0"
                  :precision="2"
                  :step="1"
                  controls-position="right"
                  class="full-width"
                />
              </el-form-item>
              <el-form-item
                :label="$t('stateAggregationAudit.adjustment.adjustmentRemark')"
                prop="adjustmentRemark"
              >
                <el-input
                  v-model="adjustForm.adjustmentRemark"
                  type="textarea"
                  :rows="4"
                  maxlength="500"
                  show-word-limit
                />
              </el-form-item>
            </el-form>

            <div class="side-actions">
              <el-button @click="resetSidePanel">
                {{ $t('stateAggregationAudit.adjustment.cancel') }}
              </el-button>
              <el-button
                type="primary"
                :loading="savingAdjustment"
                @click="handleSaveAdjustment"
              >
                {{ $t('stateAggregationAudit.adjustment.saveAdjustment') }}
              </el-button>
            </div>
          </div>

          <div v-else-if="sidePanelMode === 'history' && selectedDetailRow" class="side-content">
            <div class="side-header">
              <h3>{{ $t('stateAggregationAudit.adjustment.historyTitle') }}</h3>
              <el-button
                v-if="!isDetailLocked(selectedDetailRow)"
                size="small"
                text
                @click="handleAdjust(selectedDetailRow)"
              >
                {{ $t('stateAggregationAudit.adjustment.adjust') }}
              </el-button>
            </div>
            <div class="history-target">
              {{ selectedDetailRow.sourceName || '-' }} · {{ getDictLabel('input_category', selectedDetailRow.inputCategory) }}
            </div>
            <el-table
              v-loading="historyLoading"
              :data="historyData"
              size="small"
              max-height="430px"
            >
              <el-table-column
                prop="createdTime"
                :label="$t('stateAggregationAudit.adjustment.operationTime')"
                min-width="150"
              />
              <el-table-column
                prop="beforeQuantity"
                :label="$t('stateAggregationAudit.adjustment.beforeQuantity')"
                min-width="110"
              />
              <el-table-column
                prop="afterQuantity"
                :label="$t('stateAggregationAudit.adjustment.afterQuantity')"
                min-width="110"
              />
              <el-table-column
                prop="operatorName"
                :label="$t('stateAggregationAudit.adjustment.operator')"
                min-width="110"
              >
                <template #default="{ row }">
                  {{ row.operatorName || '-' }}
                </template>
              </el-table-column>
              <el-table-column
                prop="remark"
                :label="$t('stateAggregationAudit.adjustment.remark')"
                min-width="180"
                show-overflow-tooltip
              />
            </el-table>
            <el-empty
              v-if="historyData.length === 0 && !historyLoading"
              :description="$t('stateAggregationAudit.adjustment.noHistory')"
            />
          </div>
        </aside>
      </div>

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
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  adjustDemandSummaryDetail,
  getDemandSummaryAdjustmentHistory,
  getSummaryDetail,
  submitDemandSummaryDetailToZone,
  updateVillageDemandSummaryMain,
  getVillageDemandSummaryMainListSub
} from '@/api/villageAggregation'
import { useDict } from '@/hooks/useDict'
import { PageHeader, InfoCard } from '@/components/common'
import ActionButtons from '@/components/workflow/ActionButtons.vue'

const { getLabelByValue, options } = useDict(['input_type', 'input_category'])
const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const loading = ref(false)
const tableData = ref([])
const yearParam = ref(route.query.year || route.params.year || '')

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 查看明细对话框
const detailDialogVisible = ref(false)
const detailLoading = ref(false)
const detailData = ref([])
const currentSummaryRow = ref(null)
const selectedDetailRow = ref(null)
const sidePanelMode = ref('empty')
const adjustFormRef = ref(null)
const savingAdjustment = ref(false)
const submittingToZoneId = ref('')
const historyLoading = ref(false)
const historyData = ref([])

const adjustForm = reactive({
  adjustedQuantity: null,
  adjustmentRemark: ''
})

const adjustRules = reactive({
  adjustedQuantity: [
    { required: true, message: t('stateAggregationAudit.adjustment.requiredAdjustedQuantity'), trigger: 'blur' }
  ],
  adjustmentRemark: [
    { required: true, message: t('stateAggregationAudit.adjustment.requiredAdjustmentRemark'), trigger: 'blur' }
  ]
})

const getStoredUserInfo = () => {
  try {
    return JSON.parse(localStorage.getItem('userInfo') || '{}')
  } catch (error) {
    return {}
  }
}

const getCurrentUserPayload = () => {
  const userInfo = getStoredUserInfo()
  return {
    currentUserId: userInfo.userId || userInfo.id || userInfo?.userInfo?.user?.id || userInfo?.user?.id || '',
    currentUserName: userInfo.nickName || userInfo.userName || userInfo.username || userInfo.realName || userInfo?.userInfo?.user?.userName || userInfo?.user?.userName || ''
  }
}

const getDictLabel = (dictType, value) => {
  const label = getLabelByValue(dictType, value)
  return label || value || '-'
}

const getSeasonLabel = (value) => {
  const seasonMap = {
    '1': 'Summer',
    '2': 'Spring',
    '3': 'Irrigation'
  }
  return seasonMap[String(value)] || value || '-'
}

const normalizeDetailRow = (row = {}) => ({
  ...row,
  summaryId: row.summaryId || currentSummaryRow.value?.id || '',
  year: row.year || currentSummaryRow.value?.year || yearParam.value || '',
  variety: row.variety || row.varieties || '',
  unit: row.unit || row.units || '',
  receivedQuantity: row.receivedQuantity ?? row.totalQuantity ?? 0,
  adjustedQuantity: row.adjustedQuantity ?? 0,
  adjustmentStatus: row.adjustmentStatus || 'pending',
  hasAdjustment: Boolean(row.hasAdjustment)
})

const formatQuantity = (value, unit) => {
  const displayValue = value ?? 0
  return unit ? `${displayValue} ${unit}` : displayValue
}

const getAdjustmentStatusLabel = (status) => {
  const normalizedStatus = String(status || 'pending').trim().toLowerCase()
  const key = normalizedStatus === 'submit' ? 'submitted' : normalizedStatus
  return t(`stateAggregationAudit.adjustmentStatus.${key}`)
}

const getAdjustmentStatusType = (status) => {
  const map = {
    pending: 'info',
    adjusted: 'warning',
    submitted: 'success',
    approved: 'success',
    rejected: 'danger'
  }
  return map[status] || 'info'
}

const isDetailLocked = (row) => {
  const adjustmentStatus = String(row?.adjustmentStatus || '').trim().toLowerCase()
  const detailStatus = String(row?.status || '').trim()
  const summaryStatus = String(currentSummaryRow.value?.status || '').trim()
  return ['submit', 'submitted', 'approved'].includes(adjustmentStatus)
    || detailStatus === '2'
    || summaryStatus === '2'
}

const resetSidePanel = () => {
  selectedDetailRow.value = null
  sidePanelMode.value = 'empty'
  historyData.value = []
  adjustForm.adjustedQuantity = null
  adjustForm.adjustmentRemark = ''
  adjustFormRef.value?.clearValidate?.()
}

const getDetailPayload = (row) => ({
  detailId: row.id,
  summaryId: row.summaryId || currentSummaryRow.value?.id || '',
  year: row.year || currentSummaryRow.value?.year || yearParam.value || '',
  sourceCode: row.sourceCode,
  targetCode: row.targetCode,
  ...getCurrentUserPayload()
})

const updateDetailRow = (updatedRow) => {
  const normalized = normalizeDetailRow(updatedRow)
  const index = detailData.value.findIndex((item) => item.id === normalized.id)
  if (index !== -1) {
    detailData.value.splice(index, 1, normalized)
  }
  if (selectedDetailRow.value?.id === normalized.id) {
    selectedDetailRow.value = normalized
  }
}

// 加载列表数据
const loadData = async () => {
  loading.value = true
  try {
    const regionCode = getStoredUserInfo().deptId
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      targetCode: regionCode, // regionCode
      year: yearParam.value
    }
    const res = await getVillageDemandSummaryMainListSub(params)

    if (res.code === 200) {
      tableData.value = res.data.list || []
      pagination.total = res.data.total || 0
    }
  } catch (error) {
    console.error('Failed to load data:', error)
    ElMessage.error(t('stateAggregationAudit.messages.loadFailed'))
  } finally {
    loading.value = false
  }
}

// 查看明细
const handleViewDetail = async (row) => {
  detailDialogVisible.value = true
  detailLoading.value = true
  currentSummaryRow.value = row
  resetSidePanel()
  try {
    const res = await getSummaryDetail({
      summaryId: row.id
    })

    if (res.code === 200) {
      detailData.value = (res.data || []).map(normalizeDetailRow)
    }
  } catch (error) {
    console.error('Failed to load detail data:', error)
    ElMessage.error(t('stateAggregationAudit.messages.detailLoadFailed'))
  } finally {
    detailLoading.value = false
  }
}

const handleAdjust = (row) => {
  if (isDetailLocked(row)) return

  selectedDetailRow.value = row
  sidePanelMode.value = 'adjust'
  historyData.value = []
  adjustForm.adjustedQuantity = row.adjustedQuantity ?? row.receivedQuantity ?? 0
  adjustForm.adjustmentRemark = row.adjustmentRemark || ''
  adjustFormRef.value?.clearValidate?.()
}

const handleSaveAdjustment = async () => {
  if (!selectedDetailRow.value) return
  if (isDetailLocked(selectedDetailRow.value)) return

  try {
    await adjustFormRef.value?.validate()
  } catch (error) {
    return
  }

  savingAdjustment.value = true
  try {
    const payload = {
      ...getDetailPayload(selectedDetailRow.value),
      adjustedQuantity: adjustForm.adjustedQuantity,
      adjustmentRemark: adjustForm.adjustmentRemark
    }
    const res = await adjustDemandSummaryDetail(payload)

    if (res.code === 200) {
      updateDetailRow(res.data || {
        ...selectedDetailRow.value,
        adjustedQuantity: adjustForm.adjustedQuantity,
        adjustmentRemark: adjustForm.adjustmentRemark,
        hasAdjustment: true,
        adjustmentStatus: 'adjusted'
      })
      ElMessage.success(t('stateAggregationAudit.adjustment.saveSuccess'))
    } else {
      ElMessage.error(res.msg || t('stateAggregationAudit.adjustment.saveFailed'))
    }
  } catch (error) {
    console.error('Failed to save adjustment:', error)
    ElMessage.error(t('stateAggregationAudit.adjustment.saveFailed'))
  } finally {
    savingAdjustment.value = false
  }
}

const handleViewHistory = async (row) => {
  selectedDetailRow.value = row
  sidePanelMode.value = 'history'
  historyLoading.value = true
  historyData.value = []

  try {
    const res = await getDemandSummaryAdjustmentHistory(row.id)
    if (res.code === 200) {
      historyData.value = res.data || []
    } else {
      ElMessage.error(res.msg || t('stateAggregationAudit.adjustment.historyLoadFailed'))
    }
  } catch (error) {
    console.error('Failed to load adjustment history:', error)
    ElMessage.error(t('stateAggregationAudit.adjustment.historyLoadFailed'))
  } finally {
    historyLoading.value = false
  }
}

const handleSubmitToZone = async (row) => {
  try {
    await ElMessageBox.confirm(
      t('stateAggregationAudit.adjustment.submitConfirm'),
      t('common.warning'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )

    submittingToZoneId.value = row.id
    const res = await submitDemandSummaryDetailToZone({
      ...getDetailPayload(row),
      level: '0'
    })

    if (res.code === 200) {
      updateDetailRow(res.data || {
        ...row,
        adjustmentStatus: 'submitted'
      })
      ElMessage.success(t('stateAggregationAudit.adjustment.submitSuccess'))
    } else {
      ElMessage.error(res.msg || t('stateAggregationAudit.adjustment.submitFailed'))
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to submit detail:', error)
      ElMessage.error(t('stateAggregationAudit.adjustment.submitFailed'))
    }
  } finally {
    submittingToZoneId.value = ''
  }
}

// 审批
const handleApprove = async (row) => {
  try {
    await ElMessageBox.confirm(
      t('stateAggregationAudit.approveDialog.confirmMessage'),
      t('common.warning'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )

    const res = await updateVillageDemandSummaryMain({
      id: row.id,
      sourceCode: row.sourceCode,
      status: '2' // 审批通过
    })

    if (res.code === 200) {
      ElMessage.success(t('stateAggregationAudit.messages.approveSuccess'))
      loadData()
    } else {
      ElMessage.error(res.msg || t('stateAggregationAudit.messages.approveFailed'))
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to approve:', error)
      ElMessage.error(t('stateAggregationAudit.messages.approveFailed'))
    }
  }
}

// 驳回
const handleReject = async (row) => {
  try {
    await ElMessageBox.confirm(
      t('stateAggregationAudit.rejectDialog.confirmMessage'),
      t('common.warning'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )

    const res = await updateVillageDemandSummaryMain({
      id: row.id,
      sourceCode: row.sourceCode,
      status: '3' // 审批驳回
    })

    if (res.code === 200) {
      ElMessage.success(t('stateAggregationAudit.messages.rejectSuccess'))
      loadData()
    } else {
      ElMessage.error(res.msg || t('stateAggregationAudit.messages.rejectFailed'))
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to reject:', error)
      ElMessage.error(t('stateAggregationAudit.messages.rejectFailed'))
    }
  }
}

// 返回
const handleBack = () => {
  router.push({ name: 'StateAggregation' })
}

// 分页变化
const handleSizeChange = () => {
  pagination.currentPage = 1
  loadData()
}

const handleCurrentChange = () => {
  loadData()
}

// Workflow Handlers
const mapWorkflowStatus = (status) => {
  const map = {
    '0': 'S0',
    '1': 'S1',
    '2': 'S2',
    '3': 'S3'
  }
  return map[status] || 'S0'
}

const getTableButtons = (row) => {
  const buttons = []
  
  // Unified view button
  buttons.push({ 
    type: 'primary', 
    action: 'view', 
    label: 'common.view', 
    icon: 'ri-eye-line' 
  })
  
  if (row.status === '1') {
    buttons.push({ 
      type: 'success', 
      action: 'approve', 
      rawLabel: 'Aggregate',
      icon: 'ri-check-line' 
    })
    // Reject is temporarily hidden per business flow adjustment.
    // buttons.push({
    //   type: 'danger',
    //   action: 'reject',
    //   label: 'demandAudit.actions.reject',
    //   icon: 'ri-close-line'
    // })
  }
  
  return buttons
}

const handleTableAction = (row, action) => {
  switch (action) {
    case 'view':
      handleViewDetail(row)
      break
    case 'approve':
      handleApprove(row)
      break
    case 'reject':
      handleReject(row)
      break
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/page-common.scss';
@use '@/assets/styles/workflow-common.scss';
@use '@/assets/styles/table-enhanced.scss';

.adjustment-workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: 16px;
  min-height: 560px;
}

.detail-table-panel {
  min-width: 0;
}

.panel-title {
  margin-bottom: 12px;
  color: #1f2937;
  font-size: 16px;
  font-weight: 700;
}

.detail-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  :deep(.el-button + .el-button) {
    margin-left: 0;
  }
}

.adjustment-side-panel {
  min-width: 0;
  padding: 16px;
  border: 1px solid #dfe7df;
  border-radius: 8px;
  background: #fbfdfb;
}

.side-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.side-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  h3 {
    margin: 0;
    color: #1f2937;
    font-size: 16px;
    font-weight: 700;
  }
}

.detail-summary {
  display: grid;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  background: #ffffff;
  border: 1px solid #edf2ed;

  div {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    color: #6b7280;
    font-size: 13px;
  }

  strong {
    color: #1f2937;
    font-weight: 600;
    text-align: right;
  }
}

.adjust-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
}

.full-width {
  width: 100%;
}

.side-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.history-target {
  color: #4b5563;
  font-size: 13px;
}

@media screen and (max-width: 1024px) {
  .adjustment-workspace {
    grid-template-columns: 1fr;
  }

  .adjustment-side-panel {
    min-height: 320px;
  }
}
</style>
