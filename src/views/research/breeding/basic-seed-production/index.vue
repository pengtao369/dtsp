<template>
  <div class="page-container">
    <div class="page-wrapper">
      <!-- 列表视图 -->
      <template v-if="!showForm && !showDetail">
        <!-- 页面头部 -->
        <PageHeader
          icon="ri-seedling-line"
          :title="$t('basicSeedProduction.title')"
          :subtitle="$t('basicSeedProduction.subtitle')" />

        <!-- 内容区域 -->
        <div class="content-wrapper">
          <!-- 搜索卡片 -->
          <div class="search-card">
            <SearchForm @search="loadData" @reset="handleReset">
              <SearchItem :label="$t('basicSeedProduction.columns.varietyName')">
                <el-input
                  v-model="searchQuery"
                  :placeholder="$t('basicSeedProduction.searchPlaceholder')"
                  clearable
                  class="search-input">
                  <template #prefix><i class="ri-search-line"></i></template>
                </el-input>
              </SearchItem>

              <SearchItem :label="$t('basicSeedProduction.columns.time')">
                <el-date-picker
                  v-model="dateRange"
                  type="daterange"
                  range-separator="-"
                  :start-placeholder="$t('common.startDate')"
                  :end-placeholder="$t('common.endDate')"
                  clearable
                  style="width: 100%" />
              </SearchItem>
            </SearchForm>
          </div>

          <!-- 列表卡片 -->
          <InfoCard :title="$t('basicSeedProduction.list')" icon="ri-file-list-3-line">
            <template #actions>
              <el-button type="primary" @click="handleAdd">
                <i class="ri-add-line"></i>
                {{ $t('basicSeedProduction.add') }}
              </el-button>
            </template>

            <!-- PC端表格 -->
            <div class="table-wrapper pc-only">
              <el-table :data="filteredList" stripe v-loading="loading">
                <el-table-column type="selection" width="55" align="center" />
                <el-table-column
                  prop="produceBatchId"
                  :label="$t('basicSeedProduction.columns.produceBatchId')"
                  width="260"
                  show-overflow-tooltip />
                <el-table-column
                  prop="produceBatchName"
                  :label="$t('basicSeedProduction.columns.produceBatchName')"
                  width="210"
                  show-overflow-tooltip />
                <el-table-column
                  prop="breedBatchName"
                  :label="$t('basicSeedProduction.columns.breedBatchName')"
                  width="200"
                  show-overflow-tooltip />
                <el-table-column
                  prop="varietyName"
                  :label="$t('basicSeedProduction.columns.varietyName')"
                  min-width="150"
                  show-overflow-tooltip />
                <el-table-column
                  prop="cropType"
                  :label="$t('basicSeedProduction.columns.cropType')"
                  min-width="120"
                  align="center">
                  <template #default="{ row }">
                    {{ getCropTypeDisplay(row.cropType) }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="time"
                  :label="$t('basicSeedProduction.columns.time')"
                  min-width="150" />
                <el-table-column
                  prop="landName"
                  :label="$t('basicSeedProduction.columns.landName')"
                  min-width="120" />
                <el-table-column
                  prop="inputSeedQuantity"
                  :label="$t('basicSeedProduction.columns.inputSeedQuantity')"
                  width="180"
                  align="right">
                  <template #default="{ row }">
                    {{ row.inputSeedQuantity }} kg
                  </template>
                </el-table-column>
                <el-table-column
                  prop="fromSeedLevel"
                  :label="$t('basicSeedProduction.columns.fromSeedLevel')"
                  min-width="120"
                  align="center" />
                <el-table-column
                  prop="toSeedLevel"
                  :label="$t('basicSeedProduction.columns.toSeedLevel')"
                  min-width="120"
                  align="center" />
                <el-table-column
                  prop="operatorName"
                  :label="$t('basicSeedProduction.columns.operatorName')"
                  width="110" />
                <el-table-column
                  prop="flowStatus"
                  :label="$t('basicSeedProduction.columns.flowStatus')"
                  width="120"
                  align="center">
                  <template #default="{ row }">
                    <el-tag 
                      :type="row.flowStatus === 'S2' ? 'success' : row.flowStatus === 'S10' ? 'danger' : row.flowStatus === 'S3' ? 'warning' : 'primary'" 
                      size="small">
                      {{ getLabelByValue('flow_status', row.flowStatus) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="produceStatus"
                  :label="$t('basicSeedProduction.columns.produceStatus')"
                  width="180"
                  align="center">
                  <template #default="{ row }">
                    <el-tag type="success" size="small">
                      {{ row.produceStatus }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('basicSeedProduction.columns.actions')" width="240" fixed="right">
                  <template #default="{ row }">
                    <div class="action-buttons">
                      <el-button type="primary" size="small" @click="handleView(row)">
                        <i class="ri-eye-line"></i>
                        <span class="btn-text">{{ $t('common.view') }}</span>
                      </el-button>
                      <el-button 
                        type="danger" 
                        size="small"
                        @click="handleVoid(row)"
                        v-if="row.flowStatus !== 'S2' && row.flowStatus !== 'S10'">
                        <i class="ri-delete-bin-line"></i>
                        <span class="btn-text">{{ $t('common.delete') }}</span>
                      </el-button>
                    </div>
                  </template>
                </el-table-column>
              </el-table>

              <div class="pagination-wrapper">
                <el-pagination
                  v-model:current-page="currentPage"
                  v-model:page-size="pageSize"
                  :total="total"
                  :page-sizes="[10, 20, 50, 100]"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange" />
              </div>
            </div>

            <!-- 移动端卡片 -->
            <div class="mobile-card-list mobile-only">
              <div
                v-for="item in filteredList"
                :key="item.produceBatchName"
                class="mobile-card">
                <div class="mobile-card-header">
                  <div class="mobile-card-title">
                    <i class="ri-seedling-line"></i>
                    <span>{{ item.varietyName }}</span>
                  </div>
                  <el-tag 
                    :type="item.flowStatus === 'S2' ? 'success' : item.flowStatus === 'S10' ? 'danger' : item.flowStatus === 'S3' ? 'warning' : 'primary'" 
                    size="small">
                    {{ getLabelByValue('flow_status', item.flowStatus) }}
                  </el-tag>
                </div>
                <div class="mobile-card-body">
                  <div class="mobile-card-row">
                    <span class="label">{{ $t('basicSeedProduction.columns.produceBatchId') }}:</span>
                    <span class="value">{{ item.produceBatchId }}</span>
                  </div>
                  <div class="mobile-card-row">
                    <span class="label">{{ $t('basicSeedProduction.columns.produceBatchName') }}:</span>
                    <span class="value">{{ item.produceBatchName }}</span>
                  </div>
                  <div class="mobile-card-row">
                    <span class="label">{{ $t('basicSeedProduction.columns.cropType') }}:</span>
                    <span class="value">{{ getCropTypeDisplay(item.cropType) }}</span>
                  </div>
                  <div class="mobile-card-row">
                    <span class="label">{{ $t('basicSeedProduction.columns.time') }}:</span>
                    <span class="value">{{ item.time }}</span>
                  </div>
                  <div class="mobile-card-row">
                    <span class="label">{{ $t('basicSeedProduction.columns.inputSeedQuantity') }}:</span>
                    <span class="value">{{ item.inputSeedQuantity }} kg</span>
                  </div>
                  <div class="mobile-card-row">
                    <span class="label">{{ $t('basicSeedProduction.columns.produceStatus') }}:</span>
                    <span class="value">{{ item.produceStatus }}</span>
                  </div>
                </div>
                <div class="mobile-card-footer">
                  <div class="action-buttons">
                    <el-button type="primary" size="small" @click="handleView(item)">
                      <i class="ri-eye-line"></i>
                      <span class="btn-text">{{ $t('common.view') }}</span>
                    </el-button>
                    <el-button 
                      type="danger" 
                      size="small"
                      @click.stop="handleVoid(item)"
                      v-if="item.flowStatus !== 'S2' && item.flowStatus !== 'S10'">
                      <i class="ri-delete-bin-line"></i>
                      <span class="btn-text">{{ $t('common.delete') }}</span>
                    </el-button>
                  </div>
                </div>
              </div>

              <div class="pagination-wrapper">
                <el-pagination
                  v-model:current-page="currentPage"
                  v-model:page-size="pageSize"
                  :page-sizes="[10, 20, 50]"
                  :total="total"
                  layout="total, prev, pager, next"
                  small
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange" />
              </div>
            </div>
          </InfoCard>
        </div>
      </template>

      <!-- 新增表单视图 -->
      <ProductionForm
        v-if="showForm"
        :is-edit="false"
        @cancel="showForm = false"
        @success="handleFormSuccess" />

      <!-- 详情视图 -->
      <ProductionDetail
        v-if="showDetail"
        :data="currentRow"
        @back="showDetail = false" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { PageHeader, InfoCard, SearchForm, SearchItem } from '@/components/common'
import { getBasicSeedProduceList, voidBasicSeedProduce } from '@/api/basicSeed'
import { useDict } from '@/hooks/useDict'
import ProductionForm from './form.vue'
import ProductionDetail from './detail.vue'

const { t } = useI18n()

// 使用 useDict hook 获取字典数据
const { getLabelByValue } = useDict(['crop_type', 'flow_status'])
const getCropTypeDisplay = (value) => getLabelByValue('crop_type', value) || value || '-'

// 数据状态
const loading = ref(false)
const dataList = ref([])
const searchQuery = ref('')
const dateRange = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 视图控制
const showForm = ref(false)
const showDetail = ref(false)
const currentRow = ref(null)

// 计算属性 - 过滤列表
const filteredList = computed(() => {
  let list = dataList.value

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    list = list.filter(item =>
      item.varietyName?.toLowerCase().includes(query) ||
      item.cropType?.toLowerCase().includes(query)
    )
  }

  // 日期范围过滤
  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    list = list.filter(item => {
      const itemDate = new Date(item.time)
      return itemDate >= start && itemDate <= end
    })
  }

  return list
})

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }
    const res = await getBasicSeedProduceList(params)
    if (res.code === 200) {
      dataList.value = res.rows || []
      total.value = res.total || 0
    }
  } catch (error) {
    console.error('Failed to load data:', error)
    ElMessage.error(t('common.loadFailed'))
  } finally {
    loading.value = false
  }
}

