<template>
  <div class="page-container">
    <div class="page-wrapper">
      <!-- 页面头部（带返回按钮） -->
      <div class="page-header">
        <div class="header-left">
          <el-button class="back-btn" @click="handleBack">
            <i class="ri-arrow-left-line"></i>
          </el-button>
          <div class="header-content">
            <h1 class="page-title">{{ pageTitle }}</h1>
          </div>
        </div>
      </div>

      <!-- 表单区域 -->
      <div class="content-wrapper">
        <el-form ref="formRef" :model="formData" :rules="rules" label-width="140px" v-loading="loading">
          <!-- 基本信息卡片 -->
          <div class="info-card">
            <div class="card-header">
              <div class="card-title">
                <i class="ri-information-line"></i>
                <span>{{ $t('inputCirculation.basicInfo') }}</span>
              </div>
            </div>
            <div class="card-body">
              <el-row :gutter="20">
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('inputCirculation.releaseName')" prop="releaseName">
                    <el-input v-model="formData.releaseName" :placeholder="$t('common.pleaseInput')" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('inputCirculation.zoneId')" prop="zoneId">
                    <el-select v-model="formData.zoneId" :placeholder="$t('common.pleaseSelect')" @change="getAllUnionList" style="width: 100%">
                      <el-option v-for="item in zoneList" :key="item.code" :label="item.name" :value="item.code" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('inputCirculation.unionId')" prop="targetId">
                    <el-select v-model="selectedUnionOrgName" :placeholder="$t('common.pleaseSelect')" @change="getUnionInfo" style="width: 100%">
                      <el-option v-for="item in unionList" :key="item.code" :label="item.name" :value="item.code" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('inputCirculation.unionAddress')">
                    <el-input v-model="formData.targetAddress" :placeholder="$t('common.pleaseInput')" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('inputCirculation.unionContact')">
                    <el-input v-model="formData.targetContact" :placeholder="$t('common.pleaseInput')" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('inputCirculation.releaseYear')">
                    <el-date-picker v-model="formData.releaseYear" type="year" value-format="YYYY" @change="handleYearChange" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12">
                  <el-form-item :label="$t('inputCirculation.releaseDate')" prop="releaseDate">
                    <el-date-picker v-model="formData.releaseDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-table
                :data="demandList"
                border
                :header-cell-style="{ textAlign: 'center' }"
                :cell-style="{ textAlign: 'center' }"
                v-loading="demandLoading"
                @selection-change="handleDemandSelectionChange">
                <el-table-column type="selection" width="55" />
                <el-table-column :label="$t('districtAggregation.detailDialog.columns.inputType')" prop="inputType" min-width="150">
                  <template #default="{ row }">
                    {{ getMainCategoryLabel(row.inputType) }}
                  </template>
                </el-table-column>
                <el-table-column :label="$t('districtAggregation.detailDialog.columns.inputCategory')" prop="inputCategory" min-width="150">
                  <template #default="{ row }">
                    {{ getSubCategoryLabel(row.inputCategory) }}
                  </template>
                </el-table-column>
                <el-table-column :label="$t('farmerDemand.form.variety')" prop="variety" min-width="150">
                  <template #default="{ row }">
                    {{ row.variety || '-' }}
                  </template>
                </el-table-column>
                <el-table-column :label="$t('farmerDemand.form.season')" prop="season" min-width="140">
                  <template #default="{ row }">
                    {{ formatSeason(row.season) }}
                  </template>
                </el-table-column>
                <el-table-column :label="$t('districtAggregation.detailDialog.columns.totalQuantity')" prop="totalQuantity" min-width="120" />
              </el-table>
            </div>
          </div>

          <!-- 分发明细卡片 -->
          <div class="info-card">
            <div class="card-header">
              <div class="card-title">
                <i class="ri-file-list-line"></i>
                <span>{{ $t('inputCirculation.detailInfo') }}</span>
              </div>
              <div class="card-actions">
                <el-button type="primary" @click="addDetail">
                  <i class="ri-add-line"></i>
                  {{ $t('inputCirculation.addDetail') }}
                </el-button>
              </div>
            </div>
            <div class="card-body">
              <el-table
                :data="formData.details"
                border
                :header-cell-style="{ textAlign: 'center' }"
                :cell-style="{ textAlign: 'center' }">
                <el-table-column :label="$t('inputCirculation.releaseDetailId')" type="index" width="80" />
                <el-table-column :label="$t('districtAggregation.detailDialog.columns.inputType')" min-width="180">
                  <template #default="scope">
                    <el-select v-model="scope.row.inputType"
                               :placeholder="$t('common.pleaseSelect')"
                               @change="handleInputTypeChange(scope.$index)"
                               style="width: 100%">
                      <el-option v-for="item in inputTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('districtAggregation.detailDialog.columns.inputCategory')" min-width="180">
                  <template #default="scope">
                    <el-select v-model="scope.row.inputCategory"
                               :placeholder="$t('common.pleaseSelect')"
                               :disabled="!scope.row.inputType"
                               @change="handleInputCategoryChange(scope.$index)"
                               style="width: 100%">
                      <el-option v-for="item in getFilteredCategories(scope.row.inputType)" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('farmerDemand.form.variety')" min-width="160">
                  <template #default="scope">
                    <el-select
                      v-model="scope.row.varietyId"
                      :placeholder="$t('common.pleaseSelect')"
                      :loading="scope.row.varietyLoading"
                      :disabled="!scope.row.inputType || !scope.row.inputCategory"
                      clearable
                      filterable
                      style="width: 100%"
                      @change="(value) => handleVarietyChange(scope.$index, value)">
                      <el-option
                        v-for="item in scope.row.varietyOptions || []"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value" />
                      </el-select>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('farmerDemand.form.season')" min-width="160">
                  <template #default="scope">
                    <el-select v-model="scope.row.season"
                               :placeholder="$t('common.pleaseSelect')"
                               style="width: 100%"
                               @change="handleSeasonChange(scope.$index)">
                      <el-option v-for="item in seasonOptions" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('inputCirculation.demandQuantity')" min-width="140">
                  <template #default="scope">
                    <span>{{ getDemandQuantity(scope.row.inputType, scope.row.inputCategory, scope.row.variety, scope.row.season) }}</span>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('inputCirculation.currentStock')" min-width="140">
                  <template #default="scope">
                    <span>{{ scope.row.currentStock }}</span>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('inputCirculation.quantity')" min-width="180">
                  <template #default="scope">
                    <el-input-number
                      v-model="scope.row.quantity"
                      :min="0"
                      :precision="2"
                      style="width: 100%" />
                  </template>
                </el-table-column>
                <el-table-column :label="$t('inputCirculation.unit')" min-width="140">
                  <template #default="scope">
                    <el-select v-model="scope.row.unit" :placeholder="$t('common.pleaseSelect')" style="width: 100%">
                      <el-option v-for="item in unitOptions" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('inputCirculation.outWarehouse')" min-width="180">
                  <template #default="scope">
                    <el-select v-model="scope.row.outWarehouseCode" :placeholder="$t('common.pleaseSelect')" style="width: 100%"
                      @change="(val) => handleDetailOutWarehouseChange(scope.row, val)">
                      <el-option v-for="item in warehouseOptions" :key="item.warehouseCode" :label="item.warehouseName" :value="item.warehouseCode" />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('inputCirculation.inWarehouse')" min-width="180">
                  <template #default="scope">
                    <el-select v-model="scope.row.inWarehouseCode" :placeholder="$t('common.pleaseSelect')" style="width: 100%"
                      @change="(val) => handleDetailInWarehouseChange(scope.row, val)">
                      <el-option v-for="item in inWarehouseOptions" :key="item.warehouseCode" :label="item.warehouseName" :value="item.warehouseCode" />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('common.actions')" min-width="100" fixed="right">
                  <template #default="scope">
                    <el-button type="danger" link @click="removeDetail(scope.$index)">{{ $t('common.delete') }}</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>

          <!-- 操作按钮区域（固定在底部） -->
          <div class="form-actions">
            <el-button v-for="button in getActionButtons()" :key="button.action"
              :type="button.type" @click="handleAction(button.action)"
              :loading="loading && button.action === 'save'">
              {{ $t(`common.${button.label}`) }}
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { getOseReleaseDetail, addOseRelease, editOseRelease, getDeptCategoryStock } from '@/api/inputCirculation'
import { getInventoryWarehouseList } from '@/api/inventory'
import { getAllInputList } from '@/api/input.js'
import { listProductManage } from '@/api/productManage'
import { getUnionDetailByUnionId } from '@/api/union.js'
import { getOrgansRegionByCode, listSubRegionByCode } from '@/api/application.js'
import { getCurrentUserInfo } from '@/api/user.js'
import { getTownAggregationDetail } from '@/api/villageAggregation.js'
import { getRegistrationList } from '@/api/orgRegistration'
import { getDicts } from '@/api/system/dict'
import { parseI18nValue } from '@/utils/i18nHelper'
import { useUserStore } from '@/store/user'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const zoneWoredaFlag = computed(() => (route.query.from === 'zone-woreda' ? 1 : undefined))

