<template>
  <div class="page-container">
    <div class="page-wrapper">
      <!-- 页面头部 -->
      <PageHeader
        icon="ri-database-2-line"
        :title="$t('townAggregation.title')"
        :subtitle="$t('townAggregation.subtitle')"
      />

      <!-- 内容区域 -->
      <div class="content-wrapper">
        <InfoCard 
          :title="viewMode === 'main' ? $t('Aggregation List') : (currentDrillDownRow?.sourceName || $t('townAggregation.list'))" 
          icon="ri-file-list-3-line"
          :no-padding="true"
        >
          <!-- 主列表视图 -->
          <template v-if="viewMode === 'main'">
            <div class="filter-bar" style="display:flex; width:100%; justify-content:flex-end; align-items:center; margin-bottom:16px;">
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
                  :label="$t('townAggregation.columns.year')"
                  min-width="100"
                />
                <el-table-column
                  prop="sourceName"
                  :label="$t('WoredaName')"
                  min-width="140"
                >
                  <template #default="{ row }">
                    <el-button link type="primary" @click="handleDrillDown(row)">
                      {{ row.sourceName }}
                    </el-button>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="subQuantity"
                  :label="$t('townAggregation.columns.subQuantity')"
                  min-width="140"
                >
                </el-table-column>
                <el-table-column
                  prop="status"
                  :label="$t('townAggregation.columns.status')"
                  min-width="100"
                >
                  <template #default="{ row }">
                    <el-tag v-if="row.status === '0'" type="info">
                      {{ $t('townAggregation.status.draft') }}
                    </el-tag>
                    <el-tag v-else-if="row.status === '1'" type="warning">
                      {{ $t('townAggregation.status.pending') }}
                    </el-tag>
                    <el-tag v-else-if="row.status === '2'" type="success">
                      {{ $t('townAggregation.status.approved') }}
                    </el-tag>
                    <el-tag v-else-if="row.status === '3'" type="danger">
                      {{ $t('townAggregation.status.rejected') }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="createTime"
                  :label="$t('townAggregation.columns.createTime')"
                  min-width="160"
                />
                <el-table-column
                  :label="$t('townAggregation.columns.actions')"
                  fixed="right"
                  width="340"
                >
                  <template #default="{ row }">
                    <ActionButtons
                      :workflow-status="mapWorkflowStatus(row.status)"
                      mode="list"
                      :show-audit="true"
                      :custom-buttons="getMainTableButtons(row)"
                      @action="(action) => handleAction(row, action)"
                    />
                  </template>
                </el-table-column>
              </el-table>

              <!-- PC pagination -->
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
                  <div class="year-badge">
                    <i class="ri-calendar-line"></i>
                    <span>{{ item.year }}</span>
                  </div>
                  <el-tag v-if="item.status === '0'" type="info" size="small">
                    {{ $t('townAggregation.status.draft') }}
                  </el-tag>
                  <el-tag v-else-if="item.status === '1'" type="warning" size="small">
                    {{ $t('townAggregation.status.pending') }}
                  </el-tag>
                  <el-tag v-else-if="item.status === '2'" type="success" size="small">
                    {{ $t('townAggregation.status.approved') }}
                  </el-tag>
                  <el-tag v-else-if="item.status === '3'" type="danger" size="small">
                    {{ $t('townAggregation.status.rejected') }}
                  </el-tag>
                </div>
                <div class="mobile-card-body">
                  <div class="mobile-card-row">
                    <span class="label">{{ $t('townAggregation.columns.sourceName') }}:</span>
                    <span class="value">{{ item.sourceName }}</span>
                  </div>
                  <div class="mobile-card-row">
                    <span class="label">{{ $t('townAggregation.columns.subQuantity') }}:</span>
                    <span class="value">{{ (item.approvedQuantity || 0) + '/' + (item.subQuantity || 0) }}</span>
                  </div>
                  <div class="mobile-card-row">
                    <span class="label">{{ $t('townAggregation.columns.createTime') }}:</span>
                    <span class="value">{{ item.createTime }}</span>
                  </div>
                </div>
                <!-- Mobile Footer Action Buttons -->
                <div class="mobile-card-footer">
                   <ActionButtons
                      :workflow-status="mapWorkflowStatus(item.status)"
                      mode="list"
                      :show-audit="true"
                      :custom-buttons="getMainTableButtons(item)"
                      @action="(action) => handleAction(item, action)"
                    />
                </div>
              </div>

              <!-- Mobile pagination -->
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

            <el-empty
              v-if="tableData.length === 0 && !loading"
              :description="$t('townAggregation.messages.noData')"
            />
          </template>

          <!-- 下钻列表视图 -->
          <template v-else-if="viewMode === 'drillDown'">
            <!-- 返回按钮和面包屑 -->
            <div class="drill-down-header" style="padding: 16px;">
              <el-button type="primary" plain @click="handleBackToMain">
                <i class="ri-arrow-left-line"></i>
                {{ $t('common.back') }}
              </el-button>
              <el-breadcrumb separator="/" class="breadcrumb">
                <el-breadcrumb-item>{{ $t('townAggregation.title') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ currentDrillDownRow?.sourceName }} ({{ currentDrillDownRow?.year }})</el-breadcrumb-item>
              </el-breadcrumb>
            </div>

            <!-- 下钻表格 -->
            <div class="table-wrapper">
              <el-table
                v-loading="drillDownLoading"
                :data="drillDownData"
                stripe
                empty-text=""
                :default-sort="{ prop: 'year', order: 'descending' }"
              >
                <el-table-column
                  prop="year"
                  :label="$t('townAggregation.columns.year')"
                  min-width="100"
                />
                <el-table-column
                  prop="sourceName"
                  :label="$t('Kebele Name')"
                  min-width="140"
                />
                <el-table-column
                    prop="subQuantity"
                    :label="$t('townAggregation.columns.subQuantity')"
                    min-width="140"
                >
                </el-table-column>
                <el-table-column
                  prop="status"
                  :label="$t('townAggregation.columns.status')"
                  min-width="100"
                >
                  <template #default="{ row }">
                    <el-tag v-if="row.status === '0'" type="info">
                      {{ $t('townAggregation.status.draft') }}
                    </el-tag>
                    <el-tag v-else-if="row.status === '1'" type="warning">
                      {{ $t('townAggregation.status.pending') }}
                    </el-tag>
                    <el-tag v-else-if="row.status === '2'" type="success">
                      {{ $t('townAggregation.status.approved') }}
                    </el-tag>
                    <el-tag v-else-if="row.status === '3'" type="danger">
                      {{ $t('townAggregation.status.rejected') }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="createTime"
                  :label="$t('townAggregation.columns.createTime')"
                  min-width="160"
                />
                <el-table-column
                  :label="$t('townAggregation.columns.actions')"
                  fixed="right"
                  width="120"
                >
                  <template #default="{ row }">
                    <ActionButtons
                      :workflow-status="mapWorkflowStatus(row.status)"
                      mode="list"
                      :show-audit="false"
                      :custom-buttons="getDrillDownButtons(row)"
                      @action="(action) => handleDrillDownAction(row, action)"
                    />
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 下钻分页 -->
            <div v-if="drillDownPagination.total > 0" class="pagination-wrapper">
              <el-pagination
                :current-page="drillDownPagination.currentPage"
                :page-size="drillDownPagination.pageSize"
                :page-sizes="[10, 20, 50]"
                :total="drillDownPagination.total"
                layout="total, sizes, prev, pager, next"
                background
                small
                @size-change="handleDrillDownSizeChange"
                @current-change="handleDrillDownCurrentChange"
                @update:current-page="drillDownPagination.currentPage = $event"
                @update:page-size="drillDownPagination.pageSize = $event"
              />
            </div>

            <!-- 空状态 -->
            <el-empty
              v-if="drillDownData.length === 0 && !drillDownLoading"
              :description="$t('townAggregation.messages.noData')"
            />
          </template>
        </InfoCard>
      </div>
    </div>

    <!-- 新增年度对话框 -->
    <el-dialog
      v-model="addYearDialogVisible"
      :title="$t('townAggregation.addYearDialog.title')"
      width="500px"
    >
      <el-form :model="addYearForm" :rules="addYearRules" ref="addYearFormRef" label-width="100px">
        <el-form-item :label="$t('townAggregation.addYearDialog.year')" prop="year">
          <el-date-picker
            v-model="addYearForm.year"
            type="year"
            :placeholder="$t('townAggregation.addYearDialog.yearPlaceholder')"
            style="width: 100%"
            value-format="YYYY"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addYearDialogVisible = false">
          {{ $t('townAggregation.addYearDialog.cancel') }}
        </el-button>
        <el-button type="primary" @click="confirmAddYear" :loading="submitting">
          {{ $t('townAggregation.addYearDialog.confirm') }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 汇聚明细对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="$t('townAggregation.detailDialog.title')"
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
          :label="$t('townAggregation.detailDialog.columns.inputCategory')"
          min-width="150"
        >
          <template #default="{ row }">
            {{ getLabelByValue('input_category', row.inputCategory) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="inputType"
          :label="$t('townAggregation.detailDialog.columns.inputType')"
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
            {{ getSeasonLabel(row.season || row.seasonCode || row.season_code) }}
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
          :label="$t('townAggregation.detailDialog.columns.totalQuantity')"
          min-width="120"
        >
          <template #default="{ row }">
            {{ getEffectiveQuantity(row) }}
          </template>
        </el-table-column>
<!--        <el-table-column-->
<!--          prop="totalCount"-->
<!--          :label="$t('townAggregation.detailDialog.columns.totalCount')"-->
<!--          min-width="120"-->
<!--        />-->
      </el-table>

      <!-- 分页 -->
      <div v-if="detailPagination.total > 0" class="pagination-wrapper" style="margin-top: 16px;">
        <el-pagination
          :current-page="detailPagination.currentPage"
          :page-size="detailPagination.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="detailPagination.total"
          layout="total, sizes, prev, pager, next"
          background
          small
          @size-change="handleDetailSizeChange"
          @current-change="handleDetailCurrentChange"
          @update:current-page="detailPagination.currentPage = $event"
          @update:page-size="detailPagination.pageSize = $event"
        />
      </div>

      <el-empty
        v-if="detailData.length === 0 && !detailLoading"
        :description="$t('townAggregation.detailDialog.noData')"
      />

      <template #footer>
        <el-button @click="detailDialogVisible = false">
          {{ $t('common.close') }}
        </el-button>
      </template>
    </el-dialog>


    <!-- 下钻记录详情对话框 -->
    <el-dialog
      v-model="drillDownRecordDetailVisible"
      :title="$t('townAggregation.detailDialog.title')"
      width="80%"
      top="5vh"
    >
      <el-descriptions :column="2" border style="margin-bottom: 20px;">
        <el-descriptions-item :label="$t('townAggregation.columns.year')">
          {{ drillDownRecordDetail.year }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('Kebele Name')">
          {{ drillDownRecordDetail.sourceName }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('Kebele Code')">
          {{ drillDownRecordDetail.sourceCode }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('townAggregation.columns.status')">
          <el-tag v-if="drillDownRecordDetail.status === '0'" type="info">
            {{ $t('townAggregation.status.draft') }}
          </el-tag>
          <el-tag v-else-if="drillDownRecordDetail.status === '1'" type="warning">
            {{ $t('townAggregation.status.pending') }}
          </el-tag>
          <el-tag v-else-if="drillDownRecordDetail.status === '2'" type="success">
            {{ $t('townAggregation.status.approved') }}
          </el-tag>
          <el-tag v-else-if="drillDownRecordDetail.status === '3'" type="danger">
            {{ $t('townAggregation.status.rejected') }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('townAggregation.columns.createTime')">
          {{ drillDownRecordDetail.createTime }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 标签页 -->
      <el-tabs v-model="activeDetailTab" @tab-change="handleDetailTabChange">
        <!-- 汇聚结果标签页 -->
        <el-tab-pane :label="$t('common.aggregationResults')" name="aggregation">
          <el-table
            v-loading="drillDownAggregationLoading"
            :data="drillDownAggregationData"
            stripe
            max-height="400px"
          >
            <el-table-column
              prop="inputCategory"
              :label="$t('townAggregation.detailDialog.columns.inputCategory')"
              min-width="150"
            >
              <template #default="{ row }">
                {{ getLabelByValue('input_category', row.inputCategory) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="inputType"
              :label="$t('townAggregation.detailDialog.columns.inputType')"
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
                {{ getSeasonLabel(row.season || row.seasonCode || row.season_code) }}
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
              :label="$t('townAggregation.detailDialog.columns.totalQuantity')"
              min-width="120"
            >
              <template #default="{ row }">
                {{ getEffectiveQuantity(row) }}
              </template>
            </el-table-column>
          </el-table>
          <el-empty
            v-if="drillDownAggregationData.length === 0 && !drillDownAggregationLoading"
            :description="$t('townAggregation.detailDialog.noData')"
          />
        </el-tab-pane>

        <!-- 农民需求标签页 -->
        <el-tab-pane :label="$t('common.farmerDemands')" name="farmers">
          <!-- 搜索区域 -->
          <div class="search-section" style="margin-bottom: 16px;">
            <el-input
              v-model="farmerSearchForm.farmerName"
              :placeholder="$t('demandAudit.columns.farmerName')"
              clearable
              style="width: 200px; margin-right: 8px;"
            />
            <el-input
              v-model="farmerSearchForm.farmerIdNumber"
              :placeholder="$t('demandAudit.columns.farmerIdNumber')"
              clearable
              style="width: 200px; margin-right: 8px;"
            />
            <el-select
              v-model="farmerSearchForm.status"
              :placeholder="$t('demandAudit.columns.status')"
              clearable
              style="width: 150px; margin-right: 8px;"
            >
              <el-option :label="$t('demandAudit.status.draft')" value="0" />
              <el-option :label="$t('demandAudit.status.submitted')" value="1" />
              <el-option :label="$t('demandAudit.status.approved')" value="2" />
              <el-option :label="$t('demandAudit.status.rejected')" value="3" />
            </el-select>
            <el-button type="primary" @click="handleFarmerSearch">
              <i class="ri-search-line"></i>
              {{ $t('common.search') }}
            </el-button>
            <el-button @click="handleFarmerSearchReset">
              <i class="ri-refresh-line"></i>
              {{ $t('common.reset') }}
            </el-button>
          </div>

          <!-- 农民需求表格 -->
          <el-table
            v-loading="farmerDemandLoading"
            :data="farmerDemandData"
            stripe
            max-height="400px"
          >
            <el-table-column
              prop="batchNo"
              :label="$t('demandAudit.columns.batchNo')"
              min-width="150"
            />
            <el-table-column
              prop="farmerName"
              :label="$t('demandAudit.columns.farmerName')"
              min-width="120"
            />
            <el-table-column
              prop="farmerIdNumber"
              :label="$t('demandAudit.columns.farmerIdNumber')"
              min-width="150"
            />
            <el-table-column
              prop="landArea"
              :label="$t('demandAudit.columns.landArea')"
              min-width="120"
            >
              <template #default="{ row }">
                {{ row.landArea || '-' }}
              </template>
            </el-table-column>
            <el-table-column
              prop="status"
              :label="$t('demandAudit.columns.status')"
              min-width="120"
            >
              <template #default="{ row }">
                <el-tag :type="getFarmerStatusType(row.status)" size="small">
                  {{ getFarmerStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('common.actions')"
              fixed="right"
              width="100"
            >
              <template #default="{ row }">
                <ActionButtons
                  :workflow-status="mapWorkflowStatus(row.status)"
                  mode="list"
                  :show-audit="false"
                  :custom-buttons="getFarmerDemandButtons(row)"
                  @action="(action) => handleFarmerDemandAction(row, action)"
                />
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div v-if="farmerDemandPagination.total > 0" class="pagination-wrapper" style="margin-top: 16px;">
            <el-pagination
              v-model:current-page="farmerDemandPagination.currentPage"
              v-model:page-size="farmerDemandPagination.pageSize"
              :page-sizes="[10, 20, 50]"
              :total="farmerDemandPagination.total"
              layout="total, sizes, prev, pager, next"
              background
              small
              @size-change="handleFarmerPageChange"
              @current-change="handleFarmerPageChange"
            />
          </div>

          <el-empty
            v-if="farmerDemandData.length === 0 && !farmerDemandLoading"
            :description="$t('townAggregation.detailDialog.noData')"
          />
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <el-button @click="drillDownRecordDetailVisible = false">
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
import {
  createVillageDemandSummaryMain,
  getVillageDemandSummaryMainList,
  getVillageDemandSummaryMainListSub,
  aggregateTownInputDemand,
  getTownAggregationDetail,
  updateVillageDemandSummaryMain,
  getVillageAggregationDetail
} from '@/api/villageAggregation'
import { getFarmerDemandPage } from '@/api/farmerDemand'
import { useDict } from '@/hooks/useDict'
import { PageHeader, InfoCard } from '@/components/common'
import ActionButtons from '@/components/workflow/ActionButtons.vue'

const { getLabelByValue, options } = useDict(['input_type', 'input_category', 'agri_season'])
const router = useRouter()
const { t } = useI18n()

const loading = ref(false)
const submitting = ref(false)
const tableData = ref([])

// 视图模式: 'main' 主列表, 'drillDown' 下钻列表
const viewMode = ref('main')

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
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
    { required: true, message: t('townAggregation.addYearDialog.yearRequired'), trigger: 'change' }
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

// 下钻列表
const drillDownLoading = ref(false)
const drillDownData = ref([])
const currentDrillDownRow = ref(null)

const drillDownPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 下钻记录详情
const drillDownRecordDetailVisible = ref(false)
const drillDownRecordDetail = ref({})
const drillDownAggregationLoading = ref(false)
const drillDownAggregationData = ref([])

// 详情对话框标签页
const activeDetailTab = ref('aggregation')

// 农民需求数据
const farmerDemandLoading = ref(false)
const farmerDemandData = ref([])
const farmerDemandPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const farmerSearchForm = reactive({
  farmerName: '',
  farmerIdNumber: '',
  status: ''
})

const exportFilters = reactive({
  season: ''
})

const getSeasonLabel = (value) => {
  const seasonMap = {
    '1': 'Summer',
    '2': 'Spring',
    '3': 'Irrigation'
  }
  const rawValue = value ?? ''
  return seasonMap[String(rawValue)] || getLabelByValue('agri_season', rawValue) || rawValue || '-'
}

const hasActualAdjustment = (row = {}) => {
  const flag = row.hasAdjustment
  const status = String(row.adjustmentStatus || '').trim().toLowerCase()
  return flag === true || flag === 1 || flag === '1' || flag === 'true' || ['adjusted', 'submit', 'submitted', 'approved'].includes(status)
}

const getEffectiveQuantity = (row) => {
  if (hasActualAdjustment(row) && row.adjustedQuantity !== null && row.adjustedQuantity !== undefined) {
    return row.adjustedQuantity
  }
  return row?.receivedQuantity ?? row?.originalQuantity ?? row?.totalQuantity ?? '-'
}

// 加载某一行已审批数量（已通过村级记录数）
const loadApprovedCountForRow = async (row) => {
  try {
    const params = {
      page: 1,
      pageSize: 10000,
      targetCode: row.sourceCode,
      year: row.year,
      status: '2'
    }
    const res = await getVillageDemandSummaryMainList(params)

    if (res.code === 200) {
      const list = res.data?.list || []
      // 使用接口返回列表长度作为已审批数量
      row.approvedQuantity = list.length
    } else {
      row.approvedQuantity = 0
    }
  } catch (error) {
    console.error('Failed to load approved count for row:', error)
    row.approvedQuantity = 0
  }
}

// 加载列表数据
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      sourceCode:JSON.parse(localStorage.getItem('userInfo')).deptId,
      level: "1",
      orderByColumn: 'year',
      isAsc: 'desc'
      // sourceCode:'huangshan'
      // TODO: Add user context filters
    }
    const res = await getVillageDemandSummaryMainList(params)

    if (res.code === 200) {
      tableData.value = res.data.list || []
      pagination.total = res.data.total || 0

      // 为每一行加载已审批数量
      await Promise.all(tableData.value.map(item => loadApprovedCountForRow(item)))
    }
  } catch (error) {
    console.error('Failed to load data:', error)
    ElMessage.error(t('townAggregation.messages.loadFailed'))
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
      sourceCode: JSON.parse(localStorage.getItem('userInfo')).deptId,
      // sourceCode: 'huangshan',
      status: '0',
      level: '1',
      creator: JSON.parse(localStorage.getItem('userInfo')).userName,
      // subQuantity: 0//农民数||村的数量||
    })

    if (res.code === 200) {
      ElMessage.success(t('townAggregation.addYearDialog.success'))
      addYearDialogVisible.value = false
      loadData()
    } else {
      // ElMessage.error(res.msg || t('townAggregation.addYearDialog.failed'))
    }
  } catch (error) {
    if (error !== false) {
      // console.error('Failed to add year:', error)
      // ElMessage.error(t('townAggregation.addYearDialog.failed'))
    }
  } finally {
    submitting.value = false
  }
}

// 审批 - 跳转到审核页面
const handleApprove = (row) => {
  router.push({
    name: 'TownAuditDetail',
    params: { year: row.year }
  })
}

// 汇聚数据提交 - 调用汇聚接口
const handleSubmit = async (row) => {
  try {
    await ElMessageBox.confirm(
      t('townAggregation.submitDialog.confirmMessage'),
      t('common.warning'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )

    submitting.value = true
    // 镇级汇聚提交
    const res = await aggregateTownInputDemand({
      sourceCode: row.sourceCode,
      targetCode: row.targetCode,
      summaryId: row.id,
      year: row.year,
      level: '2'
    })

    if (res.code === 200) {
      ElMessage.success(t('townAggregation.submitDialog.success'))

      // 更新状态为待审核（1）
      const updateRes = await updateVillageDemandSummaryMain({
        id: row.id,
        sourceCode: row.sourceCode,
        status: '1'
      })

      if (updateRes.code === 200) {
        loadData()
      } else {
        ElMessage.error(updateRes.msg || t('townAggregation.submitDialog.failed'))
      }
    } else {
      ElMessage.error(res.msg || t('townAggregation.submitDialog.failed'))
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to submit aggregation:', error)
      ElMessage.error(t('townAggregation.submitDialog.failed'))
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
    // 镇级汇聚明细: 只传递sourceCode
    const res = await getTownAggregationDetail({
      sourceCode: currentDetailRow.value.sourceCode,
      year: currentDetailRow.value.year
    })

    if (res.code === 200) {
      detailData.value = res.data || []
      detailPagination.total = res.data?.length || 0
    }
  } catch (error) {
    console.error('Failed to load detail data:', error)
    ElMessage.error(t('townAggregation.detailDialog.loadFailed'))
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

// 下钻 - 点击WoreName列
const handleDrillDown = async (row) => {
  currentDrillDownRow.value = row
  viewMode.value = 'drillDown'
  drillDownPagination.currentPage = 1
  await loadDrillDownData()
}

// 返回主列表
const handleBackToMain = () => {
  viewMode.value = 'main'
  currentDrillDownRow.value = null
  drillDownData.value = []
}

// 加载下钻列表数据
const loadDrillDownData = async () => {
  if (!currentDrillDownRow.value) return

  drillDownLoading.value = true
  try {
    const params = {
      page: drillDownPagination.currentPage,
      pageSize: drillDownPagination.pageSize,
      targetCode: currentDrillDownRow.value.sourceCode,
      year: currentDrillDownRow.value.year,
      level: 0,
      orderByColumn: 'year',
      isAsc: 'desc'
    }
    const res = await getVillageDemandSummaryMainListSub(params)

    if (res.code === 200) {
      drillDownData.value = res.data?.list || []
      drillDownPagination.total = res.data?.total || 0
    }
  } catch (error) {
    console.error('Failed to load drill down data:', error)
    ElMessage.error(t('townAggregation.messages.loadFailed'))
  } finally {
    drillDownLoading.value = false
  }
}

// 下钻分页变化
const handleDrillDownSizeChange = () => {
  drillDownPagination.currentPage = 1
  loadDrillDownData()
}

const handleDrillDownCurrentChange = () => {
  loadDrillDownData()
}

// 查看下钻记录详情
const handleDrillDownDetail = async (row) => {
  drillDownRecordDetail.value = row
  drillDownRecordDetailVisible.value = true
  activeDetailTab.value = 'aggregation'
  drillDownAggregationData.value = []
  farmerDemandData.value = []

  // 重置搜索表单
  farmerSearchForm.farmerName = ''
  farmerSearchForm.farmerIdNumber = ''
  farmerSearchForm.status = ''
  farmerDemandPagination.currentPage = 1

  // 加载汇聚结果数据
  drillDownAggregationLoading.value = true
  try {
    const res = await getVillageAggregationDetail({
      sourceCode: row.sourceCode,
      year: row.year
    })
    if (res.code === 200) {
      drillDownAggregationData.value = res.data || []
    }
  } catch (error) {
    console.error('Failed to load aggregation data:', error)
      ElMessage.error(t('townAggregation.detailDialog.loadFailed'))
  } finally {
    drillDownAggregationLoading.value = false
  }
}

// 标签页切换
const handleDetailTabChange = (tabName) => {
  if (tabName === 'farmers' && farmerDemandData.value.length === 0) {
    loadFarmerDemandData()
  }
}

// 加载农民需求数据
const loadFarmerDemandData = async () => {
  if (!drillDownRecordDetail.value.sourceCode) return

  farmerDemandLoading.value = true
  try {
    const params = {
      page: farmerDemandPagination.currentPage, // 修正为 page
      pageSize: farmerDemandPagination.pageSize,
      kebele: drillDownRecordDetail.value.sourceCode,
      year: drillDownRecordDetail.value.year,
      farmerName: farmerSearchForm.farmerName || undefined,
      farmerIdNumber: farmerSearchForm.farmerIdNumber || undefined,
      status: farmerSearchForm.status || undefined,
      orderByColumn: 'createdTime',
      isAsc: 'desc'
    }

    const res = await getFarmerDemandPage(params)
    if (res.code === 200) {
      farmerDemandData.value = res.data?.records || []
      farmerDemandPagination.total = res.data?.total || 0
    }
  } catch (error) {
    console.error('Failed to load farmer demand data:', error)
    ElMessage.error(t('townAggregation.messages.loadFailed'))
  } finally {
    farmerDemandLoading.value = false
  }
}

// 农民需求搜索
const handleFarmerSearch = () => {
  farmerDemandPagination.currentPage = 1
  loadFarmerDemandData()
}

// 重置搜索
const handleFarmerSearchReset = () => {
  farmerSearchForm.farmerName = ''
  farmerSearchForm.farmerIdNumber = ''
  farmerSearchForm.status = ''
  farmerDemandPagination.currentPage = 1
  loadFarmerDemandData()
}

// 农民需求分页变化
const handleFarmerPageChange = () => {
  loadFarmerDemandData()
}

// 查看农民需求详情
const handleViewFarmerDemand = (row) => {
  // 保存当前下钻状态到 sessionStorage
  const navigationState = {
    viewMode: viewMode.value,
    kebeleCode: drillDownRecordDetail.value.sourceCode,
    year: drillDownRecordDetail.value.year,
    kebeleName: drillDownRecordDetail.value.sourceName
  }
  sessionStorage.setItem('aggregation_nav_state', JSON.stringify(navigationState))

  router.push({
    name: 'DemandAuditDetail',
    params: { id: row.id },
    query: {
      returnPath: router.currentRoute.value.path
    }
  })
}

// 获取农民需求状态标签
const getFarmerStatusLabel = (status) => {
  const statusMap = {
    0: t('demandAudit.status.draft'),
    1: t('demandAudit.status.submitted'),
    2: t('demandAudit.status.approved'),
    3: t('demandAudit.status.rejected')
  }
  return statusMap[status] || '-'
}

// 获取农民需求状态类型
const getFarmerStatusType = (status) => {
  const typeMap = {
    0: 'info',
    1: 'warning',
    2: 'success',
    3: 'danger'
  }
  return typeMap[status] || 'info'
}

// 分页变化
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

  // 检查是否需要恢复下钻状态
  const savedState = sessionStorage.getItem('aggregation_nav_state')
  if (savedState) {
    try {
      const state = JSON.parse(savedState)
      // 清除保存的状态
      sessionStorage.removeItem('aggregation_nav_state')

      // 恢复下钻状态
      if (state.viewMode === 'drillDown' && state.kebeleCode) {
        // 设置下钻记录详情
        drillDownRecordDetail.value = {
          sourceCode: state.kebeleCode,
          year: state.year,
          sourceName: state.kebeleName
        }
        viewMode.value = 'drillDown'
        drillDownRecordDetailVisible.value = true
        activeDetailTab.value = 'farmers'

        // 加载汇聚数据
        loadDrillDownData().then(() => {
          // 打开详情对话框并切换到农民需求标签页
          setTimeout(() => {
            handleDrillDownDetail(drillDownRecordDetail.value)
            setTimeout(() => {
              activeDetailTab.value = 'farmers'
              loadFarmerDemandData()
            }, 100)
          }, 100)
        })
      }
    } catch (e) {
      console.error('Failed to restore navigation state:', e)
      sessionStorage.removeItem('aggregation_nav_state')
    }
  }
})

// Unified Action Button Handlers
const mapWorkflowStatus = (status) => {
  const map = {
    '0': 'S0', // Draft
    '1': 'S1', // Pending
    '2': 'S2', // Approved
    '3': 'S3'  // Rejected
  }
  return map[status] || 'S0'
}

const getMainTableButtons = (row) => {
  const buttons = [
    { type: 'primary', action: 'audit', label: 'townAggregation.actions.approve', icon: 'ri-file-list-3-line' }
  ]
  
  if (row.status === '0' || row.status === '3') {
     buttons.push({ type: 'success', action: 'submit', label: 'townAggregation.actions.submit', icon: 'ri-upload-cloud-line' })
  }
  
  buttons.push({ type: 'primary', action: 'view', rawLabel: t('Aggregation detail'), icon: 'ri-list-check' })
  buttons.push({ type: 'success', action: 'export', rawLabel: t('common.export'), icon: 'ri-download-line' })
  
  return buttons
}

const handleAction = (row, action) => {
  switch (action) {
    case 'audit':
      handleApprove(row)
      break
    case 'submit':
      handleSubmit(row)
      break
    case 'view':
      handleDetail(row)
      break
    case 'export':
      handleExport(row)
      break
  }
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
  return new Set([
    selectedSeason,
    selected?.actualValue,
    selected?.label
  ].filter(Boolean).map(normalizeSeasonValue))
}

const matchesSelectedSeason = (item, selectedSeason) => {
  if (!selectedSeason) return true
  const filterCandidates = getSeasonFilterCandidates(selectedSeason)
  const recordSeason = item.season ?? item.seasonCode ?? item.season_code
  const recordCandidates = new Set([
    recordSeason,
    getSeasonLabel(recordSeason)
  ].filter(Boolean).map(normalizeSeasonValue))
  return [...recordCandidates].some((candidate) => filterCandidates.has(candidate))
}

const handleExport = async (row) => {
  try {
    const res = await getTownAggregationDetail({
      sourceCode: row.sourceCode,
      year: row.year
    })

    if (res.code !== 200) {
      ElMessage.error(res.msg || t('townAggregation.detailDialog.loadFailed'))
      return
    }

    const selectedSeason = exportFilters.season
    const records = (res.data || []).filter((item) => matchesSelectedSeason(item, selectedSeason))
    if (!records.length) {
      ElMessage.warning(t('townAggregation.detailDialog.noData'))
      return
    }

    const csvContent = [
      ['Woreda Name', t('townAggregation.detailDialog.columns.inputCategory'), t('townAggregation.detailDialog.columns.inputType'), t('farmerDemand.form.season'), t('farmerDemand.form.variety'), t('townAggregation.detailDialog.columns.totalQuantity')],
      ...records.map((item) => [
        row.sourceName || '-',
        getLabelByValue('input_category', item.inputCategory) || item.inputCategory || '-',
        getLabelByValue('input_type', item.inputType) || item.inputType || '-',
        getSeasonLabel(item.season || item.seasonCode || item.season_code),
        item.variety || '-',
        getEffectiveQuantity(item)
      ])
    ].map((csvRow) => csvRow.map(escapeCsvCell).join(',')).join('\n')

    const safeName = (row.sourceName || 'woreda-aggregation').replace(/[\\/:*?"<>|]/g, '_')
    const seasonLabel = selectedSeason ? (getLabelByValue('agri_season', selectedSeason) || selectedSeason) : 'all-seasons'
    const safeSeasonLabel = seasonLabel.replace(/[\\/:*?"<>|\s]/g, '_')
    downloadCsv(csvContent, `${safeName}-${row.year}-${safeSeasonLabel}-aggregation-results.csv`)
    ElMessage.success(t('common.success'))
  } catch (error) {
    console.error('Failed to export aggregation results:', error)
    ElMessage.error(t('townAggregation.detailDialog.loadFailed'))
  }
}

const getDrillDownButtons = (row) => {
  return [
    { type: 'primary', action: 'view', label: 'common.view', icon: 'ri-eye-line' }
  ]
}

const handleDrillDownAction = (row, action) => {
  if (action === 'view') {
    handleDrillDownDetail(row)
  }
}

const getFarmerDemandButtons = (row) => {
  return [
    { type: 'primary', action: 'view', label: 'common.view', icon: 'ri-eye-line' }
  ]
}

const handleFarmerDemandAction = (row, action) => {
  if (action === 'view') {
    handleViewFarmerDemand(row)
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/page-common.scss';
@use '@/assets/styles/workflow-common.scss';
@use '@/assets/styles/table-enhanced.scss';

.drill-down-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eba4a4; // Will be handled by page-common styles usually, but keeping specific alignment
}
</style>
.filter-bar {
  display: flex;
  width: 100%;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 16px;
}
