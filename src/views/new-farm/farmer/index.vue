<template>
  <div class="page-container">
    <div class="page-wrapper">
      <!-- 页面头部 -->
      <PageHeader
        icon="ri-user-line"
        :title="$t('newFarm.farmer.title')"
        :subtitle="$t('newFarm.farmer.subtitle')" />

      <!-- 内容区域 -->
      <div class="content-wrapper">
        <!-- 搜索卡片（无标题） -->
        <div class="search-card">
          <SearchForm @search="handleSearch" @reset="handleReset">
            <SearchItem :label="$t('newFarm.farmer.form.farmerName')">
              <el-input
                v-model="searchFilters.farmerName"
                :placeholder="$t('newFarm.farmer.placeholder.farmerName')"
                clearable
                class="search-input"
                @clear="handleSearch"
                @keyup.enter="handleSearch">
                <template #prefix><i class="ri-search-line"></i></template>
              </el-input>
            </SearchItem>

            <SearchItem :label="$t('newFarm.farmer.form.phone')">
              <el-input
                v-model="searchFilters.phone"
                :placeholder="$t('newFarm.farmer.placeholder.phone')"
                clearable
                class="search-input"
                @clear="handleSearch"
                @keyup.enter="handleSearch" />
            </SearchItem>
          </SearchForm>
        </div>

        <!-- 列表卡片 -->
        <InfoCard
          :title="$t('newFarm.farmer.title')"
          icon="ri-file-list-3-line">
          <template #actions>
            <el-button type="primary" @click="handleAdd">
              <i class="ri-add-line"></i>
              {{ $t('common.add') }}
            </el-button>
            <el-button type="success" plain @click="handleImport">
              <i class="ri-upload-2-line"></i>
              {{ $t('newFarm.farmer.actions.import') }}
            </el-button>
            <el-button
              v-if="selectedIds.length > 0"
              type="danger"
              plain
              @click="handleBatchDelete">
              <i class="ri-delete-bin-line"></i>
              {{ $t('newFarm.farmer.actions.batchDelete') }} ({{ selectedIds.length }})
            </el-button>
          </template>

          <!-- PC端表格 -->
          <div class="table-wrapper pc-only">
            <el-table
              v-loading="loading"
              :data="tableData"
              stripe
              style="width: 100%"
              @selection-change="handleSelectionChange">
              <el-table-column type="selection" width="50" />
              <el-table-column prop="farmerId" :label="$t('newFarm.farmer.columns.farmerId')" min-width="150" show-overflow-tooltip />
              <el-table-column prop="farmerName" :label="$t('newFarm.farmer.columns.farmerName')" min-width="150" show-overflow-tooltip />
              <el-table-column prop="gender" :label="$t('newFarm.farmer.columns.gender')" min-width="100" align="center">
                <template #default="{ row }">
                  <el-tag v-if="row.gender" size="small" :type="row.gender === 'MALE' ? 'primary' : 'danger'">
                    {{ row.gender === 'MALE' ? $t('newFarm.common.male') : $t('newFarm.common.female') }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="phone" :label="$t('newFarm.farmer.columns.phone')" min-width="130" />
              <el-table-column prop="kebeleName" :label="$t('newFarm.farmer.columns.kebeleName')" min-width="150" show-overflow-tooltip />
              <el-table-column prop="landCount" :label="$t('newFarm.farmer.columns.landCount')" min-width="100" align="center">
                <template #default="{ row }">
                  <el-tag type="info" size="small">{{ row.landCount || 0 }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="totalLandArea" :label="$t('newFarm.farmer.columns.totalLandArea')" min-width="120" align="right">
                <template #default="{ row }">
                  {{ formatArea(row.totalLandArea) }}
                </template>
              </el-table-column>
              <el-table-column :label="$t('newFarm.common.actions')" width="240" fixed="right">
                <template #default="{ row }">
                  <ActionButtons
                    :workflow-status="row.workflowStatus || 'S0'"
                    mode="list"
                    :show-audit="false"
                    :custom-buttons="rowActionButtons"
                    @action="(action) => handleAction(row, action)" />
                </template>
              </el-table-column>
            </el-table>

            <div class="pagination-wrapper">
              <el-pagination
                v-model:current-page="pagination.pageNum"
                v-model:page-size="pagination.pageSize"
                :total="pagination.total"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange" />
            </div>
          </div>
        </InfoCard>

        <!-- 移动端卡片列表 -->
        <div class="mobile-card-list mobile-only" v-loading="loading">
          <div v-for="item in tableData" :key="item.farmerId" class="mobile-card">
            <div class="mobile-card-header">
              <div class="mobile-card-title">
                <i class="ri-user-line"></i>
                <span>{{ item.farmerName }}</span>
              </div>
              <el-tag v-if="item.gender" size="small" :type="item.gender === 'MALE' ? 'primary' : 'danger'">
                {{ item.gender === 'MALE' ? $t('newFarm.common.male') : $t('newFarm.common.female') }}
              </el-tag>
            </div>
            <div class="mobile-card-body">
              <div class="mobile-card-row">
                <span class="label">{{ $t('newFarm.farmer.columns.farmerId') }}:</span>
                <span class="value">{{ item.farmerId }}</span>
              </div>
              <div class="mobile-card-row">
                <span class="label">{{ $t('newFarm.farmer.columns.phone') }}:</span>
                <span class="value">{{ item.phone || '-' }}</span>
              </div>
              <div class="mobile-card-row">
                <span class="label">{{ $t('newFarm.farmer.columns.kebeleName') }}:</span>
                <span class="value">{{ item.kebeleName || '-' }}</span>
              </div>
              <div class="mobile-card-row">
                <span class="label">{{ $t('newFarm.farmer.columns.landCount') }}:</span>
                <span class="value">{{ item.landCount || 0 }}</span>
              </div>
              <div class="mobile-card-row">
                <span class="label">{{ $t('newFarm.farmer.columns.totalLandArea') }}:</span>
                <span class="value">{{ formatArea(item.totalLandArea) }}</span>
              </div>
            </div>
            <div class="mobile-card-footer">
              <ActionButtons
                :workflow-status="item.workflowStatus || 'S0'"
                mode="list"
                :show-audit="false"
                :custom-buttons="rowActionButtons"
                @action="(action) => handleAction(item, action)" />
            </div>
          </div>

          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="pagination.pageNum"
              :total="pagination.total"
              :page-size="pagination.pageSize"
              layout="prev, pager, next"
              small
              @current-change="handleCurrentChange" />
          </div>
        </div>
      </div>

      <!-- 导入对话框 -->
      <el-dialog
        v-model="importDialogVisible"
        :title="$t('newFarm.farmer.actions.import')"
        width="500px"
        :close-on-click-modal="false">
        <div class="import-content">
          <el-upload
            ref="uploadRef"
            class="upload-area"
            drag
            action="#"
            :auto-upload="false"
            :limit="1"
            accept=".xlsx,.xls"
            :on-change="handleFileChange"
            :on-exceed="handleExceed">
            <i class="ri-upload-cloud-2-line upload-icon"></i>
            <div class="el-upload__text">
              {{ $t('newFarm.farmer.import.dragText') }}
              <em>{{ $t('newFarm.farmer.import.clickText') }}</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                {{ $t('newFarm.farmer.import.tip') }}
              </div>
            </template>
          </el-upload>

          <div class="import-options">
            <el-checkbox v-model="updateSupport">
              {{ $t('newFarm.farmer.import.updateSupport') }}
            </el-checkbox>
          </div>

          <div class="template-download">
            <el-button link type="primary" @click="handleDownloadTemplate">
              <i class="ri-download-line"></i>
              {{ $t('newFarm.farmer.import.downloadTemplate') }}
            </el-button>
          </div>
        </div>

        <template #footer>
          <el-button @click="importDialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" :loading="importLoading" @click="submitImport">
            {{ $t('common.confirm') }}
          </el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { PageHeader, InfoCard, SearchForm, SearchItem } from '@/components/common'
import ActionButtons from '@/components/workflow/ActionButtons.vue'
import {
  getFarmerList,
  deleteFarmer,
  batchDeleteFarmer,
  downloadFarmerImportTemplate,
  importFarmerData
} from '@/api/newFarm'

const router = useRouter()
const { t } = useI18n()

// 搜索筛选条件
const searchFilters = reactive({
  farmerName: '',
  phone: ''
})

// 分页
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 表格数据
const tableData = ref([])
const loading = ref(false)
const selectedIds = ref([])

// 导入相关
const importDialogVisible = ref(false)
const importLoading = ref(false)
const updateSupport = ref(false)
const uploadRef = ref(null)
const importFile = ref(null)

// 列表操作按钮（仅用于 UI 统一，不影响原有业务逻辑）
const rowActionButtons = [
  { type: 'success', action: 'view', label: 'view', icon: 'ri-eye-line' },
  { type: 'primary', action: 'edit', label: 'edit', icon: 'ri-edit-line' },
  { type: 'danger', action: 'cancelBatch', label: 'delete', icon: 'ri-delete-bin-line', text: t('common.delete') }
]

// 获取列表数据
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    }

    if (searchFilters.farmerName) params.farmerName = searchFilters.farmerName
    if (searchFilters.phone) params.phone = searchFilters.phone

    const res = await getFarmerList(params)
    if (res.code === 200 && res.data) {
      tableData.value = res.data.records || res.data.list || []
      pagination.total = res.data.total || 0
    }
  } catch (error) {
    console.error('Failed to fetch data:', error)
    ElMessage.error(t('common.failed'))
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1
  fetchData()
}