const loading = ref(false)
const formRef = ref(null)
const isEdit = computed(() => !!route.params.id)

// 根据路由路径和参数判断页面模式
const pageMode = computed(() => {
  // 优先使用 query 参数
  if (route.query.mode) {
    return route.query.mode
  }
  // 根据路由路径判断
  if (route.path.includes('/audit/')) {
    return 'audit'
  }
  if (route.path.includes('/detail/')) {
    return 'view'
  }
  // 默认逻辑
  return isEdit.value ? 'edit' : 'add'
})

// 页面标题
const pageTitle = computed(() => {
  switch (pageMode.value) {
    case 'edit':
      return t('inputCirculation.editRelease')
    default:
      return t('inputCirculation.addRelease')
  }
})



const formData = reactive({
  id: '',
  releaseName: '',
  zoneId: '',
  targetId: '',
  targetAddress: '',
  targetContact: '',
  targetPhone: '',
  releaseYear: new Date().getFullYear().toString(),
  releaseDate: new Date().toISOString().split('T')[0],
  releaseBy: '',
  auditDate: '',
  auditBy: '',
  releaseOrg: '',
  releaseType: 'OSE_TO_UNION', // OSE分发到Union
  details: []
})

const zoneList = ref([])
const unionList = ref([])
const selectedUnionOrgName = ref('')
const inputList = ref([])
const demandList = ref([])
const demandLoading = ref(false)
const selectedDemands = ref([])
const warehouseOptions = ref([])
const inWarehouseOptions = ref([])
const mainCategoryOptions = ref([])
const subCategoryOptions = ref([])
const unitOptions = ref([])
const inputTypeOptions = computed(() => mainCategoryOptions.value)

