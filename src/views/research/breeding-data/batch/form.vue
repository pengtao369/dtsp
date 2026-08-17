<template>
  <div class="page-container">
    <div class="page-wrapper">
      <!-- 页面头部 -->
      <PageHeader icon="ri-edit-box-line" :title="pageTitle" shadow show-back @back="goBack" />

      <!-- 表单区域 -->
      <div class="content-wrapper">
        <el-form ref="formRef" :model="formData" :rules="rules" label-width="180px" v-loading="loading || dictLoading">
          <!-- 批次基本信息 -->
          <div class="info-card">
            <div class="card-header">
              <div class="card-title">
                <i class="ri-information-line"></i>
                <span>{{ $t('research.breedingData.batch.form.basicInfo') }}</span>
              </div>
            </div>
            <div class="card-body">
              <el-row :gutter="20">
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('research.breedingData.batch.form.batchName')" prop="batchName">
                    <el-input v-model="formData.batchName" :placeholder="$t('research.breedingData.batch.placeholder.batchName')" :disabled="isReadOnly" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('research.breedingData.batch.form.batchId')">
                    <el-input v-model="formData.batchId" disabled :placeholder="'B_{cropType}_{year}_000001'" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('research.breedingData.batch.form.cropType')" prop="cropType">
                    <el-select 
                      v-model="formData.cropType" 
                      :placeholder="$t('research.breedingData.batch.placeholder.cropType')" 
                      style="width: 100%" 
                      @change="handleCropTypeChange" 
                      :disabled="isReadOnly"
                      v-loading="dictLoading"
                      filterable
                      clearable
                    >
                      <el-option v-for="item in cropTypeOptionsData" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('research.breedingData.batch.form.varietyName')" prop="varietyName">
                    <el-input
                      v-model="formData.varietyName"
                      :placeholder="$t('research.breedingData.batch.placeholder.varietyName')"
                      style="width: 100%"
                      :disabled="isReadOnly" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('research.breedingData.batch.form.varietyCode')">
                    <el-input v-model="formData.varietyCode" disabled :placeholder="'V_{cropType}_{year}_0001'" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('research.breedingData.batch.form.breedingMethod')" prop="breedingMethod">
                    <el-select v-model="formData.breedingMethod" :placeholder="$t('research.breedingData.batch.placeholder.breedingMethod')" style="width: 100%" :disabled="isReadOnly">
                      <el-option v-for="item in breedingMethodOptions" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('research.breedingData.batch.form.year')" prop="year">
                    <div class="w-full">
                      <el-date-picker
                        v-model="formData.year"
                        type="year"
                        value-format="YYYY"
                        style="width: 100%"
                        :placeholder="$t('research.breedingData.batch.placeholder.year')"
                        :disabled-date="disablePastYears"
                        :disabled="isReadOnly"
                      />
                      <div class="mt-1 text-xs text-gray-500">
                        {{ $t('research.breedingData.batch.hint.yearNoPastSeasonLogic') }}
                      </div>
                    </div>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('research.breedingData.batch.form.germplasmSource')" prop="germplasmSource">
                    <el-select v-model="formData.germplasmSource" :placeholder="$t('research.breedingData.batch.placeholder.germplasmSource')" style="width: 100%" :disabled="isReadOnly">
                      <el-option v-for="item in germplasmSourceOptions" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('research.breedingData.batch.form.parentalSeedSource')" prop="parentalSeedSource">
                    <el-input v-model="formData.parentalSeedSource" :placeholder="$t('research.breedingData.batch.placeholder.parentalSeedSource')" :disabled="isReadOnly" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('research.breedingData.batch.form.objective')" prop="objective">
                    <el-input v-model="formData.objective" :placeholder="$t('research.breedingData.batch.placeholder.objective')" :disabled="isReadOnly" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('research.breedingData.batch.form.status')" prop="status">
                    <el-select v-model="formData.status" :placeholder="$t('research.breedingData.batch.placeholder.status')" style="width: 100%" disabled>
                      <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :xs="24">
                  <el-form-item :label="$t('research.breedingData.batch.form.remarks')">
                    <el-input v-model="formData.remarks" type="textarea" :rows="3" :placeholder="$t('research.breedingData.batch.placeholder.remarks')" :disabled="isReadOnly" />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>

          <!-- 元数据信息 -->
          <div v-if="showMetadataInfo" class="info-card">
            <div class="card-header">
              <div class="card-title">
                <i class="ri-information-line"></i>
                <span>{{ $t('research.breedingData.batch.form.metadataInfo') }}</span>
              </div>
            </div>
            <div class="card-body">
              <el-row :gutter="20">
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('research.breedingData.batch.form.createBy')">
                    <el-input v-model="formData.createBy" disabled />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('research.breedingData.batch.form.createTime')">
                    <el-input v-model="formData.createTime" disabled />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('research.breedingData.batch.form.updateBy')">
                    <el-input v-model="formData.updateBy" disabled />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('research.breedingData.batch.form.updateTime')">
                    <el-input v-model="formData.updateTime" disabled />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>

          <!-- 工作流信息 -->
          <div class="info-card" v-if="showWorkflowInfo">
            <div class="card-header">
              <div class="card-title">
                <i class="ri-git-commit-line"></i>
                <span>{{ $t('research.breedingData.batch.form.workflowInfo') }}</span>
              </div>
            </div>
            <div class="card-body">
              <!-- 审批意见输入框（仅在审批模式下显示） -->
              <div v-if="pageMode === 'audit'">
                <el-form-item :label="$t('research.breedingData.batch.form.approvalComment')" prop="approvalComment">
                  <el-input 
                    v-model="formData.approvalComment" 
                    type="textarea" 
                    :rows="4" 
                    :placeholder="$t('research.breedingData.batch.placeholder.approvalComment')" 
                  />
                </el-form-item>
              </div>

              <!-- 历史审批信息 -->
              <div class="mb-4">
                <h4 class="mb-3">{{ $t('research.breedingData.batch.form.approvalHistory') }}</h4>
                <el-table :data="approvalHistory" border stripe>
                  <el-table-column :label="$t('research.breedingData.batch.form.approver')" prop="approver" width="200" />
                  <el-table-column :label="$t('research.breedingData.batch.form.approvalTime')" prop="approvalTime" width="250" />
                  <el-table-column :label="$t('research.breedingData.batch.form.comment')" prop="comment" />
                </el-table>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="form-actions">
            <el-button v-for="button in getActionButtons()" :key="button.action"
              :type="button.type" @click="handleAction(button.action)"
              :loading="submitLoading && button.action === 'save'">
              {{ $t(`common.${button.label}`) }}
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { getBreedingBatchInfo, addBreedingBatch, editBreedingBatch, submitForAudit, approveBatch, rejectBatch, archiveBatch, cancelBatch } from '@/api/breedingData'
import { useDict } from '@/hooks/useDict'
import { useUserStore } from '@/store'
import { PageHeader } from '@/components/common'
import { resolveCropTypeValue, resolveCropTypeLabel } from '@/utils/researchCropType'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

