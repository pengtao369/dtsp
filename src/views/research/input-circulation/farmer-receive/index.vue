<template>
  <div class="page-container">
    <div class="page-wrapper">
      <!-- 页面头部 -->
      <PageHeader
        icon="ri-file-receive-line"
        :title="$t('inputCirculation.cooperativeReleaseToFarmer')"
        :subtitle="$t('inputCirculation.cooperativeReleaseToFarmer')" />

      <!-- 内容区域 -->
      <div class="content-wrapper">
        <!-- 搜索卡片（无标题） -->
        <div class="search-card">
          <SearchForm @search="handleQuery" @reset="handleReset">
            <SearchItem :label="$t('inputCirculation.farmerName')">
              <el-input
                v-model="queryParams.farmerName"
                :placeholder="$t('common.pleaseInput')"
                clearable
                class="search-input">
                <template #prefix><i class="ri-search-line"></i></template>
              </el-input>
            </SearchItem>

            <SearchItem :label="$t('inputCirculation.farmerId')">
              <el-input
                v-model="queryParams.farmerId"
                :placeholder="$t('common.pleaseInput')"
                clearable
                class="search-input" />
            </SearchItem>

            <SearchItem :label="$t('inputCirculation.releaseYear')">
              <el-date-picker
                v-model="queryParams.year"
                type="year"
                value-format="YYYY"
                clearable
                class="search-input" />
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
          <!-- PC端表格 -->
          <div class="table-wrapper pc-only">
            <el-table :data="receiveList" stripe v-loading="loading">
              <el-table-column prop="releaseId" :label="$t('inputCirculation.releaseId')" min-width="150" show-overflow-tooltip />
              <el-table-column prop="farmerName" :label="$t('inputCirculation.farmerName')" min-width="120" show-overflow-tooltip />
              <el-table-column prop="farmerId" :label="$t('inputCirculation.farmerId')" min-width="120" show-overflow-tooltip />
              <el-table-column prop="farmerPhone" :label="$t('inputCirculation.farmerPhone')" min-width="130" show-overflow-tooltip />
              <el-table-column prop="releaseDate" :label="$t('inputCirculation.releaseDate')" min-width="160" />
              <el-table-column prop="releaseBy" :label="$t('inputCirculation.releaseBy')" min-width="120" show-overflow-tooltip />
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
          <div v-for="item in receiveList" :key="item.id" class="mobile-card">
            <div class="mobile-card-header">
              <div class="mobile-card-title">
                <i class="ri-file-receive-line"></i>
                <span>{{ item.farmerName }}</span>
              </div>
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
                <span class="value">{{ item.releaseDate }}</span>
              </div>
              <div class="mobile-card-row">
                <span class="label">{{ $t('inputCirculation.releaseBy') }}:</span>
                <span class="value">{{ item.releaseBy }}</span>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { getFarmerReceiveList } from '@/api/inputCirculation'
import { PageHeader, InfoCard, SearchForm, SearchItem } from '@/components/common'
import ActionButtons from '@/components/workflow/ActionButtons.vue'

const { t } = useI18n()
const router = useRouter()
const loading = ref(false)
const receiveList = ref([])
const total = ref(0)
const dateRange = ref([])

const queryParams = reactive({
  farmerId: '',
  farmerName: '',
  year: '',
  startTime: '',
  endTime: '',
  pageNum: 1,
  pageSize: 10
})

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
    const response = await getFarmerReceiveList({
      ...queryParams,
      flag: 2
    })
    if (response.code === 200) {
      receiveList.value = response.rows || []
      total.value = response.total || 0
    }
  } catch (error) {
    ElMessage.error(t('common.queryFailed'))
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  Object.assign(queryParams, {
    farmerId: '',
    farmerName: '',
    year: '',
    startTime: '',
    endTime: '',
    pageNum: 1
  })
  dateRange.value = []
  handleQuery()
}

const handleView = (row) => {
  router.push(`/input/input-circulation/farmer-receive/detail/${row.id}`)
}

// 统一的动作处理方法
const handleAction = (row, action) => {
  switch (action) {
    case 'view':
      handleView(row)
      break
  }
}

// 获取自定义按钮配置（因为这个页面只有查看按钮）
const getCustomButtons = (row) => {
  return [
    { type: 'primary', action: 'view', label: 'view', icon: 'ri-eye-line' }
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