const createVarietyState = () => ({
  varietyId: '',
  varietyOptions: [],
  varietyLoading: false
})

const SEASON_LABEL_MAP = {
  '1': 'Summer',
  '2': 'Spring',
  '3': 'Irrigation'
}

const seasonOptions = [
  { label: 'Irrigation', value: '3' },
  { label: 'Spring', value: '2' },
  { label: 'Summer', value: '1' }
]

const formatSeason = (season) => {
  const normalizedSeason = String(season || '').trim()
  return SEASON_LABEL_MAP[normalizedSeason] || '-'
}

const getNormalizedSeasonCode = (season) => String(season || '').trim()
const getNormalizedDemandValue = (value) => String(value || '').trim()

const matchesDemandValue = (demandValue, targetValue, targetLabel) => {
  const normalizedDemand = getNormalizedDemandValue(demandValue)
  const normalizedTarget = getNormalizedDemandValue(targetValue)
  const normalizedLabel = getNormalizedDemandValue(targetLabel)
  return normalizedDemand === normalizedTarget || normalizedDemand === normalizedLabel
}

const findMatchedDemand = (inputType, inputCategory, variety = '', season = '') => {
  if (!inputType || !inputCategory) return null

  const inputTypeLabel = getMainCategoryLabel(inputType)
  const inputCategoryLabel = getSubCategoryLabel(inputCategory)
  const normalizedSeason = getNormalizedSeasonCode(season)
  const normalizedVariety = (variety || '').trim()

  return demandList.value.find(d => {
    const demandSeason = getNormalizedSeasonCode(d.season || d.seasonCode || d.season_code)
    const demandVariety = (d.variety || '').trim()
    return matchesDemandValue(d.inputType, inputType, inputTypeLabel) &&
      matchesDemandValue(d.inputCategory, inputCategory, inputCategoryLabel) &&
      (!normalizedSeason || demandSeason === normalizedSeason) &&
      (!normalizedVariety || !demandVariety || demandVariety === normalizedVariety)
  }) || null
}

const getDetailSeason = (detail) => {
  if (!detail) return ''
  if (detail.season || detail.seasonCode || detail.season_code) {
    return detail.season || detail.seasonCode || detail.season_code
  }
  const matchedDemand = findMatchedDemand(detail.inputType, detail.inputCategory)
  return matchedDemand?.season || matchedDemand?.seasonCode || matchedDemand?.season_code || ''
}

const normalizeDetailRow = (detail = {}) => ({
  ...createVarietyState(),
  ...detail,
  season: detail.season || detail.seasonCode || detail.season_code || '',
  variety: detail.variety || '',
  varietyId: detail.varietyId || detail.variety_id || detail.productId || detail.product_id || '',
  unit: resolveDictValue(unitOptions.value, detail.unit)
})

const rules = {
  releaseName: [{ required: true, message: t('common.required'), trigger: 'blur' }],
  zoneId: [{ required: true, message: t('common.required'), trigger: 'blur' }],
  targetId: [{ required: true, message: t('common.required'), trigger: 'blur' }],
  releaseDate: [{ required: true, message: t('common.required'), trigger: 'change' }]
}