// 重置
const handleReset = () => {
  searchFilters.farmerName = ''
  searchFilters.phone = ''
  handleSearch()
}

// 分页变化
const handleSizeChange = (val) => {
  pagination.pageSize = val
  pagination.pageNum = 1
  fetchData()
}

const handleCurrentChange = (val) => {
  pagination.pageNum = val
  fetchData()
}

// 选择变化
const handleSelectionChange = (rows) => {
  selectedIds.value = rows.map(row => row.farmerId)
}

// 新增
const handleAdd = () => {
  router.push('/input/farmer/add')
}

// 查看详情
const handleView = (row) => {
  router.push(`/input/farmer/detail/${row.farmerId}`)
}

// 编辑
const handleEdit = (row) => {
  router.push(`/input/farmer/edit/${row.farmerId}`)
}

// 统一动作处理（仅做 UI 按钮事件转发，不修改业务逻辑）
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

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      t('newFarm.farmer.confirmDelete'),
      t('common.tips'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )

    const res = await deleteFarmer(row.farmerId)
    if (res.code === 200) {
      ElMessage.success(t('newFarm.common.deleteSuccess'))
      fetchData()
    } else {
      ElMessage.error(res.msg || t('common.failed'))
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete:', error)
      ElMessage.error(t('common.failed'))
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) return

  try {
    await ElMessageBox.confirm(
      t('newFarm.farmer.confirmBatchDelete', { count: selectedIds.value.length }),
      t('common.tips'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )

    const res = await batchDeleteFarmer(selectedIds.value)
    if (res.code === 200) {
      ElMessage.success(t('newFarm.common.deleteSuccess'))
      selectedIds.value = []
      fetchData()
    } else {
      ElMessage.error(res.msg || t('common.failed'))
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to batch delete:', error)
      ElMessage.error(t('common.failed'))
    }
  }
}