// 处理重置
const handleReset = () => {
  searchQuery.value = ''
  dateRange.value = []
  currentPage.value = 1
  loadData()
}

// 处理分页
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  loadData()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  loadData()
}

// CRUD 操作
const handleAdd = () => {
  showForm.value = true
  showDetail.value = false
}

const handleView = (row) => {
  currentRow.value = row
  showDetail.value = true
  showForm.value = false
}

const handleVoid = (row) => {
  ElMessageBox.confirm(
    t('basicSeedProduction.voidConfirm'),
    t('common.tips'),
    {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        const res = await voidBasicSeedProduce(row.produceBatchId)
        if (res.code === 200) {
          ElMessage.success(t('basicSeedProduction.voidSuccess'))
          loadData()
        } else {
          ElMessage.error(res.msg || t('common.operationFailed'))
        }
      } catch (error) {
        console.error('Failed to void production:', error)
        ElMessage.error(t('common.operationFailed'))
      }
    })
    .catch(() => {})
}

const handleFormSuccess = () => {
  showForm.value = false
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

// 操作按钮样式 - 匹配 ActionButtons 组件的样式
.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  justify-content: flex-start;

  :deep(.el-button) {
    min-width: auto;
    padding: 4px 10px;
    font-size: 12px;
    font-weight: 500;
    margin: 0 !important;

    i {
      margin-right: 4px;
      font-size: 13px;
      vertical-align: middle;
    }

    .btn-text {
      white-space: nowrap;
    }
  }
}
</style>