const getUserInfo = async () => {
  loading.value = true
  try {
    const response = await getCurrentUserInfo(zoneWoredaFlag.value)
    if (response.code === 200 && response.data) {
      console.log(response.data)
     formData.releaseBy = response.data.user.name
      formData.releaseOrg = response.data.user.organName
      console.log(formData.releaseBy)
    }
  } catch (error) {
    ElMessage.error(t('common.queryUserInfoFailed'))
  } finally {
    loading.value = false
  }
}

const getAllZoneList = async () => {
  loading.value = true
  try {
    const response = await listSubRegionByCode({
      regionCode: '000000000000',
      ...(zoneWoredaFlag.value ? { flag: zoneWoredaFlag.value } : {})
    })
    if (response.code === 200) {
      zoneList.value = response.data
    }
  } catch (error) {
    ElMessage.error(t('inputCirculation.queryZoneListFailed'))
  } finally {
    loading.value = false
  }
}

const normalizeId = (value) => {
  if (value === undefined || value === null) return ''
  return String(value).trim()
}

const getCurrentUserOrgId = () => {
  const userInfo = userStore.userInfo || {}
  const user = userInfo.user || {}
  return normalizeId(
    userInfo.org_id ??
    userInfo.orgId ??
    user.org_id ??
    user.orgId ??
    userInfo.deptId ??
    user.deptId ??
    userInfo.dept?.deptId ??
    user.dept?.deptId
  )
}

const getWarehouseOrgId = (warehouse) => {
  return normalizeId(
    warehouse?.org_id ??
    warehouse?.orgId ??
    warehouse?.deptId ??
    warehouse?.organCode ??
    warehouse?.orgCode
  )
}

const loadWarehouses = async () => {
  try {
    const currentUserOrgId = getCurrentUserOrgId()
    if (!currentUserOrgId) {
      warehouseOptions.value = []
      formData.details.forEach(detail => {
        detail.outWarehouseCode = ''
        detail.outWarehouseName = ''
      })
      return
    }

    const res = await getInventoryWarehouseList({
      pageNum: 1,
      pageSize: 10000,
      orgId: currentUserOrgId,
      org_id: currentUserOrgId,
      ...(zoneWoredaFlag.value ? { flag: zoneWoredaFlag.value } : {})
    })

    const warehouseList = res.rows || []
    const hasWarehouseOrgId = warehouseList.some(item => !!getWarehouseOrgId(item))
    warehouseOptions.value = hasWarehouseOrgId
      ? warehouseList.filter(item => getWarehouseOrgId(item) === currentUserOrgId)
      : warehouseList

    formData.details.forEach(detail => {
      const exists = warehouseOptions.value.some(item => item.warehouseCode === detail.outWarehouseCode)
      if (!exists) {
        detail.outWarehouseCode = ''
        detail.outWarehouseName = ''
      }
    })
  } catch (error) {
    console.error('Failed to load warehouse list:', error)
    warehouseOptions.value = []
  }
}

const clearInWarehouseSelection = () => {
  inWarehouseOptions.value = []
  formData.details.forEach(detail => {
    detail.inWarehouseCode = ''
    detail.inWarehouseName = ''
  })
}

const loadInWarehousesByUnion = async (unionOrgName) => {
  if (!unionOrgName) {
    clearInWarehouseSelection()
    return
  }
  try {
    const res = await getInventoryWarehouseList({
      pageNum: 1,
      pageSize: 10000,
      status: '0',
      orgName: unionOrgName,
      org_name: unionOrgName,
      ...(zoneWoredaFlag.value ? { flag: zoneWoredaFlag.value } : {})
    })
    inWarehouseOptions.value = res.rows || []
    formData.details.forEach(detail => {
      const exists = inWarehouseOptions.value.some(item => item.warehouseCode === detail.inWarehouseCode)
      if (!exists) {
        detail.inWarehouseCode = ''
        detail.inWarehouseName = ''
      }
    })
  } catch (error) {
    console.error('Failed to load inbound warehouse list by union:', error)
    clearInWarehouseSelection()
  }
}

const loadCategoryOptions = async () => {
  try {
    const [mainRes, subRes, unitRes] = await Promise.all([
      getDicts('inventory_main_category', zoneWoredaFlag.value),
      getDicts('inventory_sub_category', zoneWoredaFlag.value),
      getDicts('inventory_unit_new', zoneWoredaFlag.value)
    ])

    mainCategoryOptions.value = (mainRes.data || []).map(item => ({
      label: parseI18nValue(item.dictLabel, locale.value, item.dictLabel),
      value: item.dictValue
    }))

    subCategoryOptions.value = (subRes.data || []).map(item => ({
      label: parseI18nValue(item.dictLabel, locale.value, item.dictLabel),
      value: item.dictValue,
      parentValue: item.remark
    }))

    unitOptions.value = (unitRes.data || []).map(item => ({
      label: parseI18nValue(item.dictLabel, locale.value, item.dictLabel),
      value: item.dictValue
    }))
  } catch (error) {
    console.error('Failed to load category options:', error)
  }
}