// 使用 useDict hook 获取字典数据
const { options, loading: dictLoading } = useDict([
  'crop_type',
  'inventory_sub_category',
  'flow_status'
])

const cropTypeOptionsData = computed(() => {
  const subCategories = options.value.inventory_sub_category || []
  const cropTypes = options.value.crop_type || []
  
  // Combine potential sources
  const allOptions = [...subCategories, ...cropTypes]
  
  const filtered = allOptions.filter(item => {
    const remark = String(item.remark || '').toUpperCase()
    const label = String(item.label || '').toUpperCase()
    return remark === 'SEED' || remark === 'IN01' || remark.includes('SEED') || label.includes('SEED') || label.includes('种子')
  })
  
  // Deduplicate by value
  const seen = new Set()
  return filtered.filter(item => {
    if (seen.has(item.value)) return false
    seen.add(item.value)
    return true
  }).map(item => ({
    label: item.label,
    value: item.value
  }))
})

const formRef = ref(null)
const loading = ref(false)
const submitLoading = ref(false)
const userStore = useUserStore()

const isEdit = computed(() => !!route.params.dataId)

// 根据路由路径和参数判断页面模式
const pageMode = computed(() => {
  if (route.query.mode) return route.query.mode
  if (route.path.includes('/audit/')) return 'audit'
  if (route.path.includes('/detail/')) return 'view'
  return isEdit.value ? 'edit' : 'add'
})

const isReadOnly = computed(() => pageMode.value === 'audit' || pageMode.value === 'view')
const showMetadataInfo = computed(() => false)

// 页面标题
const pageTitle = computed(() => {
  switch (pageMode.value) {
    case 'audit': return t('research.breedingData.batch.audit.title')
    case 'view': return t('research.breedingData.batch.detail')
    case 'edit': return t('research.breedingData.batch.edit')
    default: return t('research.breedingData.batch.add')
  }
})