// 格式化面积
const formatArea = (area) => {
  if (!area) return '0 ha'
  return `${parseFloat(area).toFixed(2)} ha`
}

// 打开导入对话框
const handleImport = () => {
  importDialogVisible.value = true
  updateSupport.value = false
  importFile.value = null
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

// 文件变化
const handleFileChange = (file) => {
  importFile.value = file.raw
}

// 文件超出限制
const handleExceed = () => {
  ElMessage.warning(t('newFarm.farmer.import.exceedLimit'))
}

// 下载模板
const handleDownloadTemplate = async () => {
  try {
    const res = await downloadFarmerImportTemplate()

    // res 现在应该是 Blob 对象
    const blob = res instanceof Blob ? res : new Blob([res], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'Farmer_Import_Template.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    ElMessage.success(t('common.downloadSuccess') || 'Download successful')
  } catch (error) {
    console.error('Download template failed:', error)
    ElMessage.error(t('common.downloadFailed') || 'Download failed')
  }
}

// 提交导入
const submitImport = async () => {
  if (!importFile.value) {
    ElMessage.warning(t('newFarm.farmer.import.selectFile'))
    return
  }

  importLoading.value = true
  try {
    const formData = new FormData()
    formData.append('file', importFile.value)
    formData.append('updateSupport', updateSupport.value)

    const res = await importFarmerData(formData)
    if (res.code === 200) {
      const data = res.data || {}
      ElMessage.success(
        t('newFarm.farmer.import.success', {
          success: data.successCount || 0,
          update: data.updateCount || 0,
          fail: data.failCount || 0
        })
      )
      importDialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.msg || t('common.failed'))
    }
  } catch (error) {
    console.error('Import failed:', error)
    ElMessage.error(t('common.failed'))
  } finally {
    importLoading.value = false
  }
}

// 初始化
onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/page-common.scss';
@use '@/assets/styles/workflow-common.scss';
@use '@/assets/styles/table-enhanced.scss';

/* 导入对话框样式（页面独有） */
.import-content {
  padding: 0 10px;
}

.upload-area {
  width: 100%;

  :deep(.el-upload) {
    width: 100%;
  }

  :deep(.el-upload-dragger) {
    width: 100%;
    padding: 40px 20px;
  }
}

.upload-icon {
  font-size: 48px;
  color: #009a44;
  margin-bottom: 16px;
}

.import-options {
  margin-top: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.template-download {
  margin-top: 16px;
  text-align: center;

  i {
    margin-right: 4px;
  }
}
</style>