const resolveDictValue = (options, value) => {
  if (!value) return ''
  const match = options.find(item => String(item.value) === String(value) || String(item.label) === String(value))
  return match ? match.value : value
}


const regionCode = ref('')

const getAllUnionList = async (value, resetSelection = true) => {
  loading.value = true
  regionCode.value = value
  if (resetSelection) {
    selectedUnionOrgName.value = ''
    formData.targetId = ''
    formData.targetAddress = ''
    formData.targetContact = ''
    clearInWarehouseSelection()
  }
  try {
    const response = await getRegistrationList({
      regionCode: value,
      orgType: 'UNION',
      auditStatus: 1,
      page: 1,
      pageSize: 10000,
      ...(zoneWoredaFlag.value ? { flag: zoneWoredaFlag.value } : {})
    })
    console.log('Union List Response:', response)
    if (response.code === 200) {
      const list = response.data.records || response.data.rows || response.data.list || []
      unionList.value = list.map(item => ({
        id: item.id,
        orgName: item.orgName,
        code: item.orgName,
        name: item.orgName
      }))
      if (!resetSelection && formData.targetId) {
        const matched = unionList.value.find(item => String(item.id) === String(formData.targetId) || String(item.orgName) === String(formData.targetId))
        if (matched) {
          selectedUnionOrgName.value = matched.orgName
          formData.targetId = matched.id
        }
      }
    }
  } catch (error) {
    ElMessage.error(t('inputCirculation.queryUnionListFailed'))
  } finally {
    loading.value = false
  }
}

const getInputList = async () => {
  loading.value = true
  try {
    const response = await getAllInputList(zoneWoredaFlag.value)
    if (response.code === 200) {
      inputList.value = response.data.map(item => {
        return {
          inputId: item.inputId,
          inputName: item.inputName,
          // 尝试多种可能的字段名
          variety: item.variety || '',
          agriculturalInputType: item.agriculturalInputType || item.agricultural_input_type ||
              item.inputType || item.type || ''
        }
      })
    }
  } catch (error) {
    ElMessage.error(t('inputCirculation.queryInputListFailed'))
  } finally {
    loading.value = false
  }
}

// 投入品选择变化处理
const handleInputChange = (index) => {
  const detail = formData.details[index]
  const selectedInput = inputList.value.find(i => i.inputId === detail.inputId)
  if (selectedInput) {
    detail.variety = selectedInput.variety
    detail.cropType = selectedInput.agriculturalInputType
    detail.inputName = selectedInput.inputName
  } else {
    console.warn('未找到对应的投入品信息')
  }
}

// 投入品类型变化处理
const handleInputTypeChange = (index) => {
  const detail = formData.details[index]
  // 清空投入品类别
  detail.inputCategory = ''
  detail.season = ''
  detail.variety = ''
  detail.varietyId = ''
  detail.varietyOptions = []
  detail.varietyLoading = false
  detail.quantity = 0
  detail.maxQuantity = 0
  detail.currentStock = 0
}

const loadVarietyOptions = async (detail, preserveSelection = false) => {
  if (!detail) return

  const existingVarietyId = detail.varietyId
  const existingVariety = detail.variety

  detail.varietyId = preserveSelection ? (existingVarietyId || '') : ''
  detail.variety = preserveSelection ? (existingVariety || '') : ''
  detail.varietyOptions = []

  if (!detail.inputType || !detail.inputCategory) {
    detail.varietyLoading = false
    return
  }

  detail.varietyLoading = true
  try {
    const response = await listProductManage({
      pageNum: 1,
      pageSize: 1000,
      mainCategory: getMainCategoryLabel(detail.inputType),
      subCategory: getSubCategoryLabel(detail.inputCategory),
      status: '0',
      ...(zoneWoredaFlag.value ? { flag: zoneWoredaFlag.value } : {})
    })

    const list = response.data?.list || []
    detail.varietyOptions = list
      .map(product => {
        const optionValue = product.id || product.product_id || product.product_code || ''
        const productName = product.product_name || product.productName || product.product_code || ''
        return {
          label: productName || '-',
          value: optionValue,
          productName
        }
      })
      .filter(option => option.value)

    if (detail.varietyId) {
      const matchedById = detail.varietyOptions.find(option => String(option.value) === String(detail.varietyId))
      if (matchedById) {
        detail.variety = matchedById.productName
      }
    } else if (detail.variety) {
      const matchedByName = detail.varietyOptions.find(option => option.productName === detail.variety)
      if (matchedByName) {
        detail.varietyId = matchedByName.value
        detail.variety = matchedByName.productName
      }
    }
  } catch (error) {
    detail.varietyOptions = []
    ElMessage.error(t('common.loadFailed'))
  } finally {
    detail.varietyLoading = false
  }
}