const showWorkflowInfo = computed(() => {
  if (!isEdit.value && pageMode.value === 'add') return false
  return !['S0', 'S10'].includes(formData.workflowStatus)
})

const approvalHistory = ref([])

const formData = reactive({
  dataId: '',
  batchId: '',
  cropType: '',
  varietyCode: '',
  varietyName: '',
  breedingMethod: '',
  batchName: '',
  year: '',
  germplasmSource: '',
  parentalSeedSource: '',
  objective: '',
  status: 'Ongoing',
  workflowStatus: 'S0',
  remarks: '',
  createBy: '',
  createTime: '',
  updateBy: '',
  updateTime: '',
  approvalComment: ''
})

const rules = {
  cropType: [{ required: true, message: t('research.breedingData.batch.placeholder.cropType'), trigger: 'change' }],
  varietyName: [{ required: true, message: t('research.breedingData.batch.placeholder.varietyName'), trigger: 'blur' }],
  breedingMethod: [{ required: true, message: t('research.breedingData.batch.placeholder.breedingMethod'), trigger: 'change' }],
  batchName: [{ required: true, message: t('research.breedingData.batch.placeholder.batchName'), trigger: 'blur' }],
  year: [
    { required: true, message: t('research.breedingData.batch.placeholder.year'), trigger: 'change' },
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback()
          return
        }
        const currentYear = new Date().getFullYear()
        const selectedYear = parseInt(value)
        if (selectedYear < currentYear) {
          callback(new Error(t('research.breedingData.batch.validation.yearNotLessThanCurrent')))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  germplasmSource: [{ required: true, message: t('research.breedingData.batch.placeholder.germplasmSource'), trigger: 'change' }],
  parentalSeedSource: [{ required: true, message: t('research.breedingData.batch.placeholder.parentalSeedSource'), trigger: 'blur' }],
  objective: [{ required: true, message: t('research.breedingData.batch.placeholder.objective'), trigger: 'blur' }],
  approvalComment: [{ required: true, message: t('research.breedingData.batch.placeholder.approvalComment'), trigger: 'blur' }]
}

const breedingMethodOptions = [
  { label: 'hybridization', value: 'hybridization' },
  { label: 'mutagenesis', value: 'mutagenesis' },
  { label: 'molecular', value: 'molecular' },
  { label: 'selection', value: 'selection' },
  { label: 'wide_cross', value: 'wide_cross' }
]

const germplasmSourceOptions = [
  { label: 'Ethiopian', value: 'Ethiopian' },
  { label: 'ICARDA', value: 'ICARDA' },
  { label: 'CIMMYT', value: 'CIMMYT' },
  { label: 'IRRI', value: 'IRRI' },
  { label: 'IITA', value: 'IITA' },
  { label: 'World Bank', value: 'World Bank' },
  { label: 'CGIAR', value: 'CGIAR' },
  { label: 'FAO', value: 'FAO' },
  { label: 'Local Research Center', value: 'Local Research Center' },
  { label: 'Private Company', value: 'Private Company' }
]

const statusOptions = [
  { label: 'Ongoing', value: 'Ongoing' },
  { label: 'Finished', value: 'Finished' }
]

const getActionButtons = () => {
  const mode = pageMode.value
  if (mode === 'add' || mode === 'edit') return [{ type: '', label: 'cancel', action: 'cancel' }, { type: 'primary', label: 'save', action: 'save' }]
  if (mode === 'audit') return [{ type: '', label: 'cancel', action: 'cancel' }, { type: 'success', label: 'approve', action: 'approve' }, { type: 'danger', label: 'reject', action: 'reject' }]
  if (mode === 'view') return [{ type: '', label: 'cancel', action: 'cancel' }, { type: 'primary', label: 'archive', action: 'archive' }, { type: 'danger', label: 'delete', action: 'cancelBatch' }]
  return [{ type: '', label: 'cancel', action: 'cancel' }, { type: 'primary', label: 'save', action: 'save' }]
}

const handleAction = (action) => {
  switch (action) {
    case 'cancel': goBack(); break
    case 'save': handleSubmit(); break
    case 'approve': handleApprove(); break
    case 'reject': handleReject(); break
    case 'archive': handleArchive(); break
    case 'cancelBatch': handleCancelBatch(); break
  }
}

const handleApprove = async () => {
  const valid = await formRef.value.validateField('approvalComment').catch(() => false)
  if (!valid) return
  try {
    const breedingBatchDTO = { ...formData, approvalComment: formData.approvalComment ? { comment: formData.approvalComment } : null }
    await approveBatch(breedingBatchDTO)
    ElMessage.success(t('research.breedingData.batch.approveSuccess'))
    goBack()
  } catch (error) {
    ElMessage.error(t('research.breedingData.batch.approveError'))
  }
}

const handleReject = async () => {
  const valid = await formRef.value.validateField('approvalComment').catch(() => false)
  if (!valid) return
  try {
    const breedingBatchDTO = { ...formData, approvalComment: formData.approvalComment ? { comment: formData.approvalComment } : null }
    await rejectBatch(breedingBatchDTO)
    ElMessage.success(t('research.breedingData.batch.rejectSuccess'))
    goBack()
  } catch (error) {
    ElMessage.error(t('research.breedingData.batch.rejectError'))
  }
}

const handleArchive = async () => {
  try {
    await archiveBatch(formData.dataId)
    ElMessage.success(t('research.breedingData.batch.archiveSuccess'))
    goBack()
  } catch (error) {
    ElMessage.error(t('research.breedingData.batch.archiveError'))
  }
}

const handleCancelBatch = async () => {
  try {
    await cancelBatch(formData.id)
    ElMessage.success(t('research.breedingData.batch.cancelSuccess'))
    goBack()
  } catch (error) {
    ElMessage.error(t('research.breedingData.batch.cancelError'))
  }
}

const getInfo = async () => {
  if (!isEdit.value) {
    formData.status = 'Ongoing'
    formData.workflowStatus = 'S0'
    if (userStore.userInfo && userStore.userInfo.user) formData.createBy = userStore.userInfo.user.name || ''
    const now = new Date()
    formData.createTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    return
  }
  loading.value = true
  try {
    const res = await getBreedingBatchInfo(route.params.dataId)
    Object.assign(formData, res.data)
    // 根据原始逻辑尝试解析 cropType
    const cropTypeRaw = res.data.cropType || ''
    // 这里如果 cropTypeOptionsData 还没加载完，可能解析不出 value，先保留原始值
    formData.cropType = cropTypeRaw

    if (formData.year) formData.year = String(formData.year)
    if (res.data.approvalComments) {
      approvalHistory.value = res.data.approvalComments.map(comment => ({
        approver: comment.approverName,
        approvalTime: comment.approvalTime,
        comment: comment.comment
      }))
    }
    if (userStore.userInfo && userStore.userInfo.user) formData.updateBy = userStore.userInfo.user.name || ''
    const now = new Date()
    formData.updateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
  } catch (error) {
    console.error('Failed to fetch details:', error)
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitLoading.value = true
  try {
    const cropTypeLabel = cropTypeOptionsData.value.find(o => o.value === formData.cropType)?.label || formData.cropType
    const submitData = { ...formData, cropType: cropTypeLabel }
    if (submitData.year) submitData.year = parseInt(submitData.year)
    if (isEdit.value) {
      await editBreedingBatch(submitData)
      ElMessage.success(t('research.breedingData.batch.editSuccess'))
    } else {
      await addBreedingBatch(submitData)
      ElMessage.success(t('research.breedingData.batch.addSuccess'))
    }
    goBack()
  } catch (error) {
    console.error('Failed to submit:', error)
  } finally {
    submitLoading.value = false
  }
}

const handleCropTypeChange = () => {
  generateBatchId()
  generateVarietyCode()
}

const generateVarietyCode = () => {
  if (isEdit.value) return
  const { cropType, year } = formData
  if (!cropType || !year) {
    formData.varietyCode = ''
    return
  }
  const serial = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  formData.varietyCode = `V_${cropType}_${year}_${serial}`
}

const generateBatchId = () => {
  if (isEdit.value) return
  const { cropType, year } = formData
  if (!cropType || !year) {
    formData.batchId = ''
    return
  }
  const serial = String(Math.floor(Math.random() * 1000000)).padStart(6, '0')
  formData.batchId = `B_${cropType}_${year}_${serial}`
}

const goBack = () => router.back()

watch(() => formData.year, () => {
  generateBatchId()
  generateVarietyCode()
})

const disablePastYears = (date) => {
  if (!date) return false
  return date.getFullYear() < new Date().getFullYear()
}

onMounted(() => {
  getInfo()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/page-common.scss';
</style>