// 投入品类别变化处理
const handleInputCategoryChange = async (index, preserveSelection = false) => {
  const detail = formData.details[index]
  if (!detail) return

  const matchedDemand = findMatchedDemand(detail.inputType, detail.inputCategory, detail.season)

  detail.season = matchedDemand?.season || matchedDemand?.seasonCode || matchedDemand?.season_code || ''

  detail.variety = preserveSelection ? (detail.variety || '') : ''
  detail.varietyId = preserveSelection ? (detail.varietyId || '') : ''
  detail.varietyOptions = []
  // 获取需求数量作为默认值
  const demandQty = getDemandQuantity(detail.inputType, detail.inputCategory, detail.season)
  if (!preserveSelection) {
    detail.quantity = 0
  }
  detail.maxQuantity = demandQty

  if (!detail.inputType || !detail.inputCategory) {
    detail.currentStock = 0
    detail.varietyLoading = false
    return
  }

  await loadVarietyOptions(detail, preserveSelection)
  if (!isStockLookupReady(detail)) {
    detail.currentStock = 0
    return
  }
  await fetchStock(index)
}

const handleVarietyChange = (index, value) => {
  const detail = formData.details[index]
  if (!detail) return

  detail.varietyId = value || ''
  const matchedOption = (detail.varietyOptions || []).find(option => String(option.value) === String(value))
  detail.variety = matchedOption?.productName || ''
  if (!isStockLookupReady(detail)) {
    detail.currentStock = 0
    return
  }
  fetchStock(index)
}

const initializeDetailRows = async () => {
  await Promise.all(formData.details.map((detail, index) => {
    if (detail.inputType && detail.inputCategory) {
      return handleInputCategoryChange(index, true)
    }
    return Promise.resolve()
  }))
}

const isStockLookupReady = (detail) => Boolean(
  detail?.inputType && detail?.inputCategory && String(detail?.variety || '').trim()
)

const normalizeStockItem = (item) => {
  if (!item) return null
  return {
    mainCategory: item.mainCategory ?? item.main_category ?? '',
    subCategory: item.subCategory ?? item.sub_category ?? '',
    productName: item.productName ?? item.product_name ?? '',
    availableQty: item.availableQty ?? item.available_qty ?? item.availableQuantity ?? 0
  }
}

const findMatchedStockItem = (items, inputTypeLabel, inputCategoryLabel, variety) => {
  const normalizedVariety = (variety || '').trim()
  return (items || [])
    .map(normalizeStockItem)
    .find(item => item &&
      item.mainCategory === inputTypeLabel &&
      item.subCategory === inputCategoryLabel &&
      (!normalizedVariety || !item.productName.trim() || item.productName.trim() === normalizedVariety))
}

// 获取库存
const fetchStock = async (index) => {
  const detail = formData.details[index]
  if (!isStockLookupReady(detail)) {
    detail.currentStock = 0
    return
  }

  try {
    const deptId = userStore.userInfo?.deptId || userStore.userInfo?.user?.deptId
    if (!deptId) {
      console.warn('deptId is not available in userInfo')
      detail.currentStock = 0
      return
    }

    const inputTypeLabel = getMainCategoryLabel(detail.inputType)
    const inputCategoryLabel = getSubCategoryLabel(detail.inputCategory)

    const res = await getDeptCategoryStock(deptId, inputTypeLabel, inputCategoryLabel, detail.variety, zoneWoredaFlag.value)
    if (res.code === 200 && Array.isArray(res.data)) {
      const matched = findMatchedStockItem(res.data, inputTypeLabel, inputCategoryLabel, detail.variety)
      detail.currentStock = matched?.availableQty ?? 0
    } else {
      detail.currentStock = 0
    }
  } catch (error) {
    console.error('Failed to fetch stock:', error)
    detail.currentStock = 0
  }
}

// 根据投入品类型过滤投入品类别
const getFilteredCategories = (inputType) => {
  if (!inputType) return []
  return subCategoryOptions.value.filter(item => String(item.parentValue) === String(inputType))
}

const getMainCategoryLabel = (value) => {
  if (!value) return ''
  const match = mainCategoryOptions.value.find(item => String(item.value) === String(value))
  return match?.label || value
}

const getSubCategoryLabel = (value) => {
  if (!value) return ''
  const match = subCategoryOptions.value.find(item => String(item.value) === String(value))
  return match?.label || value
}

// 获取需求数量
const getDemandQuantity = (inputType, inputCategory, variety = '', season = '') => {
  if (!inputType || !inputCategory) return 0
  const demand = findMatchedDemand(inputType, inputCategory, variety, season)
  return demand ? demand.totalQuantity : 0
}


// 校验数量 - 同时检查需求量和库存
const validateQuantity = async (index) => {
  const detail = formData.details[index]
  if (!detail.inputType) return

  // 校验需求量
  const maxQty = getDemandQuantity(detail.inputType, detail.inputCategory, detail.season)
  if (detail.quantity > maxQty) {
    detail.quantity = maxQty
    ElMessage.warning(t('inputCirculation.quantityExceedsDemand'))
    return
  }

  // 校验库存 - 计算表单中同类型的总数量
  const totalFormQuantity = formData.details
    .filter(d => d.inputType === detail.inputType &&
                (d.inputCategory === detail.inputCategory || (!d.inputCategory && !detail.inputCategory)) &&
                (getNormalizedSeasonCode(d.season) === getNormalizedSeasonCode(detail.season)) &&
                (d.variety === detail.variety || (!d.variety && !detail.variety)))
    .reduce((sum, d) => sum + (d.quantity || 0), 0)

  try {
    const deptId = userStore.userInfo?.deptId || userStore.userInfo?.user?.deptId
    if (!deptId) {
      console.warn('deptId is not available for stock validation')
      return
    }

    const inputTypeLabel = getMainCategoryLabel(detail.inputType)
    const inputCategoryLabel = getSubCategoryLabel(detail.inputCategory)

    const stockRes = await getDeptCategoryStock(deptId, inputTypeLabel, inputCategoryLabel, detail.variety, zoneWoredaFlag.value)
    if (stockRes.code === 200 && Array.isArray(stockRes.data)) {
      const matched = findMatchedStockItem(stockRes.data, inputTypeLabel, inputCategoryLabel, detail.variety)
      const available = matched?.availableQty ?? 0
      if (totalFormQuantity > available) {
        // 超出可用库存，调整当前行数量
        const excessQty = totalFormQuantity - available
        const adjustedQty = Math.max(0, (detail.quantity || 0) - excessQty)
        detail.quantity = adjustedQty
        ElMessage.error(t('inputCirculation.stockInsufficient', { available, requested: totalFormQuantity }))
      }
    }
  } catch (error) {
    console.error('Failed to validate stock:', error)
  }
}

const getUnionInfo = async (value) => {
  if (!value || value.length === 0) {
    selectedUnionOrgName.value = ''
    formData.targetId = ''
    formData.targetAddress = ''
    formData.targetContact = ''
    clearInWarehouseSelection()
    return
  }
  loading.value = true
  try {
    const selectedUnion = unionList.value.find(item => String(item.orgName) === String(value) || String(item.code) === String(value))
    const unionId = selectedUnion?.id || value
    formData.targetId = selectedUnion?.id || ''
    selectedUnionOrgName.value = selectedUnion?.orgName || value

    const response = await getUnionDetailByUnionId(unionId, zoneWoredaFlag.value)
    if (response.code === 200 && response.data) {
      formData.targetAddress = response.data.fullAddress
      formData.targetContact = response.data.operator
    }
    await loadInWarehousesByUnion(selectedUnion?.orgName || value)
    // 加载需求列表
    await loadDemandList(regionCode.value)
  } catch (error) {
    ElMessage.error(t('union.getUnionInfoFailed'))
  } finally {
    loading.value = false
  }
}

const loadDemandList = async (unionCode) => {
  demandLoading.value = true
  try {
    const response = await getTownAggregationDetail({
      sourceCode: unionCode,
      year: formData.releaseYear || new Date().getFullYear().toString(),
      ...(zoneWoredaFlag.value ? { flag: zoneWoredaFlag.value } : {})
    })
    if (response.code === 200) {
      demandList.value = response.data || []
    }
  } catch (error) {
    console.error('Failed to load demand list:', error)
  } finally {
    demandLoading.value = false
  }
}

// 处理需求选择变化
const handleDemandSelectionChange = (selection) => {
  selectedDemands.value = selection
}

// 处理年度变化 - 重新加载需求列表
const handleYearChange = () => {
  if (formData.targetId) {
    loadDemandList(regionCode.value)
  }
}

const fetchDetail = async () => {
  loading.value = true
  try {
    const response = await getOseReleaseDetail(route.params.id, zoneWoredaFlag.value)
    if (response.code === 200 && response.data) {
      Object.assign(formData, response.data.main)
      formData.details = (response.data.details || []).map(detail => normalizeDetailRow(detail))
      await initializeDetailRows()
    }
  } catch (error) {
    ElMessage.error(t('common.queryFailed'))
  } finally {
    loading.value = false
  }
}

const createEmptyDetail = () => ({
  inputType: '',
  inputCategory: '',
  season: '',
  variety: '',
  ...createVarietyState(),
  quantity: 0,
  unit: unitOptions.value[0]?.value || '',
  unitPrice: 0,
  maxQuantity: 0,
  currentStock: 0,
  outWarehouseCode: '',
  outWarehouseName: '',
  inWarehouseCode: '',
  inWarehouseName: ''
})

const addDetail = () => {
  formData.details.push(createEmptyDetail())
}

const removeDetail = (index) => {
  formData.details.splice(index, 1)
}

const handleDetailOutWarehouseChange = (row, code) => {
  const warehouse = warehouseOptions.value.find(item => item.warehouseCode === code)
  row.outWarehouseName = warehouse ? warehouse.warehouseName : ''
}

const handleDetailInWarehouseChange = (row, code) => {
  const warehouse = inWarehouseOptions.value.find(item => item.warehouseCode === code)
  row.inWarehouseName = warehouse ? warehouse.warehouseName : ''
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true

    try {
      const deptId = userStore.userInfo?.deptId || userStore.userInfo?.user?.deptId
      if (!deptId) {
        ElMessage.error(t('inputCirculation.organCodeMissing') || '无法获取机构编码')
        loading.value = false
        return
      }

      const quantityByType = {}
      for (const detail of formData.details) {
        const key = `${detail.inputType}_${detail.inputCategory || ''}_${detail.season || ''}_${detail.variety || ''}`
        if (!quantityByType[key]) {
          quantityByType[key] = {
            inputType: detail.inputType,
            inputCategory: detail.inputCategory,
            season: detail.season || '',
            variety: detail.variety || '',
            quantity: 0
          }
        }
        quantityByType[key].quantity += (detail.quantity || 0)
      }

      for (const key of Object.keys(quantityByType)) {
        const item = quantityByType[key]
        if (!isStockLookupReady(item)) continue

        const inputTypeLabel = getMainCategoryLabel(item.inputType)
        const inputCategoryLabel = getSubCategoryLabel(item.inputCategory)
        const stockRes = await getDeptCategoryStock(deptId, inputTypeLabel, inputCategoryLabel, item.variety, zoneWoredaFlag.value)
        if (stockRes.code === 200 && Array.isArray(stockRes.data)) {
          const matched = findMatchedStockItem(stockRes.data, inputTypeLabel, inputCategoryLabel, item.variety)
          const available = matched?.availableQty ?? 0
          if (item.quantity > available) {
            ElMessage.error(t('inputCirculation.stockInsufficient', { available, requested: item.quantity }))
            loading.value = false
            return
          }
        }
      }

      const submitData = {
        ...formData,
        ...(zoneWoredaFlag.value ? { flag: zoneWoredaFlag.value } : {})
      }
      submitData.details = formData.details.map(({ varietyOptions, varietyLoading, varietyId, season, ...detail }) => ({ ...detail }))
      if (Array.isArray(formData.targetId) && formData.targetId.length > 0) {
        submitData.targetId = formData.targetId[formData.targetId.length - 1]
      }
      const apiFunc = isEdit.value ? editOseRelease : addOseRelease
      const response = await apiFunc(submitData)
      if (response.code === 200) {
        ElMessage.success(t('common.saveSuccess'))
        router.back()
      } else {
        ElMessage.error(response.msg || t('common.saveFailed'))
      }
    } catch (error) {
      console.error('Failed to submit form:', error)
      ElMessage.error(t('common.saveFailed'))
    } finally {
      loading.value = false
    }
  })
}

const handleBack = () => {
  router.back()
}

// 根据页面模式返回不同的按钮
const getActionButtons = () => {
  const mode = pageMode.value

  // 新建/编辑模式
  if (mode === 'add' || mode === 'edit') {
    return [
      { type: '', label: 'cancel', action: 'cancel' },
      { type: 'primary', label: 'save', action: 'save' }
    ]
  }

  // 默认按钮
  return [
    { type: '', label: 'cancel', action: 'cancel' },
    { type: 'primary', label: 'save', action: 'save' }
  ]
}

// 统一的动作处理方法
const handleAction = (action) => {
  switch (action) {
    case 'cancel':
      handleBack()
      break
    case 'save':
      handleSubmit()
      break
  }
}

onMounted(async () => {
  await getUserInfo()
  await getInputList()
  await loadCategoryOptions()
  await loadWarehouses()
  if (isEdit.value) {
    await fetchDetail()
    await getAllZoneList()
    if (formData.zoneId) {
      await getAllUnionList(formData.zoneId, false)
      await loadDemandList(formData.zoneId)
    }
    if (selectedUnionOrgName.value) {
      await loadInWarehousesByUnion(selectedUnionOrgName.value)
    }
  } else {
    await getAllZoneList()
  }
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/page-common.scss';
</style>

